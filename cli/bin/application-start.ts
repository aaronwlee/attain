import { red } from "../../deps.ts";

export async function startServer(envState: "dev" | "start") {
  const env = envState === "dev" ? "DEVElOPMENT" : "PRODUCTION"
  try {
    const process = Deno.run({
      env: {
        [env]: "true",
      },
      cmd: [
        "deno",
        "run",
        "-A",
        "--unstable",
        "-c",
        `${Deno.cwd()}/tsconfig.json`,
        `${Deno.cwd()}/server.tsx`,
      ],
    });

    await process.status();
  } catch (e) {
    console.error(red("[Server Error]"), e);
  }

}