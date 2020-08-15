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
  bitRate: number;
}

const defaultConfig: Config = {
  autoOpenWindows: true,
  orientation: "horizontal",
  borderless: false,
  fullscreen: false,
  bitRate: 20,
};

export const currentConfig = {
  config: defaultConfig,
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
      typeof config.fullscreen !== "boolean" ||
      typeof config.bitRate !== "number"
    ) {
      throw Error("Rewrite config");
    }
    currentConfig.config = config;
    return config;
  } catch (err) {
    return writeConfig();
  }
};

export const writeConfig = async (config: Config = defaultConfig) => {
  const configString = JSON.stringify(config, null, 2);
  currentConfig.config = config;
  await writeFile(configFileLocation, configString, {
    encoding: "utf-8",
  });
  return config;
};
