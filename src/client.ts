import { getLatestRelease, getVersion, Version, getNativeClassifier } from "./versions";
import { EventEmitter } from 'events';
import * as fs from "fs";
import { ChildProcess, exec } from "child_process";
import { downloadUrl } from ".";

export async function launchClient(options?: ClientOptions): Promise<RunningClient> {
    let version: Version;
    if (options && options.version) {
        version = await getVersion(options.version);
    } else {
        version = await getLatestRelease();
    }
    let path = "./" + ((options && options.dir) || "") + version.id + ".jar";
    if (options && options.dir && !fs.existsSync('./' + options.dir)) {
        fs.mkdirSync('./' + options.dir,{recursive: true});
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
    -version " + version.id + " \
    -accessToken dummy \
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
        cmd += " -width " + options.windowSize.width + " -height " + options.windowSize.height;
    }
    console.log(cmd);
    let process = exec(cmd, {cwd: './' + ((options && options.dir) || "")},(err,stdout,stderr)=>{
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
    on(event: "close", listener: ()=>void): this;
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
    outputCallback?(msg: string): void;
    errorCallback?(msg: string): void;
    version?: string;
    server?: string;
    windowSize?: {width: number, height: number};
    dir?: string;
}