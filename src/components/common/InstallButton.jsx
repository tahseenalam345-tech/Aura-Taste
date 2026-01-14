import { useEffect, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsVisible(false); // Hide button after install
    }
    
    setDeferredPrompt(null);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          onClick={handleInstallClick}
          className="fixed bottom-6 right-6 z-[100] bg-primary text-black font-bold px-6 py-3 rounded-full shadow-2xl shadow-primary/30 flex items-center gap-2 hover:scale-105 transition-transform uppercase tracking-widest text-xs border-2 border-transparent hover:border-white"
        >
          <FiDownload size={18} />
          Install App
        </motion.button>
      )}
    </AnimatePresence>
  );
}