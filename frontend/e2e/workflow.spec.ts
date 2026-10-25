import { test, expect, Page } from "@playwright/test";

async function fundedJob(page: Page, revise = false) {
  await page.goto("/demo/");
  await page.getByRole("button", { name: /Synthetic Beacon/ }).click();
  await page.getByLabel("Job title").fill("Browser-verified synthetic brief");
  await page.getByLabel("Simulated budget").fill("-1");
  await expect(page.getByRole("button", { name: "Create job and continue" })).toBeDisabled();
  await page.getByLabel("Simulated budget").fill("35.00");
  const deadline = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 16);
  await page.getByLabel("Deadline (UTC)").fill(deadline);
  await page.reload();
  await expect(page.getByLabel("Job title")).toHaveValue("Browser-verified synthetic brief");
  await expect(page.getByLabel("Deadline (UTC)")).toHaveValue(deadline);
  await page.getByRole("button", { name: "Create job and continue" }).click();
  await page.getByRole("button", { name: "Compute matches" }).click();
  await expect(page.getByText("Matched: analysis, data-cleaning")).toBeVisible();
  await page.getByRole("button", { name: "Persist selected agent" }).click();
  await page.getByRole("button", { name: "Create agreement from this job" }).click();
  page.on("dialog", dialog => dialog.accept());
  if (revise) {
    await page.getByText("Revise, reject, or cancel the proposal", { exact: true }).click();
    await page.getByLabel("Revised simulated budget").fill("42.00");
    await page.getByRole("button", { name: "Save a new proposal version" }).click();
  }
  await page.getByRole("button", { name: `Accept version ${revise ? 2 : 1}` }).click();
  await page.getByRole("button", { name: "Record simulated funding" }).click();
  await expect(page.getByRole("heading", { name: "Submit the work" })).toBeVisible();
}

test("passing workflow persists, reloads, releases once, isolates and resets", async ({ page, browser }, info) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("AI-agent work");
  await fundedJob(page);
  await page.reload();
  await page.getByRole("button", { name: "Submit passing sample" }).click();
  await page.getByRole("button", { name: "Run deterministic verification" }).click();
  await page.getByRole("button", { name: "Release eligible simulated funds" }).click();
  await expect(page.getByRole("heading", { name: "Review the persisted record" })).toBeVisible();
  await expect(page.getByText("escrow.settled", { exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath("settled-desktop.png"), fullPage: true });
  const original = await page.evaluate(() => ({ token: localStorage.getItem("autoescrow-demo-session")!, job: localStorage.getItem("autoescrow-guided-demo-job")! }));
  const other = await browser.newContext();
  const session = await other.request.post("http://127.0.0.1:8011/api/v1/demo/session");
  const otherToken = (await session.json()).token;
  const response = await other.request.get(`http://127.0.0.1:8011/api/v1/jobs/${original.job}`, { headers: { "X-Demo-Session": otherToken } });
  expect(response.status()).toBe(404);
  await page.getByRole("button", { name: "Reset sandbox" }).click();
  await expect(page.getByRole("heading", { name: "Discover a suitable agent" })).toBeVisible();
  const revoked = await other.request.get("http://127.0.0.1:8011/api/v1/jobs", { headers: { "X-Demo-Session": original.token } });
  expect(revoked.status()).toBe(401);
  await other.close();
});

test("failure blocks settlement and refund records the dispute outcome", async ({ page }, info) => {
  await fundedJob(page);
  await page.getByRole("button", { name: /Failing sample Intentionally/ }).click();
  await page.getByRole("button", { name: "Submit failing sample" }).click();
  await page.getByRole("button", { name: "Run deterministic verification" }).click();
  await expect(page.getByText("Settlement blocked.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Release eligible simulated funds" })).toHaveCount(0);
  await page.getByRole("button", { name: "Open dispute with evidence" }).click();
  await page.getByRole("button", { name: "Review and refund the simulated balance" }).click();
  await expect(page.getByText("escrow.refunded", { exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath("refunded-desktop.png"), fullPage: true });
  await page.getByRole("link", { name: "Open this job in the workspace" }).click();
  await expect(page.getByRole("heading", { name: "Simulated ledger" })).toBeVisible();
});

test("API failure is explicit and retry recovers without fake records", async ({ page }) => {
  await page.route("**/api/v1/agents*", route => route.abort());
  await page.goto("/marketplace/");
  await expect(page.getByRole("alert").filter({ hasText: "Registry unavailable" })).toBeVisible();
  await page.unroute("**/api/v1/agents*");
  await page.getByRole("button", { name: "Retry registry" }).click();
  await expect(page.getByRole("heading", { name: "Synthetic Beacon" })).toBeVisible();
  await page.getByRole("textbox", { name: "Search agent capabilities" }).fill("no-such-synthetic-agent");
  await expect(page.getByText("No agents match this search.")).toBeVisible();
});

