import { blue, red, green, yellow } from "../deps.ts";

export default class ReactViewEngine {
  #processingList: any = {};
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

  get preloadList() {
    //@ts-ignore
    return Object.keys(this.pages).map(key => <link rel="preload" href={pages[key].filePath} as="script" />)
  }

  public async load(key?: string) {
    key && console.log(yellow("[dev - server]"), `Detected a file change ${key}`)
    await this.getPageFiles(this.#currentPath, this.#pagesPath);
    console.log(green("[dev - server]"), `Successfully hot reloaded PageComponents`)
    await this.loadMainComponent();
    await this.loadDocumentComponent();
    if (key) {
      delete this.#processingList[key];
      // eventEmitter.emit("bundled")
    }
  }

  public async watchFile() {
    console.log(blue("[dev - server]"), `start to watching ${Deno.cwd()}/view`)
    for await (const event of Deno.watchFs(`${Deno.cwd()}/view`)) {
      const key = event.paths[0]
      if (!Object.keys(this.#processingList).find((p: any) => p === key)) {
        this.#processingList[key] = true
        this.load(key).catch(e => console.log(red("[dev - server]"), e));
      }
    }
  }

  private async loadMainComponent() {
    if (this.#Components.MainComponent) {
      delete this.#Components.MainComponent;
    }
    this.#Components.MainComponent = (await import(`file://${this.#componentPaths.MainComponent}`)).default
    console.log(green("[dev - server]"), `Successfully hot reloaded MainComponent`)
  }

  private async loadDocumentComponent() {
    if (this.#Components.DocumentComponent) {
      delete this.#Components.DocumentComponent;
    }
    this.#Components.DocumentComponent = (await import(`file://${this.#componentPaths.DocumentComponent}`)).default
    console.log(green("[dev - server]"), `Successfully hot reloaded DocumentComponent`)
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