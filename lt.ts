// 发帖+打标签机器人，方便之前的删文机器人操作
import puppeteer from "puppeteer";
import "dotenv/config";
import { config, sleep, ax, str, login } from "./bot.config.ts";

async function bot() {
    const { h, f } = await ax(6);
    // console.log(h,f);
    await a(h, f as string[]);
}

bot();

async function a(pageArr: string[], arr: string[]) {
    for (let c = 0; c < 3; c++) {
        try {
            const { b, p } = await login(false);
            await sleep(10);
            for (let n = 0; n < pageArr.length; n++) {
                //具体逻辑
                const np = await b.newPage();
                await np.goto(str(pageArr[n]) as string, { waitUntil: 'networkidle0' });
                await np.click("#tags-button");
                await np.waitForSelector("#page-tags-input");
                await np.evaluate(() => {
                    const t = document.querySelector(
                        "#page-tags-input",
                    ) as HTMLInputElement;
                    let r = t.value.split(" ");
                    r.push("待删除");
                    t.value = /(^|\s)待删除(\s|$)/.test(t.value)
                        ? t.value
                        : r.join(" ");
                    (
                        document.querySelector(
                            '[onclick="WIKIDOT.modules.PageTagsModule.listeners.save(event)"]',
                        ) as HTMLInputElement
                    ).click();
                });
                await np.waitForNavigation();
                await sleep(5);
                if (arr[n] === "javascript:;") {
                    await np.click("#discuss-button");
                    await np.waitForNavigation();
                } else {
                    await np.goto(str(arr[n]) as string, { waitUntil: "domcontentloaded" });
                }
                await np.click("#new-post-button");
                await np.waitForSelector("#np-title");
                await np.type("#np-title", "职员帖：长期低分删除宣告");
                await np.type(
                    "#np-text",
                    `由于条目已发布1个月，且分数并未达到合格线以上，根据[[[/deletions-policy|删除政策]]]，据此宣告将于72小时后删除此条目\n[[iframe https://secretppl608.github.io/time.html?m=ld&t=null&g=${Date.now() + 72 * 60 * 60 * 1000} style="width:400px;display:block;height:120px;"]]\n此帖为职员帖，不应在此帖下回复，除非您并非原作者但希望重写，则可以在此帖下回复希望重写条目的意图，如果您是原作者并认为自己的心血不应被删除，可以联系职员评估是否应当得到豁免。`,
                    { delay: 100 },
                );
                await np.click('#np-post');
                await np.waitForNavigation();
                await np.close();
            }
            await b.close();
            break;
        } catch (e) {
            console.log(e);
            continue;
        }
    }
}
