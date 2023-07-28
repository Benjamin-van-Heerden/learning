<script>
	import "../app.postcss"
	import "@picocss/pico/css/pico.min.css"

	import { clusterApiUrl } from "@solana/web3.js"
	import { WalletProvider, ConnectionProvider } from "@svelte-on-solana/wallet-adapter-ui"
	import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"

	const localStorageKey = "walletAdapter"
	const network = clusterApiUrl("devnet") // localhost or mainnet
	let wallets = [new PhantomWalletAdapter()]
</script>

<WalletProvider {localStorageKey} {wallets} autoConnect />
<ConnectionProvider {network} />
<main class="p-8">
	<slot />
</main>
