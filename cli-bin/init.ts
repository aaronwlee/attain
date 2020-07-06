import { download, ensureDir } from "../deps.ts";

const fileList: any = {
  controllers: ["routers.ts", "userController.ts"],
  models: ["user.ts"],
  view: {
    components: ["Home.tsx", "Layout.tsx", "Nav.tsx", "Users.tsx"],
    public: ["favicon.ico", "index.html", "logo192.png"],
    types: {
      csstype: ["index.d.ts"],
      "prop-types": ["index.d.ts"],
      react: ["global.d.ts", "index.d.ts"]
    },
    _: ["app.tsx", "deps.ts", "index.tsx"]
  },
  _: [".gitignore", "attain-env.d.ts", "packages.yaml", "react.tsconfig.json", "server.ts", "serverDeps.ts"]
}

export async function Initializer(projectPath: string) {
  console.log("Start to initialize the project at", projectPath)
  await projectInit(projectPath, fileList);
  console.log("Successfully initialized!")
}

async function projectInit(projectPath: string, list: any, prev?: string) {
  const downloadUrl = "https://raw.githubusercontent.com/aaronwlee/Attain-React-Example/master";
  const currentPath = Deno.cwd() + "/" + projectPath;

  for (const key in list) {
    if (Array.isArray(list[key])) {
      for (const path of list[key]) {
        const dir = `${prev ? prev : ""}${key === "_" ? "" : `/${key}`}`;
        const file = path
        const url = downloadUrl + dir + "/" + file;

        ensureDir(currentPath + "/" + dir);

        console.log(url);
        try {
          await download(url, {
            file,
            dir: currentPath + "/" + dir
          })
        } catch (e) {
          console.error("download error", e)
        }

      }
    } else {
      projectInit(projectPath, list[key], `/${key}`)
    }
  }
}