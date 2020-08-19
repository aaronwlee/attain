import {
  assertEquals,
  bench,
  runBenchmarks,
} from "../test_deps.ts";
import { App, Router } from "../../mod.ts";

const app = new App();

const createLinearGraph = (current: number, max: number) => {
  const newRouter = new Router();
  newRouter.get(`/${current}`, (req, res) => {
    res.send(current.toString());
  });
  if (current !== max) {
    newRouter.use(createLinearGraph(current + 1, max));
  }
  return newRouter;
};

const createNestedGraph = (current: number, max: number) => {
  const newRouter = new Router();
  newRouter.get(`/${current}`, (req, res) => {
    res.send(current.toString());
  });
  if (current !== max) {
    newRouter.use(`/${current}`, createNestedGraph(current + 1, max));
  }
  return newRouter;
};

app.use(createLinearGraph(0, 100));

app.use("/nested", createNestedGraph(0, 100));

app.listen({ port: 9550 });

/**
 * prepare section
 */
const temp = [];
for (let i = 0; i < 101; i++) {
  temp.push(i);
}
const urlForNested = temp.join("/");

bench({
  name: "warming up",
  runs: 1,
  async func(b: any): Promise<void> {
    b.start();
    const response = await fetch(`http://localhost:9550/0`);
    const data = await response.text();
    assertEquals(data, "0");
    b.stop();
  },
});

bench({
  name: "GET: linear/10",
  runs: 1,
  async func(b: any): Promise<void> {
    b.start();
    const response = await fetch(`http://localhost:9550/${100}`);
    const data = await response.text();
    assertEquals(data, "100");
    b.stop();
  },
});

bench({
  name: "GET: nested/0...100 ",
  runs: 1,
  async func(b: any): Promise<void> {
    b.start();
    const response = await fetch(
      `http://localhost:9550/nested/${urlForNested}`,
    );
    const data = await response.text();
    assertEquals(data, "100");
    b.stop();
  },
});

await runBenchmarks();

await app.close();
