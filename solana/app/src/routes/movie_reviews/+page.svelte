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
	let rating: number = -1
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

	const movieAccountSchema = borsh.struct([
		borsh.bool("initialized"),
		borsh.u8("rating"),
		borsh.str("title"),
		borsh.str("description")
	])

	// Remember, the order here matters. It needs to match how the account data is structured.
	// Solana programs will not understand the data if it's not in the right order.

	type MovieData = {
		title: string
		rating: number
		description: string
	}

	function deserializeMovieAccount(data?: Buffer): undefined | MovieData {
		if (!data) return

		try {
			const { title, rating, description } = movieAccountSchema.decode(data)
			return { title, rating, description }
		} catch (error) {
			console.error(error)
		}
	}

	let movies: any[] = []
	async function getMovies() {
		const connection = new web3.Connection(web3.clusterApiUrl("devnet"))
		const movieProgramId = new web3.PublicKey(MOVIE_PROGRAM_ID)
		const movieProgramAccounts = await connection.getProgramAccounts(movieProgramId)
		movies = movieProgramAccounts.map((account) => {
			const data = deserializeMovieAccount(account.account.data)
			if (!data) return
			const { title, rating, description } = data
			return { title, rating, description }
		})
		// filter out undefined values
		movies = movies.filter((movie) => movie)
	}
</script>

<div class="container flex flex-col">
	<nav class="mb-2">
		<a href="/">⬅️ Home</a>
	</nav>
	{#if $walletStore.publicKey}
		<p>Connected with wallet address: <strong>{$walletStore.publicKey}</strong></p>
		<div class="flex flex-col space-y-2">
			<h3 class="mb-2">Get past reviews</h3>
			<button
				on:click={() => {
					loading = true
					getMovies().then(() => (loading = false))
				}}
				aria-busy={loading}
				disabled={loading}>Get reviews</button
			>
			{#if movies.length === 0}
				<p class="!mb-4 !mt-4">No reviews loaded</p>
			{:else}
				<details class="!mb-4 !mt-4 !space-y-2">
					<summary>Show reviews</summary>
					{#each movies as movie}
						<div class="flex flex-col space-y-2 rounded-md border-2 border-white p-4">
							<h4 class="mb-0 underline">{movie.title}</h4>
							<p>Rating: {movie.rating}</p>
							<p>Description: {movie.description}</p>
						</div>
					{/each}
				</details>
			{/if}
			<h3 class="mb-2">Submit a review</h3>
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
