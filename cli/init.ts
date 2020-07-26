import { ensureDir, cyan, green, red, blue } from "../deps.ts";
import version from "../version.ts";

export async function initializer(projectPath: string) {
  console.log(blue("[init]"), `Start to initialize the project at`, cyan(projectPath))
  await getDownload(projectPath)
  console.log(green("[init]"), "Successfully initialized!")
  console.log(cyan(`\n\t\tStarting from 'cd ./${projectPath}'\n`))
}

async function getDownload(projectPath: string, path: string = "") {
  const destinationPath = `${Deno.cwd()}/${projectPath}${path}`
  const downloadUrl = `https://api.github.com/repos/aaronwlee/attain-react-ssr/contents?ref=${version}`
  try {
    const res = await fetch(`${downloadUrl}${path}`)
    if (res.status >= 400) {
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

      } else if (!info.download_url) {
        await getDownload(projectPath, `/${info.path}`)
      }
    }
  } catch (gitError) {
    console.error(red("[init error]"), gitError)
  }
}
