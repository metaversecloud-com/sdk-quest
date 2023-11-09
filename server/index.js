import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import router from "./routes.js";
import cors from "cors";
import { findObjectKeyPath } from "./utils/findObjectKeyPath.js";
dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function (req, res, next) {
  const ogSend = res.send;
  res.send = function (data) {
    if (data && res.statusCode < 300) {
      try {
        const cleanData = JSON.parse(data);
        const path = findObjectKeyPath(cleanData, "topia");
        if (cleanData && path && cleanData[path]) {
          delete cleanData[path]["topia"];
          delete cleanData[path]["credentials"];
          delete cleanData[path]["jwt"];
          delete cleanData[path]["requestOptions"];
        }
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

app.use("/backend", router);

if (process.env.NODE_ENV === "development") {
  const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
  };
  app.use(cors(corsOptions));
} else {
  // Node serves the files for the React app
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use(express.static(path.resolve(__dirname, "../client/build")));

  // All other GET requests not handled before will return our React app
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
