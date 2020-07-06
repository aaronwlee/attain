import { parse } from "../deps.ts";
import { startDev } from "./dev.ts";
import { Initializer } from "./init.ts";

const availableFlags: any = {
  dev: {
    exec: startDev,
    desc: "Development mode"
  },
  init: {
    exec: Initializer,
    desc: "Initalize the project"
  },
  help: {
    exec: displayHelp,
    desc: "Display all available options"
  }
}

function validateOptions(generalOptions: any[]) {
  if (!availableFlags[generalOptions[0]]) {
    throw `'${generalOptions[0]}' is invalid option!`
  }
}

function displayHelp() {
  console.log("\nAll available options\n")
  Object.keys(availableFlags).forEach(o => console.log(`\t${o}: ${availableFlags[o].desc}`))
  console.log()
}

export function flagsParser(args: string[]) {
  const options = parse(args, { "--": false });

  const { _: generalOptions } = options;
  try {
    validateOptions(generalOptions)
  } catch (invalidOptions) {
    console.error(invalidOptions);
    Deno.exit(1);
  }

  const jobOption = generalOptions[0]
  const pathOption = generalOptions[1]

  if (jobOption === "help") {
    availableFlags[jobOption].exec();
    Deno.exit(0);
  }

  if (jobOption === "init" && pathOption === undefined) {
    console.error("project name is required")
    Deno.exit(1);
  }

  return { ...availableFlags[jobOption], name: jobOption, pathOption };
}

