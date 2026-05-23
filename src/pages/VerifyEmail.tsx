import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";

const API_BASE = import.meta.env.VITE_AZURE_API_BASE_URL || "/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      axios.get(`${API_BASE}/auth/verify-email?token=${token}`)
        .then(() => {
          setStatus("success");
          setMessage("Your email has been verified successfully!");
        })
        .catch((err) => {
          setStatus("error");
          setMessage(err.response?.data?.error || "Invalid or expired verification link.");
        });
    } else {
      setStatus("error");
      setMessage("Missing verification token.");
    }
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <img src={logo} alt="Sanku" className="h-12 w-auto mb-6" />
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Email Verification</h2>
        </div>

        <div className="bg-white py-8 px-6 shadow-sm border rounded-xl sm:px-10 text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center py-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-slate-600">Verifying your email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="py-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Verification Successful</h3>
              <p className="mt-2 text-sm text-slate-500">{message}</p>
              <Link to="/login" className="mt-6 block">
                <Button className="w-full">Continue to Sign In</Button>
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="py-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Verification Failed</h3>
              <p className="mt-2 text-sm text-slate-500">{message}</p>
              <Link to="/login" className="mt-6 block">
                <Button variant="outline" className="w-full">Back to Login</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
