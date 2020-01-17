/// <reference types="node" />
import { ChildProcess } from "child_process";
import { EventEmitter } from "events";
/**
 * Creates and launches a new Minecraft server.
 * @param options Settings for the server
 * @returns A promise resolved to an instance of the server, used to listen to events.
 */
export declare function launchServer(options?: ServerOptions): Promise<MinecraftServer>;
export declare interface MinecraftServer {
    on(event: string, listener: Function): this;
    /**
     * An event called when the server is done loading and is ready for use.
     */
    on(event: "ready", listener: (server: MinecraftServer) => void): this;
    /**
     * An event called when the server process stops.
     */
    on(event: "stop", listener: () => void): this;
}
export declare class MinecraftServer extends EventEmitter {
    process: ChildProcess;
    constructor(process: ChildProcess);
    /**
     * Sends a minecraft command to the server's console.
     * @param cmd The command to be executed
     */
    sendCommand(cmd: string): void;
}
export interface ServerOptions {
    /**
     * The directory to save the server files in (the world directory, the server.properties, etc.)
     */
    dir?: string;
    /**
     * The name of the server .JAR file (without the .jar extension)
     */
    jarName?: string;
    /**
     * A callback for the stdout output of the server process
     * @param msg The message received from the process
     */
    outputCallback?(msg: string): void;
    /**
     * The version ID to download the server for. (e.g 1.15, 1.14.4, 18w31a...)
     *
     * Defaults to the latest release.
     */
    version?: string;
    /**
     * Additional server.properties params to modify before the server starts.
     */
    properties?: {
        [field: string]: string;
    };
}
