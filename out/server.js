"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const versions_1 = require("./versions");
const _1 = require(".");
const child_process_1 = require("child_process");
const properties_reader_1 = __importDefault(require("properties-reader"));
const events_1 = require("events");
/**
 * Creates and launches a new Minecraft server.
 * @param options Settings for the server
 * @returns A promise resolved to an instance of the server, used to listen to events.
 */
function launchServer(options) {
    return __awaiter(this, void 0, void 0, function* () {
        let jarName = ((options && options.jarName) || "server") + ".jar";
        let dir = ((options && options.dir) || "./");
        let jar = dir + jarName;
        if (options && options.dir && !fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        let version;
        if (options && options.version) {
            version = yield versions_1.getVersion(options.version);
        }
        else {
            version = yield versions_1.getLatestRelease();
        }
        if (!fs.existsSync(jar)) {
            yield _1.downloadUrl(version.downloads.server.url, jar);
        }
        if (!fs.existsSync(dir + 'eula.txt')) {
            child_process_1.execSync('java -jar ' + jarName, { cwd: dir });
            if (fs.existsSync(dir + 'eula.txt')) {
                let eulaProps = properties_reader_1.default(dir + 'eula.txt');
                if (eulaProps.get("eula") !== "true") {
                    eulaProps.set("eula", "true");
                    eulaProps.save(dir + 'eula.txt');
                }
            }
            else {
                console.log("eula not created yet!");
            }
        }
        if (options && options.properties) {
            if (fs.existsSync(dir + 'server.properties')) {
                let props = properties_reader_1.default(dir + 'server.properties');
                for (let k in options.properties) {
                    props.set(k, options.properties[k]);
                }
                props.save(dir + 'server.properties');
            }
        }
        let process = child_process_1.exec('java -jar ' + jarName, { cwd: dir });
        return new MinecraftServer(process);
    });
}
exports.launchServer = launchServer;
class MinecraftServer extends events_1.EventEmitter {
    constructor(process) {
        super();
        this.process = process;
        let s = this;
        if (this.process.stdout) {
            this.process.stdout.on("data", (d) => {
                if (d.indexOf("Done") >= 0) {
                    this.emit("ready", s);
                }
            });
        }
        this.process.on("close", () => {
            this.emit("stop");
        });
    }
    /**
     * Sends a minecraft command to the server's console.
     * @param cmd The command to be executed
     */
    sendCommand(cmd) {
        if (this.process.stdin) {
            this.process.stdin.write(cmd + "\r\n");
        }
    }
}
exports.MinecraftServer = MinecraftServer;
