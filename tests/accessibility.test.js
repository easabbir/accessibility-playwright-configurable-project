const { test } = require('@playwright/test');
const { HomePage } = require('../pages/HomePage');
const { runAccessibilityTest } = require('../utils/axeHelper');

test.describe('Accessibility Tests', () => {
  test('Check accessibility on Home Page', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    await homePage.waitForPageLoad();

    const results = await runAccessibilityTest(page,'html');
    test.info().attachments.push({
      name: 'Accessibility Violations',
      contentType: 'application/json',
      path: './reports/axe-results.json'
    });
  });
});
