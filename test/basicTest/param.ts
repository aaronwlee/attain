import { Router } from "../../mod.ts";

/**
 * Test purpose
 * 
 * - check param method
 */
const paramTest = new Router();

paramTest.param("username", (req, res, username) => {
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