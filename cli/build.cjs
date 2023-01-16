const {exec} = require("child_process");
const fs = require("fs");
if (fs.existsSync('build')) {
    fs.rmSync('build', {recursive: true});
}
exec('npx tsc -p tsconfig.json', (err, stdout, stderr) => {
    if (stdout) {
        console.log(stdout);
    }
    if (stderr) {
        console.error(stderr);
    }
    if (err) {
        console.error(err);
        process.exit(1);
        return;
    }
    console.log("Build Complete");
});
