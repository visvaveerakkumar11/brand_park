// End-to-end checks against a running dev server (npm run dev) and database.
// Run: npm run test:e2e   (uses the local Chrome install; set CHROME_PATH to override)
import "dotenv/config";
import assert from "node:assert/strict";
import pg from "pg";
import { chromium } from "playwright-core";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();

const stockOf = async (sku) => (await db.query(`select stock from "Variant" where sku = $1`, [sku])).rows[0].stock;
const setStock = (sku, n) => db.query(`update "Variant" set stock = $2 where sku = $1`, [sku, n]);

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const results = [];
async function step(name, fn) {
  try {
    await fn();
    results.push(["PASS", name]);
    console.log(`PASS  ${name}`);
  } catch (e) {
    results.push(["FAIL", name]);
    console.log(`FAIL  ${name}\n      ${e.message.split("\n").slice(0, 6).join("\n      ")}`);
  }
}

async function addToBag(page, slug, size, qty = 1) {
  await page.goto(`${BASE}/product/${slug}`);
  await page.getByRole("radio", { name: size, exact: true }).check({ force: true });
  for (let i = 1; i < qty; i++) await page.getByRole("button", { name: "Increase quantity" }).click();
  await page.getByRole("button", { name: "Add to bag" }).click();
}

async function fillCheckout(page, email) {
  await page.goto(`${BASE}/checkout`);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Full name").fill("Arjun Mehta");
  await page.getByLabel("Mobile number").fill("98765 43210");
  await page.getByLabel("Address", { exact: true }).fill("12 Residency Road");
  await page.getByLabel("City").fill("Bengaluru");
  await page.getByLabel("State").selectOption("Karnataka");
  await page.getByLabel("PIN code").fill("560025");
}

/** Waits for visible text (streamed sections can briefly appear twice while being swapped in). */
const seen = (page, text, timeout) => page.getByText(text).filter({ visible: true }).first().waitFor({ timeout });

const TEE = "essential-cotton-heavyweight-tee";
const TEE_M = "ESSENTIAL-COTTON-HEAVYWEIGHT-TEE-SAGE-M";
let orderUrl = "";
// Known starting stock so repeated runs behave the same.
await setStock(TEE_M, 20);

// ------------------------------------------------------------ guest flow
const guest = await browser.newContext();
const page = await guest.newPage();

await step("add to bag requires a size", async () => {
  await page.goto(`${BASE}/product/${TEE}`);
  await page.getByRole("button", { name: "Add to bag" }).click();
  await seen(page, "Please select a size.");
});

await step("add to bag updates the header count", async () => {
  await addToBag(page, TEE, "M");
  await seen(page, "added to your bag");
  await page.getByRole("link", { name: "Shopping bag, 1 items" }).waitFor();
});

await step("server rejects quantities above live stock", async () => {
  // The product page may show cached stock; the server must check the live value.
  await setStock(TEE_M, 1);
  await addToBag(page, TEE, "M"); // 1 already in the bag, only 1 in stock
  await seen(page, "You already have the maximum available in your bag.");
  await setStock(TEE_M, 20);
});

await step("cart quantity update recalculates totals", async () => {
  await page.goto(`${BASE}/cart`);
  await page.getByRole("button", { name: "Increase quantity of Essential Cotton Heavyweight Tee" }).click();
  await seen(page, "₹2,598"); // 2 × ₹1,299
  await seen(page, "You've unlocked free delivery");
  await page.getByRole("link", { name: "Shopping bag, 2 items" }).waitFor();
});

await step("checkout validates required fields", async () => {
  await page.goto(`${BASE}/checkout`);
  await page.getByRole("button", { name: /Place order/ }).click();
  await seen(page, "Enter a valid email address.");
  await seen(page, "Enter a valid 6-digit PIN code.");
});

await step("coupon is applied server-side and floored to rupees", async () => {
  await fillCheckout(page, "guest.e2e@example.com");
  await page.getByLabel("Discount code").fill("welcome10");
  await page.getByRole("button", { name: "Apply" }).click();
  await seen(page, "Code WELCOME10 applied.");
  await seen(page, "−₹259"); // 10% of ₹2,598 = ₹259.80 → ₹259
  await page.getByRole("button", { name: "Place order · ₹2,339" }).waitFor();
});

