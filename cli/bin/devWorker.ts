import { red } from "../../deps.ts";

self.onmessage = async (e) => {
  self.close();
};

try {
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
} catch (e) {
  console.error(red("[Server Error]"), e);
}


