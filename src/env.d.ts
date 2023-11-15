/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_PROJECT_ID: string;
  readonly VITE_OAUTH_SUCCESS: string;
  readonly VITE_OAUTH_FAILURE: string;
  readonly VITE_DATABASE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
