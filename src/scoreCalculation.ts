const fs = require("fs");

const jsonContent = fs.readFileSync("inspection.json");
const json = JSON.parse(jsonContent.toString());

const { cookies, fingerprintable_api_calls: fingerprinters, third_party_trackers: trackers } = json.reports;

const numCookies = cookies?.filter((c) => c.third_party)?.length;
const numFingerprinters = Object.values(fingerprinters).reduce(
    (count, i) =>
        count +
        Object.values(i)
            .map((j) => j.length)
            .reduce((k, l) => k + l),
    0
);

console.log("third party cookies: ", numCookies);
console.log("fingerprinting apis: ", numFingerprinters);
console.log("third party tracker: ", trackers.length);

const occurences = {
    cookies: numCookies,
    fingerprinters: numFingerprinters,
    trackers: trackers.length,
};

const vulnerabilityFactor = {
    cookies: 0.4,
    fingerprinters: 0.2,
    trackers: 0.3,
};

const sigmoid = (x) => 1 / (1 + Math.exp(-x));

const getScore = (numbers) => {
    return Object.keys(vulnerabilityFactor).reduce((score, k) => {
        const x_i = numbers[k] || 0;
        const a_i = vulnerabilityFactor[k];
        return score + sigmoid(a_i * x_i);
    }, 0);
};

console.log(10 - getScore(occurences));
