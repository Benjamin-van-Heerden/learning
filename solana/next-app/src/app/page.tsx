import { Button } from "@/components/ui/button"

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-start">
			<h1 className="mb-4 text-center text-5xl font-bold underline">Contents</h1>
			<h2 className="mb-4 text-center text-3xl font-bold">Solana Development Course</h2>
			<ul>
				<li>
					<a className="text-blue-500 underline" href="/read_solana">
						1. Read from the Solana network
					</a>
				</li>
				<li>
					<a className="text-blue-500 underline" href="/connect_wallet">
						2. Connect to a wallet
					</a>
				</li>
			</ul>
		</main>
	)
}
