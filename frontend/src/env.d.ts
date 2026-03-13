/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INSFORGE_URL: string
  readonly VITE_INSFORGE_API_KEY: string
  readonly VITE_ENABLE_AI_SUGGESTIONS: string
  readonly VITE_ENABLE_PDF_EXPORT: string
  readonly VITE_ENABLE_FILE_UPLOADS: string
  readonly PROD: boolean
  readonly DEV: boolean
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'react-dom/client' {
  import { Root } from 'react-dom';
  export function createRoot(container: Element | DocumentFragment): Root;
}