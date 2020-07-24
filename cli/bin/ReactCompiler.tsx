import babelCore from "https://dev.jspm.io/@babel/core";
import presetReact from "https://dev.jspm.io/@babel/preset-react";
import minify from "https://dev.jspm.io/babel-preset-minify"
import { ensureDir } from "https://deno.land/std@0.61.0/fs/mod.ts";

type ConfigProps = {
  dist: string;
  view: string;
  page: string;
  pageFileInfo: any;
  entryName: string;
  jsbundlePath: string;
  cwd: string;
}

export class ReactCompiler {
  #config: ConfigProps;
  #viewFileList: string[] = [];

  constructor({
    dist,
    view,
    page,
    pageFileInfo,
    jsbundlePath,
    entryName
  }: {
    dist?: string,
    view?: string,
    page?: string,
    entryName?: string,
    jsbundlePath?: string,
    pageFileInfo: any
  }) {
    this.#config = {
      dist: dist || "dist",
      view: view || "view",
      page: page || "pages",
      pageFileInfo,
      jsbundlePath: jsbundlePath || "index.tsx",
      entryName: entryName || "Main",
      cwd: Deno.cwd()
    }
  }

  build = async () => {
    this.#ensureTarget(`${this.#config.cwd}/${this.#config.dist}`)
    await this.#getViewFileList(`${this.#config.cwd}/${this.#config.view}`)
    await this.#startBuild()
    await this.#buildIndexFile();
  }

  #ensureTarget = async (path: string) => {
    try {
      await ensureDir(path)
    } catch (error) { }
  }

  #getViewFileList = async (currentPath: string) => {
    for await (const dirEntry of Deno.readDirSync(currentPath)) {
      if (dirEntry.isFile && (dirEntry.name.includes(".tsx") || dirEntry.name.includes(".ts"))) {
        this.#viewFileList.push(`${currentPath}/${dirEntry.name}`)
      } else if (!dirEntry.isFile) {
        this.#getViewFileList(`${currentPath}/${dirEntry.name}`)
      }
    }
  }

  #buildIndexFile = async () => {
    let pageImportString: string = ""
    let pageImportObject: string = "const pageList = { "
    Object.keys(this.#config.pageFileInfo).forEach(key => {
      pageImportString += `import ${this.#config.pageFileInfo[key].name} from "${this.#config.pageFileInfo[key].filePath}";\n`;
      pageImportObject += `"${key}": { Component: ${this.#config.pageFileInfo[key].name} }, `;
    });
    pageImportObject += " };";

    const indexFile = `
import { React, ReactDOM } from "/view/deps.tsx";
import { AttainRouter } from "https://deno.land/x/attain@cli-beta-0.2/react/AttainRouter.js";
import ${this.#config.entryName} from "/view/${this.#config.entryName}.tsx";
${pageImportString}
${pageImportObject}

${this.#config.entryName}.ServerSideAttain({req: { url: window.location }, res: undefined, pages: pageList, isServer: false})
    .then((SSR) => ReactDOM.hydrate(
        <AttainRouter pathname={window.location.pathname}>
          <${this.#config.entryName} SSR={SSR}/>
        </AttainRouter>
      , document.getElementById('root')))
    .catch(error => console.error(error));
`;

    const transform = (babelCore as any).transform(indexFile, {
      presets: [presetReact, [minify, {
        "keepFnName": true
      }]],
      configFile: false,
    })

    const targetPath = `${this.#config.cwd}/${this.#config.dist}/${this.#config.jsbundlePath}`
    await Deno.writeTextFile(targetPath, transform.code)
  }

  #startBuild = async () => {
    for await (const path of this.#viewFileList) {
      const data = await Deno.readTextFile(`${path}`);

      const result = await Deno.transpileOnly({
        [path]: data
      });

      const transform = (babelCore as any).transform(result[path].source, {
        presets: [presetReact, [minify, {
          "keepFnName": true
        }]],
        configFile: false,
      })

      const targetPath = `${this.#config.cwd}/${this.#config.dist}` + path.replace(this.#config.cwd, "");

      const splitedTargetPath = targetPath.split("/")
      await this.#ensureTarget(splitedTargetPath.slice(0, splitedTargetPath.length - 1).join("/"))
      await Deno.writeTextFile(targetPath, transform.code)
    }
  }

}

