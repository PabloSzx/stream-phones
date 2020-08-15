import "colors";
import "./ui";

import { createClient } from "adbkit";
import { spawn } from "child_process";
import toInteger from "lodash/toInteger";
import { resolve } from "path";

import { currentConfig, writeConfig } from "./config";
import { openPhone } from "./phone";
import { askChoices, askPrompt, setWindowData } from "./ui";

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
      const config = currentConfig.config;
      if (config.autoOpenWindows) {
        openPhone(device.id);
      }
      devices.add(device.id);
    });
    tracker.on("remove", (device) => {
      devices.delete(device.id);
    });
  });

  async function main() {
    const choice = await askChoices();
    const config = currentConfig.config;

    switch (choice) {
      case "show": {
        await client.listDevices().then((devicesList) => {
          for (const dev of devicesList) {
            devices.add(dev.id);
          }
        });
        if (devices.size) {
          setWindowData(
            Array.from(devices)
              .map((d, i) => `${(i + 1).toString().yellow.bgBlack}="${d.magenta.bgWhite}"`)
              .join(" | ")
          );
        } else {
          setWindowData("No devices connected!".magenta.bgWhite);
        }

        break;
      }
      case "open": {
        devices.forEach((device) => {
          openPhone(device);
        });
        break;
      }
      case "exit": {
        process.exit(0);
      }
      case "auto": {
        if (currentConfig.config.autoOpenWindows) {
          setWindowData("Now you have to manually open phone windows");
        } else {
          setWindowData(
            "Now the application is automatically opening windows on new phones connected."
          );
        }
        config.autoOpenWindows = !config.autoOpenWindows;

        break;
      }
      case "orientation": {
        setWindowData(
          config.orientation === "horizontal"
            ? "The windows will be vertical"
            : "The windows will be horizontal"
        );
        config.orientation = config.orientation === "horizontal" ? "vertical" : "horizontal";
        break;
      }
      case "borderless": {
        setWindowData(
          config.borderless ? "Windows will have borders" : "The windows will be borderless"
        );
        config.borderless = !config.borderless;
        break;
      }
      case "fullscreen": {
        setWindowData(
          config.fullscreen ? "The windows won't be fullscreen" : "The windows will be fullscreen"
        );
        config.fullscreen = !config.fullscreen;
        break;
      }
      case "bitRate": {
        const bitRateInt = toInteger(await askPrompt("Set a bitrate in Mbps (1 <= x <= 100)"));
        const bitRate = bitRateInt > 100 ? 100 : bitRateInt < 1 ? 1 : bitRateInt;

        setWindowData(`bitRate set to ${bitRate} Mbps`);
        config.bitRate = bitRate;
        break;
      }
    }

    writeConfig(config).catch(console.error);
    main();
  }

  main();
})();
