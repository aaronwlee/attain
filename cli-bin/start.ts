export async function startServer(envState: "dev" | "start") {
  const env = envState === "dev" ? "development" : "production"
  try {
    const currentPath = Deno.cwd();
    const process = Deno.run({
      cmd: [
        "deno",
        "run",
        "-A",
        "--unstable",
        `${currentPath}/server.ts`,
        `-mode fullstack`,
        `-env ${env}`
      ],
    });

    await process.status();
  } catch (e) {
    console.log("Server Error");
    console.error(e);
  }

}