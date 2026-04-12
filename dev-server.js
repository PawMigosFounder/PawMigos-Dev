// Wrapper to ensure node is on PATH for Turbopack child processes
const path = require('path');
const nodeDir = path.dirname(process.execPath);
process.env.PATH = nodeDir + ':' + (process.env.PATH || '');
process.chdir(__dirname);
require('next/dist/bin/next');
