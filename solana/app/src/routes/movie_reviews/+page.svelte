<script lang="ts">
	const MOVIE_PROGRAM_ID = "CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN"

	import * as borsh from "@project-serum/borsh"
	import * as web3 from "@solana/web3.js"

	const movieInstructionSchema = borsh.struct([
		borsh.u8("variant"),
		borsh.str("title"),
		borsh.u8("rating"),
		borsh.str("description")
	])

	function createBuffer(title: string, rating: number, description: string, variant: number = 0) {
		let buffer = Buffer.alloc(1000) // allocate buffer
		movieInstructionSchema.encode({ variant, title, rating, description }, buffer) // encode instruction data into buffer
		// take only what is needed
		buffer = buffer.subarray(0, movieInstructionSchema.getSpan(buffer))
		return buffer
	}

	import { walletStore } from "@svelte-on-solana/wallet-adapter-core"
	let title = ""
	let rating = 0
	let description = ""
	let result = ""

	let loading = false
	async function postReview() {
		loading = true
		const transaction = new web3.Transaction()
		const [pda] = web3.PublicKey.findProgramAddressSync(
			[$walletStore.publicKey!.toBuffer(), Buffer.from(title)],
			new web3.PublicKey(MOVIE_PROGRAM_ID)
		)

		const instructions = new web3.TransactionInstruction({
			keys: [
				{
					pubkey: $walletStore.publicKey!,
					isSigner: true,
					isWritable: false
				},
				{
					pubkey: pda,
					isSigner: false,
					isWritable: true
				},
				{
					pubkey: web3.SystemProgram.programId,
					isSigner: false,
					isWritable: false
				}
			],
			data: createBuffer(title, rating, description),
			programId: new web3.PublicKey(MOVIE_PROGRAM_ID)
		})

		transaction.add(instructions)

		try {
			const connection = new web3.Connection(web3.clusterApiUrl("devnet"))
			let txid = await $walletStore.sendTransaction(transaction, connection)
			result = `Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=devnet`
		} catch (error) {
			alert(error)
			result = "error"
		} finally {
			loading = false
		}
	}
</script>

<div class="container flex flex-col">
	<nav class="mb-2">
		<a href="/">⬅️ Home</a>
	</nav>
	{#if $walletStore.publicKey}
		<p>Connected with wallet address: <strong>{$walletStore.publicKey}</strong></p>
		<div class="mt-4 flex flex-col space-y-2">
			<label for="name">Movie name</label>
			<input id="name" type="text" bind:value={title} />
			<label for="rating">Rating</label>
			<input id="rating" type="number" bind:value={rating} />
			<label for="description">Description</label>
			<textarea id="description" bind:value={description} />
			<button aria-busy={loading} on:click={postReview} disabled={loading}
				>{loading ? "Posting..." : "Post review"}</button
			>
			{#if result}
				<p>{result}</p>
			{/if}
		</div>
	{:else}
		<p>Connect to a wallet first</p>
	{/if}
</div>
