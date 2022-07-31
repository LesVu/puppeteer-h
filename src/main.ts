'use strict';

// puppeteer-extra is a wrapper around puppeteer,
// it augments the installed puppeteer with plugin functionality
import puppeteer from 'puppeteer-extra';
import lodash from 'lodash';
import fs from 'fs';
import { sqlite, mongodb } from './db';
import { NHdata } from './interface';
// add stealth plugin and use defaults (all evasion techniques)
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdBlocker from 'puppeteer-extra-plugin-adblocker';
import Recaptcha from 'puppeteer-extra-plugin-recaptcha';
import Aua from 'puppeteer-extra-plugin-anonymize-ua';
import mongoose from 'mongoose';
puppeteer.use(StealthPlugin());
puppeteer.use(AdBlocker());
puppeteer.use(Recaptcha());
puppeteer.use(Aua());
// puppeteer usage as normal
puppeteer
  .launch({ headless: true, args: ['--no-sandbox'] })
  .then(async browser => {
    const page = (await browser.pages())[0]!;

    await page.setViewport({ width: 800, height: 600 });

    await page.setUserAgent(
      'Mozilla/5.0 (Linux; U; Android 8.1.0; en-US; Nexus 6P Build/OPM7.181205.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/12.11.1.1197 Mobile Safari/537.36'
    );

    await page.goto('https://nhentai.net');

    await page.waitForTimeout(10000);

    // await page.screenshot({ path: 'bot-debug.png' });

    const resPage = await page.evaluate(() => {
      let s: NodeListOf<HTMLAnchorElement> = document.querySelectorAll(
        '.index-popular div a'
      );
      let arrayP: NHdata[] = [];
      s.forEach(l => {
        const img = l.querySelector('img')!;
        const divP: HTMLDivElement | null = l.querySelector('.caption')!;
        const id = parseInt(l.href.slice(22, 28));
        arrayP.push({ id, name: divP.innerText, link: l.href, img: img.src });
      });
      return arrayP;
    });

    let tempdata1 = fs.readFileSync('data.json', { encoding: 'utf8' });
    // parse JSON object
    let tempdata: NHdata[] | undefined;
    if (!lodash.isEmpty(tempdata1)) {
      tempdata = JSON.parse(tempdata1.toString());
      console.log('Read data from data.json');
    }
    // print JSON object

    function getDifference(array1: NHdata[] | undefined, array2: NHdata[]) {
      if (!array1) return { a: 'placeholder' };
      if (!array2) return { a: 'placeholder' };
      return array1.filter(object1 => {
        return !array2.some(object2 => {
          return object1.id === object2.id;
        });
      });
    }

    // if (!lodash.isEmpty(getDifference(tempdata, resPage))) {
    if (true) {
      mongoose
        .connect('mongodb://127.0.0.1:27017/DataNH')
        .then(async db => {
          mongodb(resPage, db);
        })
        .catch(err => console.log(err));
      // sqlite(resPage);
      const data = JSON.stringify(resPage, null, 2);
      try {
        fs.writeFileSync('data.json', data);
        console.log('Successfully write to data.json');
      } catch (err) {
        console.error(err);
      }
    }

    await browser.close();
  });
