// This script is meant to be used solely to return metrics on files types in this repo.
// It is currently being used to help track the progression/adoption of js -> ts and as a result only prints those metrics.
// If you find yourself here and want to get additional metrics feel free - just please make sure to extend, not change, the current metrics.

// Allow node to print entire objects
require("util").inspect.defaultOptions.depth = null;

const percentage = (a, b) => ((a / b) * 100).toFixed(2);

const getResults = async (folders) => {
    console.log(`--> ${folders}`)

    // Linguist-js is as close to github's linguist implementation we can get in node at the moment,
    // as a result some of the calculations on percentages may not match what is reported in the repo however manually checked
    // counts show them to be accurate so far and should be enough for our needs.
    const linguist = require('linguist-js');
    const options = { keepVendored: false, quick: false };

    // Note: linguist is picky about being run multiple times, so if you are looking check an additional path you'll want to add it to the array in "run"
    const { files } = await linguist(folders, options);

    // Note: file types don't always match your initial expectations.
    // For example:
    // -- "JavaScript" encompasses js & jsx
    // -- "TypeScript" only encompasses ts, so we also need to look for "TSX"
    const jsFiles = Object.entries(files.results).map(([path, type]) => ({path, type})).filter(file => file.type === "JavaScript");
    const tsFiles = Object.entries(files.results).map(([path, type]) => ({path, type})).filter(file => file.type === "TypeScript" || file.type === "TSX");

    return {
        files, 
        js: {
            files: jsFiles.length,
            percentageOfCode: percentage(jsFiles.length, files.count),
            sourceFiles: jsFiles.filter(file => !file.path.includes("spec-jest")).length,
            testFiles: jsFiles.filter(file => file.path.includes("spec-jest")).length
        },
        ts: {
            files: tsFiles.length,
            percentageOfCode: percentage(tsFiles.length, files.count),
            relativeJSPercentage: percentage(tsFiles.length, jsFiles.length),
            sourceFiles: tsFiles.filter(file => !file.path.includes("spec-jest")).length,
            testFiles: tsFiles.filter(file => file.path.includes("spec-jest")).length
        }
    }
}


const run = async () => {
    console.log("Analyzing repo file types (excluding d.ts):")
    const { files, js, ts } = await getResults(["./app"]);
    console.log({ totalFilesInPaths: files.count, js, ts });
}

// Note: we don't care about the floating promise here since node will keep the process open until it 
// exits and then kill it.
// eslint-disable-next-line @typescript-eslint/no-floating-promises
run();