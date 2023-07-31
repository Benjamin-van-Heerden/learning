<script lang="ts">
	import { walletStore } from "@svelte-on-solana/wallet-adapter-core"
	import { WalletMultiButton } from "@svelte-on-solana/wallet-adapter-ui"
	import * as Web3 from "@solana/web3.js"

	let recipientAddress = "8H6v2hYEqgbPuXadEfPKrKUmiwtPvz17rkNagmzbV2K1" // my test account
	let amount = 0.1

	let transactionSignature = ""
	async function sendSol() {
		try {
			if (!$walletStore.publicKey) throw new Error("Connect to a wallet first")
			if (!recipientAddress) throw new Error("Enter a recipient address")
			if (!amount) throw new Error("Enter an amount")
			const transaction = new Web3.Transaction()
			const recipientPublicKey = new Web3.PublicKey(recipientAddress)
			const instructions = Web3.SystemProgram.transfer({
				fromPubkey: $walletStore.publicKey,
				toPubkey: recipientPublicKey,
				lamports: Web3.LAMPORTS_PER_SOL * amount
			})
			transaction.add(instructions)
			const connection = new Web3.Connection(Web3.clusterApiUrl("devnet"))
			transactionSignature = await $walletStore.sendTransaction(transaction, connection)
		} catch (error) {
			console.log(error)
			transactionSignature = "error"
		}
	}
</script>

<div class="container flex flex-col">
	<nav>
		<a href="/">⬅️ Home</a>
	</nav>
	<h1 class="mb-2">Connect to a wallet</h1>
	<div class="flex w-full md:w-1/3">
		<WalletMultiButton />
	</div>
	{#if $walletStore.publicKey}
		<p class="mt-2">
			Your public key is: <code>{$walletStore.publicKey.toString()}</code>
		</p>
		<label for="recip">Recipient Address</label>
		<input id="recip" type="text" bind:value={recipientAddress} />
		<label for="amount">Amount</label>
		<input id="amount" type="number" bind:value={amount} />
		<button on:click={sendSol}>Send SOL</button>
		<hr class="m-2" />
		{#if transactionSignature}
			{#if transactionSignature === "error"}
				<p class="text-red-500">Error sending transaction</p>
			{:else}
				<p>
					Transaction sent: <code>{transactionSignature}</code>
				</p>
				<p>
					View at on explorer: <a
						href={`https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`}
						>Transaction</a
					>
				</p>
			{/if}
		{/if}
	{/if}
</div>
