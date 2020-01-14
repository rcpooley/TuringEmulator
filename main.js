const Emulator = require("./emulator");

if (process.argv.length < 3) {
    console.log("Usage: node main.js [file]");
    process.exit();
}

function r(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rs(chars, len) {
    let str = "";
    for (let i = 0; i < len; i++) {
        let idx = Math.floor(Math.random() * chars.length);
        str += chars[idx];
    }
    return str;
}

function isValid(str) {
    if (str.length === 0) {
        return true;
    }
    let numA = 0;
    let numB = 0;
    let b = false;
    for (let i = 0; i < Math.ceil(str.length / 2); i++) {
        let j = str.length - 1 - i;
        if (str[i] === "b" && !b) {
            b = true;
        }

        if (b) {
            if (str[i] !== "b" || str[j] !== "b") {
                return false;
            }
            numB++;
        } else {
            if (str[i] !== "a" || str[j] !== "c") {
                return false;
            }
            numA++;
        }
    }

    return numB === numA * 2;
}

const emulator = Emulator.createFromFile(process.argv[2]);

for (let i = 0; i < 10; i++) {
    const input = "a".repeat(i) + "b".repeat(i * 2) + "c".repeat(i);
    const result = emulator.run(input);
    if (result !== "ACCEPT") {
        console.error(`Failed to accept input "${input}"`);
    }
}

for (let i = 0; i < 10000; i++) {
    let n = 5;
    let a = n;
    let b = n * 2;
    let c = n;
    while (c === a && b === a * 2) {
        a += Math.max(r(-n, n), 0);
        b += Math.max(r(-n, n), 0);
        c += Math.max(r(-n, n), 0);
    }
    let input = "a".repeat(a) + "b".repeat(b) + "c".repeat(c);
    if (emulator.run(input) !== "REJECT") {
        console.error(`Failed to reject input "${input}"`);
    }

    input = rs("abc", r(0, 20));
    input = "b";
    if (isValid(input) !== (emulator.run(input) === "ACCEPT")) {
        console.error(`Bad response for input "${input}"`);
    }
}

console.log("done");
