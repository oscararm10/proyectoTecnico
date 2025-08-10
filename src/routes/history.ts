import { Router } from "express";
import { getHistory } from "../services/dbService";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Number(req.query.pageSize) || 10);
    const items = await getHistory({ page, pageSize });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

export default router;
