export async function start() {
  const process = Deno.run({
    env: {
      "PRODUCTION": "true"
    },
    cmd: [
      "deno",
      "run",
      "-A",
      "--unstable",
      "-c",
      `${Deno.cwd()}/tsconfig.json`,
      `${Deno.cwd()}/server.tsx`,
    ]
  });
  
  await process.status();
}