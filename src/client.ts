import { getLatestRelease, getVersion, Version, getNativeClassifier } from "./versions";
import { EventEmitter } from 'events';
import * as fs from "fs";
import { ChildProcess, exec } from "child_process";
import { downloadUrl } from ".";

/**
 * Launches a new Minecraft client.
 * @param options Settings for the client
 * @returns A promise that resolves to an instance of the client, used for listening to events.
 */
export async function launchClient(options?: ClientOptions): Promise<RunningClient> {
    let version: Version;
    if (options && options.version) {
        version = await getVersion(options.version);
    } else {
        version = await getLatestRelease();
    }
    let path = ((options && options.dir) || "./") + version.id + ".jar";
    if (options && options.dir && !fs.existsSync(options.dir)) {
        fs.mkdirSync(options.dir,{recursive: true});
    }
    if (!fs.existsSync(path)) {
        await downloadUrl(version.downloads.client.url,path);
    }
    let cmd = "java -cp \"" + version.id + ".jar";
    for (let lib of version.libraries) {
        cmd += ";";
        cmd += "%APPDATA%/.minecraft/libraries/" + lib.downloads.artifact.path;
        let native = getNativeClassifier(lib);
        if (native) {
            cmd += ";" + "%APPDATA%/.minecraft/libraries/" + native.path;
        }
    }
    
    cmd += "\" net.minecraft.client.main.Main \
    --version " + version.id + " \
    --accessToken dummy \
    --assetsDir %APPDATA%/.minecraft/assets \
    --assetIndex 1.15";
    if (options && options.server) {
        let host = options.server;
        let port = "25565";
        if (options.server.indexOf(':') >= 0) {
            host = options.server.split(':')[0];
            port = options.server.split(':')[1];
        }
        cmd += " -server " + host + " -port " + port;
    }
    if (options && options.windowSize) {
        cmd += " --width " + options.windowSize.width + " --height " + options.windowSize.height;
    }
    if (options && options.jvmArgs) {
        cmd += " " + options.jvmArgs;
    }
    console.log(cmd);
    let process = exec(cmd, {cwd: ((options && options.dir) || "./")},(err,stdout,stderr)=>{
        if (err) {
            console.log(err);
        }
        if (stdout) {
            if (options && options.outputCallback) {
                options.outputCallback(stdout);
            }
        }
        if (stderr) {
            if (options && options.errorCallback) {
                options.errorCallback(stderr);
            }
        }
    });
    return new MinecraftClient(process);
}

export declare interface RunningClient {
    on(event: string, listener: Function): this;
    /**
     * An event called when the client window closes.
     */
    on(event: "close", listener: ()=>void): this;
    /**
     * An event called when the client outputs a message to stdout.
     */
    on(event: "stdout", listener: (msg: string)=>void): this;
}

export class MinecraftClient extends EventEmitter {
    process: ChildProcess;

    constructor(process: ChildProcess) {
        super();
        this.process = process;
        this.process.on("exit",()=>{
            this.emit("close");
        });
        if (this.process.stdout) {
            this.process.stdout.on("data",(s)=>{
                this.emit("stdout",s.toString());
            });
        }
        
    }

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
    windowSize?: {width: number, height: number};
    /**
     * The path to the directory where to save worlds, resourcepacks, screenshots, etc. from the client.
     */
    dir?: string;
    /**
     * Additional minecraft JVM args to add to the launch command.
     */
    jvmArgs?: string;
}