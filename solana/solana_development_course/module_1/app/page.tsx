"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import * as Web3 from "@solana/web3.js";

export default function Home() {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [isExecutable, setIsExecutable] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setAddress(e.target.value);
  };

  const checkBalance = async () => {
    try {
      setLoading(true);
      const key = new Web3.PublicKey(address);
      const connection = new Web3.Connection(Web3.clusterApiUrl("devnet"));
      const balance = await connection.getBalance(key);
      const info = await connection.getAccountInfo(key);
      setBalance(balance / Web3.LAMPORTS_PER_SOL);
      setIsExecutable(info?.executable || false);
    } catch (error) {
      console.log(error);
      setError("Invalid address");
      setBalance(0);
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col min-h-screen items-center justify-between p-24">
      <div className="flex flex-col space-y-4">
        <h1 className="text-4xl">Get started with solana</h1>
        <Input
          id="address"
          type="text"
          placeholder="Wallet Address"
          onChange={handleAddressChange}
        />
        <Button type="submit" onClick={checkBalance} disabled={loading}>
          Check balance
        </Button>
        {loading && (
          <div className="flex flex-col space-y-4">
            <h2 className="text-2xl">Loading...</h2>
          </div>
        )}
        {address && (
          <div className="flex flex-col space-y-4">
            <h2 className="text-2xl">The address is {address}</h2>
          </div>
        )}
        {balance > 0 && (
          <div className="flex flex-col space-y-4">
            <h2 className="text-2xl">The balance is: {balance}</h2>
          </div>
        )}
        {isExecutable && balance > 0 && (
          <div className="flex flex-col space-y-4">
            <h2 className="text-2xl">
              Is it executable? {isExecutable ? "Hell Yeah" : "Nope"}
            </h2>
          </div>
        )}
        {error && (
          <div className="flex flex-col space-y-4">
            <h2 className="text-2xl">{error}</h2>
          </div>
        )}
      </div>
    </main>
  );
}
