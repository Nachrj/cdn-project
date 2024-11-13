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

### Surrogate Server
1. Navigate to the `surrogate` directory:
   ```bash
   cd surrogate
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Run the server:
   ```bash
   node server.mjs
   ```

## Running Both Servers Concurrently
Open two separate terminal windows or tabs and run the commands for each server as described above.

### Additional Notes
- Ensure that the ports for both servers do not conflict. You may need to update the `server.mjs` files to change the ports if necessary.
- Refer to the `server.mjs` files for any specific configuration options or environment variables required.

## Troubleshooting
- If you encounter issues with dependencies, try deleting the `node_modules` folder and running `npm install` again.
- Ensure that Node.js and npm versions meet the required minimum.

You're now ready to run and test the Main and Surrogate servers!

