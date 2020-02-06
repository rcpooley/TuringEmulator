const Dfa = require("./dfa");

if (process.argv.length != 4) {
    console.log("Usage: node rundfa.js [file.dfa] [input]");
    process.exit();
}

const file = process.argv[2];
const input = process.argv[3];

const dfa = Dfa.createFromFile(file);
const out = dfa.run(input);
console.log(out);
