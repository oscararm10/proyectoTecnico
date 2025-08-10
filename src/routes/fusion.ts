import { Router } from "express";
import { getFusionCachedOrFetch } from "../services/fusionService";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const limit = Math.min(50, Number(req.query.limit) || 5);
    const result = await getFusionCachedOrFetch({ limit });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

export default router;
