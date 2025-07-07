const { test, expect } = require('../fixture/axe-test');
// const { test, expect } = require('@playwright/test');
const { createHtmlReport } = require('axe-html-reporter');


test('Accessibility audit for entire site', async ({ page, makeAxeBuilder }) => {
  // Start at homepage
  await page.goto('https://your-site.com/');
  
  // Get all internal links on the page
  const links = await page.$$eval('a[href^="/"], a[href^="https://your-site.com/"]', 
    anchors => anchors.map(a => a.href));
  
  const uniqueLinks = [...new Set(links)]; // Remove duplicates
  
  const allResults = [];
  
  // Test homepage first
  const homepageResults = await makeAxeBuilder().analyze();
  allResults.push(homepageResults);
  
  // Test each unique page
  for (const url of uniqueLinks) {
    try {
      await page.goto(url, { waitUntil: 'networkidle' });
      const results = await makeAxeBuilder().analyze();
      allResults.push(results);
    } catch (error) {
      console.error(`Failed to test ${url}:`, error);
    }
  }
  
  // Generate HTML report
  createHtmlReport({
    results: { violations: allResults.flatMap(r => r.violations) },
    options: {
      outputDir: 'accessibility-reports',
      reportFileName: 'full-site-accessibility.html'
    }
  });
  
  // Assert no violations found
  const totalViolations = allResults.reduce((sum, r) => sum + r.violations.length, 0);
  expect(totalViolations).toBe(0);
});
