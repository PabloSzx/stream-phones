declare module "adbkit" {
  interface Device {
    id: string;
    type: string;
  }
  interface Client {
    listDevices(): Promise<Device[]>;
    trackDevices(): Promise<{
      on: {
        (type: "add", cb: (dev: Device) => void): void;
        (type: "remove", cb: (dev: Device) => void): void;
        (type: "end", cb: () => void): void;
      };
    }>;
  }
  export function createClient(options?: { port?: number; host?: string; bin?: string }): Client;
}
