export {};

declare global {
  interface Window {
    v3Desktop?: {
      platform: string;
      versions: {
        electron: string;
        chrome: string;
      };
    };
  }
}
