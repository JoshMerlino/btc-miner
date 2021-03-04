import fetch, { Response } from "node-fetch";
import { Transaction } from "./Transaction";

export class Block {

	// Given properties
	hash: string;
	wasFetched: boolean = false;

	// Computed properties
	prevblock: Block | null = null;
	merkleroot: string | null = null;
	previousblockhash: string | null = null;
	time: number | null = null;
	ver: number | null = null;
	bits: number | null = null;
	fee: number | null = null;
	nonce: number | null = null;
	size: number | null = null;
	block_index: number | null = null;
	main_chain: boolean | null = null;
	height: number | null = null;
	weight: number | null = null;
	transactions: Array<Transaction> = [];

	// Initialize Block
	constructor(hash: string) {
		this.hash = hash;
	}

	// Convert to JSON string
	public async toString() : Promise<string> {

		// Fetch if not alread
		if(!this.wasFetched) await this.fetch();

		return JSON.stringify(this);

	}

	public async toJSON() : Promise<object> {

		// Fetch if not alread
		if(!this.wasFetched) await this.fetch();

		return {
			version: this.ver,
		    previousblockhash: this.previousblockhash,
		    merkleroot: this.merkleroot,
		    time: this.time,
		    bits: this.bits
		}

	}

	// Fetch full block from API and compute missing properties
	public async fetch() : Promise<this> {

		// Mark block as fetched
		this.wasFetched = true;

		// Fetch block info
		const response = await fetch(`https://blockchain.info/rawblock/${this.hash}`).then((resp: Response) => resp.json());

		// Compute properties
		this.prevblock = new this.constructor(response.prev_block);
		this.previousblockhash = response.prev_block;
		this.merkleroot = response.mrkl_root;
		this.time = response.time;
		this.ver = response.ver;
		this.bits = response.bits.toString(16);
		this.fee = response.fee;
		this.nonce = response.nonce;
		this.size = response.size;
		this.block_index = response.block_index;
		this.main_chain = response.main_chain;
		this.height = response.height;
		this.weight = response.weight;
		this.transactions = response.tx.map((tx: object) => new Transaction(tx));

		// Return for chaining
		return this;

	}

	// Get the latest block from API
	public static async latest() : Promise<Block> {

		// Fetch latest block from API
		const { hash } = await fetch(`https://blockchain.info/latestblock`).then((resp: Response) => resp.json());
		return new this(hash);

	}

}
