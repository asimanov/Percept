/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SENDGRID_API_KEY: string;
  readonly FEEDBACK_TO: string;
  readonly FEEDBACK_FROM: string;
  // add any others you use
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}