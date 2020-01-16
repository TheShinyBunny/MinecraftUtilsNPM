import { launchClient, ClientOptions, MinecraftClient } from "./client";
import { launchServer, ServerOptions, MinecraftServer } from "./server";
export declare function downloadUrl(url: string, dest: string): Promise<void>;
export { launchClient, ClientOptions, MinecraftClient, launchServer, ServerOptions, MinecraftServer };
