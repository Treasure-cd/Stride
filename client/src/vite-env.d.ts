/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_DEV_URL: string;
  readonly VITE_API_BASE_PROD_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}