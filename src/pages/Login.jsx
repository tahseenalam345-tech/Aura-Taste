import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc'; // Run 'npm install react-icons' if you get an error, but you likely have it.

export default function Login() {
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleGoogle = async () => {
    await loginWithGoogle();
    navigate('/'); // Redirect to Home after login
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
        toast.success('Logged in successfully!');
      } else {
        await registerWithEmail(email, password);
        toast.success('Account created!');
      }
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white pt-24 px-4 flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 w-full max-w-md shadow-2xl">
        
        <h2 className="text-3xl font-bold text-center mb-2">
          {isLogin ? 'Welcome Back' : 'Join Aura Taste'}
        </h2>
        <p className="text-gray-400 text-center mb-8">
          {isLogin ? 'Login to continue your order' : 'Create an account to start ordering'}
        </p>

        {/* Google Button */}
        <button 
          onClick={handleGoogle}
          className="w-full bg-white text-black font-bold py-3 rounded-lg flex items-center justify-center gap-3 mb-6 hover:bg-gray-100 transition-colors"
        >
          <FcGoogle size={24} />
          Continue with Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-[1px] bg-gray-700 flex-1"></div>
          <span className="text-gray-500 text-sm">OR</span>
          <div className="h-[1px] bg-gray-700 flex-1"></div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-dark border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none transition-colors"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-dark border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none transition-colors"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          
          <button className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-yellow-500 transition-all mt-4">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        {/* Toggle Login/Signup */}
        <p className="text-center mt-6 text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-primary font-bold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}