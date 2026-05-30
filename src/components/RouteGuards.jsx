import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { VERIFY_TOKEN } from "../utils/apis";

function getRedirectPath(role) {
    return role === "ADMIN" ? "/admin" : "/dashboard";
}

export function RequireAuth({ children, allowedRoles }) {
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        const verifySession = async () => {
            const token = localStorage.getItem("AuthToken");
            const role = localStorage.getItem("role");

            if (!token) {
                setStatus("unauthenticated");
                return;
            }

            if (allowedRoles && role && !allowedRoles.includes(role)) {
                setStatus("unauthorized");
                return;
            }

            try {
                await axios.post(VERIFY_TOKEN, { token });
                setStatus("authenticated");
            } catch {
                localStorage.removeItem("AuthToken");
                localStorage.removeItem("role");
                setStatus("unauthenticated");
            }
        };

        verifySession();
    }, [allowedRoles]);

    if (status === "loading") {
        return <div className="min-h-screen flex items-center justify-center text-gray-600">Checking session...</div>;
    }

    if (status !== "authenticated") {
        return <Navigate to="/" replace />;
    }

    return children;
}

export function PublicOnly({ children }) {
    const token = localStorage.getItem("AuthToken");
    const role = localStorage.getItem("role");

    if (token) {
        return <Navigate to={getRedirectPath(role)} replace />;
    }

    return children;
}