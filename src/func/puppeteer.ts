import { Browser } from 'puppeteer';
import { NHdata } from '../interface';

export default async function puppeteer_func(browser: Browser, url: string) {
  const page = (await browser.pages())[0]!;

  await page.setViewport({ width: 800, height: 600 });

  await page.setUserAgent(
    'Mozilla/5.0 (Linux; U; Android 8.1.0; en-US; Nexus 6P Build/OPM7.181205.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/12.11.1.1197 Mobile Safari/537.36'
  );

  await page.goto(url);

  await page.waitForTimeout(10000);

  // await page.screenshot({ path: 'bot-debug.png' });

  const resPage = await page.evaluate(() => {
    const s: NodeListOf<HTMLAnchorElement> = document.querySelectorAll(
      '.index-popular div a'
    );
    const arrayP: NHdata[] = [];
    s.forEach(l => {
      const img = l.querySelector('img')!;
      const divP: HTMLDivElement | null = l.querySelector('.caption')!;
      const id = parseInt(l.href.slice(22, 28));
      arrayP.push({ id, name: divP.innerText, link: l.href, img: img.src });
    });
    return arrayP;
  });
  return resPage;
}
