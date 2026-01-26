import "dotenv/config";
import { config, sleep, ax, str, login, postFind } from "../bot.config.ts";

async function bot() {
    const { h, f, tm, r } = await ax(0, "rt");
    /*
    ? 标识符释义：
    * lt表示长期待删除，
    * cd{n}表示-2，-10，-30分待删除，
    * n表示正常，
    * fc表示重分类的论坛路径数组，c表示重分类的路径数组
    * h为href的简写，f为forum的简写，tm为time的简写，r为rating的简写，
    * 其中，ax的参数0构建=>tab-0-{0}，即爬取status页面第一个ListPages模块的数据
    * 'rt'表示返回评分数据，若没有此属性，则不返回评分
    * 重分类还不懂啊，意思就是每次机器人先检查1-3tab的内容，然后打上待删除，然后LP模块就会收集这些标记条目到tab1，
    * 每隔一段时间就得重新检查分数是否有变化，这就叫重分类，理解业务逻辑是程序员的必修课
    ? END
    */
    const [ltc, ltfc, cd3c, cd3fc, cd2c, cd2fc, cd1c, cd1fc, nc, nfc] = [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
    ];
    for (let u = 0; u <= h.length - 1; u++) {
        const d = new Date(tm[u]).getTime();
        if (r[u] <= -30) {
            cd3c.push(h[u]);
            cd3fc.push(f[u]);
        } else if (-30 < r[u] && r[u] <= -10) {
            cd2c.push(h[u]);
            cd2fc.push(f[u]);
        } else if (-10 < r[u] && r[u] <= -2) {
            cd1c.push(h[u]);
            cd1fc.push(f[u]);
        } else if (r[u] > -2) {
            if (
                (Date.now() - d >= 30 * 24 * 60 * 60 * 1000 && r[u] >= 1) ||
                Date.now() - d <= 30 * 24 * 60 * 60 * 1000
            ) {
                nc.push(h[u]);
                nfc.push(f[u]);
            } else {
                ltc.push(h[u]);
                ltfc.push(f[u]);
            }
        }
    }
    const x = [
        [[nc, nfc], "nc"],
        [[ltc, ltfc], "ltc"],
        [[cd3c, cd3fc], "cd3c"],
        [[cd2c, cd2fc], "cd2c"],
        [[cd1c, cd1fc], "cd1c"],
    ];
    // console.log(...(x));
    for (let i of x) {
        await a(...(i[0] as [Array<string>, Array<string>]), i[1] as string);
    }
}

bot();

