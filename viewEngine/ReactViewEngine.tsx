import { blue, red, green, yellow, ensureDir } from "../deps.ts";
import { ReactCompiler } from "./ReactCompiler.tsx";

export default class ReactViewEngine {
  #pages: any = {};
  #pagesPath: string;
  #Components: {
    MainComponent: any,
    DocumentComponent: any
  } = {
      MainComponent: undefined,
      DocumentComponent: undefined
    }
  #componentPaths: {
    MainComponent: string,
    DocumentComponent: string
  }
  #currentPath: string = Deno.realPathSync(Deno.cwd());

  constructor(MainComponentPath: string, DocumentComponentPath: string, pagesPath: string) {
    this.#componentPaths = {
      MainComponent: Deno.realPathSync(`${this.#currentPath}${MainComponentPath}`),
      DocumentComponent: Deno.realPathSync(`${this.#currentPath}${DocumentComponentPath}`),
    }
    this.#pagesPath = Deno.realPathSync(`${this.#currentPath}${pagesPath}`);
  }

  get pages() {
    return this.#pages;
  }

  get MainComponent() {
    if (!this.#Components.MainComponent) {
      throw "MainComponet is empty"
    }
    return this.#Components.MainComponent;
  }

  get DocumentComponent() {
    if (!this.#Components.DocumentComponent) {
      throw "DocumentComponent is empty"
    }
    return this.#Components.DocumentComponent;
  }

  public async load() {
    await this.getPageFiles(this.#currentPath, this.#pagesPath);
    console.log(green("[dev - server]"), `Successfully load PageComponents`)
    await this.loadMainComponent();
    await this.loadDocumentComponent();
  }

  public async build() {
    try {
      await Deno.remove(`${this.#currentPath}/.attain`, { recursive: true });
    } catch (err) {
      console.log(green("[dev]"), "Don't need to remove cached files")
    }

    try {
      try {
        await ensureDir(`${this.#currentPath}/.attain`);
      } catch (e) { }
      const compiler = new ReactCompiler({
        dist: ".attain",
        pageFileInfo: this.#pages,
        jsbundlePath: "/main.js",
        entryName: this.MainComponent.name
      })
      await compiler.build();
      console.log(green("[dev]"), "Successfully build the react")

      await this.copyStatics();
      console.log(green("[dev]"), "Successfully copy static files")
    } catch (initError) {
      console.log(red("[dev] - init error:"), initError)
      Deno.exit(1);
    }
  }

  private async copyStatics(path?: string) {
    for await (const dirEntry of Deno.readDir(`${this.#currentPath}/view/public${path ? path : ""}`)) {
      if (dirEntry.name !== "index.html") {
        if (dirEntry.isDirectory) {
          try {
            await ensureDir(`${this.#currentPath}/.attain${`/${dirEntry.name}`}`)
          } catch (e) { }
          await this.copyStatics(`/${dirEntry.name}`)
        } else if (dirEntry.isFile) {
          await Deno.copyFile(`${this.#currentPath}/view/public${path ? path : ""}${`/${dirEntry.name}`}`, `${this.#currentPath}/.attain${path ? path : ""}${`/${dirEntry.name}`}`);
        }
      }
    }
  }

  private async loadMainComponent() {
    if (this.#Components.MainComponent) {
      delete this.#Components.MainComponent;
    }
    this.#Components.MainComponent = (await import(`file://${this.#componentPaths.MainComponent}`)).default
    console.log(green("[dev]"), `Successfully load MainComponent`)
  }

  private async loadDocumentComponent() {
    if (this.#Components.DocumentComponent) {
      delete this.#Components.DocumentComponent;
    }
    this.#Components.DocumentComponent = (await import(`file://${this.#componentPaths.DocumentComponent}`)).default
    console.log(green("[dev]"), `Successfully load DocumentComponent`)
  }

  private async getPageFiles(entry: string, path: string) {
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
          delete this.#pages[fullPath];
          this.#pages[fullPath] = {
            filePath: `${rootPath}/${dirEntry.name}`,
            Component: component,
            name: component.name
          }
        }
      } else if (dirEntry.isDirectory) {
        this.getPageFiles(entry, `${path}/${dirEntry.name}`)
      }
    }
  }
}