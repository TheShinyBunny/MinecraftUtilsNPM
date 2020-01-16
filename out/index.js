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
const client_1 = require("./client");
exports.launchClient = client_1.launchClient;
exports.MinecraftClient = client_1.MinecraftClient;
const server_1 = require("./server");
exports.launchServer = server_1.launchServer;
exports.MinecraftServer = server_1.MinecraftServer;
const fs = __importStar(require("fs"));
const node_fetch_1 = __importDefault(require("node-fetch"));
function downloadUrl(url, dest) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield node_fetch_1.default(url);
        let buffer = Buffer.from(yield res.arrayBuffer());
        fs.writeFileSync(dest, buffer);
    });
}
exports.downloadUrl = downloadUrl;
