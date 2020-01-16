/// <reference types="node" />
import { EventEmitter } from 'events';
import { ChildProcess } from "child_process";
export declare function launchClient(options?: ClientOptions): Promise<RunningClient>;
export declare interface RunningClient {
    on(event: string, listener: Function): this;
    on(event: "close", listener: () => void): this;
    on(event: "stdout", listener: (msg: string) => void): this;
}
export declare class MinecraftClient extends EventEmitter {
    process: ChildProcess;
    constructor(process: ChildProcess);
}
export interface ClientOptions {
    outputCallback?(msg: string): void;
    errorCallback?(msg: string): void;
    version?: string;
    server?: string;
    windowSize?: {
        width: number;
        height: number;
    };
    dir?: string;
}
