import { Block } from "./src/Block";
import BTCMiner from "bitcoin-miner";
import * as dotenv from "dotenv";
import { stdout } from "single-line-log";
import chalk from "chalk";

// Set up environment
dotenv.config();

// Get constants from environment
const { WALLET } = process.env;

// Initialize runtime
(async function run() {

    // Get latest block from blockchain
    const block: Block = await Block.latest();

    // Compute block properties
    await block.fetch();

    // Initialize miner
    const miner = new BTCMiner(await block.toJSON());

	// Initialize log
	console.log(chalk.blue("[  INFO  ]"), "previous hash:", chalk.cyan(block.hash), '\n');
	console.log("           HASH                                                             NONCE                  COMPUTES/SEC")

	// Set up nonce
	let nonce: number = 0;
	let hash: string;
	let lost: boolean = false;
	let found: boolean = false;
	let cps: number = 0;
	let cts: number = 0;

	// Set interval
	setInterval(async function() {

		// Calculate calculations per second
		cps = cts;
		cts = 0;

		const { hash } = await Block.latest();
		if(hash !== block.hash) lost = true;

	}, 1000);

	// While until hash is found
	(function loop() {

		cts ++;

		hash = miner.getHash(nonce);
		found = miner.checkHash(hash);
		stdout([
			chalk.yellowBright("[ MINING ]"),
			hash.toString("hex"),
			chalk.cyanBright(nonce > -1 ? "+":"-"),
			chalk.cyan(Math.abs(nonce).toLocaleString().padEnd(20, " ")),
			chalk.magenta(cps.toLocaleString())
		].join(" "));

		// If this hash should be abandoned or is finished
		if(found) return miner.verifyNonce(block, nonce);

		// Add to nonce and retry
		if(nonce > -1) nonce ++;
    	nonce *= -1;

		if(!(lost || found)) setImmediate(loop);

		if(lost) {
			lost = false;
			return console.log(chalk.redBright("[ FAILED ]"), "Someone else computed that hash already. Moving on for maxiumum efficiencey.");
		}

	}());

	if(lost || found) setImmediate(run);

}());
