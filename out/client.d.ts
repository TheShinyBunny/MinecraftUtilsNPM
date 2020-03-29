/// <reference types="node" />
import { EventEmitter } from 'events';
import { ChildProcess } from "child_process";
/**
 * Launches a new Minecraft client.
 * @param options Settings for the client
 * @returns A promise that resolves to an instance of the client, used for listening to events.
 */
export declare function launchClient(options?: ClientOptions): Promise<MinecraftClient>;
export declare interface MinecraftClient {
    on(event: string, listener: Function): this;
    /**
     * An event called when the client window closes.
     */
    on(event: "close", listener: () => void): this;
    /**
     * An event called when the client outputs a message to stdout.
     */
    on(event: "stdout", listener: (msg: string) => void): this;
}
export declare class MinecraftClient extends EventEmitter {
    process: ChildProcess;
    constructor(process: ChildProcess);
}
export interface ClientOptions {
    /**
     * A callback for stdout output from the client's process
     * @param msg The message received from the proccess
     */
    outputCallback?(msg: string): void;
    /**
     * A callback for stderr output from the client's process
     * @param msg The error message received from the process
     */
    errorCallback?(msg: string): void;
    /**
     * An optional version ID (e.g 1.14, 1.5.1, 19w45a...) to be used as the client version.
     *
     * If left unspecified, the version defaults to the latest release.
     */
    version?: string;
    /**
     * The server IP to automatically connect to when starting the client.
     *
     * Note: Currently a minecraft bug prevents this feature from working, and crashing the client the second it joins the server.
     */
    server?: string;
    /**
     * The size of the client window. contains properties width, height.
     *
     * Defaults to the minecraft default size.
     */
    windowSize?: {
        width: number;
        height: number;
    };
    /**
     * The path to the directory where to save worlds, resourcepacks, screenshots, etc. from the client.
     */
    dir?: string;
    /**
     * Additional minecraft JVM args to add to the launch command.
     */
    jvmArgs?: string;
}
