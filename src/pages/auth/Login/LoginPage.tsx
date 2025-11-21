// src/pages/auth/Login.tsx
import {  useEffect, useState } from "react";
import SrmLogo from "../../../assets/images/srm_login_logo.png";
import TrophyImage from "../../../assets/images/login_cup_img.png";
import loginBg from "../../../assets/images/login_left_img.png";
import { Eye ,EyeClosed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { USER_ROLES , type UserRole } from "../../../dataTypes/roles";
import "./Login.module.css";



interface LoginProps {
  setUserRole: React.Dispatch<React.SetStateAction<UserRole | null | undefined>>;
}



const apiUrl = import.meta.env.VITE_API_URL;



export default function Login({ setUserRole }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

const handleForgotPassword = () => {
  navigate("/forgot-password");
};
 

const handleLoginTwo = async () => {
  if (!email || !password) {
    alert('Please enter both email and password');
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userName: email, password, isEncrypted: false }),
    });

    const data = await response.json();
    

    if (response.ok) {
      const { token, roleid, userid, username, email, refreshtoken } = data;

      if (!roleid) {
        alert('Your role is not defined. Please contact support.');
        return;
      }

      let role_user: UserRole;

switch (Number(roleid)) {
  case 1:
    role_user = USER_ROLES.USER;
    break;
  case 2:
    role_user = USER_ROLES.MANAGER;
    break;
  case 3:
    role_user = USER_ROLES.JURY;
    break;
  case 4:
    role_user = USER_ROLES.PRESIDENT_UNIT;
    break;
  case 5:
    role_user = USER_ROLES.PRESIDENT_LEVEL;
    break;
  case 6:
    role_user = USER_ROLES.ADMIN;
    break;
  default:
    alert('Invalid role. Please contact support.');
    return;
}


      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', refreshtoken);
      localStorage.setItem('userId', userid.toString());
      localStorage.setItem('username', username);
      localStorage.setItem('email', email);
      localStorage.setItem('userRole', role_user);  

      
      setUserRole(role_user);

      switch (role_user) {
        case USER_ROLES.MANAGER:
          navigate('/approvals');
          break;
        case USER_ROLES.JURY:
          navigate('/business-jury');
          break;
        case USER_ROLES.PRESIDENT_UNIT:
          navigate('/president-unit');
          break;
        case USER_ROLES.PRESIDENT_LEVEL:
          navigate('/president-level');
          break;
        case USER_ROLES.ADMIN:
          navigate('/admin');
          break;
        default:
          navigate('/home');
      }
      window.location.reload();
    } else {
    
      alert(data.message || 'Invalid email or password');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
};


// useEffect(() => {
//   handleLoginTwo();
// }, [handleLoginTwo]);
















//  const handleLogin = () => {
//     if (!email || !password) {
//       alert('Please enter both email and password');
//       return;
//     }

//     let role: UserRole | null = null;

//     if (email === "user@gmail.com" && password === "1") role = USER_ROLES.USER;
//     else if (email === "manager@gmail.com" && password === "2") role = USER_ROLES.MANAGER;
//     else if (email === "jury@gmail.com" && password === "3") role = USER_ROLES.JURY;
//     else if (email === "presidentUnit@gmail.com" && password === "4") role = USER_ROLES.PRESIDENT_UNIT;
//     else if (email === "presidentLevel@gmail.com" && password === "5") role = USER_ROLES.PRESIDENT_LEVEL;
//     else if (email === "admin@gmail.com" && password === "6") role = USER_ROLES.ADMIN;
//     else {
//       alert('Invalid email or password');
//       return;
//     }

//     // ✅ Update localStorage and App state
//     localStorage.setItem('userRole', role);
//     setUserRole(role);

//     // Navigate based on role
//     switch (role) {
//       case USER_ROLES.MANAGER: navigate('/approvals'); break;
//       case USER_ROLES.JURY: navigate('/business-jury'); break;
//       case USER_ROLES.PRESIDENT_UNIT: navigate('/president-unit'); break;
//       case USER_ROLES.PRESIDENT_LEVEL: navigate('/president-level'); break;
//       case USER_ROLES.ADMIN: navigate('/admin'); break;
//       default: navigate('/home');
//     }
//   };


  return (
    <div className="min-h-screen flex">
     
      <div className="w-1/2  ba  flex flex-col text-white p-10 relative  items-baseline" 
       style={{
    backgroundImage: `linear-gradient(rgba(0,128,0,0.6), rgba(0,128,0,0.6)), url(${loginBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
      >
        <img src={SrmLogo} alt="SRM Logo"  className="w-24 sm:w-32 md:w-40 lg:w-40 xl:w-40 max-w-full h-auto mb-6"  />

        <div className="mt-[50px]">
          
          <img src={TrophyImage} alt="Trophy"  className="w-24 sm:w-32 md:w-40 lg:w-40 xl:w-40 max-w-full h-auto mb-6"  />
        <h1 className="text-[40px] font-bold mb-4">
          Welcome to the Excellence <br /> Awards Platform
        </h1>
        <p className="max-w-md text-[16px]">
          Discover, recognize, and celebrate outstanding projects from SRM
          innovators. Login to explore award-winning work, give your feedback,
          and celebrate excellence together.
        </p>
        </div>
       
      </div>

     
      <div className="w-1/2 flex flex-col justify-center items-center bg-white px-12">
        <div className="max-w-sm w-full">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Welcome Back!
          </h2>
          <p  className="text-center text-gray-500 mb-6">
            Sign in to your account
          </p>

          {/* Email Input */}
          <label className="block mb-2 text-sm font-medium">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-green-600"
          />

          {/* Password Input */}
          <label className="block mb-2 text-sm font-medium">Password</label>
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 text-gray-500"
            >
              {showPassword ? <Eye /> : <EyeClosed />}
            </button>
          </div>

          {/* Remember Me + Forgot Password */}
          <div className="flex justify-between items-center mb-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-sm text-green-700 hover:underline" onClick={handleForgotPassword}>
              Forgot Password?
            </a>
          </div>

          {/* Sign In Button */}
          {/* <button onClick={handleLogin} className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition">
            Sign In
          </button> */}

          <button onClick={handleLoginTwo} className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition">
            Sign In
          </button>

          {/* Signup Link */}
          <p className="text-center mt-4 text-sm">
            Don’t have an account?{" "}
            <a href="#" className="text-green-700 font-semibold hover:underline">
              Sign up
            </a>
          </p>

        
         
        </div>
      </div>
    </div>
  );
}
