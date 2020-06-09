import { Router } from "../../mod.ts";

const sleep = (time: number = 1000) => new Promise((resolve) => { setTimeout(() => resolve(), time) })

/**
 * Test purpose
 * 
 * - check param method
 */
const paramTest = new Router();

paramTest.param("username", async (req, res, username) => {
  await sleep();
  req.username = username;
})

paramTest.get("/:username", (req, res) => {
  res.send(req.username);
})

paramTest.post("/:username/post", async (req, res) => {
  res.send(req.username);
})

paramTest.patch("/:username/patch", async (req, res) => {
  res.send(req.username);
})

paramTest.put("/:username/put", async (req, res) => {
  res.send(req.username);
})

paramTest.delete("/:username/delete", async (req, res) => {
  res.send(req.username);
})

export default paramTest;