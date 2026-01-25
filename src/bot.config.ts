import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer, { Page } from "puppeteer";
import { parse } from "date-fns";

//bot.config.ts
export const config = {
    importantPage: ["start", "status"],
    baseUrl: "https://backrooms-neo-t-wiki.wikidot.com",
    loginUrl: "https://www.wikidot.com/default--flow/login__LoginPopupScreen",
} as const;

export async function sleep(delay: number) {
    await new Promise((resolve) => setTimeout(resolve, delay * 1000));
}

/**
 * @function
 * @param path - 带斜杠的页面路径
 * @param num - 请输入要生成的路径数量
 * @param mid - 请输入不带斜杠的中间路径
 * @example e.g. str('/abc',1,'def')==>r.t. 'https://backrooms-neo-t-wiki.wikidot.com/def/abc'
 * str(['/abc','def'],1,'def')==>r.t. ['https://backrooms-neo-t-wiki.wikidot.com/def/abc','https://backrooms-neo-t-wiki.wikidot.com/def/def']
 * @returns {string|string[]}
 */
export function str(path: string | string[], mid?: string) {
    const baseUrl = "https://backrooms-neo-t-wiki.wikidot.com";
    if (typeof path == "string") {
        if (!mid) {
            return `${baseUrl}${path.startsWith("/") ? `${path}` : `/${path}`}`;
        } else {
            return `${baseUrl}/${mid}${path.startsWith("/") ? `${path}` : `/${path}`}`;
        }
    } else {
        let d = [];
        for (let i of path) {
            if (!mid) {
                d.push(`${baseUrl}${i.startsWith("/") ? `${i}` : `/${i}`}`);
            } else {
                d.push(
                    `${baseUrl}/${mid}${i.startsWith("/") ? `${i}` : `/${i}`}`,
                );
            }
        }
        return d;
    }
}

export async function ax(tab: number, m?: "rt") {
    const htmlContent = (
        await axios.get("https://backrooms-neo-t-wiki.wikidot.com/status", {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
        })
    ).data;
    const $ = cheerio.load(htmlContent);
    // 只需要将删除机器人的逻辑改动几个地方就可以了
    const signPageBox = $(
        `div#wiki-tab-0-${tab} > .list-pages-box > table.wiki-content-table`,
    );
    const aHrefCollage: string[] = [];
    const aTextCollage: string[] = [];
    const aForumCollage: (string | undefined)[] = [];
    signPageBox.find("a").each(function (i, el) {
        aHrefCollage.push(el.attribs.href);
        aTextCollage.push($(this).text());
    });
    const aTimeCollage: string[] = [];
    const aRateCollage: number[] = [];
    if (tab == 0) {
        signPageBox.find("span.odate").each((i, e) => {
            aTimeCollage.push(
                parse($(e).text(), "dd MMM yyyy HH:mm", new Date())
                    .toISOString()
                    .split(".")[0],
            );
        });
    }
    if (m === "rt") {
        signPageBox.find("tr").each((i, e) => {
            $(e)
                .find("td")
                .each((n, b) => {
                    if (n == 2) {
                        aRateCollage.push(parseInt($(b).text()));
                    }
                });
        });
    }
    for (let h of aHrefCollage) {
        let p;
        for (let n = 0; n <= 3; n++) {
            try {
                p = (
                    await axios.get(
                        `https://backrooms-neo-t-wiki.wikidot.com${h}`,
                        {
                            headers: {
                                "User-Agent":
                                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                            },
                            timeout: 15000,
                        },
                    )
                ).data;
                break;
            } catch (e) {
                console.log(e);
                continue;
            }
        }
        const A = cheerio.load(p);
        const discussBtn = A("a#discuss-button").attr("href");
        aForumCollage.push(discussBtn);
        await sleep(5);
    }
    return {
        h: aHrefCollage,
        f: aForumCollage,
        t: aTextCollage,
        tm: aTimeCollage,
        r: aRateCollage,
    };
}

export async function login(test: boolean) {
    try{
        let x = test ? { defaultViewport: null, devtools: true } : {};
        const browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            // ! TEST START-------------------------
            headless: test ? false : true,
            ...x,
            // ! TEST END  -------------------------
        });
        const page = await browser.newPage();
        await browser
            .defaultBrowserContext()
            .overridePermissions(config.baseUrl, []);
        page.on("dialog", async (dialog) => {
            console.log(dialog.message);
            await dialog.accept();
        });
        await page.goto(config.loginUrl, {
            timeout: 100000,
        });
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
        return { b: browser, p: page };
    } catch(e){
        console.log(e);
        throw Error(e);
    }
}

/**
 *
 * @description 返回的字符串：.post-container:has(#${str})
 */
export async function postFind(np1: Page) {
    const tb = await np1.$$(".post .title");
    for (let v of tb) {
        let t = (
            await (await v!.getProperty("textContent")).jsonValue()
        ).trim();
        if (t === "职员帖：删除宣告" || t === "职员帖：长期低分删除宣告") {
            //? -------------------------------------------------
            let hI = await v.evaluate((el) => el.hasAttribute("id"));
            if (!hI) {
                await sleep(5);
                continue;
            }
            const postId = await np1.evaluate((el) => el.id, v);
            //? --------------------------------------------------
            let str = postId;
            const selector = `.post-container:has(#${str})`;
            //? ---------------------------------------------------
            await sleep(10);
            await np1.waitForSelector(`#${str}`, {
                timeout: 30000,
                visible: true,
            });
            const post = await np1.$(selector);
            return {
                p1: post,
                s1: selector,
                id: postId.split("-")[2],
                isF: true,
            };
        } else {
            continue;
        }
    }
    return {
        isF: false,
    };
}
