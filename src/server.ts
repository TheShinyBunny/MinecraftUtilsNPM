
import * as fs from "fs";
import { Version, getVersion, getLatestRelease } from "./versions";
import { downloadUrl } from ".";
import { exec, execSync, ChildProcess } from "child_process";
import properties from "properties-reader";
import { EventEmitter } from "events";


export async function launchServer(options?: ServerOptions): Promise<MinecraftServer> {
    let jarName = ((options && options.jarName) || "server") + ".jar";
    let dir = './' + ((options && options.dir) || "");
    let jar = dir + jarName;
    if (options && options.dir && !fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    let version: Version;
    if (options && options.version) {
        version = await getVersion(options.version);
    } else {
        version = await getLatestRelease();
    }
    if (!fs.existsSync(jar)) {
        await downloadUrl(version.downloads.server.url,jar);
    }
    if (!fs.existsSync(dir + 'eula.txt')) {
        execSync('java -jar ' + jarName,{cwd: dir});
        if (fs.existsSync(dir + 'eula.txt')) {
            let eulaProps = properties(dir + 'eula.txt');
            if (eulaProps.get("eula") !== "true") {
                eulaProps.set("eula","true");
                eulaProps.save(dir + 'eula.txt');
            }
        } else {
            console.log("eula not created yet!");
        }
    }
    if (options && options.properties) {
        if (fs.existsSync(dir + 'server.properties')) {
            let props = properties(dir + 'server.properties');
            for (let k in options.properties) {
                props.set(k,options.properties[k]);
            }
            props.save(dir + 'server.properties');
        }
    }
    let process = exec('java -jar ' + jarName,{cwd: dir});
    return new MinecraftServer(process);
}

export declare interface MinecraftServer {
    on(event: string, listener: Function): this;
    on(event: "ready", listener: (server: MinecraftServer)=>void): this;
    on(event: "stop", listener: ()=>void): this;
}

export class MinecraftServer extends EventEmitter {

    process: ChildProcess;

    constructor(process: ChildProcess) {
        super();
        this.process = process;
        let s = this;
        if (this.process.stdout) {
            this.process.stdout.on("data",(d: string)=>{
                if (d.indexOf("Done") >= 0) {
                    this.emit("ready",s);
                }
            });
        }
        
        this.process.on("close",()=>{
            this.emit("stop");
        });
    }

}

export interface ServerOptions {
    dir?: string;
    jarName?: string;
    outputCallback?(msg: string): void;
    version?: string;
    properties?: {[field: string]: string};
}

