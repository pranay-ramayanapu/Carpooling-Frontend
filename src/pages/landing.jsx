import React, { useEffect, useState } from "react";
import {
  Car,
  Users,
  MapPin,
  ArrowRight,
  Menu,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { VERIFY_TOKEN } from "../utils/apis";
import axios from "axios";

function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("AuthToken");
      setIsLoggedIn(!!token);

      if (token) {
        try {
          const res = await axios.post(VERIFY_TOKEN, { token });
          if (res.status === 200) {
            setIsLoggedIn(true);
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem("AuthToken");
          setIsLoggedIn(false);
        }
      }
    };

    verifyToken();
  }, []);


  const handleLogout = () => {
    localStorage.removeItem("AuthToken");
    setIsLoggedIn(false);
    navigate("/");
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };



  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-2 rounded-lg">
                <Car className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">
                CarpoolConnect

              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {isLoggedIn ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  Dashboard
                </button>
              ) : (
                <a
                  href="#features"
                  className="text-gray-600 hover:text-emerald-600 transition-colors"
                >
                  Features
                </a>
              )}
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-emerald-600 transition-colors"
              >
                How It Works
              </a>
              {isLoggedIn ? (
                <a
                  className="text-gray-600 hover:text-emerald-600 transition-colors cursor-pointer"
                  onClick={() => navigate("/profile")}
                >
                  Profile
                </a>
              ) : (
                <a
                  href="#benefits"
                  className="text-gray-600 hover:text-emerald-600 transition-colors"
                >
                  Benefits
                </a>
              )}

              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 font-semibold"
                >
                  Logout
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200"
                  >
                    Sign Up
                  </button>
                </>
              )}

            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-gray-600 hover:text-emerald-600"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a
                  href="#features"
                  className="block px-3 py-2 text-gray-600 hover:text-emerald-600"
                  onClick={closeMenu}
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="block px-3 py-2 text-gray-600 hover:text-emerald-600"
                  onClick={closeMenu}
                >
                  How It Works
                </a>
                <a
                  href="#benefits"
                  className="block px-3 py-2 text-gray-600 hover:text-emerald-600"
                  onClick={closeMenu}
                >
                  Benefits
                </a>
                <button
                  onClick={() => {
                    closeMenu();
                    navigate("/login")
                  }}
                  className="block w-full text-left px-3 py-2 text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    closeMenu();
                    navigate("/signup");
                  }}
                  className="block w-full text-left px-3 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Share Rides,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-600">
                Save Money
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with fellow travelers, reduce costs, and make a positive
              impact on the environment. Our smart carpooling system matches you
              with the perfect ride.
            </p>
            <div className="mb-8 max-w-3xl mx-auto bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md text-sm text-left">
              <strong>Note:</strong> This project is hosted on a free Render server. The first request may take <strong>30–40 seconds</strong> to load as the server spins up. Subsequent interactions will be faster.
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  if (isLoggedIn) {
                    navigate("/dashboard");
                  } else {
                    navigate("/signup");
                  }
                }}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoggedIn ? "Go to Dashboard" : "Get Started"} <ArrowRight size={20} />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("how-it-works")}
                className="border-2 border-emerald-500 text-emerald-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-50 transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting started with CarpoolConnect is simple and straightforward
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <MapPin className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                1. Set Your Route
              </h3>
              <p className="text-gray-600">
                Enter your pickup and destination locations along with your
                preferred departure time.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                2. Find Your Match
              </h3>
              <p className="text-gray-600">
                Our intelligent system finds the best matches based on your
                route and preferences.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Car className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                3. Share & Save
              </h3>
              <p className="text-gray-600">
                Connect with your matched riders, share the ride, and save money
                while helping the environment.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-500 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join thousands of users who are already carpooling smarter, saving
            money, and helping the environment.
          </p>
          <button
            onClick={() => {
              if (isLoggedIn) {
                navigate("/dashboard");
              } else {
                navigate("/signup");
              }
            }}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoggedIn ? "Go to Dashboard" : "Get Started today"} <ArrowRight size={20} />
          </button>

        </div>
      </section>

    </div>
  );
}

export default Landing;
