import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiMail, FiVideo } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/10 pt-10 pb-6 relative z-10">
      <div className="container mx-auto px-6">
        
        {/* Compact Grid: 2 Cols on Mobile, 4 on Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-10">
          
          {/* BRAND */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-serif font-bold text-primary tracking-wider">AURA</span>
            </Link>
            <p className="text-gray-500 text-xs leading-relaxed max-w-xs">
              Redefining fast dining art.
            </p>
          </div>

          {/* EXPLORE */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Explore</h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li><Link to="/menu" className="hover:text-primary">Menu</Link></li>
              <li><Link to="/deals" className="hover:text-primary">Deals</Link></li>
              <li><Link to="/locations" className="hover:text-primary">Locations</Link></li>
            </ul>
          </div>

          {/* LEGAL */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Legal</h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li><Link to="/terms" className="hover:text-primary">Terms</Link></li>
              <li><Link to="/privacy" className="hover:text-primary">Privacy</Link></li>
              <li><Link to="/cookies" className="hover:text-primary">Cookies</Link></li>
            </ul>
          </div>

          {/* CONNECT */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-white font-bold text-sm mb-4">Connect</h4>
            <div className="flex gap-3">
              {[FiMail, FiInstagram, FiVideo, FiFacebook].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:text-black transition-all">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="border-t border-white/5 pt-6 text-center">
          <p className="text-gray-600 text-[10px] uppercase tracking-wider">
            © 2026 Aura-Taste Inc. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}