test("revised terms fund the accepted amount and a corrected submission can pass", async ({ page }) => {
  await fundedJob(page, true);
  await page.getByRole("button", { name: /Failing sample Intentionally/ }).click();
  await page.getByRole("button", { name: "Submit failing sample" }).click();
  await page.getByRole("button", { name: "Run deterministic verification" }).click();
  await page.getByLabel("Corrected synthetic output").fill('{"result":"Corrected synthetic quality review with findings"}');
  await page.getByRole("button", { name: "Submit a correction" }).click();
  await expect(page.getByText("version 2", { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Run deterministic verification" }).click();
  await page.getByRole("button", { name: "Release eligible simulated funds" }).click();
  await expect(page.getByRole("heading", { name: "Review the persisted record" })).toBeVisible();
  await expect(page.getByText("42.00 USD", { exact: true })).toHaveCount(2);
  await page.getByRole("link", { name: "Open this job in the workspace" }).click();
  await expect(page.getByText(/Accepted version: 2/)).toBeVisible();
});

test("invalid sessions require explicit recovery and offline state is truthful", async ({ page, context }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("autoescrow-demo-session", "invalid-expired-session"));
  let issuance = 0;
  page.on("request", request => { if (request.url().endsWith("/demo/session")) issuance += 1; });
  await page.goto("/demo/");
  const dialog = page.getByRole("dialog", { name: "Start a fresh demo session" });
  await expect(dialog).toBeVisible();
  expect(issuance).toBe(0);
  await expect(dialog.getByLabel(/Demo access code/)).toBeFocused();
  await context.setOffline(true);
  await expect(page.getByText(/You are offline/)).toBeVisible();
  await context.setOffline(false);
  await expect(page.getByText(/You are offline/)).toHaveCount(0);
  await page.getByRole("button", { name: "Start session", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Discover a suitable agent" })).toBeVisible();
  expect(issuance).toBe(1);
});

for (const width of [1440, 768, 390]) {
  test(`all primary routes render without horizontal page overflow at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    for (const route of ["", "demo", "marketplace", "discover", "dashboard", "jobs", "negotiation", "negotiate", "escrow", "execution", "execute", "verification", "disputes", "reputation", "audit", "risk", "settings", "identity", "initialize"]) {
      await page.goto(`/${route}${route ? "/" : ""}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.waitForTimeout(200);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      if (route === "marketplace") {
        const bounds = await page.getByRole("button", { name: "Show only available agents" }).boundingBox();
        expect(bounds).not.toBeNull();
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      }
      if (route === "") {
        await expect(page.getByAltText("Detailed synthetic metallic robot head")).toBeVisible();
        await expect(page.locator('img[src="/robot-head-cutout.png"]')).toHaveCount(1);
        await expect(page.getByText("What this prototype proves")).toBeVisible();
      }
      await page.screenshot({ path: info.outputPath(`${route || "home"}-${width}.png`), fullPage: true });
    }
    if (width === 390) {
      await page.goto("/jobs/");
      await page.getByRole("button", { name: "Open workspace navigation" }).click();
      await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Disputes" }).click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Disputes & evidence");
    }
    expect(errors).toEqual([]);
  });
}

test("mobile visitor can complete the passing workflow", async ({ page }, info) => {
  test.setTimeout(150000);
  // The suite can legitimately exhaust the real 10-issuances/minute ceiling.
  // Honor Retry-After instead of disabling admission protections for browser QA.
  let session = await page.request.post("http://127.0.0.1:8011/api/v1/demo/session");
  if (session.status() === 429) {
    const seconds = Number(session.headers()["retry-after"]);
    expect(seconds).toBeGreaterThan(0);
    expect(seconds).toBeLessThanOrEqual(60);
    await page.waitForTimeout((seconds + 1) * 1000);
    session = await page.request.post("http://127.0.0.1:8011/api/v1/demo/session");
  }
  expect(session.status()).toBe(200);
  await page.addInitScript(token => { if (!localStorage.getItem("autoescrow-demo-session")) localStorage.setItem("autoescrow-demo-session", token); }, (await session.json()).token);
  await page.setViewportSize({ width: 390, height: 844 });
  await fundedJob(page);
  await page.getByRole("button", { name: "Submit passing sample" }).click();
  await page.getByRole("button", { name: "Run deterministic verification" }).click();
  await page.getByRole("button", { name: "Release eligible simulated funds" }).click();
  await expect(page.getByRole("heading", { name: "Review the persisted record" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath("settled-mobile.png"), fullPage: true });
});

test("workspace requests recover into an explicit session when hosted reads require one", async ({ page }) => {
  await page.goto("/jobs/");
  await expect(page.getByRole("heading", { name: "Job registry" })).toBeVisible();
  await expect(page.getByText("Your sandbox is ready for its first job")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("autoescrow-demo-session"))).not.toBeNull();
});

test("global light mode remains active across settings reloads", async ({ page }) => {
  await page.goto("/settings/");
  await expect(page.getByRole("button", { name: "Light mode" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Global light mode is active.")).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(false);
  await page.reload();
  await expect(page.getByRole("button", { name: "Light mode" })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(false);
});
