import * as blessed from "blessed";

import { currentConfig, readConfig } from "./config";

const screen = blessed.screen({
  smartCSR: true,
  title: "Stream Phones",
});

export const selectedChoice = {
  n: 0,
};

export const getChoices = () => {
  const { autoOpenWindows, orientation, borderless, bitRate, fullscreen } = currentConfig.config;

  return [
    {
      text: "Show devices connected",
      value: "show",
    },
    {
      text: "Open windows",
      value: "open",
    },
    {
      text: autoOpenWindows
        ? "Automatically opening windows on connected phone"
        : "Manually opening windows",
      value: "auto",
    },
    {
      text: orientation === "horizontal" ? "Horizontal windows" : "Vertical windows",
      value: "orientation",
    },
    {
      text: borderless ? "Borderless windows" : "Windows with borders",
      value: "borderless",
    },
    {
      text: fullscreen ? "Fullscreen windows" : "No fullscreen windows",
      value: "fullscreen",
    },
    {
      text: `${bitRate} Mbps bitrate`,
      value: "bitRate",
    },
    {
      text: "Exit",
      value: "exit",
    },
  ] as const;
};

export type ChoicesValues = ReturnType<typeof getChoices>[number]["value"];

const list = blessed.list({
  label: "Choose an action, press enter to confirm:",
  parent: screen,
  items: getChoices().map(({ text }) => text),
  border: "line",
  width: "50%",
  height: "shrink",
  left: "center",
  style: {
    item: {
      hover: {
        bg: "blue",
      },
    },
    selected: {
      bg: "blue",
      bold: true,
    },
  },
  vi: true,
  keys: true,
  mouse: true,
});

const data = blessed.box({
  parent: screen,
  bottom: 0,
  left: "center",
  height: "50%",
  width: "50%",
  align: "center",
  valign: "middle",
  border: {
    type: "line",
  },
  hidden: true,
});

const prompt = blessed.prompt({
  parent: screen,
  bottom: 0,
  left: "center",
  height: "50%",
  width: "50%",
  align: "center",
  keys: true,
  vi: true,
  mouse: true,
  tags: true,
  border: "line",
  hidden: true,
});

export const askPrompt = (question: string) => {
  data.hide();
  screen.render();

  return new Promise<string>((resolve, reject) => {
    prompt.input(question, "", (err, value) => {
      if (err) return reject(err);

      resolve(value);
    });
  });
};

const refreshList = async () => {
  await readConfig();
  //@ts-expect-error
  list.setItems(getChoices().map(({ text }) => text));
  screen.render();
};

refreshList().catch(console.error);

let resolveQuestion: (answer: ChoicesValues) => void = () => {};

export const askChoices = async () => {
  await refreshList();
  return new Promise<ChoicesValues>((resolve) => {
    resolveQuestion = resolve;
  });
};

export const setWindowData = (content: string) => {
  data.show();
  data.content = content;
  screen.render();
};

list.on("select", (_el, selected) => {
  resolveQuestion(getChoices()[selected].value);
});

screen.key(["C-c"], function () {
  return process.exit(0);
});
