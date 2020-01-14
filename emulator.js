const fs = require("fs");

class Emulator {
    static createFromFile(filePath) {
        const lines = fs
            .readFileSync(filePath, "utf-8")
            .replace(/\r/g, "")
            .split("\n")
            .map(l => l.trim())
            .filter(l => l.length > 0 && !l.startsWith("//"));

        const vars = {};
        const states = {};

        const getState = n => {
            if (!(n in states)) {
                states[n] = {};
            }
            return states[n];
        };

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.includes(":")) {
                const spl = line.split(":");
                vars[spl[0].trim()] = spl[1].trim();
                continue;
            }

            const spl = line.split(",").map(p => p.trim());
            const next = lines[++i].split(",").map(p => p.trim());
            const state = getState(spl[0]);
            state[spl[1]] = {
                nextState: next[0],
                write: next[1],
                dir: next[2]
            };
        }

        return new Emulator(vars.init, vars.accept, states);
    }

    constructor(init, accept, states) {
        this.init = init;
        this.accept = accept;
        this.states = states;
    }

    run(input) {
        let tape = input;
        let state = this.init;
        let pos = 0;

        while (state !== this.accept) {
            while (pos < 0) {
                tape = "_" + tape;
                pos++;
            }

            while (pos >= tape.length) {
                tape += "_";
            }

            const c = tape[pos];
            const action = this.states[state][c];
            if (!action) {
                return "REJECT";
            }
            state = action.nextState;
            const spl = tape.split("");
            spl[pos] = action.write;
            tape = spl.join("");
            if (action.dir === "<") {
                pos--;
            } else if (action.dir === ">") {
                pos++;
            }
        }

        return "ACCEPT";
    }
}

module.exports = Emulator;
