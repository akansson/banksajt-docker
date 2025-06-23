import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Account() {
  const [balance, setBalance] = useState(0);
  const [depositAmount, setDepositAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/me/accounts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setBalance(data.balance);
      } else {
        setMessage(data.message || "Failed to fetch balance");
      }
    } catch (error) {
      setMessage("Error connecting to server");
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const token = localStorage.getItem("token");
    const amount = parseFloat(depositAmount);

    if (amount <= 0) {
      setMessage("Please enter a valid amount");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/me/accounts/transactions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, amount }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setBalance(data.newBalance);
        setDepositAmount("");
        setMessage(`Successfully deposited ${amount} SEK.`);
      } else {
        setMessage(data.message || "Deposit failed");
      }
    } catch (error) {
      setMessage("Error connecting to server");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            Akan Bank
          </Link>
          <button onClick={handleLogout} className="hover:underline">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto p-8">
        <h2 className="text-2xl font-bold mb-6">Your Account</h2>

        {/* Balance Display */}
        <div className="bg-white p-6 rounded shadow mb-6">
          <h3 className="text-lg font-semibold mb-2">Current Balance</h3>
          <p className="text-3xl font-bold text-blue-600">{balance} SEK</p>
        </div>

        {/* Deposit Form */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Deposit Money</h3>

          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Amount (SEK)
              </label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter amount"
                min="1"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "Depositing..." : "Deposit"}
            </button>
          </form>
        </div>

        {message && (
          <p
            className={`mt-4 text-center ${
              message.includes("Successfully")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