await step("placing a COD order reserves stock and clears the bag", async () => {
  const before = await stockOf(TEE_M);
  await page.getByRole("button", { name: /Place order/ }).click();
  await page.waitForURL(/\/order-confirmation\//, { timeout: 30_000 });
  orderUrl = page.url();
  await seen(page, "Thank you for your order, Arjun.");
  assert.equal(await stockOf(TEE_M), before - 2);
  const { rows } = await db.query(`select total, discount, shipping, status from "Order" order by "createdAt" desc limit 1`);
  assert.deepEqual(rows[0], { total: 233_900, discount: 25_900, shipping: 0, status: "CONFIRMED" });
  await page.getByRole("link", { name: "Shopping bag" }).waitFor(); // badge gone
});

// The order page streams, so a denied request renders the not-found UI (with noindex) rather than a 404 status.
async function assertOrderHidden(p) {
  await p.goto(orderUrl.split("?")[0]);
  await seen(p, "Page not found");
  assert.equal(await p.getByText(/Thank you for your order/).count(), 0);
}

await step("order page needs the access token", async () => {
  const anon = await browser.newContext();
  const p = await anon.newPage();
  await assertOrderHidden(p);
  await p.goto(orderUrl);
  await seen(p, "Thank you for your order, Arjun.");
  await anon.close();
});

// ---------------------------------------------------- concurrent checkout
await step("two shoppers racing for the last unit: exactly one wins", async () => {
  const SKU = "RELAXED-HEAVYWEIGHT-TEE-WHITE-XXL";
  const original = await stockOf(SKU);
  await setStock(SKU, 1);
  const shoppers = await Promise.all([browser.newContext(), browser.newContext()]);
  const pages = await Promise.all(shoppers.map((c) => c.newPage()));
  for (const p of pages) {
    await addToBag(p, "relaxed-heavyweight-tee", "XXL");
    await seen(p, "added to your bag");
    await fillCheckout(p, "racer@example.com");
  }
  await Promise.all(pages.map((p) => p.getByRole("button", { name: /Place order/ }).click()));
  const outcomes = await Promise.all(
    pages.map((p) =>
      Promise.race([
        p.waitForURL(/\/order-confirmation\//, { timeout: 30_000 }).then(() => "won"),
        seen(p, /no longer has 1 in stock/, 30_000).then(() => "lost"),
      ]),
    ),
  );
  assert.deepEqual(outcomes.sort(), ["lost", "won"]);
  assert.equal(await stockOf(SKU), 0);
  await Promise.all(shoppers.map((c) => c.close()));
  await setStock(SKU, original);
});

// -------------------------------------------------------------- accounts
const email = `e2e.${Date.now()}@example.com`;
const member = await browser.newContext();
const mp = await member.newPage();

await step("account pages redirect anonymous visitors to login", async () => {
  await mp.goto(`${BASE}/account/orders`);
  await mp.waitForURL(/\/login\?next=%2Faccount%2Forders/);
});

await step("register signs in and merges the guest bag", async () => {
  await addToBag(mp, "slim-tapered-jeans", "32");
  await seen(mp, "added to your bag");
  await mp.goto(`${BASE}/register`);
  await mp.getByLabel("Full name").fill("Rohan Iyer");
  await mp.getByLabel("Email", { exact: true }).fill(email);
  await mp.getByLabel("Password", { exact: true }).fill("correct-horse-1");
  await mp.getByLabel("Confirm password").fill("correct-horse-1");
  await mp.getByRole("button", { name: "Create account" }).click();
  await mp.waitForURL(`${BASE}/account`);
  await seen(mp, "Hello, Rohan");
  await mp.goto(`${BASE}/cart`);
  await seen(mp, "Slim Tapered Jeans");
});

await step("signed-in user cannot open another customer's order", async () => {
  await assertOrderHidden(mp);
});

await step("saved address appears at checkout", async () => {
  await mp.goto(`${BASE}/account/addresses`);
  await mp.getByLabel("Full name").fill("Rohan Iyer");
  await mp.getByLabel("Mobile number").fill("9123456780");
  await mp.getByLabel("Address", { exact: true }).fill("4 Marine Drive");
  await mp.getByLabel("City").fill("Mumbai");
  await mp.getByLabel("State").selectOption("Maharashtra");
  await mp.getByLabel("PIN code").fill("400020");
  await mp.getByRole("button", { name: "Save address" }).click();
  await seen(mp, "Address saved.");
  await mp.goto(`${BASE}/checkout`);
  await mp.getByRole("button", { name: /Rohan Iyer/ }).waitFor();
  assert.equal(await mp.getByLabel("City").inputValue(), "Mumbai");
});

await step("wrong password is rejected; sign out and back in works", async () => {
  await mp.goto(`${BASE}/account`);
  await mp.getByRole("button", { name: "Sign out" }).click();
  await mp.waitForURL(`${BASE}/`);
  await mp.goto(`${BASE}/login`);
  await mp.getByLabel("Email", { exact: true }).fill(email);
  await mp.getByLabel("Password", { exact: true }).fill("wrong-password");
  await mp.getByRole("button", { name: "Sign in" }).click();
  await seen(mp, "Email or password is incorrect.");
  await mp.getByLabel("Password", { exact: true }).fill("correct-horse-1");
  await mp.getByRole("button", { name: "Sign in" }).click();
  await mp.waitForURL(`${BASE}/account`);
});

await step("wishlist: save, then move to bag", async () => {
  await mp.goto(`${BASE}/product/cotton-twill-joggers`);
  await mp.getByRole("button", { name: "Save Cotton Twill Joggers to wishlist" }).click();
  // Wait for the server action to finish (the button is disabled while it runs).
  await mp.getByRole("button", { name: "Remove Cotton Twill Joggers from wishlist" }).and(mp.locator(":not([disabled])")).waitFor();
  await mp.goto(`${BASE}/wishlist`);
  await seen(mp, "1 item saved.");
  await mp.getByLabel("Size for Cotton Twill Joggers").filter({ visible: true }).selectOption({ label: "34" });
  await mp.getByRole("button", { name: "Move to bag" }).click();
  await seen(mp, "Nothing saved yet");
  await mp.goto(`${BASE}/cart`);
  await seen(mp, "Cotton Twill Joggers");
});

await browser.close();
await db.end();
const failed = results.filter(([r]) => r === "FAIL").length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
