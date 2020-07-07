import { ensureDir, parseAll, green, red, cyan } from "../deps.ts";

const currentPath = Deno.cwd();
const distPath = "dist"

export async function startBuild() {
  try {
    await Deno.remove(`${currentPath}/${distPath}`, { recursive: true });
  } catch (err) {
    console.log(green("[build]"), "don't need to clear build files")
  }
  await ensureDir(`${currentPath}/${distPath}`);
  await startBundle();
  await copyStatics();
  console.log(green("[build]"), "static files are successfully copied")
  console.log(green("[build]"), "Project build job has successfully done!")
  console.log(cyan("\n\t\t Now you can start the server 'attain-cli start'\n\n"))
}

async function startBundle() {
  try {
    const process = Deno.run({
      cmd: [
        "deno",
        "bundle",
        "-c",
        `${currentPath}/react.tsconfig.json`,
        `${currentPath}/view/index.tsx`,
        `${currentPath}/${distPath}/index.bundle.js`
      ],
    });

    await process.status();
    await rewireIndex();

  } catch (e) {
    console.error(red("[bundle error]"), e)
  }
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
  const decoder = new TextDecoder("utf-8");
  const readStream = Deno.readFileSync(`${currentPath}/view/public/index.html`);
  const indexHTML = decoder.decode(readStream);
  const devReact = `
    <!-- react, react-dom dev bundles -->
    <script crossorigin src="//unpkg.com/react@16/umd/react.production.min.js"></script>
    <script crossorigin src="//unpkg.com/react-dom@16/umd/react-dom.production.min.js"></script>
  `
  let replacedHTML = indexHTML.replace("{{ React }}", devReact)

  replacedHTML = replacedHTML.replace("{{ DevTools }}", "")

  const packagesYaml: any = parseAll(Deno.readTextFileSync(`${currentPath}/packages.yaml`));
  if (packagesYaml[0].CDN) {
    const list = packagesYaml[0].CDN.map((p: string) => `<script crossorigin src="${p}"></script>`)
    replacedHTML = replacedHTML.replace("{{ Packages }}", list.join(""))
  }

  const encoder = new TextEncoder();
  const writeStream = encoder.encode(replacedHTML);
  await Deno.writeFile(`${currentPath}/${distPath}/index.html`, writeStream);

  console.log(green("[build]"), "index.html has been successfully rewired")
}