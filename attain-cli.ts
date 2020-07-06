import { flagsParser } from "./cli-bin/flag-parser.ts";

async function start() {
  const job: {
    name: string,
    pathOption?: string,
    exec: any;
    description: string;
  } = flagsParser(Deno.args);

  if(job.name === "init" && job.pathOption) {
    await job.exec(job.pathOption);
  } else {
    await job.exec();
  }
  
}


if (import.meta.main) {
  await start();
}