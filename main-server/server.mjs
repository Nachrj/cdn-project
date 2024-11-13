import http from "http";
import fs from "fs";
import path from "path";
import url from "url";
import express from "express";

// Creating express object
const app = express();

// Defining port number
const PORT = 8000;

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static("public"));

app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  const imgPath = path.join(__dirname, "images", "crying_minnie.png");
  res.sendFile(imgPath);
});

// Server setup
app.listen(PORT, () => {
  console.log(`Running server on PORT ${PORT}...`);
});
