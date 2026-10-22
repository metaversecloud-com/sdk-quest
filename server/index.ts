import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes.js";
import path from "path";
import { cleanReturnPayload } from "./utils/cleanReturnPayload.js";
import { fileURLToPath } from "url";

dotenv.config({ path: "../.env" });

function checkEnvVariables() {
  const requiredEnvVariables = ["INTERACTIVE_KEY", "INTERACTIVE_SECRET"];
  const missingVariables = requiredEnvVariables.filter((variable) => !process.env[variable]);

  if (missingVariables.length > 0) {
    throw new Error(`Missing required environment variables in the .env file: ${missingVariables.join(", ")}`);
  } else {
    console.log("All required environment variables provided.");
  }
}
checkEnvVariables();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
// Body size has to accommodate the base64-encoded admin uploads sent via
// POST /api/uploads. The controller enforces the raw size cap
// (`MAX_UPLOAD_BYTES = 2 MB` in `utils/s3.ts`); here we only need to
// let the base64-inflated payload through. 2 MB raw → ~2.7 MB base64,
// so 4 MB covers it with headroom for the surrounding JSON envelope.
// Without this, Express's 100 KB default rejects every real image with
// a 413 before the controller's size check can report a friendly error.
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: false, limit: "4mb" }));
app.use("/api", router);

if (process.env.NODE_ENV === "development") {
  const corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
  };
  app.use(cors(corsOptions));
} else {
  // Node serves the files for the React app
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use(express.static(path.resolve(__dirname, "../../../client/build")));

  // All other GET requests not handled before will return our React app
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../../../client/build", "index.html"));
  });
}

app.use(function (req, res, next) {
  const ogSend = res.send;
  // @ts-ignore
  res.send = function (data) {
    if (data) {
      try {
        const cleanData = cleanReturnPayload(typeof data === "string" ? JSON.parse(data) : data);
        res.send = ogSend;
        return res.send(cleanData);
      } catch (error) {
        console.log(error);
        next();
      }
    }
  };
  next();
});


// Prevent crashes from unhandled promise rejections (e.g., API timeouts after response sent)
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  // ERR_HTTP_HEADERS_SENT is non-fatal — response was already sent, just log it
  if ((error as any).code === "ERR_HTTP_HEADERS_SENT") {
    console.error("Caught ERR_HTTP_HEADERS_SENT (response already sent):", error.message);
    return;
  }
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
