# Stream-phones

> Made for **Windows 10**

Streaming multiple phones cameras made easy and full quality, using [**scrcpy**](https://github.com/Genymobile/scrcpy) + [**adb**](https://developer.android.com/studio/command-line/adb).

![UI Screenshot](https://i.imgur.com/z6Au0XN.png)

## Usage

### Download and extract ZIP

Download the executable from here [https://github.com/PabloSzx/stream-phones/releases/download/v0.7/stream-phones.zip](https://github.com/PabloSzx/stream-phones/releases/download/v0.7/stream-phones.zip) and unzip the file anywhere.

### Prepare your phone(s)

Enable USB Debugging mode on your Android Phone and plug them into your PC.

[Instructions here](https://developer.android.com/studio/debug/dev-options)

### Open it

Then you can simply open `stream-phones.exe` and you can enjoy this application functionality.

## Installation & Usage from source

> Requisites: **Node.js v14** https://nodejs.org/en/

> Optional: **Yarn v1** https://classic.yarnpkg.com/en/docs/install#windows-stable

Clone this repository, then install dependencies

```sh
npm i
```

Then you can start it calling

```sh
npm start
```

Or to start it while listening to code changes and restarting the application automatically:

```sh
npm run dev
```