async function a(pageArr: string[], arr: string[], m: string) {
    for (let c = 0; c < 3; c++) {
        try {
            const { b, p } = await login(false);
            await sleep(10);
            for (let n = 0; n < pageArr.length; n++) {
                //具体逻辑
                if (m === "nc") {
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
                        r.splice(
                            r.findIndex((e) => e == "待删除"),
                            1,
                        );
                        t.value = /(^|\s)待删除(\s|$)/.test(t.value)
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
                    await np.goto(str(arr[n]) as string, {
                        waitUntil: "domcontentloaded",
                    });
                    const { s1, id } = await postFind(np);
                    await np.click(
                        `${s1} a[onclick="togglePostOptions(event,${id})"]`,
                    );
                    await np.waitForSelector(
                        `a[onclick="WIKIDOT.modules.ForumViewThreadModule.listeners.editPost(event,'${id}')"]`,
                    );
                    await np.click(
                        `a[onclick="WIKIDOT.modules.ForumViewThreadModule.listeners.editPost(event,'${id}')"]`,
                    );
                    await np.waitForSelector("#np-title");
                    await np.evaluate(() => {
                        (
                            document.querySelector(
                                "#np-text",
                            ) as HTMLInputElement
                        ).value = "由于条目分数回升，删除程序终止。";
                    });
                    await sleep(2);
                    await np.click("#np-post");
                    await np.waitForNavigation();
                    await np.close();
                } else if (m === "ltc") {
                    const np = await b.newPage();
                    await np.goto(str(arr[n]) as string, {
                        waitUntil: "domcontentloaded",
                    });
                    const { s1, id } = await postFind(np);
                    await np.click(
                        `${s1} a[onclick="togglePostOptions(event,${id})"]`,
                    );
                    await np.waitForSelector(
                        `a[onclick="WIKIDOT.modules.ForumViewThreadModule.listeners.editPost(event,'${id}')"]`,
                    );
                    await np.click(
                        `a[onclick="WIKIDOT.modules.ForumViewThreadModule.listeners.editPost(event,'${id}')"]`,
                    );
                    await np.waitForSelector("#np-title");
                    const t = await np.evaluate(
                        () =>
                            (
                                document.querySelector(
                                    "#np-title",
                                ) as HTMLInputElement
                            ).value == "职员帖：长期低分删除宣告",
                    );
                    await np.evaluate(() => {
                        if (
                            (
                                document.querySelector(
                                    "#np-title",
                                ) as HTMLInputElement
                            ).value == "职员帖：长期低分删除宣告"
                        ) {
                            return;
                        } else {
                            (
                                document.querySelector(
                                    "#np-title",
                                ) as HTMLInputElement
                            ).value = "职员帖：长期低分删除宣告";
                            (
                                document.querySelector(
                                    "#np-text",
                                ) as HTMLInputElement
                            ).value =
                                `由于条目分数回升，但条目仍发布超一个月且未达到合格线，根据[[[/deletions-policy|删除政策]]]，据此宣告将于72小时后删除此条目\n[[iframe https://secretppl608.github.io/time.html?m=ld&t=null&g=${Date.now() + 72 * 60 * 60 * 1000} style="width:400px;display:block;height:120px;"]]\n此帖为职员帖，不应在此帖下回复，除非您并非原作者但希望重写，则可以在此帖下回复希望重写条目的意图，如果您是原作者并认为自己的心血不应被删除，可以联系职员评估是否应当得到豁免。`;
                        }
                    });
                    if (!t) {
                        await np.click("#np-post");
                        await np.waitForNavigation();
                    } else {
                        await np.click('#np-cancel');
                        await sleep(1);
                    }
                    await sleep(2);
                    await np.close();
                } else if (m.startsWith("cd")) {
                    const np = await b.newPage();
                    await np.goto(str(arr[n]) as string, {
                        waitUntil: "domcontentloaded",
                    });
                    const { s1, id } = await postFind(np);
                    const src = await np.evaluate(
                        (s) =>
                            (
                                document.querySelector(
                                    `${s} iframe`,
                                ) as HTMLIFrameElement
                            ).src,s1
                    );
                    let g1 = src.match(/&g=(?<gn>[^&\s]*)/);
                    let g = parseInt(g1?.groups?.gn ?? "");
                    let t1 = src.match(/&t=(?<tn>[^&\s]*)/);
                    let t = t1?.groups?.tn ?? "";
                    if (`f${m.slice(2, 3)}` !== t) {
                        await np.click(
                            `${s1} a[onclick="togglePostOptions(event,${id})"]`,
                        );
                        await np.waitForSelector(
                            `a[onclick="WIKIDOT.modules.ForumViewThreadModule.listeners.editPost(event,'${id}')"]`,
                        );
                        await np.click(
                            `a[onclick="WIKIDOT.modules.ForumViewThreadModule.listeners.editPost(event,'${id}')"]`,
                        );
                        await np.waitForSelector("#np-title");
                        await np.evaluate((md,gn) => {
                            const i = parseInt(md.slice(2, 3));
                            if (
                                (
                                    document.querySelector(
                                        "#np-title",
                                    ) as HTMLInputElement
                                ).value == "职员帖：删除宣告"
                            ) {
                                (
                                    document.querySelector(
                                        "#np-text",
                                    ) as HTMLInputElement
                                ).value =
                                    `由于条目已触达${i == 1 ? -2 : i == 2 ? -10 : -30}分的删除线，根据[[[/deletions-policy|删除政策]]]，据此宣告将${i == 1 ? "于72小时后" : i == 2 ? "于24小时后" : "立即"}删除此条目\n[[iframe https://secretppl608.github.io/time.html?m=cd&t=${i == 1 ? "f1" : i == 2 ? "f2" : "f3"}&g=${i == 1 ? gn.toString() : i == 2 ? (g - 48 * 60 * 60 * 1000).toString() : (g - 72 * 60 * 60 * 1000).toString()} style="width:400px;display:block;height:120px;"]]\n此帖为职员帖，不应在此帖下回复，除非您并非原作者但希望重写，则可以在此帖下回复希望重写条目的意图，如果您是原作者并认为自己的心血不应被删除，可以联系职员评估是否应当得到豁免。`;
                            } else {
                                (
                                    document.querySelector(
                                        "#np-title",
                                    ) as HTMLInputElement
                                ).value = "职员帖：删除宣告";
                                (
                                    document.querySelector(
                                        "#np-text",
                                    ) as HTMLInputElement
                                ).value =
                                    `由于条目已触达${i == 1 ? -2 : i == 2 ? -10 : -30}分的删除线，根据[[[/deletions-policy|删除政策]]]，据此宣告将${i == 1 ? "于72小时后" : i == 2 ? "于24小时后" : "立即"}删除此条目\n[[iframe https://secretppl608.github.io/time.html?m=cd&t=${i == 1 ? "f1" : i == 2 ? "f2" : "f3"}&g=${i == 1 ? gn.toString() : i == 2 ? (gn - 48 * 60 * 60 * 1000).toString() : (gn - 72 * 60 * 60 * 1000).toString()} style="width:400px;display:block;height:120px;"]]\n此帖为职员帖，不应在此帖下回复，除非您并非原作者但希望重写，则可以在此帖下回复希望重写条目的意图，如果您是原作者并认为自己的心血不应被删除，可以联系职员评估是否应当得到豁免。`;
                            }
                        }, m,g);
                        await np.click("#np-post");
                        await np.waitForNavigation();
                    }
                    await np.close();
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
