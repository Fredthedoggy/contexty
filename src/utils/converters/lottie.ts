import * as puppeteer from "puppeteer";
import renderLottie from "puppeteer-lottie";
import {Sticker} from "discord.js";
import * as fs from "fs";
import * as Buffer from "buffer";
import {isDevelopment} from "../main.js";
import axios from "axios";

const unrendered: Record<string, Promise<Buffer>> = {};

const browser = puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    product: 'chrome',
});

export async function lottieToImage(sticker: Sticker): Promise<{buffer: Buffer, type: "PNG" | "GIF", promiseGif?: Promise<Buffer>}> {
    const staticVersion = fs.existsSync(`../images/${sticker.id}.png`);
    const gifVersion = fs.existsSync(`../images/${sticker.id}.gif`);
    if (!unrendered[sticker.id] && !gifVersion) {
        unrendered[sticker.id] = lottieToGif((await axios.get(sticker.url)).data, sticker);
        unrendered[sticker.id].then((buffer) => {
            fs.promises.writeFile(`../images/${sticker.id}.gif`, buffer);
            delete unrendered[sticker.id];
        });
    }
    if (gifVersion && !unrendered[sticker.id]) {
        return {buffer: await fs.promises.readFile(`../images/${sticker.id}.gif`), type: "GIF"};
    } else if (staticVersion && unrendered[sticker.id]) {
        return {buffer: await fs.promises.readFile(`../images/${sticker.id}.png`), type: "PNG", promiseGif: unrendered[sticker.id]};
    } else {
        const buffer = (await axios.get(sticker.url)).data;
        return {buffer: await lottieToPng(buffer, sticker), type: "PNG", promiseGif: unrendered[sticker.id]};
    }
}

export async function lottieToPng(data: Buffer, sticker: Sticker): Promise<Buffer> {
    await renderLottie({
        animationData: data,
        output: `../images/${sticker.id}.png`,
        width: 512,
        height: 512,
        browser: await browser,
        quiet: !isDevelopment(),
    })
    return await fs.promises.readFile(`../images/${sticker.id}.png`);
}

export async function lottieToGif(data: Buffer, sticker: Sticker): Promise<Buffer> {
    await renderLottie({
        animationData: data,
        output: `../images/${sticker.id}.gif`,
        width: 512,
        height: 512,
        browser: await browser,
        quiet: !isDevelopment(),
        gifskiOptions: {
            quality: 100,
        }
    })
    return await fs.promises.readFile(`../images/${sticker.id}.gif`);
}
