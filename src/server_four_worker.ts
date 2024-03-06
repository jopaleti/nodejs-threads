import express, { Request, Response } from "express";
import getCurrentTimeInSeconds from "./helpers/time.helper";
import { Worker } from "node:worker_threads";
import * as path from "path";

const app = express();
const PORT = process.env.PORT || 8000;
const cpu_worker = "./src/worker.ts";

// Specifing the number of thread count
const THREAD_COUNT = 4;

/**
 * Non blocking route...
 * The main thread doesn't get block at this route
 */
app.get("/non-blocking", async (req: Request, res: Response) => {
  const startTime = getCurrentTimeInSeconds();
  console.log(startTime);
  res.status(200).send("This page is non blocking");
  const endTime = getCurrentTimeInSeconds() - startTime;
  console.log(`Run time is ${endTime}`);
});

/**
 *Blocking route...
 * It contains a CPU intensive task that blocks the main thread
 * No message is returned because the main thread is blocked
 */
app.get("/blocking", async (req: Request, res: Response) => {
  let counter = 0;
  for (let i = 0; i < 20_000_000_000; i++) {
    counter++;
  }
  res.status(200).send(`The result is ${counter}`);
});
// Conclusion: The problem above is called the blocking effect from CPU-bound tasks

/**
 * Offloading a CPU-Bound Task Using Promises
 * Handling the blocking route of the api
 * Note: usiing promises to make the code non-blocking
 * stems from the knowledge of using non-blocking promise-based I/O methods,
 * such as readFile() and writeFile().
 * but the I/O operations make use of Node.js hidden threads, which CPU-bound tasks do not.
 * Therefore the use of promises to offload CPU-bound tasks is not a good idea and won't work.
 */
const calculateCount = () => {
  return new Promise((resolve, reject) => {
    let counter = 0;
    for (let i = 0; i < 20_000_000_000; i++) {
      counter++;
    }
    resolve(counter);
  });
};

app.get("/blocking-offload", async (req: Request, res: Response) => {
  const counter = await calculateCount();
  res.status(200).send(`result is ${counter}`);
});

/**
 * Optimizing a CPU-Intensive Task Using Four Worker Threads
 */

function createWorker() {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./src/four_worker.mjs", {
      workerData: { thread_count: THREAD_COUNT },
    });
    worker.on("message", (data) => {
      resolve(data);
    });
    worker.on("error", (msg) => {
      reject(`An error occured: ${msg}`);
    });
  });
}

app.get("/blocking-thread-offload", async (req: Request, res: Response) => {
  const workerPromises: any[] = [];
  for (let i = 0; i < THREAD_COUNT; i++) {
    workerPromises.push(createWorker());
  }
  const thread_results = await Promise.all(workerPromises);

  const total = thread_results.reduce((acc, result) => acc + result, 0);

  res.status(200).send(`Result is ${total}`);
});

app.listen(PORT, () => {
  console.log(`Server listen on port ${PORT}`);
});
