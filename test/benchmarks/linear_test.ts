import {
  assertEquals,
  bench,
  runBenchmarks,
} from "../test_deps.ts";
import { App, staticServe } from "../../mod.ts";

const app = new App();

for (let i = 0; i < 10001; i++) {
  app.use(`/${i}`, (req, res) => {
    res.send(i.toString());
  });
}

app.listen(9555);

bench({
  name: "warming up",
  runs: 1,
  async func(b: any): Promise<void> {
    b.start();
    const response = await fetch(`http://localhost:9555/${0}`);
    const data = await response.text();
    assertEquals(data, "0");
    b.stop();
  },
});

bench({
  name: "GET: /0",
  runs: 1,
  async func(b: any): Promise<void> {
    b.start();
    const response = await fetch(`http://localhost:9555/${0}`);
    const data = await response.text();
    assertEquals(data, "0");
    b.stop();
  },
});

bench({
  name: "GET: /10",
  runs: 1,
  async func(b: any): Promise<void> {
    b.start();
    const response = await fetch(`http://localhost:9555/${10}`);
    const data = await response.text();
    assertEquals(data, "10");
    b.stop();
  },
});

bench({
  name: "GET: /100",
  runs: 1,
  async func(b: any): Promise<void> {
    b.start();
    const response = await fetch(`http://localhost:9555/${100}`);
    const data = await response.text();
    assertEquals(data, "100");
    b.stop();
  },
});

bench({
  name: "GET: /1000",
  runs: 1,
  async func(b: any): Promise<void> {
    b.start();
    const response = await fetch(`http://localhost:9555/${1000}`);
    const data = await response.text();
    assertEquals(data, "1000");
    b.stop();
  },
});

bench({
  name: "GET: /5000",
  runs: 1,
  async func(b: any): Promise<void> {
    b.start();
    const response = await fetch(`http://localhost:9555/${5000}`);
    const data = await response.text();
    assertEquals(data, "5000");
    b.stop();
  },
});

bench({
  name: "GET: /10000",
  runs: 1,
  async func(b: any): Promise<void> {
    b.start();
    const response = await fetch(`http://localhost:9555/${10000}`);
    const data = await response.text();
    assertEquals(data, "10000");
    b.stop();
  },
});

await runBenchmarks();

await app.close();
