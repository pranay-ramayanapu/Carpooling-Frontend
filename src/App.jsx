import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/landing";
import Login from "./pages/login";
import Signup from "./pages/signup";
import { Notifications } from "@mantine/notifications";
import { MantineProvider } from "@mantine/core";
import { createContext } from "react";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import SearchRides from "./pages/searchrides";
import RideCreation from "./pages/ridecreation";
import IncomingRequests from "./pages/incomingrequest";
import MyBookings from "./pages/mybookings";
import UserProfile from "./pages/userprofile";
import BookingDetails from "./pages/bookingdetails";
import DriverRides from "./pages/driverrides";
import RideDetails from "./pages/ridedetails";
import SosAlerts from "./pages/sosalerts";
import OAuthSuccess from "./pages/OAuthSuccess";
import AddAuthorities from "./pages/AddAUthorites";
import DashboardAdmin from "./pages/dashboard_admin";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminRides from "./pages/AdminRides.jsx";
import AdminAnalytics from "./pages/AdminAnalytics.jsx";
import FailedEmailsAdmin from "./pages/FailedEmails.jsx";
import ChatBotModal from "./pages/ChatBotModel.jsx";
import { PublicOnly, RequireAuth } from "./components/RouteGuards.jsx";


export const AuthContext = createContext();
function DashboardEntry() {
  const role = localStorage.getItem("role");

  if (role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return <Dashboard />;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("AuthToken");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Notifications />
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
          <Route path="/signup" element={<PublicOnly><Signup backTo="/" backLabel="Back to Home" /></PublicOnly>} />
          <Route path='/dashboard' element={<RequireAuth><DashboardEntry /></RequireAuth>} />
          <Route path="/search" element={<RequireAuth><SearchRides /></RequireAuth>} />
          <Route path="/create/:rideId" element={<RequireAuth allowedRoles={['DRIVER']}><RideCreation /></RequireAuth>} />
          <Route path="/create" element={<RequireAuth allowedRoles={['DRIVER']}><RideCreation /></RequireAuth>} />
          <Route path="/incoming" element={<RequireAuth allowedRoles={['DRIVER']}><IncomingRequests /></RequireAuth>} />
          <Route path="/mybookings" element={<RequireAuth><MyBookings /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><UserProfile /></RequireAuth>} />
          <Route path="/my-bookings/:id" element={<RequireAuth><BookingDetails /></RequireAuth>} />
          <Route path="/ride-details/:id" element={<RequireAuth><RideDetails /></RequireAuth>} />
          <Route path="/driver-rides" element={<RequireAuth allowedRoles={['DRIVER']}><DriverRides /></RequireAuth>} />
          <Route path="/alerts" element={<RequireAuth allowedRoles={['DRIVER', 'ADMIN']}><SosAlerts /></RequireAuth>} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/admin/authorities" element={<RequireAuth allowedRoles={['ADMIN']}><AddAuthorities /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth allowedRoles={['ADMIN']}><DashboardAdmin /></RequireAuth>} />
          <Route path="/admin/users" element={<RequireAuth allowedRoles={['ADMIN']}><AdminUsers /></RequireAuth>} />
          <Route path="/admin/rides" element={<RequireAuth allowedRoles={['ADMIN']}><AdminRides /></RequireAuth>} />
          <Route path="/admin/analytics" element={<RequireAuth allowedRoles={['ADMIN']}><AdminAnalytics /></RequireAuth>} />
          <Route path="/admin/emails" element={<RequireAuth allowedRoles={['ADMIN']}><FailedEmailsAdmin /></RequireAuth>} />
        </Routes>
      </Router>
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-700 shadow-xl flex items-center justify-center text-3xl hover:scale-105 transition-transform z-40 border-4 border-white"
        aria-label="Open ChatBot"
      >
        <span role="img" aria-label="Robot Bot">🤖</span>
      </button>

      {/* Chatbot modal */}
      <ChatBotModal open={chatOpen} onClose={() => setChatOpen(false)} />
    </MantineProvider>
  );
}

export default App;
