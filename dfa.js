const fs = require("fs");

function parseDfa(lines) {
    let init, curState;
    const states = {};

    const getState = n => {
        if (!(n in states)) {
            states[n] = {};
        }
        return states[n];
    };

    lines.forEach(line => {
        const arg = line.split(" ")[1];

        if (line.startsWith("init")) {
            init = arg;
            return;
        } else if (line.startsWith("state")) {
            curState = arg;
            return;
        }

        if (!curState) {
            console.error(`Current state not defined for line ${line}`);
            return;
        }
        const state = getState(curState);

        const spl = line.split(" to ");
        if (spl.length !== 2) {
            console.error(`Invalid line: "${line}"`);
            return;
        }
        const read = spl[0].split(",").map(p => p.trim());
        const nextState = spl[1].trim();

        read.forEach(c => {
            state[c] = nextState;
        });
    });

    return {
        init,
        states
    };
}

class Dfa {
    static createFromFile(filePath) {
        const lines = fs
            .readFileSync(filePath, "utf-8")
            .replace(/\r/g, "")
            .split("\n")
            .map(l => l.trim())
            .filter(l => l.length > 0 && !l.startsWith("//"));

        const { init, states } = parseDfa(lines);
        return new Dfa(init, states);
    }

    constructor(init, states) {
        this.init = init;
        this.states = states;
    }

    run(input) {
        let tape = input.split("");
        let state = this.init;
        let log = "";

        const addLog = s => {
            if (log.length > 0) log += ", ";
            log += s;
        };
        addLog(state);

        while (tape.length > 0) {
            const c = tape.splice(0, 1)[0];
            const nextState = this.states[state][c];
            if (!nextState) {
                console.error(`No state transition defined for ${state}[${c}]`);
                process.exit();
            }
            state = nextState;
            addLog(state);
        }

        return log;
    }
}

module.exports = Dfa;
