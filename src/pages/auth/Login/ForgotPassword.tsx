import { useState } from "react";

const apiUrl = import.meta.env.VITE_API_URL;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendLink = async () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${apiUrl}/api/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setMessage("Password reset link sent to your email");
      } else {
        setMessage(data.message || "Something went wrong");
      }
    } catch (err) {
      setLoading(false);
      setMessage("Server error. Try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Forgot Password
        </h2>
        <p className="text-gray-600 mb-4 text-center">
          Enter your registered email. We’ll send a password reset link.
        </p>

        <input
          type="email"
          className="w-full px-4 py-2 border rounded-lg mb-4"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleSendLink}
          disabled={loading}
          className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {message && (
          <p className="text-center text-sm mt-3 text-blue-600">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
