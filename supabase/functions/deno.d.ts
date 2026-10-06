// Ambient type definitions for Deno runtime in Supabase Edge Functions
// This allows IDEs and TypeScript language servers without Deno extension to typecheck edge functions cleanly.

declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): Record<string, string>;
  }
  export const env: Env;
}

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export type Handler = (req: Request) => Response | Promise<Response>;
  export interface ServeInit {
    port?: number;
    hostname?: string;
    signal?: AbortSignal;
    onError?: (error: unknown) => Response | Promise<Response>;
    onListen?: (params: { hostname: string; port: number }) => void;
  }
  export function serve(handler: Handler, init?: ServeInit): void | Promise<void>;
}

declare module "https://*" {
  const content: any;
  export default content;
  export const serve: any;
}
