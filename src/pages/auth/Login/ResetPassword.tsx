import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useFormState } from "react-dom";
//import { useAuth } from "./ContextAPI/AuthContext";

export default function ResetPassword() {
 // const { authToken, userId } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const[data,setData]= useState<any>([]);

  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleReset = async () => {
  if (!password || !confirm) {
    setError("Both fields are required");
    return;
  }

  if (password.length < 6) {
    setError("Password must be at least 6 characters");
    return;
  }

  if (password !== confirm) {
    setError("Passwords do not match");
    return;
  }

  setError("");
  setSuccess("");
  setLoading(true);

  try {   
    const response = await axios.put(
      `${apiUrl}/api/updateuserpassword`,
      {},
      {
        params: {
          UserEmail: email,
          PwdHash: password,
        },
       // headers: { Authorization: `Bearer ${authToken}`,},   
      }
    );
    setData(response.data);
    setSuccess("Password updated successfully!");

    setTimeout(() => {
      navigate("/");
    }, 1500);
  } catch (error: any) {
  console.log("Full error object:", error);

  if (error.response) {
    console.log("Server responded with:", error.response.data);
    console.log("Status code:", error.response.status);

    // Show raw error
    setError(
      typeof error.response.data === "string"
        ? error.response.data
        : JSON.stringify(error.response.data)
    );
  } 
  else if (error.request) {
    console.log("No response received:", error.request);
    setError("No response from server. Check API URL or network.");
  } 
  else {
    console.log("Other error:", error.message);
    setError(error.message);
  }
  setLoading(false);
}
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>

        <p className="text-gray-600 mb-4 text-center">{email}</p>

        {/* Password Field */}
        <div className="relative mb-3">
          <input
            type={showPass ? "text" : "password"}
            className={`w-full px-4 py-2 border rounded-lg pr-10 ${
              error ? "border-red-500" : ""
            }`}
            placeholder="New Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
              setSuccess("");
            }}
          />
          <span
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-2.5 cursor-pointer text-gray-600"
          >
            {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>

        {/* Confirm Password Field */}
        <div className="relative mb-1">
          <input
            type={showConfirm ? "text" : "password"}
            className={`w-full px-4 py-2 border rounded-lg pr-10 ${
              error ? "border-red-500" : ""
            }`}
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setError("");
              setSuccess("");
            }}
          />
          <span
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-2.5 cursor-pointer text-gray-600"
          >
            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>

        {/* Error */}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* Success */}
        {success && (
          <p className="text-green-600 text-sm mb-3 font-semibold">
            {success}
          </p>
        )}

        {/* Reset Password Button */}
        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition mb-3"
        >
          {loading ? "Updating..." : "Reset Password"}
        </button>

        {/* Back to Login Link */}
        <p
          onClick={() => navigate("/")}
          className="text-center text-blue-600 underline cursor-pointer"
        >
          Back to Login
        </p>
      </div>
    </div>
  );
}
