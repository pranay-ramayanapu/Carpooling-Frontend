import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { GOOGLE_AUTH_URL, SIGNUP_URL, VERIFY_EMAIL, VERIFY_OTP } from "../utils/apis";
import axios from "axios";
import PageHeader from "../components/PageHeader";
import { showError, showSuccess } from "../utils/notify";

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
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

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
      setFormError("Please enter your email to get OTP.");
      return;
    }
    setFormError("");
    setIsSendingOtp(true);
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
      showSuccess("OTP sent. Check your email.");
      startResendTimeout();
    } catch {
      showError("Could not send OTP. Try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    setIsVerifyingOtp(true);
    try {
      const res = await axios.post(
        VERIFY_OTP,
        { email: signupData.email, otp }
      );
      if (res.status === 200) {
        setOtpVerified(true);
        showSuccess("OTP verification successful.");
        setFormError("");
      } else {
        throw new Error();
      }
    } catch {
      setFormError("Invalid or expired OTP.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
      setFormError("Please verify your OTP before signing up.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);
    try {
      const response = await axios.post(SIGNUP_URL, signupData);
      if (response.status === 200) {
        showSuccess("Successfully signed up!");
        localStorage.setItem("AuthToken", response.data.jwtToken);
        localStorage.setItem("role", response.data.role);
        navigate("/dashboard");
      } else if (response.status === 403) {
        setFormError("Email already exists, please try again.");
      } else {
        setFormError("Failed to signup, please try again.");
      }
    } catch {
      setFormError("Failed to signup. Email already exists or unforeseen error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 px-4 py-8">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl mx-auto p-6 md:p-10 flex flex-col border border-emerald-100">
        <PageHeader
          title="Join CarpoolConnect"
          description="Create your account, verify your email, and choose whether you are a rider or driver."
          backTo="/"
          backLabel="Back to Home"
        />
        {formError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {formError}
          </div>
        )}
        {/* Guidance */}
        <div className="w-full bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-2xl mb-8 text-base shadow-sm">
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
                  className="bg-emerald-500 text-white px-4 py-2 rounded disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  disabled={!signupData.email || (otpSent && resendTimeout > 0) || isSendingOtp}
                >
                  {isSendingOtp ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending...
                    </>
                  ) : otpSent && resendTimeout > 0
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
                        disabled={isVerifyingOtp}
                        className="bg-emerald-600 text-white px-4 py-2 rounded disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center gap-2"
                      >
                        {isVerifyingOtp ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Verify OTP"
                        )}
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
              disabled={!otpVerified || isSubmitting}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Creating...
                </span>
              ) : (
                "Create Account"
              )}
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
