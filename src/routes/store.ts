import { Router } from "express";
import { saveCustom } from "../services/dbService";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const payload = req.body;
    if (!payload) return res.status(400).json({ error: "no_body" });
    const saved = await saveCustom(payload);
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

export default router;
