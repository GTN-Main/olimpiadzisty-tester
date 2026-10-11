import { spawn } from "node:child_process";
import fs from "node:fs";
import { glob, readFile } from "node:fs/promises";
import path from "node:path";

import Table from "cli-table3";
import pLimit from "p-limit";
import { Spinner } from "picospinner";

const dir = process.argv[2]?.replaceAll("\\", "/");

if (dir === undefined) {
    console.error("correct usage: node main.ts <path>");
    process.exit(1);
}

if (!fs.existsSync(dir)) {
    console.error("provided path does not exist");
    process.exit(1);
}

const { value: bin } = await glob(`${dir}/**/*.exe`).next();

if (typeof bin !== "string") {
    console.error(".exe file not found");
    process.exit(1);
}

const table = new Table({
    head: ["", "Name", "Time", "Code", "Input", "Received", "Expected"],
    style: { head: ["cyan", "bold"] },
});

const startTime = performance.now();
const spinner = new Spinner("Running tests... [0.0 s]");
spinner.start();

let errorCount = 0;

const timer = setInterval(() => {
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
    spinner.setText(
        `Running tests... [${elapsed} s]${errorCount > 0 ? ` | Errors: ${errorCount}` : ""}`,
    );
}, 100);

const limit = pLimit(navigator.hardwareConcurrency);
const tasks: Array<Promise<void>> = [];

for await (const inFile of glob(`${dir}/**/*.in`)) {
    const runTest = async () => {
        try {
            const testData = await readFile(inFile, "utf-8");

            await new Promise<void>((resolve) => {
                const t0 = performance.now();
                const childProcess = spawn(bin);

                let result = "";

                childProcess.stdout.on("data", (data) => {
                    result += data.toString();
                });

                childProcess.stderr.on("data", (data) => {
                    console.error("error occurred in subprocess", data.toString());
                });

                childProcess.stdin.write(testData);
                childProcess.stdin.end();

                childProcess.on("close", async (code) => {
                    const t1 = performance.now();
                    const executionTime = (t1 - t0).toFixed(2);
                    const baseName = path.basename(inFile, ".in");
                    const { value: outFile } = await glob(`${dir}/**/${baseName}.out`).next();

                    if (outFile === undefined) {
                        console.error(`${baseName}.out not found`);
                        resolve();
                        return;
                    }

                    const expectedResult = await readFile(outFile, "utf-8");
                    const normalize = (string: string) => string.replace(/\r\n/g, "\n").trim();
                    const isPassed = normalize(result) === normalize(expectedResult);

                    if (!isPassed) errorCount++;

                    table.push([
                        isPassed ? "✔️" : "❌",
                        baseName,
                        executionTime + " ms",
                        code,
                        testData,
                        result,
                        expectedResult,
                    ]);
                    resolve();
                });
            });
        } catch (err) {
            console.error(err);
        }
    };

    tasks.push(limit(runTest));
}

await Promise.all(tasks);

clearInterval(timer);
const totalTime = ((performance.now() - startTime) / 1000).toFixed(2);

if (errorCount === 0) {
    spinner.succeed(`Tests succeeded! [${totalTime} s]`);
} else {
    spinner.fail(`${errorCount} tests failed! [${totalTime} s]`);
}

console.log(table.toString());
