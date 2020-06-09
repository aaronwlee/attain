import { Router, parser } from "../../mod.ts";

/**
 * Test purpose
 * 
 * - check nested router
 */
const router = new Router();

router.get("/", (req, res) => {
  res.send("/router");
})

router.get("/second", (req, res) => {
  res.send("/router/second");
})

router.get("/second/:id", (req, res) => {
  res.send(`/router/second/${req.params.id}`);
})

router.get("/search", parser, (req, res) => {
  res.send(req.query);
})

router.post("/post", parser, async (req, res) => {
  res.send(req.params);
})

export default router;