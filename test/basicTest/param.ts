import { Router, parser } from "../../mod.ts";

const sleep = (time: number = 100) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), time);
  });

/**
 * Test purpose
 * 
 * - check param method
 */
const paramTest = new Router();

paramTest.param("username", async (req, res, username) => {
  await sleep();
  req.username = username;
});

paramTest.param("password", async (req, res, password) => {
  await sleep(500);
  if(password !== "123") {
    return res.status(404).send("password is not matched");
  }
  req.password = password;
});

paramTest.get("/:username", (req, res) => {
  res.send(req.username);
});

paramTest.get("/:username/:password", (req, res) => {
  res.send({ name: req.username, password: req.password });
});

paramTest.post("/:username/password", parser, (req, res) => {
  res.send({ name: req.username, password: req.params.password });
});

paramTest.post("/:username/post", async (req, res) => {
  res.send(req.username);
});

paramTest.patch("/:username/patch", async (req, res) => {
  res.send(req.username);
});

paramTest.put("/:username/put", async (req, res) => {
  res.send(req.username);
});

paramTest.delete("/:username/delete", async (req, res) => {
  res.send(req.username);
});

paramTest.options("/:username/options", async (req, res) => {
  res.send(req.username);
});



export default paramTest;
