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

const args = process.argv.slice(2);
const MAX_CACHE_SIZE = parseInt(args[0], 10) || 5;
const BROTHER_HOSTNAME = args[1] || "localhost";
const BROTHER_PORT = parseInt(args[2], 10) || 8000;

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

// Function to get image data from another server hosted on localhost:8000 and save it locally
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
            "images",
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

app.use(express.static("public"));

app.use(async (req, res) => {
  const imagePath = req.path;
  try {
    if (cache.has(imagePath)) {
      const cachedImage = cache.get(imagePath);
      cachedImage.count++;
      res.setHeader("Content-Type", cachedImage.contentType);
      res.send(cachedImage.buffer);
      console.log("Image served from cache");
      console.log("Cache size:", cache.size);
      console.log("Cache contents:", cache);
      return;
    }
    const { buffer, contentType } = await getDataFromMainServer(imagePath);

    cache.set(imagePath, { buffer, contentType, count: 1 });

    if (cache.size > MAX_CACHE_SIZE) {
      const lfuKey = getLeastFrequentlyUsedKey();
      cache.delete(lfuKey);

      const filePath = path.join(__dirname, "images", path.basename(lfuKey));
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file ${filePath}:`, err.message);
        } else {
          console.log(`File deleted: ${filePath}`);
        }
      });

      console.log(`Evicted least frequently used image: ${lfuKey}`);
    }
    console.log("Cache size:", cache.size);
    console.log("Cache contents:", cache);

    res.setHeader("Content-Type", contentType);
    res.send(buffer);
    console.log("Image served and cached:", imagePath);
  } catch (err) {
    console.error("Error fetching image from main server:", err.message);

    const imgPath = path.join(__dirname, "images", "crying_minnie.png");
    res.sendFile(imgPath);
    console.log("Default image served for:", imagePath);
  }
});

app.listen(PORT, () => {
  if (args.length > 3) {
    console.error("Too many arguments provided.");
    process.exit();
  }
  console.log(`Running server on PORT ${PORT}...`);
});
