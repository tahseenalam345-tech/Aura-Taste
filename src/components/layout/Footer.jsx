import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiMail, FiVideo } from 'react-icons/fi';
// Note: FiVideo is used as a placeholder for TikTok style, or you can use FaTiktok if you install react-icons/fa

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050505] border-t border-white/10 pt-20 pb-10">
      <div className="container mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          
          {/* COL 1: BRAND */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-serif font-bold text-primary tracking-wider">
                AURA
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Redefining the art of fast dining.
            </p>
          </div>

          {/* COL 2: EXPLORE */}
          <div>
            <h4 className="text-white font-bold mb-6">Explore</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link to="/menu" className="hover:text-primary transition-colors">Menu</Link></li>
              <li><Link to="/story" className="hover:text-primary transition-colors">Our Story</Link></li>
              <li><Link to="/locations" className="hover:text-primary transition-colors">Locations</Link></li>
            </ul>
          </div>

          {/* COL 3: LEGAL */}
          <div>
            <h4 className="text-white font-bold mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

          {/* COL 4: CONNECT (Gmail, Insta, TikTok, FB) */}
          <div>
            <h4 className="text-white font-bold mb-6">Connect</h4>
            <div className="flex gap-4">
              {/* Gmail */}
              <a href="mailto:info@aurataste.com" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:text-black transition-all">
                <FiMail size={18} />
              </a>
              {/* Instagram */}
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:text-black transition-all">
                <FiInstagram size={18} />
              </a>
              {/* TikTok (Using Video Icon as generic placeholder if FaTiktok isn't installed) */}
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:text-black transition-all">
                <FiVideo size={18} />
              </a>
              {/* Facebook */}
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:text-black transition-all">
                <FiFacebook size={18} />
              </a>
            </div>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-gray-600 text-xs uppercase tracking-wider">
            © 2026 aura-taste inc. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}