import { launchClient, ClientOptions, MinecraftClient } from "./client";
import { launchServer, ServerOptions, MinecraftServer } from "./server";
import * as fs from "fs";
import fetch from 'node-fetch';

export async function downloadUrl(url: string, dest: string): Promise<void> {
    let res = await fetch(url);
    let buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest,buffer);
}

export {
    launchClient,
    ClientOptions,
    MinecraftClient,
    launchServer,
    ServerOptions,
    MinecraftServer
};