// const vulnerabilityFactor = {
//     cookies: 0.2,
//     fingerprinters: 0.2,
//     trackers: 0.2,
//     events: 0.2,
//     fonts_blocked:0.2,
// };


const tot_metrics = 18;
// const sigmoid = (x) => 1 / (1 + Math.exp(-x / 100));

// const getScore = (numbers) => {
//     return Object.keys(vulnerabilityFactor).reduce((score, k) => {
//         const x_i = numbers[k] || 0;
//         const a_i = vulnerabilityFactor[k];
//         return score + sigmoid(a_i * x_i * 10);
//     }, 0);
// };



export const calculate = (data: any) => {
    const { cookies: cookies, fingerprintable_api_calls: fingerprinters, third_party_trackers: trackers, behaviour_event_listeners: events, filtered_fonts: fonts_blocked } = data;
    if (cookies) {
        var numCookies = cookies.filter((c) => c.third_party).length;
    }
    else {
        var numCookies = null;
    }
    if (fingerprinters) {
        var api_call = Object.values(fingerprinters).length;
    }
    else {
        var api_call = 0;
    }
    if (events) {
        var numevent = Object.values(events).length;
    }
    else {
        var numevent = 0;
    }
    if (fonts_blocked) {
        var numFonts = fonts_blocked.length;
    }
    else {
        var numFonts = null;
    }

    if(trackers)
    {
        var numTrack = trackers.length;
    }
    else
    {
        var numTrack = null;
    }
    var cookie_score;
    var tp_score;
    var font_score;

    if (numCookies >= 1) {
        cookie_score = 1;
    }
    else {
        cookie_score = 0;
    }
    if (numTrack >= 1) {
        tp_score = 1;
    }
    else {
        tp_score = 0;
    }
    if (fonts_blocked.length >= 1) {
        font_score = 1;
    }
    else {
        font_score = 0;
    }


    // var numFingerprinters = Object.values(fingerprinters).reduce(
    //     (count, i) =>
    //         count +
    //         Object.values(i)
    //             .map((j) => j.length)
    //             .reduce((k, l) => k + l),
    //     0,
    // );

    // const numevent_listeners = Object.values(events).reduce(
    //     (count, i) =>
    //         count +
    //         Object.values(i)
    //             .map((j) => j.length)
    //             .reduce((k, l) => k + l),
    //     0,
    // );


    const occurences = {
        cookies: numCookies,
        fingerprinters: api_call,
        trackers: numTrack,
        events: numevent,
        fonts: numFonts,
    };
    const count_metric = cookie_score + api_call + tp_score + font_score + numevent;
    const tbf_score = 100 - (count_metric / tot_metrics) * 100;
    return {
        tbf_score,
        occurences,
        count_metric,
        tot_metrics,

    }
};

