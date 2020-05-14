import { App } from "https://raw.githubusercontent.com/aaronwlee/Attain/master/mod.ts";
import logger from "https://raw.githubusercontent.com/aaronwlee/Attain/master/plugins/logger.ts";
import parser from "https://raw.githubusercontent.com/aaronwlee/Attain/master/plugins/json-parser.ts";

const app = new App();

// logging response method status path time
app.use(logger);

// parsing the request body and save it to request.params
app.use(parser);

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
