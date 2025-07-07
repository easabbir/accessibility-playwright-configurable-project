class HomePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.url = 'https://www.vivasoftltd.com/'; // Replace with your actual target
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('load');
  }
}

module.exports = { HomePage };
