import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-blue-600 text-white p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Akan Bank</h1>
          <div className="space-x-4">
            <Link href="/login" className="hover:underline">
              Login
            </Link>
            <Link href="/register" className="hover:underline">
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Welcome to Akan Bank</h2>
        <p className="text-gray-600 mb-8">
          Simple and secure banking for everyone
        </p>

        <div className="space-x-4">
          <Link
            href="/register"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
