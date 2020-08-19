const fileName = Deno.args;

// const decoder = new TextDecoder("utf-8");
console.log("Auto Recovery mode with Attain");
// let memoryInspect = null;
const exec = async () => {
  const p = Deno.run({
    cmd: [
      "deno",
      "run",
      "-A",
      "--unstable",
      fileName[0],
    ],
  });

  // memoryInspect = setInterval(() => checkMem(p), 2000);
  const { code } = await p.status();
  console.log("code: ", code);
  console.warn("auto recovered!");
  p.close();
  // clearInterval(memoryInspect);
  await exec();
};

// const checkMem = async (p: any) => {
//   const p2 = Deno.run({
//     cmd: [
//       "wmic",
//       "process",
//       "where",
//       `processid=${p.pid}`,
//       "get",
//       "WorkingSetSize",
//     ],
//     stdout: "piped"
//   })
//   // "get-process chrome | select-object @{l='Private Memory (MB)'; e={$_.privatememorysize64 / 1mb}}"

//   const string = await p2.output();
//   console.log(formatBytes(parseInt(decoder.decode(string).split("\n")[1])));
// }

// function formatBytes(bytes: number, decimals = 4) {
//   if (bytes === 0) return '0 Bytes';

//   const k = 1024;
//   const dm = decimals < 0 ? 0 : decimals;
//   const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

//   const i = Math.floor(Math.log(bytes) / Math.log(k));

//   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
// }

// await exec();
