import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';

const LegalPage = () => {
  const location = useLocation();
  let title = '';
  let content = '';

  switch (location.pathname) {
    case '/privacy-policy':
      title = 'Privacy Policy';
      content = `At Mye3 e-Tuitions, we take your privacy seriously. This Privacy Policy outlines how we collect, use, and protect your personal information...
      
(Please add your official privacy policy content here.)`;
      break;
    case '/refund-policy':
      title = 'Refund Policy';
      content = `We want you to be completely satisfied with your Mye3 e-Tuitions experience. If you are not satisfied, please review our refund conditions...
      
(Please add your official refund policy content here.)`;
      break;
    case '/terms-and-conditions':
      title = 'Terms & Conditions';
      content = `Welcome to Mye3 e-Tuitions. By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement...
      
(Please add your official terms and conditions content here.)`;
      break;
    case '/disclaimer':
      title = 'Disclaimer';
      content = `The information provided by Mye3 e-Tuitions on this website is for general informational purposes only...
      
(Please add your official disclaimer content here.)`;
      break;
    default:
      title = 'Legal Information';
      content = 'Legal documentation.';
  }

  return (
    <div className="bg-[#fcfcfd] min-h-screen font-sans">
      <div className="bg-[#002147] py-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500 rounded-full blur-[140px] -mr-64 -mt-64 opacity-20 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">{title}</h1>
          <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full" />
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
