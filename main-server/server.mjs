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

// Serve static files from the "public" directory
app.use(express.static("public"));

// Serve images from the "images" directory
app.use("/images", (req, res) => {
  const imgPath = path.join(__dirname, "images", req.path);

  // Check if the file exists
  fs.access(imgPath, fs.constants.F_OK, (err) => {
    if (err) {
      // File does not exist, send a 404 response
      res.status(404).send("Image not found");
    } else {
      // File exists, send the image
      res.sendFile(imgPath);
    }
  });
});

// Server setup
app.listen(PORT, () => {
  console.log(`Running server on PORT ${PORT}...`);
});
