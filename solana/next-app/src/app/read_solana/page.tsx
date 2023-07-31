"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import * as web3 from "@solana/web3.js"

export default function ReadSolana() {
	let startingAddress = "Jkrq3ZN6H6SaaGudG8KMKY587BZ8gczxNBuzfaB9JGc" // my address
	const [address, setAddress] = useState(startingAddress)
	const [balance, setBalance] = useState(0)
	const [isExecutable, setIsExecutable] = useState(false)
	const [balanceStatus, setBalanceStatus] = useState("") // "loading" | "success" | "error"
	const [airdropStatus, setAirdropStatus] = useState("") // "loading" | "success" | "error"
	const [airdropSignature, setAirdropSignature] = useState("")

	async function getBalance() {
		try {
			setBalanceStatus("loading")
			const connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed")
			const publicKey = new web3.PublicKey(address)
			const balance = await connection.getBalance(publicKey)
			const info = await connection.getAccountInfo(publicKey)
			setIsExecutable(info!.executable)
			setBalance(balance / web3.LAMPORTS_PER_SOL)
			setBalanceStatus("success")
		} catch (e) {
			alert(e)
			setBalanceStatus("error")
		}
	}

	async function airdrop() {
		try {
			setAirdropStatus("loading")
			const connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed")
			const publicKey = new web3.PublicKey(address)
			const signature = await connection.requestAirdrop(publicKey, web3.LAMPORTS_PER_SOL)
			setAirdropSignature(signature)
			setAirdropStatus("success")
		} catch (e) {
			alert(e)
			setAirdropStatus("error")
		}
	}

	return (
		<>
			<nav>
				<a className="text-blue-500" href="/">
					⬅️ Home
				</a>
			</nav>
			<h3 className="mt-4 text-3xl">Get the balance of a Solana address</h3>
			<Input
				className="my-4 w-1/2"
				onChange={(e) => setAddress(e.target.value)}
				value={startingAddress}
			/>
			<Button className="mb-4" onClick={getBalance}>
				Get balance
			</Button>
			{balanceStatus === "loading" && <p>Loading...</p>}
			{balanceStatus === "success" && (
				<>
					<p className="mt-4">Balance: {balance} SOL</p>
					<p className="my-2">Is executable: {isExecutable ? "Yes" : "No"}</p>
					<Button className="mt-2" onClick={airdrop}>
						Airdrop 1 SOL
					</Button>
					{airdropStatus === "loading" && <p>Loading...</p>}
					{airdropStatus === "success" && (
						<>
							<p className="mt-4">Airdrop signature: {airdropSignature}</p>
							<p className="mt-4">
								Check the transaction on{" "}
								<a
									className="text-blue-500 underline"
									href={`https://explorer.solana.com/tx/${airdropSignature}`}
								>
									Solana Explorer
								</a>
							</p>
						</>
					)}
				</>
			)}
		</>
	)
}
