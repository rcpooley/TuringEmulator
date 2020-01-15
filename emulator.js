const fs = require("fs");

function parseReg(lines) {
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

    return {
        init: vars.init,
        accept: vars.accept,
        states
    };
}

function parseTur(lines) {
    let init, accept, curState;
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
            accept = arg;
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
        const next = spl[1].split(",").map(p => p.trim());
        let nextState, dir, write;
        nextState = next[0];
        if (next.length === 2) {
            dir = next[1];
        } else if (next.length === 3) {
            write = next[1];
            dir = next[2];
        }

        dir = dir.toLowerCase();
        if (dir === "r") dir = ">";
        else if (dir === "l") dir = "<";

        read.forEach(c => {
            state[c] = {
                nextState,
                write: write || c,
                dir
            };
        });
    });

    return {
        init,
        accept,
        states
    };
}

function sanitize(str) {
    return str.replace(/#/g, "\\#").replace(/_/g, "\\s");
}

class Emulator {
    static createFromFile(filePath) {
        const lines = fs
            .readFileSync(filePath, "utf-8")
            .replace(/\r/g, "")
            .split("\n")
            .map(l => l.trim())
            .filter(l => l.length > 0 && !l.startsWith("//"));

        let parsed;
        if (filePath.endsWith(".tur")) {
            parsed = parseTur(lines);
        } else {
            parsed = parseReg(lines);
        }

        return new Emulator(parsed.init, parsed.accept, parsed.states);
    }

    constructor(init, accept, states) {
        this.init = init;
        this.accept = accept;
        this.states = states;
    }

    run(input, stateLog = false) {
        let tape = input;
        let state = this.init;
        let pos = 0;

        let log = "";

        const addLog = () => {
            if (log.length > 0) log += ", ";
            log += sanitize(tape.substring(0, pos));
            log += `$${state[0] + "_" + state.substring(1)}$`;
            log += sanitize(tape.substring(pos));
        };

        const fixPos = () => {
            while (pos < 0) {
                tape = "_" + tape;
                pos++;
            }

            while (pos >= tape.length) {
                tape += "_";
            }
        };

        while (state !== this.accept) {
            fixPos();
            addLog();

            const c = tape[pos];
            const action = this.states[state][c];
            if (!action) {
                state = "q{reject}";
                pos++;
                fixPos();
                addLog();
                if (stateLog) {
                    return log;
                }
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

        addLog();

        if (stateLog) {
            return log;
        }

        return "ACCEPT";
    }
}

module.exports = Emulator;
