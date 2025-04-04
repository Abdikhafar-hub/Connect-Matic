
import React from "react";
import LoginForm from "@/components/LoginForm";
import { ScanLine } from "lucide-react";

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="w-full max-w-4xl grid md:grid-cols-2 shadow-lg rounded-lg overflow-hidden">
        <div className="hidden md:flex bg-gradient-to-br from-primary to-primary-light flex-col justify-center items-center p-12 text-white">
          <ScanLine className="w-16 h-16 mb-6" />
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-center opacity-90">
            Log in to ConnectMatic and continue managing your networking follow-ups efficiently.
          </p>
        </div>
        <div className="bg-white p-4 md:p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
