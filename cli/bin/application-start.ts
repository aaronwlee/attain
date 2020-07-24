import { red } from "../../deps.ts";

export async function startServer(envState: "dev" | "start") {
  const env = envState === "dev" ? "DEVElOPMENT" : "PRODUCTION"
  try {
    const currentPath = Deno.cwd();
    const process = Deno.run({
      env: {
        [env]: "true",
      },
      cmd: [
        "deno",
        "run",
        "-A",
        "--unstable",
        `${currentPath}/server.tsx`,
      ],
    });

    await process.status();
  } catch (e) {
    console.error(red("[Server Error]"), e);
  }

}