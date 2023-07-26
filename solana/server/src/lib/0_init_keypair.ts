import * as web3 from "@solana/web3.js"
import Dotenv from "dotenv"

Dotenv.config()

export function initializeKeypair(payer: boolean = true): web3.Keypair {
	const secret = payer
		? (JSON.parse(process.env.PRIVATE_KEY ?? "") as number[])
		: (JSON.parse(process.env.PRIVATE_KEY_2 ?? "") as number[])
	const secretKey = Uint8Array.from(secret)
	return web3.Keypair.fromSecretKey(secretKey)
}
