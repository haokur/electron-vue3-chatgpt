// env.d.ts
/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_CHAT_BASE_URL: string;
    readonly VITE_CHAT_API_KEY: string;
    readonly VITE_APP_NAME: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};

// // env.d.ts
// interface ImportMetaEnv {}

// interface ImportMeta {
//   readonly env: ImportMetaEnv;
// }
