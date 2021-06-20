const { collector } = require("./build");
const { join } = require("path");
const { createWriteStream, readdirSync, readFileSync, mkdirSync } = require("fs");
const pLimit = require("p-limit");

const EMULATE_DEVICE = "Tor";
const PARALLEL_INSPECTION_LIMIT = 3;

const INPUT_PATH = join(__dirname, "Input");
const OUTPUT_PATH = join(__dirname, "Output");
mkdirSync(OUTPUT_PATH, { recursive: true });

const reportFile = createWriteStream(join(OUTPUT_PATH, "inspection-report.ndjson"), { flags: "w" });

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

    return collector(config).then((result) => {
        if (result.status === "success") {
            const { TB_Friendliness: scores } = result;
            reportFile.write(JSON.stringify({ url, ...scores }) + "\r\n");
            console.log(`${url} - completed`);
        } else {
            console.log(`${url} - failed ${result.page_response ? "- Reason: " + result.page_response.message : ""}`);
        }
    });
};

// main function
(async () => {
    console.log("Capturing URLs from input files...");
    const urls = getUrls();
    console.log("Capturing completed.\n");

    console.log("Inspection in progess. Please wait...");
    try {
        const results = await Promise.all(urls.map((url) => limit(() => processUrl(url))));
        reportFile.close();
    } catch (e) {
        console.log("Inspection failed", e);
    } finally {
        console.log("Exiting.");
    }
})();
