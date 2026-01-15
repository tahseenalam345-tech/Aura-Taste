import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiGoogle } from 'react-icons/fi'; // Using FiGoogle or generic G icon

export default function Login() {
  const { loginWithGoogle, login, signup } = useAuth();
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (e) {
      toast.error("Google Login Failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        await signup(email, password);
        toast.success("Account Created!");
      } else {
        await login(email, password);
        toast.success("Logged In!");
      }
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-[#111] p-8 rounded-2xl border border-white/10 shadow-2xl">
        <h2 className="text-3xl font-serif font-bold text-center text-white mb-2">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-center text-gray-500 mb-8 text-sm">Join Aura for exclusive deals</p>

        {/* GOOGLE BUTTON */}
        <button 
          onClick={handleGoogle} 
          className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-3 mb-6 hover:bg-gray-200 transition-colors"
        >
          <FiGoogle /> Continue with Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-gray-500 text-xs">OR</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email Address" 
            className="w-full bg-black border border-white/10 rounded-xl p-4 text-white outline-none focus:border-primary"
            value={email} onChange={e => setEmail(e.target.value)} required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full bg-black border border-white/10 rounded-xl p-4 text-white outline-none focus:border-primary"
            value={password} onChange={e => setPassword(e.target.value)} required 
          />
          <button type="submit" className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:bg-yellow-400 transition-colors shadow-lg">
            {isSignup ? "SIGN UP" : "LOGIN"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          {isSignup ? "Already have an account?" : "Don't have an account?"} 
          <button onClick={() => setIsSignup(!isSignup)} className="text-primary font-bold ml-2 hover:underline">
            {isSignup ? "Login" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}