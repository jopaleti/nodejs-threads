import express, { Request, Response } from "express";

const app = express();
const PORT = process.env.PORT || 4000;

/**
 * Non blocking route...
 * The main thread doesn't get block at this route
 */
app.get("/non-blocking", async (req: Request, res: Response) => {
    res.status(200).send("This page is non blocking");
})

/**
 *Blocking route...
 * It contains a CPU intensive task that blocks the main thread
 * @param {object} req
 * @param {object} res
 * @returns {null} No message is returned because the main thread is blocked
 */
app.get("/blocking", async (req: Request, res: Response) => {
    let counter = 0;
    for (let i = 0; i < 20_000_000_000; i++) {
        counter++
    }
    res.status(200).send(`The result is ${counter}`);
})

app.listen(PORT, () => {
    console.log(`Server listen on port ${PORT}`);
})