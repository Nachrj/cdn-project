# Project Setup and Run Instructions

This repository contains two main components:
- **Main Server** (Node.js)
- **Surrogate Server** (Node.js)

Follow the steps below to install and run each component.

## Prerequisites
Ensure that you have the following installed on your machine:
- Node.js (version 14.x or higher)
- npm (Node Package Manager)

## Installation and Setup

### Main Server
1. Navigate to the `main_server` directory:
   ```bash
   cd main_server
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Run the server:
   ```bash
   node server.mjs
   ```

- Possible to change the port number in the `server.mjs` code using the `PORT` constant.
- We should create a directory named `images` and store all our images inside.

### Surrogate (EU) Server
1. Navigate to the `surrogate` directory:
   ```bash
   cd surrogate
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Run the surrogate(EU):
   ```bash
   node surrogate.mjs <main_server_hostname>
   ```
   - The parameter should be the IP address of the main server.

- Possible to change `PORT` , `MAX_CACHE_SIZE` , `SERVER_PORT` and `IMAGE_DIR` in the `surrogate.mjs`.
- We should create a directory named what we defined in `IMAGE_DIR`.


### Surrogate (FR/IT) Server
1. Navigate to the `surrogate` directory:
   ```bash
   cd surrogate
   ```
2. Run the surrogate(FR/IT):
   ```bash
   node IT_FR_surrogate.mjs <port> <surrogate_id> <max_cached_images> <brother_hostname>
   ```
   - The first parameter is the internal port of the surrogate to be run.
   - The second parameter is the surrogate id (1 : France surrogate, 2 : Italy surrogate)
   - The third parameter is the max amount of images that the surrogate is going to cache.
   - The brother hostname is the IP address of the surrogate where we want to get the images from.
 
- Possible to change `BROTHER_PORT` , `DEFAULT_IMAGE_FILE_NAME` in the `IT_FR_surrogate.mjs`.
- We should create directories named `FR_images` and `IT_images` and have the file defined in `DEFAULT_IMAGE_FILE_NAME` in both directories.

## Running Both Servers Concurrently
Open two separate terminal windows or tabs and run the commands for each server as described above.

### Additional Notes
- Ensure that the ports for both servers do not conflict. You may need to update the `server.mjs` files to change the ports if necessary.
- Refer to the `server.mjs` files for any specific configuration options or environment variables required.

## Troubleshooting
- If you encounter issues with dependencies, try deleting the `node_modules` folder and running `npm install` again.
- Ensure that Node.js and npm versions meet the required minimum.

## Testing
- On the client side, we can search for the `http://<IT_FR_IP_ADDRESS>/images/<image.png>` to get the images we want.
   
You're now ready to run and test the Main and Surrogate servers!

