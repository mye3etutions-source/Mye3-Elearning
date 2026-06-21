import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiMail } from 'react-icons/fi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/auth/forgotpassword', { email: email.toLowerCase() });
      if (res.data.success) {
        setIsSent(true);
        toast.success('Password reset link sent to your email!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-800 mb-2">Forgot Password</h2>
          <p className="text-sm font-bold text-slate-400">
            {isSent 
              ? 'Check your email for the reset link.' 
              : 'Enter your email to receive a password reset link.'}
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-5 py-4 pl-12 rounded-2xl border-2 border-slate-50 focus:border-indigo-500 bg-slate-50 outline-none font-black text-slate-800 text-sm transition-colors"
                  required
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                  <FiMail size={20} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-indigo-200 active:scale-95 disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'SEND RESET LINK'
              )}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
              <FiMail size={40} />
            </div>
            <p className="text-center font-bold text-slate-600 mb-8">
              We've sent an email to <span className="text-slate-800">{email}</span> with a link to reset your password.
            </p>
            <button
              onClick={() => setIsSent(false)}
              className="text-sm font-bold text-indigo-600 hover:underline"
            >
              Try another email address
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Remember your password?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-800 underline">
              Login Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
