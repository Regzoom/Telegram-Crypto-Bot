import { config } from "dotenv";
import Client from "./structure/Client";
console.clear()
config();

async function start() {
    await new Client().run()
}; start()