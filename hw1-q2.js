const Emulator = require("./emulator");

const emulator = Emulator.createFromFile("ex3-9.tur");

const inputs = ["1#1", "1##1", "10#11", "10#10"];

inputs.forEach(input => {
    const result = emulator.run(input, true);
    console.log(`\\item ${result}`);
});
