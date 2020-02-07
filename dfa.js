const fs = require("fs");

function parseDfa(lines) {
    let init, curState, accept;
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
        } else if (line.startsWith("accept")) {
            accept = line
                .split(" ")
                .slice(1)
                .join("")
                .trim()
                .split(",")
                .map(a => a.trim());
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
        accept,
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

        const { init, accept, states } = parseDfa(lines);
        return new Dfa(init, accept, states);
    }

    constructor(init, accept, states) {
        this.init = init;
        this.accept = accept;
        this.states = states;
    }

    run(input, stateLog = true) {
        let tape = input.split("");
        let state = this.init;
        let log = "";

        const addLog = (s, c) => {
            if (log.length > 0) log += " -> ";
            log += s;
            if (c) {
                log += `[${c}]`;
            }
        };

        while (tape.length > 0) {
            const c = tape.splice(0, 1)[0];
            addLog(state, c);
            const nextState = this.states[state][c];
            if (!nextState) {
                log += `\nREJECT (no state transition defined for ${state}[${c}])`;
                if (!stateLog) {
                    return "REJECT";
                }
                return log;
            }
            state = nextState;
        }
        addLog(state);

        let result = "REJECT";

        if (this.accept.includes(state)) {
            result = "ACCEPT";
        }

        if (stateLog) {
            log += "\n" + result;
            return log;
        }

        return result;
    }
}

module.exports = Dfa;
