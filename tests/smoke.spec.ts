import { expect, test } from "@playwright/test";

const routes = ["/", "/auth", "/map", "/forecast", "/trips", "/community", "/learn", "/market", "/profile", "/profile/farid"];

for (const route of routes) {
  test(`${route} renders without horizontal overflow`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(route);
    await expect(page.locator("body")).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    expect(errors).toEqual([]);
    if (["/", "/map", "/forecast"].includes(route)) {
      const name = route === "/" ? "home" : route.slice(1);
      await page.screenshot({ path: `test-results/${name}-${testInfo.project.name}.png`, fullPage: route !== "/map" });
    }
  });
}

test("catch composer requires an account", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Share your latest catch/i }).click();
  await expect(page.getByRole("heading", { name: "Create a post" })).toBeVisible();
  await page.getByLabel("Species").fill("Siakap");
  await page.getByRole("button", { name: "Publish catch" }).click();
  await page.waitForURL("**/auth");
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
});

test("post author opens a public profile", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "View Farid Rahman's profile" }).click();
  await expect(page).toHaveURL(/\/profile\/farid$/);
  await expect(page.getByRole("heading", { name: "Farid Rahman" })).toBeVisible();
});

test("real fishing map loads tiles and selectable indicators", async ({ page }) => {
  await page.goto("/map");
  await expect(page.locator(".leaflet-tile-loaded").first()).toBeVisible({ timeout: 15000 });
  await expect(page.locator(".fishing-map-marker")).toHaveCount(5);
  await page.locator(".fishing-map-marker").nth(1).click();
  await expect(page.getByRole("heading", { name: "Pulau Aman Kelong" })).toBeVisible();
});

test("home catch images and mobile navigation labels render", async ({ page }) => {
  await page.goto("/");
  const firstCatchImage = page.locator(".catch-image img").first();
  await expect(firstCatchImage).toBeVisible();
  await expect.poll(() => firstCatchImage.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  if (await page.locator(".mobile-nav").isVisible()) {
    for (const label of ["Home", "Map", "Forecast", "Trips", "Learn", "Market", "Progress"]) await expect(page.locator(".mobile-nav").getByText(label, { exact: true })).toBeVisible();
  }
});

test("home catch photo opens and closes the large viewer", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Enlarge .* catch photo/i }).first().click();
  await expect(page.getByRole("dialog", { name: /catch photo/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "Close enlarged photo" })).toBeVisible();
  await page.getByRole("button", { name: "Close enlarged photo" }).click();
  await expect(page.getByRole("dialog", { name: /catch photo/i })).toBeHidden();
});
