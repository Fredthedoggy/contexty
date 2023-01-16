import {Sticker} from "discord.js";
// import * as fs from "fs";
// import axios from "axios";
// import {isDevelopment} from "../main.js";
// import {temporaryDirectory} from 'tempy';
// import {execa} from "execa";
// import * as path from "path";
// import {default as upng} from 'upng-js';
// import {toPng} from "@rgba-image/png";
// import {createCanvas, loadImage} from "canvas"; // for some reason export is "default"?

export async function apngToGif(sticker: Sticker): Promise<Buffer> | undefined {
    return undefined;
    // if (!fs.existsSync(`../images/${sticker.id}.gif`)) {
    //     const tempDir = temporaryDirectory()
    //     if (isDevelopment()) {
    //         console.log("Sticker URL: " + sticker.url);
    //     }
    //     const buffer = (await axios(
    //         {
    //             url: sticker.url,
    //             responseType: "arraybuffer",
    //             "method": "GET",
    //         }
    //     )).data;
    //     const decode = upng.decode(buffer);
    //     const frames = upng.toRGBA8(decode);
    //     const canvas = createCanvas(decode.width, decode.height);
    //     const ctx = canvas.getContext("2d");
    //     for (let i = 0; i < frames.length; i++) {
    //         const frame = frames[i];
    //         ctx.drawImage(await loadImage(frame), 0, 0)
    //         await fs.promises.writeFile(path.join(tempDir, `frame-${i}.png`), toPng(ctx.createImageData(decode.width, decode.height), {}));
    //     }
    //     const tempOutput = path.join(tempDir, 'frame-%012d.png');
    //     const framePattern = tempOutput.replace('%012d', '*')
    //     const escapePath = arg => arg.replace(/(\s+)/g, '\\$1')
    //     const params = [
    //         '-o', escapePath(`../images/${sticker.id}.gif`),
    //         '--fps', 25,
    //         '--quality', 100,
    //         '--quiet',
    //         escapePath(framePattern)
    //     ].filter(Boolean)
    //
    //     const executable = process.env.GIFSKI_PATH || 'gifski'
    //     const cmd = [ executable ].concat(params).join(' ')
    //     await execa(cmd)
    //     //await fs.promises.rm(tempDir, {recursive: true});
    //     console.log(tempDir);
    // }
    // return await fs.promises.readFile(`../images/${sticker.id}.gif`);
}
