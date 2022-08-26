import puppeteer from 'puppeteer-extra';

// add stealth plugin and use defaults (all evasion techniques)
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdBlocker from 'puppeteer-extra-plugin-adblocker';
import Recaptcha from 'puppeteer-extra-plugin-recaptcha';
import Aua from 'puppeteer-extra-plugin-anonymize-ua';
import puppeteer_func from './func/puppeteer';
import { getDifference, readData, writeData } from './func/utils';
import lodash from 'lodash';

puppeteer.use(StealthPlugin());
puppeteer.use(AdBlocker());
puppeteer.use(Recaptcha());
puppeteer.use(Aua());

puppeteer
  .launch({ headless: true, args: ['--no-sandbox'] })
  .then(async browser => {
    const resPage = await puppeteer_func(browser, 'https://nhentai.net');

    const data1 = readData('data.json');

    if (!lodash.isEmpty(getDifference(data1, resPage))) {
      writeData(resPage, {
        wsOption: { enabled: false },
        mongooseConfig: { enabled: false },
      });
    }

    await browser.close();
  });
