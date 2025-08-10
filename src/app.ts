import express from "express";
import fusionRouter from "./routes/fusion";
import storeRouter from "./routes/store";
import historyRouter from "./routes/history";

const app = express();
app.use(express.json());

app.use("/fusionados", fusionRouter);
app.use("/almacenar", storeRouter);
app.use("/historial", historyRouter);

app.get("/", (_, res) => res.json({ ok: true, service: "starwars-weather-api" }));
export default app;
