import { yamlParse, yamlStringify, green } from "../../deps.ts";

const workerGlobals = [
  "console", "queueMicrotask",
  "atob", "btoa",
  "clearInterval", "clearTimeout",
  "fetch", "setInterval",
  "setTimeout", "crypto",
  "performance", "self",
  "onmessage", "onerror",
  "postMessage", "addEventListener",
  "dispatchEvent", "removeEventListener",
  "name",
]
const currentPath = Deno.cwd();

export async function installCDNPackages(url: string, env?: "DEVELOPMENT" | "PRODUCTION") {
  await validateCDN(url, env)
  await updatePackagesFile(url, env);
  await updateExportsFile(env);
  console.log(green("[install]"), `Package ${url} has successfully installed`)
}

async function validateCDN(url: string, env: "DEVELOPMENT" | "PRODUCTION" = "DEVELOPMENT") {
  return new Promise(async (resolve, reject) => {
    const packagesYaml: any = yamlParse(Deno.readTextFileSync(`${currentPath}/config/cdn-packages.yaml`));
    if (!packagesYaml[env]) {
      throw "unable to find the packages file"
    }

    const cdn = packagesYaml[env].map((p: string) => `import "${p}"`).join("\n")
    const tempFile = await Deno.makeTempFile({ suffix: ".ts" });

    const workerString = `
    ${cdn}
    import "${url}";
    import _ from "https://deno.land/x/deno_lodash/mod.ts";
    
    const workerGlobals = ['${workerGlobals.join("', '")}']
    await self.postMessage({ result: _.difference(Object.keys(globalThis as any), workerGlobals) });
    self.close();
    `
    await Deno.writeTextFile(tempFile, workerString)

    const worker = new Worker(new URL(tempFile, import.meta.url).href, {
      type: "module",
    });

    worker.onmessage = async e => {
      if(e.data.result.length > 0) {
        resolve()
      } else {
        reject("Invalid cdn package!")
      }
    }
  })
}

async function updatePackagesFile(packageUrl: string, env?: "DEVELOPMENT" | "PRODUCTION") {
  const packagesYaml: any = yamlParse(Deno.readTextFileSync(`${currentPath}/config/cdn-packages.yaml`));
  if (!packagesYaml) {
    throw "unable to find the packages file"
  }

  if (env) {
    packagesYaml[env].push(packageUrl)
  } else {
    packagesYaml["DEVELOPMENT"].push(packageUrl)
    packagesYaml["PRODUCTION"].push(packageUrl)
  }

  await Deno.writeTextFile(`${currentPath}/config/cdn-packages.yaml`, yamlStringify(packagesYaml))
}

async function updateExportsFile(env: "DEVELOPMENT" | "PRODUCTION" = "DEVELOPMENT") {
  const packagesYaml: any = yamlParse(Deno.readTextFileSync(`${currentPath}/config/cdn-packages.yaml`));
  if (!packagesYaml[env]) {
    throw "unable to find the packages file"
  }

  const cdn = packagesYaml[env].map((p: string) => `import "${p}"`).join("\n")
  const tempFile = await Deno.makeTempFile({ suffix: ".ts" });

  const workerString =
    `${cdn}
  import _ from "https://deno.land/x/deno_lodash/mod.ts";
  
  const workerGlobals = ['${workerGlobals.join("', '")}']
  await self.postMessage({ result: _.difference(Object.keys(globalThis as any), workerGlobals) });
  self.close();
  `
  await Deno.writeTextFile(tempFile, workerString)

  const worker = new Worker(new URL(tempFile, import.meta.url).href, {
    type: "module",
  });

  worker.onmessage = async e => {
    const checkIsValid = (val: string) => /^([^0-9]*)$/.test(val);
    const changeToValidName = (val: string) => {
      let result = val;
      const hasDash = val.indexOf("-")
      if(hasDash !== -1) {
        result = result.substr(0, hasDash) + result.charAt(hasDash + 1).toUpperCase() + result.substr(hasDash + 2, result.length);
      }
      const hasComma = val.indexOf(".")
      if(hasComma !== -1) {
        result = result.substr(0, hasComma) + result.charAt(hasComma + 1).toUpperCase() + result.substr(hasComma + 2, result.length);
      }
      return result;
    }
    const validList: any[] = []
    e.data.result.forEach((d: string) => checkIsValid(d) && validList.push(`export const ${changeToValidName(d)} = globalThis["${d}"];`))
    await Deno.writeTextFile(`${currentPath}/config/cdn-exports.ts`, validList.join("\n"))
  }
}


