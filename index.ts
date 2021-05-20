import puppeteer from 'puppeteer-extra';
import { Page } from 'puppeteer';
import logger from './logger';
import moment from 'moment';

// instead of the puppeteer-extra official code, use the following 3 lines to fix https://github.com/berstend/puppeteer-extra/issues/211
const stealth = require('puppeteer-extra-plugin-stealth')();
stealth.onBrowser = () => {};
puppeteer.use(stealth);


const startingUrl = 'https://www.hauts-de-seine.gouv.fr/booking/create/14086/0';

const playSound = function playSound() {
    process.stdout.write('\x07');
    setTimeout(playSound, 2000);
};

const sleep = function (ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
};

const launch = async function (page: Page) {
    try {
        await page.goto(startingUrl);
        await page.waitForSelector('input#condition');
        page.click('input#condition');
        await sleep(100);
        page.click('input.Bbutton[name="nextButton"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        page.click('button#proceed-button');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        page.click('label[for="planning14089"]');
        await sleep(3000);
        page.click('input.Bbutton[name="nextButton"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        page.click('button#proceed-button');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        const element = await page.$('#FormBookingCreate');
        const value = await page.evaluate(el => el.textContent, element);

        if (value.indexOf('n\'existe') === -1) {
            logger.log('info', `OK`);
            playSound();
        } else {
            logger.log('info', `Unavailable`);
            setTimeout(() => launch(page), 60000);
        }
    } catch(e) {
        logger.log('error', `KO${e}`);
        await page.screenshot({path: `err-${moment().format()}.png`});
        setTimeout(() => launch(page), 60000);
    }
};

(async () => {
    const browser = await puppeteer.launch({headless: false});
    const page: any = await browser.newPage();

    await launch(page as Page);

    //await browser.close();
  })();

