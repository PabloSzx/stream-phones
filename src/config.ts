import * as fs from "fs";
import { resolve } from "path";
import { promisify } from "util";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

export interface Config {
  autoOpenWindows: boolean;
  orientation: "vertical" | "horizontal";
  borderless: boolean;
  fullscreen: boolean;
}

const defaultConfig: Config = {
  autoOpenWindows: true,
  orientation: "horizontal",
  borderless: false,
  fullscreen: false,
};

const configFileLocation = resolve(process.cwd(), "./stream-phones-config.json");

export const readConfig = async () => {
  try {
    const configString = await readFile(configFileLocation, {
      encoding: "utf-8",
    });
    const config: Config = JSON.parse(configString);
    if (
      typeof config?.autoOpenWindows !== "boolean" ||
      (config.orientation !== "horizontal" && config.orientation !== "vertical") ||
      typeof config.borderless !== "boolean" ||
      typeof config.fullscreen !== "boolean"
    ) {
      throw Error("Rewrite config");
    }

    return config;
  } catch (err) {
    return writeConfig();
  }
};

export const writeConfig = async (config: Config = defaultConfig) => {
  const configString = JSON.stringify(config, null, 2);
  await writeFile(configFileLocation, configString, {
    encoding: "utf-8",
  });
  return config;
};
