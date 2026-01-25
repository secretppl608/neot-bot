import "dotenv/config";
import { config, sleep, ax, str, login } from "../bot.config.ts";


async function bot() {
    const { h, f, tm,r } = await ax(0,'rt');
    console.log(h,f,r,tm);
    // await a(h, f as string[]);
}

bot();

async function a(pageArr: string[], arr: string[]) {
    for (let c = 0; c < 3; c++) {
        try {
            const { b, p } = await login(false);
            await sleep(10);
            for (let n = 0; n < pageArr.length; n++) {
                //具体逻辑
                
            }
            await b.close();
            break;
        } catch (e) {
            console.log(e);
            continue;
        }
    }
}
