'use strict';

// puppeteer-extra is a wrapper around puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra');
const lodash = require('lodash');
const fs = require('fs');
const { sqlite, mongodb } = require('./db.js');
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdBlocker = require('puppeteer-extra-plugin-adblocker');
const Recaptcha = require('puppeteer-extra-plugin-recaptcha');
const Aua = require('puppeteer-extra-plugin-anonymize-ua');
puppeteer.use(StealthPlugin());
puppeteer.use(AdBlocker());
puppeteer.use(Recaptcha());
puppeteer.use(Aua());
// puppeteer usage as normal
puppeteer
  .launch({ headless: true, args: ['--no-sandbox'] })
  .then(async browser => {
    const page = (await browser.pages())[0];

    await page.setViewport({ width: 800, height: 600 });

    await page.setUserAgent(
      'Mozilla/5.0 (Linux; U; Android 8.1.0; en-US; Nexus 6P Build/OPM7.181205.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/12.11.1.1197 Mobile Safari/537.36'
    );

    await page.goto('https://nhentai.net');

    await page.waitForTimeout(10000);

    // await page.screenshot({ path: 'bot-debug.png' });

    const resPage = await page.evaluate(() => {
      let s = document.querySelectorAll('.index-popular div a');
      let arrayP = [];
      s.forEach(l => {
        const img = l.querySelector('img');
        const divP = l.querySelector('.caption');
        const id = l.href.substr(22, 6);
        arrayP.push({ id, name: divP.innerText, link: l.href, img: img.src });
      });
      return arrayP;
    });

    let tempdata1 = fs.readFileSync('data.json', { encoding: 'utf8' });
    // parse JSON object
    let tempdata;
    if (!lodash.isEmpty(tempdata1)) {
      tempdata = JSON.parse(tempdata1.toString());
      console.log('Data read');
    }
    // print JSON object

    function getDifference(array1, array2) {
      if (!array1) return { a: 'placeholder' };
      if (!array2) return { a: 'placeholder' };
      return array1.filter(object1 => {
        return !array2.some(object2 => {
          return object1.id === object2.id;
        });
      });
    }

    if (!lodash.isEmpty(getDifference(tempdata, resPage))) {
      // if (true) {
      mongodb(resPage);
      sqlite(resPage);
      const data = JSON.stringify(resPage, null, 2);
      try {
        fs.writeFileSync('data.json', data);
        console.log('JSON data is saved.');
      } catch (error) {
        console.error(err);
      }
    }

    await browser.close();
  });
