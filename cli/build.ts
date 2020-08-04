import { ensureDir, green, red, cyan } from "../deps.ts";
import { ReactCompiler } from "../viewEngine/ReactCompiler.ts";

const currentPath = Deno.cwd();
const distPath = "dist"

export async function startBuild() {
  try {
    await Deno.remove(`${currentPath}/${distPath}`, { recursive: true });
  } catch (err) {
    console.log(green("[build]"), "don't need to clear build files")
  }
  try {
    try {
      await ensureDir(`${currentPath}/${distPath}`);
    } catch (e) { }
    await startBundle();
    await copyStatics();
    console.log(green("[build]"), "Successfully copied static files")
    console.log(green("[build]"), "Successfully built the view files!")
    console.log(cyan("\n\t\t Now you can start the server 'attain-cli/attain start'\n\n"))

  } catch (e) {
    console.error(red("[bundle error]"), e)
    Deno.exit(1);
  }
}

const getPageFiles = async (list: any, entry: string, path: string) => {
  for await (const dirEntry of Deno.readDirSync(`${path}`)) {
    if (dirEntry.isFile && dirEntry.name.includes(".tsx")) {
      const rootPath = path.replace(entry, "");
      const routePath = rootPath.replace("/view/pages", "")
      const browerPath = dirEntry.name.replace(".tsx", "")
      let fullPath = ""
      if (browerPath === "index") {
        if (!routePath) {
          fullPath = "/"
        }
        else {
          fullPath = `${routePath}`
        }
      } else {
        fullPath = `${routePath}/${browerPath}`
      }
      const component: any = (await import(`file://${Deno.realPathSync(`${path}/${dirEntry.name}`)}`)).default;

      if (component.name) {
        list[fullPath] = {
          filePath: `${rootPath}/${dirEntry.name}`,
          Component: component,
          name: component.name
        }
      }
    } else if (dirEntry.isDirectory) {
      getPageFiles(list, entry, `${path}/${dirEntry.name}`)
    }
  }
}

async function startBundle() {
  const pages: any = {};
  await getPageFiles(pages, `${Deno.cwd()}`, `${Deno.cwd()}/view/pages`);

  const compiler = new ReactCompiler({
    dist: "dist",
    pageFileInfo: pages,
    jsbundlePath: "/main.js",
    entryName: "Main"
  })
  await compiler.build();

}

async function copyStatics(path?: string) {
  for await (const dirEntry of Deno.readDir(`${currentPath}/view/public${path ? path : ""}`)) {
    if (dirEntry.name !== "index.html") {
      if (dirEntry.isDirectory) {
        try {
          await ensureDir(`${currentPath}/${distPath}${`/${dirEntry.name}`}`)
        } catch (e) { }
        await copyStatics(`/${dirEntry.name}`)
      } else if (dirEntry.isFile) {
        await Deno.copyFile(`${currentPath}/view/public${path ? path : ""}${`/${dirEntry.name}`}`, `${currentPath}/${distPath}${path ? path : ""}${`/${dirEntry.name}`}`);
      }
    }
  }
}