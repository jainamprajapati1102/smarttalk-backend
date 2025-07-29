import app from "./app.js";
import { createServer } from "http";

const PORT = 5100;
const server = createServer(app);
server.listen(PORT, () => {
  console.log(`server listing PORT No. ${PORT}`);
});
