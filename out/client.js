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
Object.defineProperty(exports, "__esModule", { value: true });
const versions_1 = require("./versions");
const events_1 = require("events");
const fs = __importStar(require("fs"));
const child_process_1 = require("child_process");
const _1 = require(".");
function launchClient(options) {
    return __awaiter(this, void 0, void 0, function* () {
        let version;
        if (options && options.version) {
            version = yield versions_1.getVersion(options.version);
        }
        else {
            version = yield versions_1.getLatestRelease();
        }
        let path = ((options && options.dir) || "./") + version.id + ".jar";
        if (options && options.dir && !fs.existsSync(options.dir)) {
            fs.mkdirSync(options.dir, { recursive: true });
        }
        if (!fs.existsSync(path)) {
            yield _1.downloadUrl(version.downloads.client.url, path);
        }
        let cmd = "java -cp \"" + version.id + ".jar";
        for (let lib of version.libraries) {
            cmd += ";";
            cmd += "%APPDATA%/.minecraft/libraries/" + lib.downloads.artifact.path;
            let native = versions_1.getNativeClassifier(lib);
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
        let process = child_process_1.exec(cmd, { cwd: ((options && options.dir) || "./") }, (err, stdout, stderr) => {
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
    });
}
exports.launchClient = launchClient;
class MinecraftClient extends events_1.EventEmitter {
    constructor(process) {
        super();
        this.process = process;
        this.process.on("exit", () => {
            this.emit("close");
        });
        if (this.process.stdout) {
            this.process.stdout.on("data", (s) => {
                this.emit("stdout", s.toString());
            });
        }
    }
}
exports.MinecraftClient = MinecraftClient;
