import React from "react";
import { Link } from "react-router-dom";
import { ScanLine, Mail, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Updated Header with mobile responsiveness */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <ScanLine className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span className="font-bold text-lg sm:text-xl text-primary">ConnectMatic</span>
            </div>
            <span className="text-xs text-gray-500 hidden sm:block">Powered by A.khafar Solutions</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/login" className="text-sm sm:text-base text-gray-700 hover:text-primary font-medium">
              Sign In
            </Link>
            <Link to="/register">
              <Button className="text-sm sm:text-base" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="bg-gradient-to-r from-primary to-secondary/90 text-white py-32 sm:py-80"
        style={{
          backgroundImage: "url('https://res.cloudinary.com/ddkkfumkl/image/upload/v1743697394/freepik__the-style-is-candid-image-photography-with-natural__18214_ijiiqz.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-md">
              Automate Your Networking Follow-ups
            </h1>
            <p className="text-lg sm:text-xl mb-8 text-white/90 drop-shadow-sm">
              Scan business cards, add quick notes, and generate personalized follow-up emails—all in one seamless workflow.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100 hover:text-primary">
                  Start for Free
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Why Professionals Choose ConnectMatic</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Never miss a valuable connection again. Our all-in-one networking tool helps you build and maintain relationships effortlessly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <ScanLine className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Business Card Scanning</h3>
              <p className="text-gray-600">
                Instantly capture contact details from business cards using your device's camera and OCR technology.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI-Powered Emails</h3>
              <p className="text-gray-600">
                Generate personalized follow-up emails based on your meeting notes with our advanced AI technology.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Contact Management</h3>
              <p className="text-gray-600">
                Organize and manage your professional network with a powerful yet simple contact database.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Trusted by Professionals</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of business professionals who have streamlined their networking process.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500" fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "ConnectMatic has completely transformed how I follow up after networking events. It's saved me countless hours and helped me close more deals."
              </p>
              <div className="font-medium">Dr. Adan Siyat</div>
              <div className="text-sm text-gray-500">CEO, Biogex Pharma</div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500" fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "As a consultant attending multiple events each month, keeping track of new contacts was a nightmare until I found ConnectMatic."
              </p>
              <div className="font-medium">Abdikhafar Issack</div>
              <div className="text-sm text-gray-500">Founder, A.khafar Solutions</div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500" fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "The AI-generated follow-up emails are so well-written, they've increased my response rate by 40%. An absolute game-changer!"
              </p>
              <div className="font-medium">John Doe</div>
              <div className="text-sm text-gray-500">Marketing Manager, Globex</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-primary to-secondary/90 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Revolutionize Your Networking?</h2>
          <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join ConnectMatic today and never let a valuable connection slip away again.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 hover:text-primary">
                Start Your Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Column 1 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ScanLine className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl text-white">ConnectMatic</span>
              </div>
              <p className="text-sm text-gray-300 mb-4 ml-8">
                Powered by <span className="font-semibold">A.khafar Solutions</span>
              </p>
              <p className="mb-4">
                Automating your networking follow-ups so you can focus on building relationships.
              </p>
            </div>

            {/* Column 2 */}
            <div>
              <h3 className="font-bold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/features" className="hover:text-white">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/use-cases" className="hover:text-white">Use Cases</Link></li>
                <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h3 className="font-bold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h3 className="font-bold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="/cookies" className="hover:text-white">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} ConnectMatic. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;