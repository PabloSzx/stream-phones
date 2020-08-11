import { spawn } from "child_process";
import { resolve } from "path";

import type { Config } from "./config";

const scrcpyExe = resolve(process.cwd(), "./scrcpy/scrcpy.exe");

console.log(scrcpyExe);

export const openPhone = (device: string, config: Config) => {
  return spawn(
    `${scrcpyExe} -b 100M -s ${device} --lock-video-orientation ${
      config.orientation === "horizontal" ? 1 : 0
    } -w ${config.borderless ? "--window-borderless" : ""} ${
      config.fullscreen ? "--fullscreen" : ""
    }`.trim(),
    {
      detached: true,
      shell: true,
    }
  );
};
