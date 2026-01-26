import "dotenv/config";
import { config, sleep, ax, str, login, postFind } from "../bot.config.ts";
//cd.ts - 一般删除程序
async function bot() {
    for (let i = 1; i <= 3; i++) {
        const { h, f } = await ax(i);
        console.log(h, f);
        await a(h, f as string[], i);
    }
}

bot().catch((e) => console.log(e));

async function a(pageArr: string[], arr: string[], i: number) {
    for (let c = 0; c < 3; c++) {
        try {
            const { b, p } = await login(false);
            await sleep(10);
            for (let n = 0; n < pageArr.length; n++) {
                //具体逻辑
                const np = await b.newPage();
                await np.goto(str(pageArr[n]) as string, {
                    waitUntil: "networkidle0",
                });
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
                });
                await sleep(1);
                await np.evaluate(() => {
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
                    await np.goto(str(arr[n]) as string, {
                        waitUntil: "domcontentloaded",
                    });
                }
                const { s1, id, isF } = await postFind(np);
                if (!isF) {
                    await np.click("#new-post-button");
                } else {
                    await np.click(
                        `${s1} a[onclick="togglePostOptions(event,${id})"]`,
                    ); //wikidot你告诉我，为什么这里不用引号？？
                    await np.waitForSelector(
                        `a[onclick="WIKIDOT.modules.ForumViewThreadModule.listeners.editPost(event,'${id}')"]`,
                    ); //这里有引号你是几个意思？？？尼玛的两个人写的代码吗？？
                    await np.click(
                        `a[onclick="WIKIDOT.modules.ForumViewThreadModule.listeners.editPost(event,'${id}')"]`,
                    );
                    await np.waitForSelector("#np-title");
                    await np.evaluate(() => {
                        (
                            document.querySelector(
                                "#np-title",
                            ) as HTMLInputElement
                        ).value = "";
                        (
                            document.querySelector(
                                "#np-text",
                            ) as HTMLInputElement
                        ).value = "";
                    });
                    await sleep(2);
                }
                await np.waitForSelector("#np-title");
                await np.type("#np-title", "职员帖：删除宣告");
                await np.type(
                    "#np-text",
                    `由于条目已触达${i == 1 ? -2 : i == 2 ? -10 : -30}分的删除线，根据[[[/deletions-policy|删除政策]]]，据此宣告将${i == 1 ? "于72小时后" : i == 2 ? "于24小时后" : "立即"}删除此条目\n[[iframe https://secretppl608.github.io/time.html?m=cd&t=${i == 1 ? 'f1' : i == 2 ? 'f2' : 'f3'}&g=${i == 1 ? Date.now() + 72 * 60 * 60 * 1000 : i == 2 ? Date.now() + 24 * 60 * 60 * 1000 : Date.now()} style="width:400px;display:block;height:120px;"]]\n此帖为职员帖，不应在此帖下回复，除非您并非原作者但希望重写，则可以在此帖下回复希望重写条目的意图，如果您是原作者并认为自己的心血不应被删除，可以联系职员评估是否应当得到豁免。`,
                    { delay: 100 },
                );
                await np.click("#np-post");
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
