import { defineConfig } from "@playwright/test";

// Runs against the built site (dist/) served by a plain static server, in the Chrome
// already installed on this machine. `npm run check` = build + these tests.
export default defineConfig({
  testDir: "./tests",
  timeout: 90_000,
  fullyParallel: true,
  workers: 4,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4322",
    channel: "chrome",
    trace: "off",
  },
  webServer: {
    command: "node tests/serve.mjs",
    url: "http://127.0.0.1:4322/index.html",
    reuseExistingServer: true,
    timeout: 20_000,
  },
});
