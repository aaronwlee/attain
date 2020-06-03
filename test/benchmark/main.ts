import {
  assertEquals,
  bench,
  runBenchmarks,
} from "../test_deps.ts";
import { App, staticServe } from "../../mod.ts";
import router from "./router.ts";

/**
 * Main part
 */
const app = new App();

app.use(staticServe("test/static"))
app.use("/router", router);

app.get("/", (req, res) => {
  res.send("/");
})

app.get("/sendFile", async (req, res) => {
  await res.sendFile("test/static/test.html")
})

app.get("/error", (req, res) => {
  throw new Error("test error");
})

app.error("/error", (error, req, res) => {
  res.send(error.message);
})

app.listen({ port: 8080 })

/**
 * basic route test
 */
bench({
  name: "GET: /",
  runs: 5,
  async func(b: any): Promise<void> {
    b.start();
    const conns = [];
    for (let i = 0; i < 10; ++i) {
      conns.push(fetch("http://localhost:8080/").then((resp) => resp.text()));
    }
    await Promise.all(conns);
    for await (const i of conns) {
      assertEquals(i, "/");
    }
    b.stop();
  },
});

/**
 * error test
 */
bench({
  name: "GET: /error",
  runs: 1,
  async func(b: any): Promise<void> {
    b.start();
    const errorTest = await fetch("http://localhost:8080/error");
    const data = await errorTest.text();
    assertEquals(data, "test error")
    b.stop();
  },
});

/**
 * static serve
 */
bench({
  name: "GET: /test.html",
  runs: 1,
  async func(b: any): Promise<void> {
    b.start();
    const staticTest = await fetch("http://localhost:8080/test.html");
    const staticData = await staticTest.text();
    assertEquals(staticData, `<!doctype html><html lang="en"><body><div class="info"><p><strong>Test</strong> this page is a simple html</p></div></body></html>`)
    b.stop();
  },
});
bench({
  name: "GET: /sendFile",
  runs: 1,
  async func(b: any): Promise<void> {
    b.start();
    const sendFileTest = await fetch("http://localhost:8080/sendFile");
    const sendFileData = await sendFileTest.text();
    assertEquals(sendFileData, `<!doctype html><html lang="en"><body><div class="info"><p><strong>Test</strong> this page is a simple html</p></div></body></html>`)
    b.stop();
  },
});

/**
 * nested
 */
bench({
  name: "GET: /router and /router/second",
  runs: 1,
  async func(b: any): Promise<void> {
    b.start();
    const routerPath = await fetch("http://localhost:8080/router");
    const routerData = await routerPath.text();
    assertEquals(routerData, "/router")

    const secondPath = await fetch("http://localhost:8080/router/second");
    const secondData = await secondPath.text();
    assertEquals(secondData, "/router/second")
    b.stop();
  },
});

bench({
  name: "GET: /router/second/:id",
  runs: 1,
  async func(b: any): Promise<void> {
    b.start();
    const conns = [];
    for (let i = 0; i < 5; ++i) {
      conns.push(fetch(`http://localhost:8080/router/second/${i}`).then((resp) => resp.text()));
    }
    await Promise.all(conns);
    for (const key in conns) {
      const data = await conns[key];
      assertEquals(data, `/router/second/${key}`);
    }
    b.stop();
  },
});

bench({
  name: "GET: /router/seach?name=aaron",
  runs: 1,
  async func(b: any): Promise<void> {
    b.start();
    b.start();
    const test = await fetch("http://localhost:8080/router/search?name=aaron");
    const data = await test.json();
    assertEquals(data, { name: "aaron" })
    b.stop();
  },
});

bench({
  name: "POST: /router/post",
  runs: 1,
  async func(b: any): Promise<void> {
    b.start();
    const test = await fetch("http://localhost:8080/router/post", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: "aaron" })
    });
    const data = await test.json();
    assertEquals(data, { name: "aaron" })
    b.stop();
  },
});

runBenchmarks().finally(async () => {
  app.close();
});