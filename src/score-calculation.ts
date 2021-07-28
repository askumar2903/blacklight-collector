const vulnerabilityFactor = {
    cookies: 0.1,
    fingerprinters: 0.1,
    trackers: 0.1,
    events: 0.1,
    blockedFonts: 0.1,
};


const tot_metrics = 18;
// const sigmoid = (x) => (1 / (1 + Math.exp(-x)) - 0.5);


const getScore = (numbers, metric) => {
    return Object.keys(vulnerabilityFactor).reduce((score, k) => {
        const x_i = numbers[k] || 0;
        const a_i = vulnerabilityFactor[k];
        const met = metric
        return score + (a_i * x_i) / met;
    }, 0);
};



export const calculate = (data: any) => {
    const { cookies: cookies, fingerprintable_api_calls: fingerprinters, third_party_trackers: trackers, behaviour_event_listeners: events, filtered_fonts: fonts_blocked } = data;
    const numCookies = cookies ? cookies.filter((c) => c.third_party).length : 0;
    const api_call = fingerprinters ? Object.values(fingerprinters).length : 0;
    const numevent = events ? Object.values(events).length : 0;
    const numFonts = fonts_blocked ? fonts_blocked.length : 0;
    const numTrack = trackers ? trackers.length : 0;

    const cookie_score = numCookies >= 1 ? 1 : 0;
    const tp_score = numTrack >= 1 ? 1 : 0;
    const font_score = fonts_blocked.length >= 1 ? 1 : 0;

    const numFingerprinters = Object.values(fingerprinters).reduce(
        (count, i) =>
            count +
            Object.values(i)
                .map((j) => j.length)
                .reduce((k, l) => k + l),
        0,
    );

    const numevent_listeners = Object.values(events).reduce(
        (count, i) =>
            count +
            Object.values(i)
                .map((j) => j.length)
                .reduce((k, l) => k + l),
        0,
    );


    const metric_count = {
        cookies: numCookies,
        fingerprinters: numFingerprinters,
        trackers: numTrack,
        events: numevent_listeners,
        blockedFonts: numFonts,
    };

    const count_metric = cookie_score + api_call + tp_score + font_score + numevent;
    const tbf_score = 100 - (count_metric / tot_metrics) * 100;
    // const vul_score = 10 - getScore(vulnerability_score,count_metric);
    const severity_score = getScore(metric_count, count_metric);

    const sev_range =
        severity_score < 2 ? 'LOW SEVERITY' :
            severity_score >= 2 && severity_score < 6 ? 'MEDIUM SEVERITY' :
                severity_score >= 6 && severity_score < 8 ? 'HIGH SEVERITY' :
                    "CRITICAL SEVERITY";
    return {
        tbf_score: Math.round(tbf_score),
        count_metric,
        tot_metrics,
        severity_score: severity_score.toFixed(2),
        cookies: numCookies,
        fingerprinters: numFingerprinters,
        trackers: numTrack,
        events: numevent_listeners,
        blockedFonts: numFonts,
        sev_range,
    }
};

