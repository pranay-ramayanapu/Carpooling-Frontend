import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { GOOGLE_AUTH_URL, SIGNUP_URL, VERIFY_EMAIL, VERIFY_OTP } from "../utils/apis";
import axios from "axios";

function Signup() {
  const navigate = useNavigate();

  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "",
    emergencyEmail: "",
    preferences: {
      music: "",
      smoking: "",
      petFriendly: "",
      genderBased: "",
      ac: "",
    },
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendTimeout, setResendTimeout] = useState(0);

  // Helper: resend OTP cooldown
  const startResendTimeout = () => {
    setResendTimeout(30);
    let timer = setInterval(() => {
      setResendTimeout((t) => {
        if (t <= 1) {
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleSignupChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setSignupData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setSignupData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const sendOtp = async () => {
    if (!signupData.email) {
      alert("Please enter your email to get OTP.");
      return;
    }
    try {
      await axios.post(
        VERIFY_EMAIL,
        { email: signupData.email },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setOtpSent(true);
      setOtpVerified(false);
      setOtp("");
      alert("OTP sent! Check your email.");
      startResendTimeout();
    } catch {
      alert("Could not send OTP. Try again.");
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await axios.post(
        VERIFY_OTP,
        { email: signupData.email, otp }
      );
      if (res.status === 200) {
        setOtpVerified(true);
        alert("OTP verification successful.");
      } else {
        throw new Error();
      }
    } catch {
      alert("Invalid or expired OTP.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
      alert("Please verify your OTP before signing up.");
      return;
    }
    try {
      const response = await axios.post(SIGNUP_URL, signupData);
      if (response.status === 200) {
        alert("Successfully signed up!");
        localStorage.setItem("AuthToken", response.data.jwtToken);
        navigate("/Dashboard");
      } else if (response.status === 403) {
        alert("Email already exists, please try again.");
      } else {
        alert("Failed to signup, please try again.");
      }
    } catch {
      alert("Failed to signup. Email already exists or unforeseen error.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-100 via-white to-green-100 px-0">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl mx-4 p-12 flex flex-col">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-4xl font-extrabold text-emerald-700 flex gap-2 items-center">
            <span role="img" aria-label="wheel">🛞</span> Join CarpoolConnect
          </h2>
          <button
            onClick={() => navigate("/")}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={28} />
          </button>
        </div>
        {/* Guidance */}
        <div className="w-full bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-8 text-base shadow">
          <strong>Safety Notice:</strong> Please provide a valid and accessible <span className="font-semibold">Emergency Email</span>. This address may be used to contact you or your emergency contact during emergencies or account recovery.
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input
              type="text"
              value={signupData.firstName}
              onChange={(e) => handleSignupChange("firstName", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
              placeholder="First Name"
            />
            <input
              type="text"
              value={signupData.lastName}
              onChange={(e) => handleSignupChange("lastName", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
              placeholder="Last Name"
            />
            <input
              type="tel"
              value={signupData.phoneNumber}
              onChange={(e) => handleSignupChange("phoneNumber", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
              placeholder="Phone Number"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <input
                type="email"
                value={signupData.email}
                onChange={(e) => handleSignupChange("email", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
                placeholder="Email"
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={sendOtp}
                  className="bg-emerald-500 text-white px-4 py-2 rounded disabled:opacity-60"
                  disabled={!signupData.email || (otpSent && resendTimeout > 0)}
                >
                  {otpSent && resendTimeout > 0
                    ? `Resend OTP (${resendTimeout}s)`
                    : otpSent
                    ? "Resend OTP"
                    : "Send OTP"}
                </button>
                {otpSent && !otpVerified && (
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={otp}
                        maxLength={6}
                        onChange={e => setOtp(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg w-36"
                        placeholder="Enter OTP"
                      />
                      <button
                        type="button"
                        onClick={verifyOtp}
                        className="bg-emerald-600 text-white px-4 py-2 rounded"
                      >
                        Verify OTP
                      </button>
                    </div>
                  </div>
                )}
                {otpVerified && (
                  <span className="text-green-600 font-medium ml-2">
                    ✔ Verified
                  </span>
                )}
              </div>
            </div>
            <input
              type="email"
              value={signupData.emergencyEmail || ""}
              onChange={e => handleSignupChange("emergencyEmail", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
              placeholder="Emergency Email (for notifications in critical situations)"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="password"
              value={signupData.password}
              onChange={(e) => handleSignupChange("password", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
              placeholder="Password"
            />
            <select
              value={signupData.role}
              onChange={(e) => handleSignupChange("role", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
            >
              <option value="">Select Role</option>
              <option value="RIDER">Rider</option>
              <option value="DRIVER">Driver</option>
            </select>
          </div>
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Preferences</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <select
                value={signupData.preferences.genderBased}
                onChange={(e) => handleSignupChange("preferences.genderBased", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Gender Based</option>
                <option value="MALE_ONLY">Male</option>
                <option value="FEMALE_ONLY">Female</option>
                <option value="NONE">None</option>
              </select>
              {["music", "smoking", "petFriendly", "ac"].map((pref) => (
                <select
                  key={pref}
                  value={signupData.preferences[pref]}
                  onChange={(e) =>
                    handleSignupChange(`preferences.${pref}`, e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">{pref.charAt(0).toUpperCase() + pref.slice(1)}</option>
                  <option value="YES">Yes</option>
                  <option value="NO">No</option>
                  <option value="NONE">None</option>
                </select>
              ))}
            </div>
          </div>
          {/* BUTTONS: Create + Google side by side */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-lg text-xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition"
              disabled={!otpVerified}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() =>
                window.location.href = GOOGLE_AUTH_URL
              }
              className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-800 border border-gray-300 py-3 rounded-lg shadow-sm hover:bg-gray-100 text-xl"
              style={{ minWidth: 0 }}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="h-5 w-5"
              />
              Sign up with Google
            </button>
          </div>
        </form>
        <div className="text-base text-gray-600 text-center mt-6">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-emerald-600 font-semibold"
            type="button"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;
