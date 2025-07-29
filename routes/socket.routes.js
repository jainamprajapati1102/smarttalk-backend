import e from "express";
const router = e.Router();

router.get("/:id", (req, res) => {
  res.send(1);
});
export default router;
