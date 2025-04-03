import React from "react";
import RegisterForm from "@/components/RegisterForm";
import { ScanLine, Users, Mail } from "lucide-react";

const Register = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted px-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 shadow-lg rounded-lg overflow-hidden">
        <div className="hidden md:flex bg-gradient-to-br from-primary to-primary-light flex-col justify-center items-center p-12 text-white">
          <ScanLine className="w-16 h-16 mb-6" />
          <h1 className="text-3xl font-bold mb-2">Start Networking Smarter</h1>
          <p className="text-center opacity-90 mb-8">
            Create your ConnectMatic account and never miss a valuable connection again.
          </p>
          <div className="space-y-4 w-full">
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg">
              <Users className="w-6 h-6 flex-shrink-0" />
              <span>Easily manage all your networking contacts</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg">
              <ScanLine className="w-6 h-6 flex-shrink-0" />
              <span>Scan business cards with your device's camera</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg">
              <Mail className="w-6 h-6 flex-shrink-0" />
              <span>AI-generated personalized follow-up emails</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 md:p-8">
          <RegisterForm />
        </div>
      </div>

      {/* Footer message */}
      <p className="mt-6 text-sm text-gray-600 text-center">
        Made with <span className="text-red-500">❤️</span> by <strong>Abdikhafar</strong>
      </p>
    </div>
  );
};

export default Register;
