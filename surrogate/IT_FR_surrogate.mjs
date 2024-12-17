import http from "http";
import fs from "fs";
import path from "path";
import url from "url";
import express from "express";

// Creating express object
const app = express();

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const HTTP_PORT = 80; // For Anycast and client-facing HTTP
const INTERNAL_PORT = parseInt(args[0], 10) || 4000; // For internal communication
const SURROGATE_ID = parseInt(args[1], 10) || 1; // 1: France, 2: Italy -> For the images directory name
const MAX_CACHE_SIZE = parseInt(args[2], 10) || 3;
const BROTHER_HOSTNAME = args[3] || "localhost";
const BROTHER_PORT = 3000;
const DEFAULT_IMAGE_FILE_NAME = "crying_minnie.png";

let image_dir;
switch (SURROGATE_ID) {
  case 1:
    image_dir = "FR_images";
    break;
  case 2:
    image_dir = "IT_images";
    break;
}

const cache = new Map();

function getLeastFrequentlyUsedKey() {
  let leastKey = null;
  let leastCount = Infinity;

  for (const [key, value] of cache.entries()) {
    if (value.count < leastCount) {
      leastCount = value.count;
      leastKey = key;
    }
  }

  return leastKey;
}

// Function to get image data from another server hosted on BROTHER_HOSTNAME:BROTHER_PORT
function getDataFromMainServer(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BROTHER_HOSTNAME,
      port: BROTHER_PORT,
      path: endpoint,
      method: "GET",
    };

    const req = http.request(options, (res) => {
      let data = [];

      res.on("data", (chunk) => {
        data.push(chunk);
      });

      res.on("end", () => {
        if (res.statusCode === 200) {
          const buffer = Buffer.concat(data);
          const localPath = path.join(
            __dirname,
            image_dir,
            path.basename(endpoint)
          );

          fs.mkdirSync(path.dirname(localPath), { recursive: true });

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

    req.on("error", (err) => {
      console.error("Error with request:", err.message);
      reject(err);
    });

    req.end();
  });
}

// Serve client requests on port 80
http
  .createServer(async (req, res) => {
    const imagePath = req.url;
    try {
      // Check if the image is in the cache
      if (cache.has(imagePath)) {
        const cachedImage = cache.get(imagePath);
        cachedImage.count++;
        res.setHeader("Content-Type", cachedImage.contentType);
        res.write(cachedImage.buffer);
        res.end();
        console.log("Image served from cache");
        console.log("Cache size:", cache.size);
        console.log("Cache contents:", cache);
        return;
      }

      // Check if the image is in local storage
      const localPath = path.join(__dirname, image_dir, path.basename(imagePath));
      if (fs.existsSync(localPath)) {
        const buffer = fs.readFileSync(localPath);
        res.setHeader("Content-Type", "image/png"); // Adjust content type as needed
        res.write(buffer);
        res.end();
        console.log("Image served from local storage:", localPath);
        console.log("Cache size:", cache.size);
        console.log("Cache contents:", cache);
        return;
      }

      // Fetch image from the main server and cache it
      const { buffer, contentType } = await getDataFromMainServer(imagePath);
      cache.set(imagePath, { buffer, contentType, count: 1 });

      // Evict the least frequently used item if cache size exceeds the limit
      if (cache.size > MAX_CACHE_SIZE) {
        const lfuKey = getLeastFrequentlyUsedKey();
        cache.delete(lfuKey);

        const filePath = path.join(__dirname, image_dir, path.basename(lfuKey));
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file ${filePath}:`, err.message);
          } else {
            console.log(`File deleted: ${filePath}`);
          }
        });
        console.log(`Evicted least frequently used image: ${lfuKey}`);
      }

      // Serve the fetched image
      res.setHeader("Content-Type", contentType);
      res.write(buffer);
      res.end();
      console.log("Image served and cached:", imagePath);
      console.log("Cache size:", cache.size);
      console.log("Cache contents:", cache);
    } catch (err) {
      // Error handling
        console.error("Error fetching image from main server:", err.message);
        const defaultImagePath = path.join(__dirname, image_dir, DEFAULT_IMAGE_FILE_NAME);
      fs.readFile(defaultImagePath, (err, defaultData) => {
        if (err) {
          console.error("Error reading default image:", err.message);
          res.statusCode = 500;
          res.end("Internal Server Error");
        } else {
          res.setHeader("Content-Type", "image/png");
          res.write(defaultData);
          res.end();
          console.log("Default image served");
        }
      }
      );
    
  }})
  .listen(HTTP_PORT, () => {
    console.log(`Client-facing HTTP server running on port ${HTTP_PORT}`);
  });

// Internal Express server for surrogate-to-main server communication
app.listen(INTERNAL_PORT, () => {
  console.log(`Internal communication server running on port ${INTERNAL_PORT}`);
});

