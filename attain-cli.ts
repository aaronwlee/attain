import Denomander from "https://deno.land/x/denomander/mod.ts";
import { start } from "./cli/start.ts";
import { dev } from "./cli/dev.ts";
import { initializer } from "./cli/init.ts";
import { startBuild } from "./cli/build.ts";

function envValidater(env?: any) {
  if (typeof env !== "string") {
    throw new Error(`--env must be either PRODUCTION or DEVELOPMENT`)
  }

  const uppercasedENV = env.toUpperCase();
  if (uppercasedENV === "PRODUCTION") {
    return uppercasedENV;
  } else if (uppercasedENV === "DEVELOPMENT") {
    return uppercasedENV;
  } else {
    throw new Error(`'${env}' must be either PRODUCTION or DEVELOPMENT`)
  }
}

const program = new Denomander(
  {
    app_name: "Attain Command Line Interface",
    app_description: "React - Attain Framework Tool",
    app_version: "0.0.1",
  }
);

program
  .command("start", "Start the production server")
  .action(async () => {
    await start();
  });


program
  .command("development", "Start the development server")
  .alias("dev", "Start the development server")
  .action(async () => {
    await dev();
  });

program
  .command("initialize [path]", "initialize the React-Attain project")
  .alias("init", "initialize the React-Attain project")
  .action(async ({ path }: any) => {
    await initializer(path);
  });

program
  .command("build", "Build the packages")
  .action(async () => {
    await startBuild();
  });


try {
  program.parse(Deno.args);
} catch (err) {
  console.error("[Error]", err.message);
}