import { App, logger, parser, staticServe } from "https://deno.land/x/attain/mod.ts";
// import { App, logger, parser } from "https://deno.land/x/attain/mod.ts";

const app = new App();

// logging response method status path time
app.use(logger);

// parsing the request body and save it to request.params
app.use(parser);

// serve static files
app.use(staticServe("./public"));

app.use("/", (req, res) => {
  res.status(200).send("hello");
});

app.post("/submit", (req, res) => {
  console.log(req.params);
  res.status(200).send({ data: "has received" });
});

app.use((req, res) => {
  res.status(404).send("page not found");
});

app.listen({ port: 4000 });
console.log("Starting to listen at http://localhost:4000");
