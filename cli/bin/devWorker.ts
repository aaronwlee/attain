self.onmessage = async (e) => {
  self.close();
};

const process = Deno.run({
  env: {
    "DEVElOPMENT": "true"
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

