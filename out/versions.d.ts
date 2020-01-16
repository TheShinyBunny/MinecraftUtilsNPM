export declare function getLatestRelease(): Promise<Version>;
export declare function getVersion(id: string): Promise<Version>;
export declare function getManifest(): Promise<Manifest>;
export declare function getNativeClassifier(lib: Library): Artifact | undefined;
export interface Version {
    id: string;
    downloads: {
        server: DownloadLink;
        client: DownloadLink;
    };
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
    };
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
declare class Manifest {
    latest: LatestVersions;
    versions: [ManifestVersion];
    constructor(json: any);
    latestRelease(): Promise<Version>;
    latestSnapshot(): Promise<Version>;
    get(versionId: string): Promise<Version>;
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
export {};
