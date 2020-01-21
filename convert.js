const fs = require("fs");
const Emulator = require("./emulator");

if (process.argv.length < 4) {
    console.log("Usage: node convert.js [in.tur] [out.txt]");
    process.exit();
}

const inFile = process.argv[2];
const outFile = process.argv[3];

const emulator = Emulator.createFromFile(inFile);
fs.writeFileSync(outFile, emulator.export());
