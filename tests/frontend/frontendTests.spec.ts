// import { test, expect } from '@playwright/test';

// test('has title', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Expect a title "to contain" a substring.
//   await expect(page).toHaveTitle(/Playwright/);
// });

// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });
import { test, expect } from "@playwright/test";

test.describe("AddressValidator Component", () => {
  test("should render without crashing", async ({ page }) => {
    // Navigate to the page where the AddressValidator component is used
    await page.goto("http://localhost:3000"); // Update with your app's URL or route

    // Check if the component is visible
    const addressValidator = await page.locator(
      "text=Australian Address Validator"
    ); // Update with a selector for your component
    await expect(addressValidator).toBeVisible();
  });
});

test.describe("Australian Address Validator", () => {
  test("should display validation errors on empty submission", async ({
    page,
  }) => {
    // Navigate to the page where the AddressValidator component is rendered
    await page.goto("http://localhost:3000"); // Replace with your actual app URL or local server address

    // Click the Submit button
    await page.click('button:has-text("Submit")');

    // Check for validation error messages
    const postcodeError = page.locator(
      "text=A postcode is required. Please enter a postcode."
    );
    const suburbError = page.locator(
      "text=A suburb is required. Please enter a suburb."
    );
    const stateError = page.locator(
      "text=A state is required. Please select a state."
    );

    // Assert that the error messages are visible
    await expect(postcodeError).toBeVisible();
    await expect(suburbError).toBeVisible();
    await expect(stateError).toBeVisible();

    // Optionally, verify that the fields have a red border or other visual indicators
    const postcodeInput = page.locator('input[placeholder="Enter postcode"]');
    const suburbInput = page.locator('input[placeholder="Enter suburb"]');
    const stateSelect = page.locator("select");

    await expect(postcodeInput).toHaveClass("input-error");
    await expect(suburbInput).toHaveClass("input-error");
    await expect(stateSelect).toHaveClass("input-dropdown-error");
  });
});

test.describe("Australian Address Validator", () => {
  test("should show validation errors for invalid inputs", async ({ page }) => {
    await page.goto("http://localhost:3000");

    // Fill in invalid inputs
    await page.fill('input[placeholder="Enter postcode"]', "");
    await page.fill('input[placeholder="Enter postcode"]', "abcd");
    await page.press('input[placeholder="Enter postcode"]', "Tab"); // Trigger blur
    await page.fill('input[placeholder="Enter suburb"]', "12345"); // Leave state blank
    await page.click('button:has-text("Submit")');

    // Wait for validation errors
    await page.waitForSelector("text=The postcode must contain only digits.", {
      timeout: 10000,
    });
    await page.waitForSelector("text=The suburb must contain only letters.", {
      timeout: 10000,
    });

    // Assert that error messages are visible
    const postcodeError = page.locator(
      "text=The postcode must contain only digits."
    );
    const suburbError = page.locator(
      "text=The suburb must contain only letters."
    );

    await expect(postcodeError).toBeVisible();
    await expect(suburbError).toBeVisible();

    // Check the inputs retain their invalid values
    const postcodeInput = page.locator('input[placeholder="Enter postcode"]');
    const suburbInput = page.locator('input[placeholder="Enter suburb"]');

    await expect(postcodeInput).toHaveValue("abcd");
    await expect(suburbInput).toHaveValue("12345");

    // Take a screenshot for debugging in headless mode
    await page.screenshot({ path: "validation-debug.png", fullPage: true });
  });
});

test.describe("Australian Address Validator with Mocked API", () => {
  test("should display success message for valid address submission", async ({
    page,
  }) => {
    // Intercept the API request to mock the response
    await page.route(
      "http://localhost:3000/api/validatorProxy",
      async (route) => {
        console.log("Mocking API response for /api/validatorProxy");
        // Mocked response matching the SearchPostcodeInterface
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            valid: true,
            reason: undefined,
            badPostcode: false,
            badState: false,
            badSuburb: false,
          }),
        });
      }
    );

    // Navigate to the page
    await page.goto("http://localhost:3000"); // Replace with your actual app URL

    // Input valid values
    await page.fill('input[placeholder="Enter postcode"]', "2204"); // Valid postcode
    await page.fill('input[placeholder="Enter suburb"]', "Marrickville"); // Valid suburb
    await page.selectOption("select", { label: "New South Wales" }); // Valid state (adjust the label or value if necessary)

    // Click the Submit button
    await page.click('button:has-text("Submit")');

    // Verify the success message appears
    const successMessage = page.locator("text=Address Valid");
    await expect(successMessage).toBeVisible();

    // Optionally verify the form inputs are still valid
    const postcodeInput = page.locator('input[placeholder="Enter postcode"]');
    const suburbInput = page.locator('input[placeholder="Enter suburb"]');
    // const stateInput = page.locator("select");

    await expect(postcodeInput).toHaveValue("2204");
    await expect(suburbInput).toHaveValue("Marrickville");
    // await expect(stateInput).toHaveText("NSW");
  });
});

test.describe("Australian Address Validator with Mocked API", () => {
  test("should display error messages and field styles for invalid address submission", async ({
    page,
  }) => {
    // Intercept the API request to mock the response
    await page.route("**/validate-address", async (route) => {
      // Mocked response for invalid submission
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          valid: false,
          reason: "test reason",
          badPostcode: true,
          badState: true,
          badSuburb: true,
        }),
      });
    });

    // Navigate to the page
    await page.goto("http://localhost:3000");

    // Input invalid values
    await page.fill('input[placeholder="Enter postcode"]', "1111");
    await page.fill('input[placeholder="Enter suburb"]', "Fake");
    await page.selectOption("select", { label: "New South Wales" });

    // Click the Submit button
    await page.click('button:has-text("Submit")');

    // Verify error messages and reason
    // const reasonMessage = page.locator("text=test reason");
    // await expect(reasonMessage).toBeVisible();

    const successMessage = page.locator("text=Address Not Valid");
    await expect(successMessage).toBeVisible();

    // Verify the input fields have the error classes applied
    const postcodeInput = page.locator('input[placeholder="Enter postcode"]');
    const suburbInput = page.locator('input[placeholder="Enter suburb"]');
    const stateSelect = page.locator("select");

    await expect(postcodeInput).toHaveClass(/input-error/);
    await expect(suburbInput).toHaveClass(/input-error/);
    await expect(stateSelect).toHaveClass(/input-dropdown-error/);
  });
});
