// src/pages/auth/Login/VerifyOtp.tsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;

  const handleVerify = () => {
    if (!otp) {
      setError("OTP is required");
      return;
    }
    if (!/^\d{4,6}$/.test(otp)) {
      setError("OTP must be 4–6 digits");
      return;
    }

    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigate("/reset-password", { state: { email } });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Verify OTP</h2>

        <p className="text-gray-600 mb-4 text-center">
          OTP sent to: <span className="font-semibold">{email}</span>
        </p>

        <input
          type="text"
          maxLength={6}
          className={`w-full px-4 py-2 border rounded-lg mb-1 ${
            error ? "border-red-500" : ""
          }`}
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => {
            const onlyNums = e.target.value.replace(/\D/g, ""); // allow only numbers
            setOtp(onlyNums);
            setError("");
          }}
        />

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </div>
  );
}
