const vulnerabilityFactor = {
    cookies: 0.3,
    fingerprinters: 0.1,
    trackers: 0.25,
};

const sigmoid = (x) => 1 / (1 + Math.exp(-x / 100));

const getScore = (numbers) => {
    return Object.keys(vulnerabilityFactor).reduce((score, k) => {
        const x_i = numbers[k] || 0;
        const a_i = vulnerabilityFactor[k];
        return score + sigmoid(a_i * x_i * 10);
    }, 0);
};


export const calculate = (data: any) => {
    const { cookies, fingerprintable_api_calls: fingerprinters, third_party_trackers: trackers } = data;

    const numCookies = cookies.filter((c) => c.third_party).length;
    const numFingerprinters = Object.values(fingerprinters).reduce(
        (count, i) =>
            count +
            Object.values(i)
                .map((j) => j.length)
                .reduce((k, l) => k + l),
        0,
    );

    const occurences = {
        cookies: numCookies,
        fingerprinters: numFingerprinters,
        trackers: trackers.length,
    };

    return 10 - getScore(occurences);
};

