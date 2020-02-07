const Dfa = require("./dfa")

if (process.argv.length < 3) {
    console.log("Usage: node hw3-q1.js [file]");
    process.exit()
}

const dfa = Dfa.createFromFile(process.argv[2])

for (let i = 0; i < 100000; i++) {
    const input = i.toString();
    const result = dfa.run(input, false);
    if (i <= 9000 && result !== "REJECT") {
        console.error(`Failed to reject input "${input}"`);
    } else if (i > 9000 && result !== "ACCEPT") {
        console.error(`Failed to accept input "${input}"`);
    }
}

console.log("done");
