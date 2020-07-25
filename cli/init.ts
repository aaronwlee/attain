import { ensureDir, cyan, green, red, blue } from "../deps.ts";
// export { download } from "https://deno.land/x/download/mod.ts";


// const fileList: any = {
//   controllers: ["routers.ts", "userController.ts"],
//   models: ["user.ts"],
//   view: {
//     components: ["Home.tsx", "Layout.tsx", "Nav.tsx", "Users.tsx"],
//     public: ["favicon.ico", "index.html", "logo192.png"],
//     types: {
//       csstype: ["index.d.ts"],
//       "prop-types": ["index.d.ts"],
//       react: ["global.d.ts", "index.d.ts"]
//     },
//     _: ["app.tsx", "deps.ts", "index.tsx"]
//   },
//   _: [".gitignore", "global.d.ts", "packages.yaml", "react.tsconfig.json", "server.ts", "serverDeps.ts"]
// }

export async function initializer(projectPath: string) {
  console.log(blue("[init]"), `Start to initialize the project at`, cyan(projectPath))
  await getDownload(projectPath)
  console.log(green("[init]"), "Successfully initialized!")
  console.log(cyan(`\n\t\tStarting from 'cd ./${projectPath}'\n`))
}

async function getDownload(projectPath: string, path: string = "") {
  const destinationPath = `${Deno.cwd()}/${projectPath}${path}`
  const downloadUrl = "https://api.github.com/repos/aaronwlee/attain-react-ssr/contents"
  try {
    const res = await fetch(`${downloadUrl}${path}`)
    if(res.status >= 400) {
      throw res.statusText
    }
    const data = await res.json();

    for await (const info of data) {
      if (info.download_url) {
        await ensureDir(destinationPath)
        console.log(green("[init download]"), `start - ${destinationPath}/${info.name}`)

        const gitfetch = await fetch(`${info.download_url}`)
        const gitdata = await gitfetch.text();
        await Deno.writeTextFile(`${destinationPath}/${info.name}`, gitdata);
        // try {
        //   await download(info.download_url, {
        //     file: info.name,
        //     dir: destinationPath
        //   })
        //   console.log(green("[init download]"), `done - ${info.download_url}`)
        // } catch (error) {
        //   console.error(red(`[init download]`), error)
        // }

      } else if (!info.download_url) {
        await getDownload(projectPath, `/${info.path}`)
      }
    }
  } catch (gitError) {
    console.error(red("[init error]"), gitError)
  }
}

// async function projectInit(projectPath: string, list: any, prev?: string) {
//   const downloadUrl = "https://raw.githubusercontent.com/aaronwlee/Attain-React-Example/master";
//   const currentPath = Deno.cwd() + "/" + projectPath;

//   const jobs = Object.keys(list).map(async key => {
//     if (Array.isArray(list[key])) {
//       for await (const path of list[key]) {
//         const dir = `${prev ? prev : ""}${key === "_" ? "" : `/${key}`}`;
//         const file = path
//         const url = downloadUrl + dir + "/" + file;

//         ensureDir(currentPath + "/" + dir);

//         console.log(url);
//         try {
//           await download(url, {
//             file,
//             dir: currentPath + "/" + dir
//           })
//         } catch (e) {
//           console.error(red(`[${file} download error]`), e)
//         }

//       }
//     } else {
//       projectInit(projectPath, list[key], `${prev ? prev : ""}/${key}`)
//     }
//   })

//   await Promise.all(jobs);
// }