import { createClient } from "adbkit";
import { prompt } from "inquirer";
import { openPhone } from "./phone";

const client = createClient();

const devices = new Set<string>();

let autoOpenWindows = true;

client.listDevices().then((devicesList) => {
  for (const dev of devicesList) {
    devices.add(dev.id);
  }
});

client.trackDevices().then((tracker) => {
  tracker.on("add", (device) => {
    if (autoOpenWindows) {
      openPhone(device.id);
    }
    devices.add(device.id);
  });
  tracker.on("remove", (device) => {
    devices.delete(device.id);
  });
});

async function main() {
  const { choice } = await prompt([
    {
      type: "list",
      name: "choice",
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
          name: autoOpenWindows
            ? "Automatically opening windows on connected phone"
            : "Manually opening windows",
          value: "auto",
        },
        {
          name: "Exit",
          value: "exit",
        },
      ],
    },
  ]);

  switch (choice) {
    case "show": {
      console.log(
        Array.from(devices)
          .map((d, i) => `${i + 1}="${d}"`)
          .join(" | ")
      );
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
      if (autoOpenWindows) {
        console.log("Manually opening windows");
      } else {
        console.log("Automatically opening windows on new phones connected.");
      }
      autoOpenWindows = !autoOpenWindows;
      break;
    }
  }

  main();
}

main();
