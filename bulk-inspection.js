const { collector } = require("./build");
const { join } = require("path");
const { readdirSync, readFileSync, writeFileSync } = require("fs");
const pLimit = require("p-limit");

const EMULATE_DEVICE = "Tor";
const PARALLEL_INSPECTION_LIMIT = 5;

const INPUT_PATH = join(__dirname, "Input");
const OUTPUT_PATH = join(__dirname, "Output");

const limit = pLimit(PARALLEL_INSPECTION_LIMIT);

const getUrls = () => {
    const files = readdirSync(INPUT_PATH);
    const urls = files.flatMap((file) => {
        const filePath = join(INPUT_PATH, file);
        const contents = readFileSync(filePath).toString();

        const urls = contents
            .replace(/\r\n/g, "\n")
            .split("\n")
            .map((url) => url.trim())
            .filter((url) => url.startsWith("https"));
        return urls;
    });
    return urls;
};
const processUrl = async (url) => {
    const config = {
        inUrl: url,
        numPages: 3,
        headless: true,
        emulateDevice: EMULATE_DEVICE,
        outDir: join(OUTPUT_PATH, url.replace(/https?:\/\//, "")),
    };

    return collector(config).then((value) => {
        console.log(`${url} - completed`);
    });
};

const createReport = (results) => {
    const reportString = results.map((result) => JSON.stringify(result.reports)).join("\r\n");
    writeFileSync(join(OUTPUT_PATH, "inspection-report.ndjson"), reportString);
};

// main function
(async () => {
    console.log("Capturing URLs from input files...");
    const urls = getUrls();
    console.log("Capturing completed.\n");

    console.log("Inspection in progess. Please wait...");

    try {
        const results = await Promise.all(urls.map((url) => limit(() => processUrl(url))));

        results.map((res, i) => {
            const status = res.status == "success" ? "successful" : "failed";
            console.log(`Processing of ${urls[i]} ${status}.`);
        });
        console.log(`\n\nEnd of inspection.`);
        createReport(results);
    } catch (e) {
        console.log("Inspection failed");
    }
})();
