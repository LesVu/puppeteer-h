import puppeteer from 'puppeteer-extra';

// add stealth plugin and use defaults (all evasion techniques)
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdBlocker from 'puppeteer-extra-plugin-adblocker';
import Recaptcha from 'puppeteer-extra-plugin-recaptcha';
import Aua from 'puppeteer-extra-plugin-anonymize-ua';

import { getDifference, readData, writeData } from './func/utils';
import lodash from 'lodash';
import { jGuruData, NHdata } from './interface';

puppeteer.use(StealthPlugin());
puppeteer.use(AdBlocker());
puppeteer.use(Recaptcha());
puppeteer.use(Aua());

puppeteer.launch({ headless: true, args: ['--no-sandbox'] }).then(async browser => {
  const page = (await browser.pages())[0]!;
  await page.setViewport({ width: 800, height: 600 });
  await page.setUserAgent(
    'Mozilla/5.0 (Linux; U; Android 8.1.0; en-US; Nexus 6P Build/OPM7.181205.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/12.11.1.1197 Mobile Safari/537.36'
  );

  await page.goto('https://nhentai.net');
  await page.waitForTimeout(10000);
  const resPage = await page.evaluate(() => {
    const s: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('.index-popular div a');
    const arrayP: NHdata[] = [];
    s.forEach(l => {
      const img = l.querySelector('img')!;
      const divP: HTMLDivElement | null = l.querySelector('.caption')!;
      const id = parseInt(l.href.slice(22, 28));
      arrayP.push({ id, name: divP.innerText, link: l.href, img: img.src });
    });
    return arrayP;
  });
  // await page.screenshot({ path: 'bot-debug.png' });
  let conditt = true;
  let pageNum = 1;
  const resPage2: jGuruData[] = [];

  while (conditt) {
    await page.goto(`https://jav.guru/page/${pageNum}`);
    const resPage3 = await page.evaluate(() => {
      const dateNow = new Date();
      const articles: NodeListOf<HTMLDivElement> = document.querySelectorAll('.inside-article');
      if (
        `${dateNow.getDate()} ${new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
          dateNow
        )}, ${dateNow.getFullYear() - 2000}` == articles[0]!.querySelector('.date')!.innerHTML
      ) {
        console.log('first block');
        const arrayJ: jGuruData[] = [];

        articles.forEach(article => {
          const img = article.querySelector('img')!.src;
          const name: HTMLAnchorElement | null = article.querySelector('.grid1 h2 a');
          const date = article.querySelector('.date')!.innerHTML;
          const tags: string[] = [];
          const atagslist: HTMLCollection = article.querySelector('.tags')!.children;
          const temp = [...atagslist];
          temp?.forEach(atag => tags.push(atag.innerHTML));
          let subMatch: string | undefined;
          const matches = name?.innerHTML.match(/\[(.*?)\]/);
          if (matches) {
            const [, subMatchIn] = matches;
            subMatch = subMatchIn;
          }
          const id = subMatch!;
          if (
            `${dateNow.getDate()} ${new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
              dateNow
            )}, ${dateNow.getFullYear() - 2000}` !== date
          ) {
            console.log('secod block');
            conditt = false;
            return;
          }
          arrayJ.push({ id, img, name: name!.innerHTML, tags, date });
        });

        return arrayJ;
      }
      conditt = false;
      console.log('trird');
      return undefined;
    });
    if (resPage3 !== undefined) {
      resPage2.push(...resPage3);
    }
    pageNum++;
  }

  console.log(resPage2);

  const data1 = readData('data.json');

  if (!lodash.isEmpty(getDifference(data1, resPage))) {
    writeData(resPage, {
      wsOption: { enabled: false },
      mongooseConfig: { enabled: false },
    });
  }

  await browser.close();
});
