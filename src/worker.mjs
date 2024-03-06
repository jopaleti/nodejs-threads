import { parentPort } from "worker_threads";

let counter = 0;
for (let i = 0; i < 20_000_000_000; i++) {
  counter++;
}

// Ensure parentPort is not null before calling postMessage
if (parentPort) {
  parentPort.postMessage(counter);
} else {
  console.error("parentPort is null");
}
