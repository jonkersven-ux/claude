import "dotenv/config";
import app from "./app";

const PORT = parseInt(process.env.API_PORT || "4000", 10);

app.listen(PORT, () => {
  console.log(`[HostIQ API] Running on http://localhost:${PORT}`);
});
