const { exec } = require("child_process");
const fs = require("fs");
if (fs.existsSync('build')) {
  fs.rmSync('build', {recursive: true});
}
exec('npx tsc -p tsconfig.json', (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("Build Complete");
});
