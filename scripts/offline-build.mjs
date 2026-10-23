import { distServer } from "./dist-server.mjs";
/** Stream the large self-contained HTML from local disk over loopback, avoiding
 * CDP's oversized route.fulfill/base64 message limit. Disable networking before
 * any gameplay gesture. The separate PWA check covers cached cold offline launch.
 * Callers block service workers so this checks the HTML's own embedded assets.
 */
export async function bootOfflineBuild(page, context) {
  const server = distServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  await context.route("**/*", (route) =>
    new URL(route.request().url()).origin === origin
      ? route.continue()
      : route.abort(),
  );
  try {
    await page.goto(origin + "/?qa");
    await page.waitForSelector('#stage[data-ready="true"]');
    await page.evaluate(() => document.fonts.ready);
    await context.setOffline(true);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}
