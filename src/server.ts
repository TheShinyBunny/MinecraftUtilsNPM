
import * as fs from "fs";
import { Version, getVersion, getLatestRelease } from "./versions";
import { downloadUrl } from ".";
import { exec, execSync, ChildProcess } from "child_process";
import properties from "properties-reader";
import { EventEmitter } from "events";

/**
 * Creates and launches a new Minecraft server.
 * @param options Settings for the server
 * @returns A promise resolved to an instance of the server, used to listen to events.
 */
export async function launchServer(options?: ServerOptions): Promise<MinecraftServer> {
    let jarName = ((options && options.jarName) || "server") + ".jar";
    let dir = ((options && options.dir) || "./");
    let jar = dir + jarName;
    if (options && options.dir && !fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
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
    /**
     * An event called when the server is done loading and is ready for use.
     */
    on(event: "ready", listener: (server: MinecraftServer)=>void): this;
    /**
     * An event called when the server process stops.
     */
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

    /**
     * Sends a minecraft command to the server's console.
     * @param cmd The command to be executed
     */
    sendCommand(cmd: string): void {
        if (this.process.stdin) {
            this.process.stdin.write(cmd + "\r\n");
        }
        
    }

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
    properties?: {[field: string]: string};
}

