const { AxeBuilder } = require('@axe-core/playwright');
const fs = require('fs');
const path = require('path');
const config = require('../config/wcag.config.json');
const { createHtmlReport } = require('axe-html-reporter');

const severityMap = {
  critical: 'must',
  serious: 'should',
  moderate: 'may',
  minor: 'may'
};

async function runAccessibilityTest(page, context = 'body') {
  const results = await new AxeBuilder({ page })
    .include(context)
    .withTags([config.wcagVersion])
    .analyze();

  const categorizedResults = results.violations.map((violation) => {
    const severity = severityMap[violation.impact] || 'may';

    return {
      id: violation.id,
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      impact: violation.impact,
      severity,
      nodes: violation.nodes.map((node) => ({
        target: node.target,
        html: node.html,
        failureSummary: node.failureSummary
      }))
    };
  });

  // Save JSON report
  const reportDir = path.join(__dirname, '../reports');
  const jsonReportPath = path.join(reportDir, 'axe-results.json');
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(jsonReportPath, JSON.stringify(categorizedResults, null, 2));

  // Generate HTML report
  const htmlReportPath = path.join(reportDir, 'axe-report.html');
  createHtmlReport({
    results,
    options: {
      projectKey: 'Accessibility Scan',
      outputDir: 'reports', // use relative path
      reportFileName: 'axe-report.html'
    }
  });

  // Console summary
  console.log('\nAccessibility Report Summary:');
  for (const level of config.reportLevels) {
    const count = categorizedResults.filter(r => r.severity === level).length;
    console.log(`  ${level.toUpperCase()}: ${count} issues`);
  }

  console.log(`\n✅ HTML report generated at: ${htmlReportPath}`);

  return categorizedResults;
}

module.exports = { runAccessibilityTest };
