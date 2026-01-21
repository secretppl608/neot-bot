import axios from "axios";
import * as cheerio from "cheerio";
import { Client } from "@ukwhatn/wikidot";
import puppeteer, { Dialog } from "puppeteer";
import "dotenv/config";

async function sleep(delay: number) {
    await new Promise((resolve) => setTimeout(resolve, delay * 1000));
}

async function bot() {
    const authClientResult = await Client.create({
        username: process.env.BOT_ACCOUNT,
        password: process.env.BOT_PASSWORD,
    });
    if (!authClientResult.isOk()) {
        throw new Error("登陆失败");
    }
    const authClient = authClientResult.value;
    const siteResult = await authClient.site.get("backrooms-neo-t-wiki");
    if (!siteResult.isOk()) {
        throw new Error("Failed to retrieve site");
    }
    const site = siteResult.value;
    const htmlContent = (
        await axios.get("https://backrooms-neo-t-wiki.wikidot.com/status", {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
        })
    ).data;
    const $ = cheerio.load(htmlContent);
    const signPageBox = $(
        "div#wiki-tab-0-0 > .list-pages-box > table.wiki-content-table",
    );
    const aHrefCollage: string[] = [];
    const aTextCollage: string[] = [];
    const aForumCollage: (string | undefined)[] = [];
    signPageBox.find("a").each(function (i, el) {
        aHrefCollage.push(el.attribs.href);
        aTextCollage.push($(this).text());
    });
    for (let h of aHrefCollage) {
        let p = (
            await axios.get(`https://backrooms-neo-t-wiki.wikidot.com${h}`, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                },
            })
        ).data;
        const A = cheerio.load(p);
        const discussBtn = A("a#discuss-button").attr("href");
        aForumCollage.push(discussBtn);
    }
    await login(aHrefCollage, aForumCollage as string[]);
}

bot();

async function login(pageArr: string[], arr: string[]) {
    for (let c = 0; c < 3; c++) {
        try {
            const browser = await puppeteer.launch({
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                ],
                headless: true,
                // ! TEST START-------------------------
                // headless: false,
                // defaultViewport: null,
                // devtools: true,
                // ! TEST END  -------------------------
            });
            const page = await browser.newPage();
            await browser.defaultBrowserContext().overridePermissions("https://backrooms-neo-t-wiki.wikidot.com", []);
            page.on('dialog',async dialog=>{
                console.log(dialog.message)
                await dialog.accept();
            })
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
            await sleep(10);
            let gt = [];
            let id = [];
            for (let href = 0; href < arr.length; href++) {
                const np1 = await browser.newPage();
                await np1.goto(
                    `https://backrooms-neo-t-wiki.wikidot.com${arr[href]}`,
                    {
                        waitUntil: "domcontentloaded",
                        timeout: 100000,
                    },
                );
                const tb = await np1.$$(".post .title");
                for (let v of tb) {
                    let t = (
                        await (await v!.getProperty("textContent")).jsonValue()
                    ).trim();
                    if (t === "职员帖：删除宣告" || t === "职员帖:删除宣告") {
                        //? -------------------------------------------------
                        let hI = await v.evaluate((el) =>
                            el.hasAttribute("id"),
                        );
                        if (!hI) {
                            await sleep(5);
                            continue;
                        }
                        const postId = await np1.evaluate(el => el.id, v);
                        //? --------------------------------------------------
                        let str = postId;
                        const selector = `.post-container:has(#${str}) .content>p iframe`;
                        //? ---------------------------------------------------
                        await sleep(10);
                        await np1.waitForSelector(`#${str}`, {
                            timeout: 30000,
                            visible: true,
                        });
                        const post = await np1.$(selector);
                        const src: any = await (
                            await post!.getProperty("src")
                        ).jsonValue();
                        const g = src.split("&g=");
                        const idn = postId.split("-")[2];
                        const rt = Date.now();
                        let ng = parseInt(g[1]);
                        if (ng <= rt) {
                            console.log(ng);
                            const np2 = await browser.newPage();
                            await np2.goto(
                                `https://backrooms-neo-t-wiki.wikidot.com${pageArr[href]}`,{
                                    timeout: 100000
                                },
                            );
                            await np2.click("#more-options-button");
                            await sleep(1);
                            await np2.evaluate(() => {
                                (
                                    document.querySelector(
                                        "#delete-button",
                                    )! as HTMLButtonElement
                                ).click();
                            });
                            await sleep(5);
                            await np2.click(
                                'input[onclick="WIKIDOT.modules.RenamePageModule.listeners.rename(event)"]',
                            );
                            await np2.waitForNavigation();
                            await np2.close();
                        }
                        gt.push(g[1]);
                        id.push(idn);
                    }
                }
                await np1.close();
            }
            await browser.close();
            break;
        } catch (e) {
            console.log(e);
            continue;
        }
    }
}
