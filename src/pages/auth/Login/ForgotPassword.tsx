import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../components/ContextAPI/AuthContext";

export default function ForgotPassword() {
    const { authToken } = useAuth();
  
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateEmail = (value: string) => {
  const rx = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return rx.test(value);
  };
 const apiUrl = import.meta.env.VITE_API_URL;
  const handleNext = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setLoading(true);
    try {       
        await axios.put(
          `${apiUrl}/api/generateotp`,
          {},
          {
            params: {
              UserEmail: email,
              IsResendOTP: false,
            },
          headers: { Authorization: `Bearer ${authToken}`,},   
          }
        );
  } catch (error: any) {
  console.log("Full error object:", error);
  }
    setTimeout(() => {
      setLoading(false);
      navigate("/verify-otp", { state: { email } });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>

        <input
          type="email"
          className={`w-full px-4 py-2 border rounded-lg mb-1 ${
            error ? "border-red-500" : ""
          }`}
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
        />

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          onClick={handleNext}
          disabled={loading}
          className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition"
        >
          {loading ? "Sending..." : "Generate OTP"}
        </button>
      </div>
    </div>
  );
}
