import { spawn } from "child_process";
import { resolve } from "path";

const location = resolve(process.cwd(), "./scrcpy/scrcpy.exe");

console.log(location);

export const openPhone = (device: string) => {
  return spawn(
    `${location} -b 100M -s ${device} --lock-video-orientation 1 -w --window-borderless`,
    {
      detached: true,
      shell: true,
    }
  );
};
