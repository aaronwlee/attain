import Router from "../router.ts";
import second from "./second.ts";

const api = new Router();


api.use("/", second);

api.get("/hello", (req, res) => {
  console.log("here '/hello'")
  res.status(200).send({ status: "Hello" });
})

api.use("/post", second);



export default api;