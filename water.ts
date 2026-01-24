// 发帖+打标签机器人，方便之前的删文机器人操作
import axios from "axios";
import * as cheerio from "cheerio";
import { Client } from "@ukwhatn/wikidot";
import "dotenv/config";
import { config } from "./bot.config.ts";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AnonymizeUAPlugin from "puppeteer-extra-plugin-anonymize-ua";

async function sleep(delay: number) {
    await new Promise((resolve) => setTimeout(resolve, delay * 1000));
}

w();

puppeteer.use(StealthPlugin());
puppeteer.use(AnonymizeUAPlugin());
async function w() {
    const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        //headless: true,
        // ! TEST START-------------------------
        headless: false,
        defaultViewport: null,
        devtools: true,
        // ! TEST END  -------------------------
    });
    const page = await browser.newPage();
    await browser
        .defaultBrowserContext()
        .overridePermissions("https://拾昔.wikidot.com", []);
    page.on("dialog", async (dialog) => {
        console.log(dialog.message);
        await dialog.accept();
    });
    await page.goto(
        "https://www.wikidot.com/default--flow/login__LoginPopupScreen",
    );
    await page.type(
        'input.text.form-control.input-lg[name="login"]',
        process.env.BOT_ACCOUNT!,
    );
    await page.type(
        'input.text.form-control.input-lg[name="password"]',
        process.env.BOT_PASSWORD!,
    );
    await page.click('button.btn.btn-primary.btn-lg[type="submit"]');
    await page.waitForNavigation();
    await sleep(5);
    const np1 = await browser.newPage();
    await np1.goto('https://拾昔.wikidot.com/forum/t-17570491/');
    for(let n = 0;n<100;n++){
        await np1.click('#new-post-button');
        await np1.waitForSelector('#np-text',{timeout:5000});
        await np1.type('#np-text','水帖');
        await np1.click('#np-post');
        await sleep(5);
    }
    await np1.close();
    await browser.close();
}
