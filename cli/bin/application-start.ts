import { red } from "../../deps.ts";

export async function startServer(envState: "dev" | "start") {
  const env = envState === "dev" ? "DEVElOPMENT" : "PRODUCTION"
  const cmd = {
    "PRODUCTION": [
      "deno",
      "run",
      "-A",
      "--unstable",
      "-c",
      `${Deno.cwd()}/tsconfig.json`,
      `${Deno.cwd()}/server.tsx`,
    ],
    "DEVElOPMENT": [
      "deno",
      "run",
      "-A",
      "--unstable",
      `https://deno.land/x/denon@v2.2.1/denon.ts`,
      `dev`,
    ]
  }
  try {
    const process = Deno.run({
      env: {
        [env]: "true",
      },
      cmd: cmd[env]
    });

    await process.status();
  } catch (e) {
    console.error(red("[Server Error]"), e);
  }

}