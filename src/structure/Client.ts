import { config } from "dotenv";
import { Bot, GrammyError, HttpError } from "grammy";
config();
const bot = new Bot(String(process.env.TOKEN));

export default class Client {

    async run() {
        let counter = 1
        await this.SendMessages()
        bot.command("start", (ctx) => {ctx.reply("working")})
        bot.catch((err) => {
            const ctx = err.ctx;
            console.error(`Error while handling update ${ctx.update.update_id}:`);
            const e = err.error;
            if (e instanceof GrammyError) {
              console.error("Error in request:", e.description);
            } else if (e instanceof HttpError) {
              console.error("Could not contact Telegram:", e);
            } else {
              console.error("Unknown error:", e);
            }
        });
        bot.start();
    };

    async getStats(crypto: String) {
        const res = await fetch(
            `https://min-api.cryptocompare.com/data/price?fsym=${crypto}&tsyms=USD,RUB`,{
                headers: {
                    Authentication: String(process.env.API_SECRET)
                }
            }
        ).then(async (r) => await r.json()).catch(() => null)

        if (res) {
            return res
        }

        return console.error("Ошибка в апишке")
    }

    async SendMessages() {
        const btc = await this.getStats("BTC")
        const ton = await this.getStats("TON")
        const time = await this.getMoscowTime()
        bot.api.sendMessage(
            process.env.CHAT_ID!,
            `
            Ну кароче курс валют:
                BTC | Биткоин: 
                    USD: $\`${await this.formatNumberWithCommas(btc.USD)}\`
                    RUB: ₽\`${await this.formatNumberWithCommas(btc.RUB)}\`
                TON | Тонкоин:
                    USD: $\`${await this.formatNumberWithCommas(ton.USD)}\`
                    RUB: ₽\`${await this.formatNumberWithCommas(ton.RUB)}\`
            `,
            {parse_mode: "Markdown"}
        )
        setTimeout(async () => {
            await this.SendMessages()
        }, 10000)
    }

    async getMoscowTime() {
        const now: Date = new Date();
        const msOffset: number = 3 * 60 * 60 * 1000;
        const moscowTime: Date = new Date(now.getTime() + msOffset);
        return moscowTime;
    }

    async formatNumberWithCommas(number: number): Promise<string> {
        let [integerPart, decimalPart] = number.toFixed(2).split('.');
        let integerArray = integerPart.split('');
        let formattedArray = [];
    
        for (let i = integerArray.length - 1, count = 0; i >= 0; i--, count++) {
            formattedArray.unshift(integerArray[i]);
    
            if (count === 2 && i !== 0) {
                formattedArray.unshift(',');
                count = -1;
            }
        }
    
        return formattedArray.join('') + (decimalPart ? `.${decimalPart}` : '');
    }
}
