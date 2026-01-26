//用于重写+豁免的处理逻辑，机器人扫描数据页面第5-6板块的链接，然后将这些页面的待删除标签删除，打上相应标签，然后更新删除宣告为删除终止
import "dotenv/config";
import { config, sleep, ax, str, login, postFind } from "../bot.config.ts";

async function bot() {
    for (let i = 4; i <= 5; i++) {
        const { h, f } = await ax(i);
        // console.log(h,f);
        await a(h, f as string[], i);
    }
}

bot();

async function a(pageArr: string[], arr: string[], i: number) {
    for (let c = 0; c < 3; c++) {
        try {
            const { b, p } = await login(false);
            await sleep(10);
            for (let n = 0; n < pageArr.length; n++) {
                //具体逻辑
                if (i == 4) {
                    const np = await b.newPage();
                    await np.goto(str(pageArr[n]) as string, {
                        waitUntil: "networkidle0",
                    });
                    if (arr[n] === "javascript:;") {
                        await np.click("#discuss-button");
                        await np.waitForNavigation();
                    } else {
                        await np.goto(str(arr[n]) as string, {
                            waitUntil: "domcontentloaded",
                        });
                    }
                    const { isF, s1, id } = await postFind(
                        np,
                        "职员帖：条目重写中",
                    );
                    if (!isF) {
                        await np.click("#new-post-button");
                        await np.waitForSelector("#np-title");
                        await np.type("#np-title", "职员帖：条目重写中");
                        await np.type(
                            "#np-text",
                            `此条目正在被重写！这可能让它再度焕发生机，根据[[[/deletions-policy|删除政策]]]，重写中的文章有14天的时间，之后职员将再次评估重写是否有效\n[[iframe https://secretppl608.github.io/time.html?m=cd&t=f1&g=${Date.now() + 14 * 24 * 60 * 60 * 1000} style="width:400px;display:block;height:120px;"]]\n此帖为职员帖，不应在此帖下回复，若您对于重写条目有更好的想法，可以联系职员、作者或重写者。`,
                            { delay: 100 },
                        );
                        await np.click("#np-post");
                        await np.waitForNavigation();
                    } else {
                        const selector = `${s1} .content>p iframe`;
                        //? ---------------------------------------------------
                        await sleep(10);
                        await np.waitForSelector(selector, {
                            timeout: 30000,
                            visible: true,
                        });
                        const post = await np.$(selector);
                        const src: any = await (
                            await post!.getProperty("src")
                        ).jsonValue();
                        const g = parseInt((src as string).split("&g=")[1]);
                        if (Date.now() >= g) {
                            await np.click(
                                `${s1} a[onclick="togglePostOptions(event,${id})"]`,
                            );
                            await np.waitForSelector(
                                `a[onclick="WIKIDOT.modules.ForumViewThreadModule.listeners.deletePost(event,'${id}')"]`,
                            );
                            await np.click(
                                `a[onclick="WIKIDOT.modules.ForumViewThreadModule.listeners.deletePost(event,'${id}')"]`,
                            );
                            await np.waitForNavigation();
                            await np.goto(pageArr[n], {
                                waitUntil: "networkidle0",
                            });
                            await np.click("#tags-button");
                            await np.waitForSelector("#page-tags-input");
                            await np.evaluate(() => {
                                const t = document.querySelector(
                                    "#page-tags-input",
                                ) as HTMLInputElement;
                                let r = t.value.split(" ");
                                r.splice(
                                    r.findIndex((e) => e == "重写中"),
                                    1,
                                );
                                t.value = /(^|\s)重写中(\s|$)/.test(t.value)
                                    ? r.join(" ")
                                    : t.value;
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
                        }
                    }
                    await np.close();
                } else {
                    return;
                }
            }
            await b.close();
            break;
        } catch (e) {
            console.log(e);
            continue;
        }
    }
}
