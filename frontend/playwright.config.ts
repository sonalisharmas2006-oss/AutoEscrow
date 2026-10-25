import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  timeout: 60000,
  expect: { timeout: 10000 },
  workers: 1,
  retries: 0,
  reporter: "list",
  use: { baseURL: "http://localhost:3011", viewport: { width: 1440, height: 1000 }, trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: [
    { command: "python tests/serve_e2e.py", cwd: "../backend", url: "http://127.0.0.1:8011/api/ready", reuseExistingServer: false, timeout: 60000 },
    { command: "python scripts/serve_static.py", url: "http://127.0.0.1:3011", reuseExistingServer: false },
  ],
});
