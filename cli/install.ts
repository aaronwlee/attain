import { installCDNPackages } from "./bin/install-cdn-packages.ts";

export async function startInstall(url: string, env?: "PRODUCTION" | "DEVELOPMENT") {
  installCDNPackages(url, env);
}