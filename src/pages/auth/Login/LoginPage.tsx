// src/pages/auth/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SrmLogo from "../../../assets/images/srm_login_logo.png";
// import TrophyImage from "../../../assets/images/login_cup_img.png";
import loginBg from "../../../assets/images/login_cup_img.png";
import { Eye, EyeClosed, Mail, Lock, Fingerprint, LogIn, Shield, ArrowLeft, CheckCircle , MessageSquareLock } from "lucide-react";
import { USER_ROLES, type UserRole } from "../../../dataTypes/roles";
import  Tree from "../../../assets/images/tree.png"
// import axios from "axios";
// import { useAuth } from "../../../components/ContextAPI/AuthContext";

interface LoginProps {
  setUserRole: React.Dispatch<React.SetStateAction<UserRole | null | undefined>>;
}

// const apiUrl = import.meta.env.VITE_API_URL;

export default function Login({ setUserRole }: LoginProps) {
    // const { authToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [otpStep, setOtpStep] = useState<"enterEmail" | "enterOtp">("enterEmail");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2000);
  };

  // ---------------- PASSWORD LOGIN ----------------
 const handleLoginWithPassword = async () => {
  if (!email || !password) {
    showMessage("Please enter both email and password", "error");
    return;
  }

  setIsLoading(true);

  try {
    // 🔐 Hardcoded users
    const users = [
      { email: "admin@gmail.com", password: "123", roleid: 6 },
      { email: "manager@gmail.com", password: "123", roleid: 2 },
      { email: "user@gmail.com", password: "123", roleid: 1 },
    ];

    // simulate API delay
    await new Promise((res) => setTimeout(res, 800));

    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!foundUser) {
      showMessage("Invalid email or password", "error");
      setIsLoading(false);
      return;
    }

    // ✅ fake response (API response maari)
    const token = "dummy-token-123";
    const refreshToken = "dummy-refresh";
    const roleid = foundUser.roleid;
    const userid = 1;
    const username = email.split("@")[0];
    const userEmail = email;
    const tenantname = "demo";
    const primaryfield = "test";

    if (!token) {
      showMessage("Login failed. Token missing.", "error");
      setIsLoading(false);
      return;
    }

    let role_user: UserRole;
    switch (Number(roleid)) {
      // case 1: role_user = USER_ROLES.USER; break;
      // case 2: role_user = USER_ROLES.MANAGER; break;
      // case 3: role_user = USER_ROLES.JURY; break;
      // case 4: role_user = USER_ROLES.PRESIDENT_UNIT; break;
      // case 5: role_user = USER_ROLES.PRESIDENT_LEVEL; break;
      case 6: role_user = USER_ROLES.ADMIN; break;
      default:
        showMessage("Invalid role. Contact support.", "error");
        setIsLoading(false);
        return;
    }

    // ✅ same localStorage logic (unchanged)
    localStorage.setItem("authToken", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("userId", userid.toString());
    localStorage.setItem("username", username);
    localStorage.setItem("email", userEmail);
    localStorage.setItem("userRole", role_user);
    localStorage.setItem("tenantname", tenantname);
    localStorage.setItem("primaryfield", primaryfield);

    setUserRole(role_user);
    showMessage("Login successful!", "success");

    setTimeout(() => {
      switch (role_user) {
        // case USER_ROLES.MANAGER: navigate("/approvals"); break;
        // case USER_ROLES.JURY: navigate("/business-jury"); break;
        // case USER_ROLES.PRESIDENT_UNIT: navigate("/president-unit"); break;
        // case USER_ROLES.PRESIDENT_LEVEL: navigate("/president-level"); break;
        case USER_ROLES.ADMIN: navigate("/home"); break;
        default: navigate("/home");
      }
      window.location.reload();
     
    }, 1000);

  } catch (err) {
    console.error("Login error:", err);
    showMessage("Server error. Please try again.", "error");
    setIsLoading(false);
  }
};

  // ---------------- OTP FLOW ----------------
  // const handleGenerateOtp = async () => {
  //   if (!email) {
  //     showMessage("Please enter email to receive OTP", "error");
  //     return;
  //   }

  //   setIsLoading(true);
    
  //   try {

  //     await axios.put(
  //         `${apiUrl}/api/generateotp`,
  //         {},
  //         {
  //           params: {
  //             UserEmail: email,
  //             IsResendOTP: false,
  //           },
  //         headers: { Authorization: `Bearer ${authToken}`,},   
  //         }
  //       );
  //     await new Promise(resolve => setTimeout(resolve, 1000));
  //     showMessage(`OTP sent to ${email}`, "success");
  //     setOtpStep("enterOtp");
  //   } catch (err) {
  //     console.error("Login error:", err);
  //     showMessage("Server error. Please try again.", "error");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleVerifyOtp = async () => {
  //   if (!otp) {
  //     showMessage("Please enter OTP", "error");
  //     return;
  //   }

  //   if (!/^\d{6}$/.test(otp)) {
  //     showMessage("OTP must be 6 digits", "error");
  //     return;
  //   }

  //   setIsLoading(true);

  //   try {
  //     const res = await fetch(`${apiUrl}/api/loginbyotp`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         userName: email,
  //         password: password ?? "",
  //         isEncrypted: false,
  //         otp: otp ?? ""
  //       }),
  //     });

  //     const data = await res.json();
  //     console.log(data);

  //     if (!res.ok) {
  //       showMessage(data.message || "Invalid OTP", "error");
  //       setIsLoading(false);
  //       return;
  //     }

  //     showMessage("OTP verified successfully!", "success");

  //     const token = data.token;
  //     const roleid = data.roleid;
  //     const userid = data.userid;
  //     const username = data.username;
  //     const userEmail = data.email;
  //     const refreshToken = data.refreshtoken;
  //     const tenantname = data.tenantname;
  //     const primaryfield = data.primaryfield;

  //     let role_user: UserRole;
  //     switch (Number(roleid)) {
  //       // case 1: role_user = USER_ROLES.USER; break;
  //       // case 2: role_user = USER_ROLES.MANAGER; break;
  //       // case 3: role_user = USER_ROLES.JURY; break;
  //       // case 4: role_user = USER_ROLES.PRESIDENT_UNIT; break;
  //       // case 5: role_user = USER_ROLES.PRESIDENT_LEVEL; break;
  //       case 6: role_user = USER_ROLES.ADMIN; break;
  //       default: showMessage("Invalid role. Contact support.", "error"); setIsLoading(false); return;
  //     }

  //     localStorage.setItem("authToken", token);
  //     localStorage.setItem("refreshToken", refreshToken);
  //     localStorage.setItem("userId", userid?.toString() ?? "");
  //     localStorage.setItem("username", username ?? "");
  //     localStorage.setItem("email", userEmail ?? "");
  //     localStorage.setItem("userRole", role_user);
  //     localStorage.setItem("tenantname", tenantname);
  //     localStorage.setItem("primaryfield", primaryfield);

  //     setUserRole(role_user);

  //     setTimeout(() => {
  //       navigate("/home");
  //       window.location.reload();
  //     }, 1000);

  //   } catch (error) {
  //     console.error(error);
  //     showMessage("Server error. Please try again.", "error");
  //     setIsLoading(false);
  //   }
  // };
  const handleGenerateOtp = async () => {
  if (!email) {
    showMessage("Please enter email to receive OTP", "error");
    return;
  }

  setIsLoading(true);

  try {
    // ✅ Fake OTP
    const fakeOtp = "123456";

    // store in localStorage (or state)
    localStorage.setItem("demoOtp", fakeOtp);

    await new Promise((res) => setTimeout(res, 800));

    console.log("Generated OTP:", fakeOtp); // 🔥 for testing

    showMessage(`OTP sent to ${email}`, "success");
    setOtpStep("enterOtp");

  } catch (err) {
    console.error(err);
    showMessage("Something went wrong", "error");
  } finally {
    setIsLoading(false);
  }
};
const handleVerifyOtp = async () => {
  if (!otp) {
    showMessage("Please enter OTP", "error");
    return;
  }

  if (!/^\d{6}$/.test(otp)) {
    showMessage("OTP must be 6 digits", "error");
    return;
  }

  setIsLoading(true);

  try {
    const storedOtp = localStorage.getItem("demoOtp");

    await new Promise((res) => setTimeout(res, 800));

    if (otp !== storedOtp) {
      showMessage("Invalid OTP", "error");
      setIsLoading(false);
      return;
    }

    showMessage("OTP verified successfully!", "success");

    // ✅ Fake user data
    const token = "dummy-token-otp";
    const refreshToken = "dummy-refresh";
    const roleid = 6;
    const userid = 1;
    const username = email.split("@")[0];
    const userEmail = email;
    const tenantname = "demo";
    const primaryfield = "test";

    let role_user: UserRole;

    switch (Number(roleid)) {
      case 6:
        role_user = USER_ROLES.ADMIN;
        break;
      default:
        showMessage("Invalid role", "error");
        setIsLoading(false);
        return;
    }

    // ✅ store
    localStorage.setItem("authToken", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("userId", userid.toString());
    localStorage.setItem("username", username);
    localStorage.setItem("email", userEmail);
    localStorage.setItem("userRole", role_user);
    localStorage.setItem("tenantname", tenantname);
    localStorage.setItem("primaryfield", primaryfield);

    setUserRole(role_user);

    setTimeout(() => {
      navigate("/home");
      window.location.reload();
    }, 1000);

  } catch (error) {
    console.error(error);
    showMessage("Something went wrong", "error");
    setIsLoading(false);
  }
};

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className=" relative">
      <div className="flex min-h-screen flex-col lg:flex-row">

  {/* LEFT SIDE */}
  <div
    className="w-full lg:w-1/2 flex flex-col justify-between text-white p-6 sm:p-10"
    style={{
      backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${loginBg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    <div>
      <img src={SrmLogo} className="w-32 sm:w-40 mb-6" alt="SRM Logo" />
    </div>

    <div>
      <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-bold mb-4 drop-shadow-lg">
        Innovate. Experiment. Excel.
      </h1>

      <p className="max-w-md text-sm sm:text-base text-white/90">
        Explore groundbreaking lab projects, track progress, and celebrate scientific excellence.
      </p>
    </div>
  </div>

  {/* RIGHT SIDE */}
  <div className="w-full lg:w-1/2 flex justify-center items-center bg-gradient-to-br from-gray-50 to-white px-4 sm:px-8 lg:px-12 py-10">

     <div className="max-w-md w-full">
          {/* Card with professional box-shadow */}
          <div className="bg-white rounded-2xl shadow-2xl shadow-green-900/10 hover:shadow-2xl hover:shadow-green-900/20 transition-shadow duration-300 p-8">
            {/* Header */}
            <div className="flex justify-center mb-3">
              <div className="inline-flex gap-3 items-center    mb-4">
                  <img src={Tree} alt="" className="w-14 h-14" />
                  <div>
                     <h2 className="text-2xl font-bold text-gray-900">  Welcome Back!</h2>
                     <p className="text-gray-500 mt-1">Sign in to your account</p>
                  </div>
                   
              </div>
              <div>
               
              </div>
            
             
            </div>

            {/* Method Switcher */}
            <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => {
                  setLoginMethod("password");
                  setOtpStep("enterEmail");
                  setOtp("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  loginMethod === "password"
                    ? "bg-white textColor shadow-sm font-medium ring-1 ring-green-100"
                    : "text-gray-600 "
                }`}
              >
                <Lock className="w-4 h-4" />
                Password
              </button>
              <button
                onClick={() => {
                  setLoginMethod("otp");
                  setOtpStep("enterEmail");
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  loginMethod === "otp"
                    ? "bg-white textColor shadow-sm font-medium ring-1 ring-green-100"
                    : "text-gray-600 "
                }`}
              >
                <MessageSquareLock  className="w-4 h-4" />
                OTP Login
              </button>
            </div>

            {loginMethod === "password" && (
              <div className="space-y-4">
                {/* Email Field */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:borderColor focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all bg-white"
                  />
                </div>

                {/* Password Field */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:borderColor
 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all bg-white"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeClosed className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Options */}
                <div className="flex justify-between text-sm">
                  <button
                    onClick={() => {
                      setLoginMethod("otp");
                      setOtpStep("enterEmail");
                    }}
                    className="textColor font-medium transition-colors flex items-center gap-1"
                  >
                    <Fingerprint className="w-4 h-4" />
                    Login with OTP
                  </button>
                  <button
                    onClick={handleForgotPassword}
                    className="textColor font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Sign In Button */}
                <button
                  onClick={handleLoginWithPassword}
                  disabled={isLoading}
                  className="w-full  themeColor text-white py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <LogIn className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {loginMethod === "otp" && (
              <div>
                {otpStep === "enterEmail" && (
                  <div className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:borderColor
 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all bg-white"
                      />
                    </div>
                    <button
                      onClick={handleGenerateOtp}
                      disabled={isLoading}
                      className="w-full  themeColor  py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Generate OTP
                          <Mail className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setLoginMethod("password")}
                      className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Password Login
                    </button>
                  </div>
                )}

                {otpStep === "enterOtp" && (
                  <div className="space-y-4">
                    <div className="text-center p-3 bg-green-50 rounded-xl">
                      <p className="text-sm text-gray-700">
                        OTP sent to <span className="font-semibold text-green-700">{email}</span>
                      </p>
                    </div>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:borderColor
 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-center text-lg tracking-wider bg-white"
                      />
                    </div>
                    <button
                      onClick={handleVerifyOtp}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify OTP
                          <CheckCircle className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={handleGenerateOtp}
                        className="flex-1 textColor hover:text-green-800 text-sm font-medium transition-colors"
                      >
                        Resend OTP
                      </button>
                      <button
                        onClick={() => {
                          setLoginMethod("password");
                          setOtpStep("enterEmail");
                          setOtp("");
                        }}
                        className="flex-1 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" />
                Secured with industry-standard encryption
              </p>
            </div>
          </div>
        </div>
  </div>
</div>
     

      {/* Toast Message */}
      {message && (
        <div className={`fixed top-5 right-5 px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in z-50 ${
          message.type === "success" 
            ? "bg-green-600 text-white" 
            : "bg-red-600 text-white"
        }`}>
          {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}