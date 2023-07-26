import * as web3 from "@solana/web3.js"
import { initializeKeypair } from "./lib/0_init_keypair"
import { pingProgram } from "./lib/1_ping_program"
import { sendLamports } from "./lib/2_send_lamports"

async function main() {
	// // generate a new keypair
	// const newKeypair = web3.Keypair.generate()
	// const { publicKey, secretKey } = newKeypair
	// console.log(secretKey.toString())

	const payer = initializeKeypair()
	const receiver = initializeKeypair(false)
	const connection = new web3.Connection(web3.clusterApiUrl("devnet"))

	// if the keypair is new, the transaction will fail since the account does not have any "prior credit"
	// need to airdrop some SOL to the account

	// // this will only work on devnet
	// await connection.requestAirdrop(payer.publicKey, web3.LAMPORTS_PER_SOL * 1)
	// console.log("Airdropped 1 SOL to", payer.publicKey.toString())

	// await pingProgram(connection, payer)

	await sendLamports(connection, payer, receiver)
}

main().catch((err) => {
	console.log("Error", err)
})
