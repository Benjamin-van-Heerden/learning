import * as web3 from "@solana/web3.js"

export async function sendLamports(
	connection: web3.Connection,
	payer: web3.Keypair,
	receiver: web3.Keypair
) {
	const transaction = new web3.Transaction()
	const lamports = web3.LAMPORTS_PER_SOL * 0.1

	const instruction = web3.SystemProgram.transfer({
		fromPubkey: payer.publicKey,
		toPubkey: receiver.publicKey,
		lamports
	})

	transaction.add(instruction)

	const signature = await web3.sendAndConfirmTransaction(connection, transaction, [payer])
	console.log("SIGNATURE", signature)
	console.log(
		`You can view your transaction on the Solana Explorer at:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
	)
}
