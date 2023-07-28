<script lang="ts">
	import * as Web3 from "@solana/web3.js"
	let address = "Jkrq3ZN6H6SaaGudG8KMKY587BZ8gczxNBuzfaB9JGc" // my address
	let loading = false
	let isExecutable = false
	let balanceInfoSet = false
	let balanceValue = 0
	let setAddress = ""

	async function getBalance() {
		try {
			loading = true
			const key = new Web3.PublicKey(address)
			const connection = new Web3.Connection(Web3.clusterApiUrl("devnet"))
			const balance = await connection.getBalance(key)
			balanceValue = balance / Web3.LAMPORTS_PER_SOL
			const info = await connection.getAccountInfo(key)
			if (info) isExecutable = info.executable
			setAddress = address
			balanceInfoSet = true
		} catch (error) {
			console.log(error)
			isExecutable = false
			balanceInfoSet = false
			balanceValue = 0
		} finally {
			loading = false
		}
	}

	type AirdropStatus = "none" | "loading" | "success" | "error"
	let airdropStatus: AirdropStatus = "none"
	async function airdrop() {
		try {
			airdropStatus = "loading"
			const connection = new Web3.Connection(Web3.clusterApiUrl("devnet"))
			const key = new Web3.PublicKey(address)
			await connection.requestAirdrop(key, Web3.LAMPORTS_PER_SOL * 1)
			airdropStatus = "success"
		} catch (error) {
			console.log(error)
			airdropStatus = "error"
		}
	}
</script>

<div class="container flex flex-col justify-center">
	<nav>
		<a href="/">⬅️ Home</a>
	</nav>
	<h1>Get The Balance of a Solana Address</h1>
	<label for="address">Solana Address (Devnet)</label>
	<input id="address" type="text" bind:value={address} />
	<button aria-busy={loading} on:click={getBalance} disabled={loading}>
		{loading ? "Getting balance..." : "Get Balance"}
	</button>
	{#if balanceInfoSet}
		<p class="mb-1">Address: <strong>{setAddress}</strong></p>
		<p class="mb-1">The balance is: <strong>{balanceValue}</strong> SOL</p>
		<p>Is it executable? <strong>{isExecutable ? "Hell Yeah" : "Nope"}</strong></p>
		<hr class="m-2" />
		<button on:click={airdrop} aria-busy={airdropStatus == "loading"}
			>{airdropStatus == "loading" ? "Airdropping..." : "Airdrop 1 SOL"}</button
		>
		{#if airdropStatus == "success"}
			<p>Airdrop successful</p>
		{/if}
	{/if}
</div>
