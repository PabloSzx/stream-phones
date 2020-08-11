import "colors";

import { createClient } from "adbkit";
import { spawn } from "child_process";
import { prompt } from "inquirer";
import { resolve } from "path";

import { readConfig, writeConfig } from "./config";
import { openPhone } from "./phone";

const devices = new Set<string>();

const adb = `${resolve(process.cwd(), "./scrcpy/adb.exe")}`;

const isReady = (() => {
  let resolve: () => void = undefined as any;
  const promise = new Promise((res) => {
    resolve = res;
  });

  return {
    promise,
    resolve,
  };
})();

const startAdb = spawn(adb, ["start-server"], {
  stdio: "ignore",
});

startAdb.stderr?.pipe(process.stderr);

startAdb.on("error", () => {});

startAdb.on("close", (code) => {
  if (code === 0) {
    isReady.resolve();
  } else {
    console.error("adb couldn't be started properly".red.bgBlack);
    setTimeout(() => {
      process.exit(1);
    }, 5000);
  }
});

let configPromise = readConfig();

(async () => {
  await isReady.promise;

  const client = createClient({
    bin: adb,
  });

  client.listDevices().then((devicesList) => {
    for (const dev of devicesList) {
      devices.add(dev.id);
    }
  });

  client.trackDevices().then((tracker) => {
    tracker.on("add", async (device) => {
      const config = await configPromise;
      if (config.autoOpenWindows) {
        openPhone(device.id, config);
      }
      devices.add(device.id);
    });
    tracker.on("remove", (device) => {
      devices.delete(device.id);
    });
  });

  async function main() {
    const config = await configPromise;
    console.log("\n");
    const { choice } = await prompt([
      {
        type: "list",
        name: "choice",
        message: "What do you want to do?",
        choices: [
          {
            name: "Show devices connected",
            value: "show",
          },
          {
            name: "Open windows",
            value: "open",
          },
          {
            name: config.autoOpenWindows
              ? "Automatically opening windows on connected phone"
              : "Manually opening windows",
            value: "auto",
          },
          {
            name: config.orientation === "horizontal" ? "Horizontal windows" : "Vertical windows",
            value: "orientation",
          },
          {
            name: config.borderless ? "Borderless windows" : "Windows with borders",
            value: "borderless",
          },
          {
            name: config.fullscreen ? "Fullscreen windows" : "No fullscreen windows",
            value: "fullscreen",
          },
          {
            name: "Exit".red.bgBlack,
            value: "exit",
          },
        ],
      },
    ]);

    switch (choice) {
      case "show": {
        await client.listDevices().then((devicesList) => {
          for (const dev of devicesList) {
            devices.add(dev.id);
          }
        });
        if (devices.size) {
          console.log(
            Array.from(devices)
              .map((d, i) => `${i + 1}="${d}"`.bgBlack.white)
              .join(" | ")
          );
        } else {
          console.log("No devices connected!".magenta.bgWhite);
        }

        break;
      }
      case "open": {
        devices.forEach((device) => {
          openPhone(device, config);
        });
        break;
      }
      case "exit": {
        process.exit(0);
      }
      case "auto": {
        if (config.autoOpenWindows) {
          console.log("Now you have to manually open phone windows");
        } else {
          console.log(
            "Now the application is automatically opening windows on new phones connected."
          );
        }
        config.autoOpenWindows = !config.autoOpenWindows;

        break;
      }
      case "orientation": {
        console.log(
          config.orientation === "horizontal"
            ? "The windows will be vertical"
            : "The windows will be horizontal"
        );
        config.orientation = config.orientation === "horizontal" ? "vertical" : "horizontal";
        break;
      }
      case "borderless": {
        console.log(
          config.borderless ? "Windows will have borders" : "The windows will be borderless"
        );
        config.borderless = !config.borderless;
        break;
      }
      case "fullscreen": {
        console.log(
          config.fullscreen ? "The windows won't be fullscreen" : "The windows will be fullscreen"
        );
        config.fullscreen = !config.fullscreen;
        break;
      }
    }

    configPromise = writeConfig(config);

    main();
  }

  main();
})();
