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

	const movieAccountSchema = borsh.struct([
		borsh.bool("initialized"),
		borsh.u8("rating"),
		borsh.str("title"),
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
	let rating: number
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
			<div class="flex flex-row-reverse justify-center p-2">
				{#each [5, 4, 3, 2, 1] as star}
					<label
						class="peer [&>*]:cursor-pointer {rating && rating <= star - 1
							? '[&>*]:text-gray-600'
							: '[&>*]:text-yellow-400'} [&>*]:duration-100 [&>*]:hover:text-yellow-400 [&>*]:peer-hover:text-yellow-400"
						for="star_{star}"
					>
						<svg
							width="35"
							height="35"
							xmlns="http://www.w3.org/2000/svg"
							fill="currentColor"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
							/>
						</svg>
					</label>
					<input
						class="hidden"
						type="radio"
						id="star_{star}"
						value={star}
						bind:group={rating}
					/>
				{/each}
			</div>
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
