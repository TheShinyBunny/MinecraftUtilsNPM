/// <reference types="node" />
import { ChildProcess } from "child_process";
import { EventEmitter } from "events";
export declare function launchServer(options?: ServerOptions): Promise<MinecraftServer>;
export declare interface MinecraftServer {
    on(event: string, listener: Function): this;
    on(event: "ready", listener: (server: MinecraftServer) => void): this;
    on(event: "stop", listener: () => void): this;
}
export declare class MinecraftServer extends EventEmitter {
    process: ChildProcess;
    constructor(process: ChildProcess);
}
export interface ServerOptions {
    dir?: string;
    jarName?: string;
    outputCallback?(msg: string): void;
    version?: string;
    properties?: {
        [field: string]: string;
    };
}
