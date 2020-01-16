import fetch from "node-fetch";

const MANIFEST_URL = "https://launchermeta.mojang.com/mc/game/version_manifest.json";

let _manifest: Manifest;
let _versionCache: Map<string,Version> = new Map();

export async function getLatestRelease(): Promise<Version> {
    return await (await getManifest()).latestRelease();
}

export async function getVersion(id: string): Promise<Version> {
    return await (await getManifest()).get(id);
}

export async function getManifest(): Promise<Manifest> {
    if (!_manifest) {
        _manifest = await fetchManifest();
    }
    return _manifest;
}

async function fetchManifest(): Promise<Manifest> {
    return new Manifest(await (await fetch(MANIFEST_URL)).json());
}

async function fetchVersion(url: string): Promise<Version> {
    let version: Version = <Version>await (await fetch(url)).json();
    _versionCache.set(version.id,version);
    return version;
}

export function getNativeClassifier(lib: Library): Artifact | undefined {
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

export interface Version {
    id: string;
    downloads: {server: DownloadLink, client: DownloadLink};
    libraries: Library[];
}

interface DownloadLink {
    sha1: string;
    size: number;
    url: string;
}

interface Library {
    name: string;
    downloads: {
        artifact: Artifact;
        classifiers?: Classifiers;
    }
}

interface Artifact {
    path: string;
    sha1: string;
    size: number;
    url: string;
}

interface Classifiers {
    javadoc?: Artifact;
    sources?: Artifact;
    "natives-linux": Artifact;
    "natives-macos": Artifact;
    "natives-windows": Artifact;
}

class Manifest {
    latest: LatestVersions;
    versions: [ManifestVersion];

    constructor(json: any) {
        this.latest = json.latest;
        this.versions = json.versions;
    }

    async latestRelease(): Promise<Version> {
        return this.get(this.latest.release);
    }

    async latestSnapshot(): Promise<Version> {
        return this.get(this.latest.snapshot);
    }

    async get(versionId: string): Promise<Version> {
        let cached = _versionCache.get(versionId);
        if (cached) return cached;
        for (let v of this.versions) {
            if (v.id == versionId) return await fetchVersion(v.url);
        }
        return Promise.reject("No version found with ID " + versionId);
    }
}

interface LatestVersions {
    release: string;
    snapshot: string;
}

interface ManifestVersion {
    id: string;
    type: "release" | "snapshot";
    url: string;
    time: string;
    releaseTime: string;
}