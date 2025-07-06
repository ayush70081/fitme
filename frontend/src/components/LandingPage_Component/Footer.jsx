export default function Footer() {
  return (
    <footer className="bg-prime-blue text-gray-200 py-10 px-6 md:px-12 ">
      <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-3 text-center md:text-left">
        
        {/* Company Info */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">FitTrack</h3>
          <p className="text-sm">
            Your personal AI-powered fitness companion. Track. Improve. Repeat.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-2">Quick Links</h4>
          <ul className="space-y-1 text-sm">
            <li><a href="#" className="hover:text-white transition">Home</a></li>
            <li><a href="#" className="hover:text-white transition">Features</a></li>
            <li><a href="#" className="hover:text-white transition">FAQs</a></li>
            <li><a href="#" className="hover:text-white transition">Contact</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-2">Get in Touch</h4>
          <ul className="space-y-1 text-sm">
            <li>Email: support@fittrack.ai</li>
            <li>Phone: +1 234 567 8901</li>
            <li>Address: 123 Fit Avenue, Wellness City</li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-8 border-t border-white/10 pt-4 text-center text-xs text-gray-400">
        <p>© {new Date().getFullYear()} FitTrack. All rights reserved.</p>
        <p className="mt-1">
          Built with 💙 for a healthier tomorrow.
        </p>
      </div>
    </footer>
  );
}
