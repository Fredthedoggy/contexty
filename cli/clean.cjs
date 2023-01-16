// Not for production use

const fs = require("fs");
if (fs.existsSync('build')) {
  fs.rmSync('build', {recursive: true});
}
if (fs.existsSync('./images')) {
  fs.rmSync('./images', {recursive: true});
}
