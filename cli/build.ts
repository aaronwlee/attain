import { ensureDir, yamlParse, green, red, cyan } from "../deps.ts";

const currentPath = Deno.cwd();
const distPath = "dist"

export async function startBuild() {
  try {
    await Deno.remove(`${currentPath}/${distPath}`, { recursive: true });
  } catch (err) {
    console.log(green("[build]"), "don't need to clear build files")
  }
  try {
    await ensureDir(`${currentPath}/${distPath}`);
    await startBundle();
    await copyStatics();
    console.log(green("[build]"), "static files are successfully copied")
    console.log(green("[build]"), "Project build job has successfully done!")
    console.log(cyan("\n\t\t Now you can start the server 'attain-cli start'\n\n"))

  } catch (e) {
    console.error(red("[bundle error]"), e)
    Deno.exit(1);
  }
}

async function startBundle() {
  const process = Deno.run({
    cmd: [
      "deno",
      "bundle",
      "--unstable",
      `--importmap=${currentPath}/import_map.json`,
      "-c",
      `${currentPath}/tsconfig.json`,
      `${currentPath}/view/index.tsx`,
      `${currentPath}/dist/index.bundle.js`
    ],
  });

  await process.status();
  await rewireIndex();
}

async function copyStatics(path?: string) {
  for await (const dirEntry of Deno.readDir(`${currentPath}/view/public${path ? path : ""}`)) {
    if (dirEntry.name !== "index.html") {
      if (dirEntry.isDirectory) {
        ensureDir(`${currentPath}/${distPath}${`/${dirEntry.name}`}`)
        await copyStatics(`/${dirEntry.name}`)
      } else if (dirEntry.isFile) {
        await Deno.copyFile(`${currentPath}/view/public${path ? path : ""}${`/${dirEntry.name}`}`, `${currentPath}/${distPath}${path ? path : ""}${`/${dirEntry.name}`}`);
      }
    }
  }
}

async function rewireIndex() {
  const indexHTML = await Deno.readTextFile(`${currentPath}/view/public/index.html`);
  let replacedHTML = indexHTML.replace("{{ DevTools }}", "")

  const packagesYaml: any = yamlParse(Deno.readTextFileSync(`${currentPath}/config/cdn-packages.yaml`));
  if (packagesYaml["PRODUCTION"]) {
    const list = packagesYaml["PRODUCTION"].map((p: string) => `<script crossorigin src="${p}"></script>`)
    replacedHTML = replacedHTML.replace("{{ Packages }}", list.join(""))
  }

  await Deno.writeTextFile(`${currentPath}/${distPath}/index.html`, replacedHTML);

  console.log(green("[build]"), "index.html has been successfully rewired")
}