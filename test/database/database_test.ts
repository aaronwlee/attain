import {
  assertEquals,
  bench,
  runBenchmarks,
} from "../test_deps.ts";
import { App, Router, AttainDatabase } from "../../mod.ts";

const port = 8564;

class SampleDatabaseClass extends AttainDatabase {
  #connection: boolean = false;
  async connect() {
    console.log("fake DB connected");
    this.#connection = true;
  }

  get connection() {
    return this.#connection
  }
}

async function SampleDatabaseConnector() {
  const instance = new SampleDatabaseClass()
  await instance.connect()
  return instance.connection
}

const app1 = new App();
app1.database(SampleDatabaseClass)
app1.use((req, res, db) => {
  Deno.test("'database' method with a class instance", () => {
    assertEquals(db.connection, true)
  })

  res.send("Ok")
})
app1.listen(port);

await fetch(
  `http://localhost:${port}`,
);



const app2 = new App();
app2.database(SampleDatabaseConnector)
app2.use((req, res, db) => {
  Deno.test("'database' method with a function", () => {
    assertEquals(db, true)
  })

  res.send("Ok")
})
app2.listen(port + 1);

await fetch(
  `http://localhost:${port + 1}`,
);


const app3 = App.startWith(SampleDatabaseClass);
app3.use((req, res, db) => {
  Deno.test("'startWith' method with a class instance", () => {
    assertEquals(db.connection, true)
  })

  res.send("Ok")
})
app3.listen(port + 2);

await fetch(
  `http://localhost:${port + 2}`,
);


const app4 = App.startWith(SampleDatabaseConnector);
app4.use((req, res, db) => {
  Deno.test("'startWith' method with a function", () => {
    assertEquals(db, true)
  })

  res.send("Ok")
})
app4.listen(port + 3);

await fetch(
  `http://localhost:${port + 3}`,
);


await app1.close();
await app2.close();
await app3.close();
await app4.close();