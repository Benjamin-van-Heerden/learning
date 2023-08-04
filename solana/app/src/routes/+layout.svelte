<script>
	import "../app.postcss"
	import "@picocss/pico/css/pico.min.css"

	import { clusterApiUrl } from "@solana/web3.js"
	import {
		WalletProvider,
		ConnectionProvider,
		WalletMultiButton
	} from "@svelte-on-solana/wallet-adapter-ui"
	import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets"

	const localStorageKey = "walletAdapter"
	const network = clusterApiUrl("devnet") // localhost or mainnet
	let wallets = [new PhantomWalletAdapter()]
</script>

<WalletProvider {localStorageKey} {wallets} />
<ConnectionProvider {network} />
<main class="p-4">
	<nav class="flex w-full justify-end">
		<div class="flex">
			<WalletMultiButton />
		</div>
	</nav>
	<div class="p-4">
		<slot />
	</div>
</main>

<style>
	:global(.wallet-adapter-modal-button-close) {
		border-radius: 10px;
		width: 20%;
	}

	:global(.wallet-adapter-modal li) {
		list-style: none;
		width: 100%;
	}
</style>
