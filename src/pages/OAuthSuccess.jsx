import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    // console.log("OAuthSuccess token:", token);

    if (token) {
      localStorage.setItem("AuthToken", token);
      localStorage.setItem("role", "RIDER");
      console.log("Token stored. Redirecting to dashboard.");
      navigate("/dashboard");
    }
  }, [navigate]);

  return <div className="text-center mt-10 text-xl font-medium">Logging you in...</div>;
}

export default OAuthSuccess;
