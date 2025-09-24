// server/libs/validation.js
export function assertScenarioShape(s) {
    if (!s || typeof s !== "object") throw new Error("Scenario is required");
    if (!s.Name && !s.name) throw new Error("Scenario.name is required");
    const nodes = s.ChoiceNodes || s.choiceNodes;
    if (!Array.isArray(nodes) || nodes.length === 0) {
        throw new Error("Scenario.choiceNodes must be a non-empty array");
    }
    for (const n of nodes) {
        if (typeof n.Id !== "number") throw new Error("ChoiceNode.Id must be number");
        if (!Array.isArray(n.Dialogs)) throw new Error(`ChoiceNode[${n.Id}].Dialogs must be array`);
        if (!Array.isArray(n.PossibleOutcomes)) throw new Error(`ChoiceNode[${n.Id}].PossibleOutcomes must be array`);
    }
}

export function pickNextByMajority(tally) {
    // tally: { "0": count, "1": count, ... }
    let max = -1, key = null;
    for (const [k, v] of Object.entries(tally)) {
        if (v > max || (v === max && key === null)) { max = v; key = k; }
    }
    return key === null ? null : Number(key);
}


// // votes: Map<choiceId, { count: number, timeSum: number }>
// const best = Array.from(votes.entries())
//     .sort((a, b) => {
//         const [ , A ] = a; const [ , B ] = b;
//         if (B.count !== A.count) return B.count - A.count;   // majority first
//         return A.timeSum - B.timeSum;                        // tie-break: lowest reaction time sum wins
//     })[0];
