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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const MANIFEST_URL = "https://launchermeta.mojang.com/mc/game/version_manifest.json";
let _manifest;
let _versionCache = new Map();
function getLatestRelease() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (yield getManifest()).latestRelease();
    });
}
exports.getLatestRelease = getLatestRelease;
function getVersion(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (yield getManifest()).get(id);
    });
}
exports.getVersion = getVersion;
function getManifest() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!_manifest) {
            _manifest = yield fetchManifest();
        }
        return _manifest;
    });
}
exports.getManifest = getManifest;
function fetchManifest() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Manifest(yield (yield node_fetch_1.default(MANIFEST_URL)).json());
    });
}
function fetchVersion(url) {
    return __awaiter(this, void 0, void 0, function* () {
        let version = yield (yield node_fetch_1.default(url)).json();
        _versionCache.set(version.id, version);
        return version;
    });
}
function getNativeClassifier(lib) {
    let classifiers = lib.downloads.classifiers;
    if (classifiers) {
        let os = process.platform;
        switch (os) {
            case "win32":
                return classifiers["natives-windows"];
            case "linux":
                return classifiers["natives-linux"];
            case "darwin":
                return classifiers["natives-macos"];
        }
    }
    return undefined;
}
exports.getNativeClassifier = getNativeClassifier;
class Manifest {
    constructor(json) {
        this.latest = json.latest;
        this.versions = json.versions;
    }
    latestRelease() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.get(this.latest.release);
        });
    }
    latestSnapshot() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.get(this.latest.snapshot);
        });
    }
    get(versionId) {
        return __awaiter(this, void 0, void 0, function* () {
            let cached = _versionCache.get(versionId);
            if (cached)
                return cached;
            for (let v of this.versions) {
                if (v.id == versionId)
                    return yield fetchVersion(v.url);
            }
            return Promise.reject("No version found with ID " + versionId);
        });
    }
}
