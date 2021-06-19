const { collector } = require("./build");
const { join } = require("path");
const { readdirSync, readFileSync } = require("fs");
const { mkdirSync } = require("fs");
const { url } = require("inspector");
const EMULATE_DEVICE = "Tor";

const INPUT_PATH = join(__dirname, "Input");
const OUTPUT_PATH = join(__dirname, "Output");

const files = readdirSync(INPUT_PATH);

const getUrls = () => {
    const urls = files
        .flatMap((file) => {
            const filePath = join(INPUT_PATH, file);
            const contents = readFileSync(filePath).toString();

            const urls = contents
                .replace(/\r\n/g, "\n")
                .split("\n")
                .map((url) => url.trim())
                .filter((url) => url.startsWith("https"));
            return urls;
        })
        .slice(0, 3);
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

    return collector(config);
};

// main function
(async () => {
    console.log("Capturing URLs from input files...");
    const urls = getUrls();
    console.log("Capturing completed.\n");

    console.log("Inspection in progess. Please wait...");
    const results = await Promise.all(urls.map(processUrl));

    results.map((res, i) => {
        const status = res.status == "success" ? "successful" : "failed";
        console.log(`Processing of ${urls[i]} ${status}.`);
    });

    console.log(`\n\nEnd of inspection.`);
})();
