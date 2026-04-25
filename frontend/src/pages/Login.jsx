import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { setCredentials } from '../store/slices/authSlice';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import logoImg from '../assets/output-onlinepngtools.png';
import loginImg from '../assets/ChatGPT Image Mar 30, 2026, 01_51_09 AM.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', { email: email.toLowerCase(), password });
      const user = res.data;
      dispatch(setCredentials({ ...user }));
      
      const userRole = user?.role?.toLowerCase() || 'student';
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-white md:bg-sky-50 flex items-center justify-center p-0 md:p-4 overflow-hidden">
      <div className="max-w-4xl w-full h-full md:h-auto bg-white rounded-none md:rounded-[2rem] shadow-none md:shadow-2xl overflow-hidden flex flex-col lg:flex-row md:max-h-[90vh]">
        {/* Left Side: Form */}
        <div className="w-full lg:w-[45%] p-6 md:p-8 flex flex-col justify-between min-h-screen md:min-h-0 gap-2">
          <div className="space-y-3">
            <header className="flex justify-center w-full pb-4">
              <Link to="/" className="inline-block hover:scale-105 transition-transform duration-300">
                <img 
                  src={logoImg} 
                  alt="e-Tuitions Logo" 
                  className="h-20 md:h-24 object-contain"
                />
              </Link>
            </header>

            {/* Create Account Button Only */}
            <div className="grid grid-cols-1 gap-2">
              <Link 
                to="/register" 
                className="flex items-center justify-center w-full py-2.5 px-6 bg-slate-100 rounded-full font-bold text-slate-600 hover:bg-slate-200 transition-all text-sm"
              >
                Create Account
              </Link>
            </div>

            <div className="relative flex items-center justify-center uppercase py-1">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-3 text-[9px] font-black text-slate-300 tracking-widest whitespace-nowrap">
                or Sign in with Email
              </span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 text-center">
                {error}
              </div>
            )}

            <form onSubmit={submitHandler} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email</label>
                <input 
                  type="email" 
                  className="w-full px-5 py-3 rounded-xl border border-slate-100 focus:border-indigo-600 focus:bg-white bg-slate-50 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 text-sm"
                  placeholder="batukre312@|"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Password</label>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="w-full px-5 py-3 rounded-xl border border-slate-100 focus:border-indigo-600 focus:bg-white bg-slate-50 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 text-sm"
                    placeholder="Enter your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                <div className="flex justify-end pr-1">
                  <Link to="#" className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">Forget Password?</Link>
                </div>
              </div>
              
              <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all">
                Login
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Illustration */}
        <div 
          className="hidden lg:block w-[55%] relative bg-cover"
          style={{ 
            backgroundImage: `url("${loginImg}")`,
            backgroundPosition: 'center 10%'
          }}
        >
          {/* Decorative Overlay */}
          <div className="absolute inset-0 bg-indigo-600/5 mix-blend-overlay"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
