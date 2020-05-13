import App from "../application.ts";
import api from "./router.ts";
import parser from "../plugins/json-parser.ts";
import logger from "../plugins/logger.ts";


const app = new App();

// app.use((req, res) => {

// })

app.use(parser);
app.use(logger);



app.use("/api", api);

app.use((req, res) => {
  res.status(404).send("<h2>Page not found</h2>")
})

app.listen({ port: 3500 });

console.log("http://localhost:3500");

