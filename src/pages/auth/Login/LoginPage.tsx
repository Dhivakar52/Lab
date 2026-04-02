// src/pages/auth/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SrmLogo from "../../../assets/images/srm_login_logo.png";
import TrophyImage from "../../../assets/images/login_cup_img.png";
import loginBg from "../../../assets/images/login_left_img.png";
import { Eye, EyeClosed } from "lucide-react";
import { USER_ROLES, type UserRole } from "../../../dataTypes/roles";
 
interface LoginProps {
  setUserRole: React.Dispatch<React.SetStateAction<UserRole | null | undefined>>;
}
 
const apiUrl = import.meta.env.VITE_API_URL;
 
export default function Login({ setUserRole }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [otpStep, setOtpStep] = useState<"enterEmail" | "enterOtp">("enterEmail");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
 
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
 
    try {
      const res = await fetch(`${apiUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          //userName: email, password, isEncrypted: false 
          userName: email,
          password: password ?? "",
          isEncrypted: false,
          otp: otp ??""
        }),
      });
 
      const data = await res.json();
      console.log(" login Data",data)
      if (!res.ok) {
        showMessage(data.message || "Invalid email or password", "error");
        return;
      }
 
      // ---------------- Token handling ----------------
      const token = data.token || data.Token || data.accessToken || data.jwtToken || data?.result?.token;
      const refreshToken = data.refreshToken || data.refreshtoken || data?.result?.refreshToken || "";
      const roleid = data.roleid || data.RoleId || data?.result?.roleid;
      const userid = data.userid ?? data.userId ?? data?.result?.userid;
      const username = data.username ?? data.userName ?? data?.result?.username;
      const userEmail = data.email ?? data.userEmail ?? data?.result?.email;
      const tenantname = data.tenantname ?? data.tenantname ?? data?.result?.tenantname;
      const primaryfield = data.primaryfield ?? data.primaryfield ?? data?.result?.primaryfield;
 
      if (!token) {
        showMessage("Login failed. Token missing.", "error");
        return;
      }
      if (!roleid) {
        showMessage("Your role is not defined. Contact support.", "error");
        return;
      }
 
      // ---------------- Map role ----------------
      let role_user: UserRole;
      switch (Number(roleid)) {
        case 1: role_user = USER_ROLES.USER; break;
        case 2: role_user = USER_ROLES.MANAGER; break;
        case 3: role_user = USER_ROLES.JURY; break;
        case 4: role_user = USER_ROLES.PRESIDENT_UNIT; break;
        case 5: role_user = USER_ROLES.PRESIDENT_LEVEL; break;
        case 6: role_user = USER_ROLES.ADMIN; break;
        default: showMessage("Invalid role. Contact support.", "error"); return;
      }
 
      // ---------------- Save tokens & user info ----------------
      localStorage.setItem("authToken", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userId", userid?.toString() ?? "");
      localStorage.setItem("username", username ?? "");
      localStorage.setItem("email", userEmail ?? "");
      localStorage.setItem("userRole", role_user);
       localStorage.setItem("tenantname", tenantname);
      localStorage.setItem("primaryfield", primaryfield);
 
      setUserRole(role_user);
      showMessage("Login successful!", "success");
 
      setTimeout(() => {
        switch (role_user) {
          case USER_ROLES.MANAGER: navigate("/approvals"); break;
          case USER_ROLES.JURY: navigate("/business-jury"); break;
          case USER_ROLES.PRESIDENT_UNIT: navigate("/president-unit"); break;
          case USER_ROLES.PRESIDENT_LEVEL: navigate("/president-level"); break;
          case USER_ROLES.ADMIN: navigate("/admin"); break;
          default: navigate("/home");
        }
        window.location.reload();
      }, 1000);
 
    } catch (err) {
      console.error("Login error:", err);
      showMessage("Server error. Please try again.", "error");
    }
  };
 
  // ---------------- OTP FLOW ----------------
  const handleGenerateOtp = async() => {
    
    if (!email) {
      showMessage("Please enter email to receive OTP", "error");
      return;
    }
     try {
      
    //   const response = await axios.put(
    //   `${apiUrl}/api/generateotp`,
    //   {},
    //   {
    //     params: {
    //       UserEmail: email,
    //       IsResendOTP: false,
    //     },
    //    // headers: { Authorization: `Bearer ${authToken}`,},   
    //   }
    // );
      
    } catch (err) {
      console.error("Login error:", err);
      showMessage("Server error. Please try again.", "error");
    }
    showMessage(`OTP sent to ${email}`, "success");
    setOtpStep("enterOtp");
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
 
  try {
          const res = await fetch(`${apiUrl}/api/loginbyotp`, {   //"https://localhost:7218/api/loginbyotp"
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: email,
          password: password ?? "",
          isEncrypted: false,
          otp: otp ?? ""
        }),
      });

    const data = await res.json();  // ← SAFE NOW because backend returns JSON always
console.log(data);
    if (!res.ok) {
      showMessage(data.message || "Invalid OTP", "error");
      return;
    }

    // Login successful
    showMessage("OTP verified successfully!", "success");

    // Save user info (you can reuse your password login logic)
    const token = data.token;
    const roleid = data.roleid;
    const userid = data.userid;
    const username = data.username;
    const userEmail = data.email;
    const refreshToken = data.refreshtoken;
    const tenantname = data.tenantname;
      const primaryfield = data.primaryfield;

    let role_user: UserRole;
      switch (Number(roleid)) {
        case 1: role_user = USER_ROLES.USER; break;
        case 2: role_user = USER_ROLES.MANAGER; break;
        case 3: role_user = USER_ROLES.JURY; break;
        case 4: role_user = USER_ROLES.PRESIDENT_UNIT; break;
        case 5: role_user = USER_ROLES.PRESIDENT_LEVEL; break;
        case 6: role_user = USER_ROLES.ADMIN; break;
        default: showMessage("Invalid role. Contact support.", "error"); return;
      }

    localStorage.setItem("authToken", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("userId", userid?.toString() ?? "");
    localStorage.setItem("username", username ?? "");
    localStorage.setItem("email", userEmail ?? "");
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
    showMessage("Server error. Please try again.", "error");
  }
};

 
  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };
 
  return (
<div className="min-h-screen flex relative">
      {/* Left side */}
<div className="w-1/2 flex flex-col text-white p-10"
           style={{ backgroundImage: `linear-gradient(rgba(0,128,0,0.6), rgba(0,128,0,0.6)), url(${loginBg})`,
                    backgroundSize: "cover", backgroundPosition: "center" }}>
<img src={SrmLogo} className="w-40 mb-6" />
<img src={TrophyImage} className="w-40 mb-6" />
<h1 className="text-[40px] font-bold mb-4">Welcome to the Excellence <br /> Awards Platform</h1>
<p className="max-w-md text-[16px]">Discover, recognize and celebrate outstanding projects. Login to explore and participate.</p>
</div>
 
      {/* Right side */}
<div className="w-1/2 flex flex-col justify-center items-center bg-white px-12">
<div className="max-w-sm w-full">
<h2 className="text-2xl font-bold text-gray-900 text-center">Welcome Back!</h2>
<p className="text-center text-gray-500 mb-6">Sign in to your account</p>
 
          {loginMethod === "password" && (
<>
<input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
                     className="w-full px-4 py-2 border rounded-lg mb-2" />
<div className="relative mb-2">
<input type={showPassword ? "text" : "password"} placeholder="Password" value={password}
                       onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
<button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2">
                  {showPassword ? <Eye /> : <EyeClosed />}
</button>
</div>
<div className="flex justify-between mb-4 text-sm">
<button onClick={() => { setLoginMethod("otp"); setOtpStep("enterEmail"); }}
                        className="text-green-700">Login with OTP</button>
<button onClick={handleForgotPassword} className="text-green-700">Forgot Password?</button>
</div>
<button onClick={handleLoginWithPassword} className="w-full bg-green-700 text-white py-2 rounded-lg">Sign In</button>
</>
          )}
 
          {loginMethod === "otp" && (
<div className="mb-4">
              {otpStep === "enterEmail" && (
<>
<input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
                         className="w-full px-4 py-2 border rounded-lg mb-2" />
<button onClick={handleGenerateOtp} className="w-full bg-green-700 text-white py-2 rounded-lg">Generate OTP</button>
</>
              )}
              {otpStep === "enterOtp" && (
<>
<input type="text" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)}
                         className="w-full px-4 py-2 border rounded-lg mb-2" />
<button onClick={handleVerifyOtp} className="w-full bg-green-700 text-white py-2 rounded-lg">Verify OTP</button>
</>
              )}
</div>
          )}
</div>
</div>
 
      {message && (
<div className={`fixed top-10 right-10 px-6 py-4 rounded-lg text-white ${message.type==="success"?"bg-green-600":"bg-red-600"}`}>
          {message.text}
</div>
      )}
</div>
  );
}