import http from "http";
import fs from "fs";
import path from "path";
import url from "url";
import express from "express";

// Creating express object
const app = express();

// Defining port number
const PORT = 3000;

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to get image data from another server hosted on localhost:8000 and save it locally
function getDataFromMainServer(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 8000,
      path: endpoint,
      method: "GET",
    };

    const req = http.request(options, (res) => {
      let data = [];

      // Handle incoming data chunks in binary format
      res.on("data", (chunk) => {
        data.push(chunk);
      });

      // Handle end of response
      res.on("end", () => {
        if (res.statusCode === 200) {
          const buffer = Buffer.concat(data);
          const localPath = path.join(
            __dirname,
            "images",
            path.basename(endpoint)
          );

          // Ensure the directory exists
          fs.mkdirSync(path.dirname(localPath), { recursive: true });

          // Save the image locally
          fs.writeFile(localPath, buffer, (err) => {
            if (err) {
              console.error("Error saving the file:", err.message);
              reject(err);
            } else {
              console.log("File saved successfully at", localPath);
              resolve({ buffer, contentType: res.headers["content-type"] });
            }
          });
        } else {
          reject(new Error(`Request failed. Status code: ${res.statusCode}`));
        }
      });
    });

    // Handle request errors
    req.on("error", (err) => {
      console.error("Error with request:", err.message);
      reject(err);
    });

    // End the request
    req.end();
  });
}

// Middleware to serve static files from the /public directory
app.use(express.static("public"));

// Serve static images from the /images directory
app.use("/images", express.static(path.join(__dirname, "images")));

// Route handler for custom image fetching from localhost:8000
app.use(async (req, res) => {
  try {
    const { buffer, contentType } = await getDataFromMainServer(req.path);
    res.setHeader("Content-Type", contentType);
    res.send(buffer);
    console.log("Image sent successfully");
  } catch (err) {
    console.error("Error fetching image from local server:", err.message);
    const imgPath = path.join(__dirname, "images", "crying_minnie.png");
    res.sendFile(imgPath);
    console.log("Default image sent");
  }
});

// Server setup
app.listen(PORT, () => {
  console.log(`Running server on PORT ${PORT}...`);
});
