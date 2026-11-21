/*
 * Hostinger / Passenger entry point.
 *
 * Hostinger's managed Node.js hosting (Phusion Passenger) looks for an
 * "Application startup file" and, by default, expects `app.js` at the project
 * root. It then `require()`s that file and mounts the exported app (it does NOT
 * run it as the main module, so api/index.js skips its own app.listen and lets
 * Passenger bind the port).
 *
 * This file simply delegates to the real Express app in ./api/index.js so the
 * correct backend boots regardless of whether the panel's startup file is set
 * to `app.js` (default) or `api/index.js`.
 */
module.exports = require("./api/index.js");
