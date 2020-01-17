# Minecraft Utils

A npm package for Minecraft utilities.

## Features

* Query minecraft versions
* Launch a Minecraft Client with various options
* Initialize a Minecraft Server

## Launching A Minecraft Client

To launch a minecraft client, use the `launchClient` function.

```ts

// typescript
import { launchClient } from 'minecraft_utils';

async function launch() {
    let client: MinecraftClient = await launchClient({dir: './client/', version: '1.15'});
}
```

### Client Options

These are the optional settings you can pass to the `launchClient` function in the `options` parameter:

* `dir`: A path to the directory to save worlds, logs, screenshots, etc.
* `version`: The version ID to create the client for. Can be any valid version ID, for example: '1.15', '1.14.4', '19w45a'...
* `outputCallback(msg)`: A callback for any output from the client stdout.
* `errorCallback(msg)`: A callback for any output from the client stderr.
* `jvmArgs`: Additional custom arguments for the Minecraft JVM, like username, memory allocation, etc.
* `server` (*deprecated*): A server IP to connect to when Minecraft starts. *deprecated*: A bug in Minecraft currently crashes the game when using this feature.

### Client Events

The `MinecraftClient` class has the following events you can listen to:

```ts
let client = await launchClient(...);

// An event equivalant to the ClientOptions.outputCallback
// Called for every line of stdout.
client.on("stdout",(msg)=>{
    console.log(msg);
});

// Called when the minecraft window has been closed.
client.on("close",()=>{
    console.log("CLIENT CLOSED");
});
```

## Launching a Minecraft Server

To launch a Minecraft server, use the `launchServer` function:

```ts
import { launchClient } from 'minecraft_utils';

async function launch() {
    let server: MinecraftServer = await launchServer({dir: './server/'});
}
```

### Server Options

These are the optional settings you can pass to the `launchServer` function in the `options` parameter:

* `dir`: A path to the directory to save the world, logs, datapacks, etc.
* `version`: The version ID to create the server for. Can be any valid version ID, for example: '1.15', '1.14.4', '19w45a'...
* `outputCallback(msg)`: A callback for any output from the server stdout.
* `jarName`: The name to use for the server.jar file (without the .jar extension).
* `properties`: A key-value object containing custom properties to change in the server.properties file.

### Server Events

The `MinecraftServer` class has the following events you can listen to:

```ts
let server = await launchServer(...);

// Called when the server is ready for use (or more precisely, when the server outputs the "done" message).
server.on("ready",(msg)=>{
    console.log("SERVER IS READY!");
});

// Called when the server has been stopped.
client.on("stop",()=>{
    console.log("SERVER STOPPED");
});
```

## Installing

Install using NPM:
`npm i minecraft_utils -S`

For any issues, suggestions or questions, ask them in the GitHub repo.
