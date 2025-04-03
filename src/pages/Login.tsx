import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "@/components/LoginForm";
import { ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted px-4">
      {/* Login card */}
      <div className="w-full max-w-4xl grid md:grid-cols-2 shadow-lg rounded-lg overflow-hidden">
        {/* Left section - Welcome */}
        <div className="hidden md:flex bg-gradient-to-br from-primary to-primary-light flex-col justify-center items-center p-12 text-white">
          <ScanLine className="w-16 h-16 mb-6" />
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-center opacity-90">
            Log in to ConnectMatic and continue managing your networking follow-ups efficiently.
          </p>
        </div>

        {/* Right section - Form */}
        <div className="bg-white p-4 md:p-8">
          <LoginForm />
        </div>
      </div>

      {/* Back to Home Button */}
      <Link to="/" className="mt-4">
        <Button variant="outline">← Back to Home</Button>
      </Link>

      {/* Footer message */}
      <p className="mt-6 text-sm text-gray-600 text-center">
        Made with <span className="text-red-500">❤️</span> by <strong>Abdikhafar</strong>
      </p>
    </div>
  );
};

export default Login;
