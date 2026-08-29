/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IUCN_API_TOKEN?: string;
  readonly VITE_CARTO_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
