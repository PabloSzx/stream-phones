import { spawn } from "child_process";
import { resolve } from "path";

import { currentConfig } from "./config";

const scrcpyExe = resolve(process.cwd(), "./scrcpy/scrcpy.exe");

export const openPhone = (device: string) => {
  const config = currentConfig.config;
  const p = spawn(
    `"${scrcpyExe}"`,
    [
      "-b",
      `${config.bitRate}M`,
      "-s",
      device,
      "--lock-video-orientation",
      config.orientation === "horizontal" ? "1" : "0",
      "-w",
      config.borderless ? "--window-borderless" : "",
      config.fullscreen ? "--fullscreen" : "",
    ].filter((v) => !!v),
    {
      detached: true,
      shell: true,
    }
  );

  p.stderr.pipe(process.stderr);

  return p;
};
