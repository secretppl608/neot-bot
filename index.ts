import axios from "axios";
import * as cheerio from "cheerio";
import { Client } from "@ukwhatn/wikidot";

async function bot() {
    const authClientResult = await Client.create({
        username: process.env.BOT_ACCOUNT,
        password: process.env.BOT_PASSWORD,
    });
    if (!authClientResult.isOk()) {
        throw new Error("登陆失败");
    }
    const authClient = authClientResult.value;
    const htmlContent = (
        await axios.get(
            "https://backrooms-neo-t-wiki.wikidot.com/overview:status",
        )
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
    aHrefCollage.map(async (value, index) => {
        let p = (
            await axios.get(`https://backrooms-neo-t-wiki.wikidot.com${value}`)
        ).data;
        const A = cheerio.load(p);
        const discussBtn = A("a#discuss-button").attr("href");
        aForumCollage.push(discussBtn);
    });
    aForumCollage.map(async (v, i) => {
        let q = (
            await axios.get(`https://backrooms-neo-t-wiki.wikidot.com${v}`)
        ).data;
    });
    console.log(aHrefCollage, aTextCollage);
}

bot();
