export async function dev() {
  const process = Deno.run({
    env: {
      "DEVElOPMENT": "true"
    },
    cmd: [
      "deno",
      "run",
      "-A",
      "--unstable",
      `${Deno.cwd()}/scripts/development.ts`,
    ]
  });

  await process.status();
}