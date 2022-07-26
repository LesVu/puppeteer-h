// puppeteer-extra is a wrapper around puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra');

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
// puppeteer usage as normal
puppeteer.launch({ headless: true }).then(async browser => {
  console.log('Check the bot tests..');
  // const page = await browser.newPage();
  const page = (await browser.pages())[0];
  await page.goto('');
  await page.waitFor(5000);
  await page.screenshot({ path: 'bot-test-result.png', fullPage: true });
  await page.evaluate(() => {
    let s = document.querySelectorAll(
      '.container.index-container.index-popular div.gallery'
    );
    console.log(s);
  });
  await browser.close();
});
