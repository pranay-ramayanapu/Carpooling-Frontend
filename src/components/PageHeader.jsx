import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function PageHeader({ title, description, backTo = "/dashboard", backLabel = "Back to Dashboard" }) {
    const navigate = useNavigate();
    return (
        <div className="mb-8">
            <button
                type="button"
                onClick={() => navigate(backTo)}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50"
            >
                <ArrowLeft size={16} />
                {backLabel}
            </button>

            <div className="mt-5 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-6 text-white shadow-lg">
                <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
                {description && <p className="mt-2 max-w-3xl text-sm text-emerald-50/90 md:text-base">{description}</p>}
            </div>
        </div>
    );
}

export default PageHeader;