import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Mail, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative text-slate-300">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0B1E33]" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-[radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.18),transparent_60%)]" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="text-2xl font-bold text-white">FitMe+</div>
            <p className="mt-3 text-slate-400">Built to keep you in a healthy flow. AI Coach, Workouts, and Nutrition that fit your lifestyle.</p>

            <div className="mt-6 flex items-center gap-5 text-slate-300">
              <a href="mailto:support@fitme.app" className="hover:text-white" aria-label="Email"><Mail className="w-5 h-5" /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white" aria-label="Instagram"><Instagram className="w-5 h-5" /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white" aria-label="X/Twitter"><Twitter className="w-5 h-5" /></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white" aria-label="LinkedIn"><Linkedin className="w-5 h-5" /></a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-white" aria-label="YouTube"><Youtube className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Columns */}
          <div className="md:col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Product</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li><RouterLink to="/dashboard" className="hover:text-white">Dashboard</RouterLink></li>
              <li><RouterLink to="/dashboard/aicoach" className="hover:text-white">AI Coach</RouterLink></li>
              <li><RouterLink to="/dashboard/workouts" className="hover:text-white">Workouts</RouterLink></li>
              <li><RouterLink to="/dashboard/nutrition" className="hover:text-white">Nutrition</RouterLink></li>
              <li><RouterLink to="/dashboard/progress" className="hover:text-white">Progress</RouterLink></li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Capabilities</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="hover:text-white"><span>Personalized Plans</span></li>
              <li className="hover:text-white"><span>AI Meal Suggestions</span></li>
              <li className="hover:text-white"><span>Workout Generator</span></li>
              <li className="hover:text-white"><span>Progress Tracking</span></li>
              <li className="hover:text-white"><span>Reminders</span></li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Company</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li><RouterLink to="/" className="hover:text-white">About Us</RouterLink></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
              <li><RouterLink to="/dashboard/settings" className="hover:text-white">Contact</RouterLink></li>
              <li><a href="#" className="hover:text-white">Partnerships</a></li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Resources</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li><a href="#" className="hover:text-white">Docs</a></li>
              <li><a href="#" className="hover:text-white">Changelog</a></li>
              <li><a href="#" className="hover:text-white">Support</a></li>
              <li><a href="#" className="hover:text-white">Feature Requests</a></li>
              <li><a href="#" className="hover:text-white">Directory</a></li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Connect</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li><RouterLink to="/login" className="hover:text-white">Login</RouterLink></li>
              <li><RouterLink to="/register" className="hover:text-white">Create Account</RouterLink></li>
              <li><RouterLink to="/dashboard/settings" className="hover:text-white">Contact</RouterLink></li>
              <li><a href="#" className="hover:text-white">Community</a></li>
              <li><a href="#" className="hover:text-white">Students</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} FitMe. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <span className="opacity-30">•</span>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <span className="opacity-30">•</span>
            <a href="#" className="hover:text-white">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
