import { spawnSync } from "node:child_process";
const result = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], {
  stdio: "inherit", env: { ...process.env, NEXT_PUBLIC_API_URL: "http://127.0.0.1:8011" },
});
process.exit(result.status ?? 1);
