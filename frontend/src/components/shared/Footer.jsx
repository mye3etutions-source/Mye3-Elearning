import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiArrowRight,
} from 'react-icons/hi';
import footerLogo from '../../assets/output-onlinepngtools.png';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaTwitter,
} from 'react-icons/fa';

const Footer = () => {
  const [email, setEmail] = useState('');

  return (
    <footer className="bg-[#002147] text-white border-t border-slate-100 transition-colors duration-300">

      {/* ── Scrolling Rating Ticker — hidden on mobile ── */}
      <div
        className="hidden md:block w-full py-3 overflow-hidden border-b border-white/10"
        style={{ background: '#001a38' }}
      >
        <div className="flex whitespace-nowrap" style={{ animation: 'marquee 14s linear infinite' }}>
          {/* Duplicate the list twice for seamless loop */}
          {[...Array(2)].map((_, rep) => (
            <div key={rep} className="flex shrink-0 items-center">
              {[
                'QUALITY TEACHER ⭐ 4.9/5',
                'PUNCTUALITY AND PROFESSIONALISM ⭐ 4.8/5',
                'STUDENT SATISFACTION ⭐ 4.9/5',
                'SEAMLESS LEARNING EXPERIENCE ⭐ 5/5',
                'PERSONALIZED ATTENTION ⭐ 4.7/5',
                'ENGAGING TEACHING ⭐ 5/5',
              ].map((text, i) => (
                <span key={i} className="flex items-center gap-6">
                  <span className="font-black text-[12px] md:text-[13px] uppercase tracking-widest px-8 text-indigo-200">
                    {text}
                  </span>
                  <span className="text-white/20 text-lg">|</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* ── Main Footer Content ── */}
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-4 md:py-16 grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-8">
        
        {/* Column 1 & 2: Logo, Tagline, Socials */}
        <div className="lg:col-span-2 space-y-1 md:space-y-6 lg:pr-10">
          <Link to="/" className="block mx-auto md:mx-0 w-fit">
            <img
              src={footerLogo}
              alt="e-Tuitions Logo"
              className="w-[120px] md:w-[240px] h-auto drop-shadow-md hover:scale-[1.03] transition-transform"
            />
          </Link>
          <p className="font-bold text-[10px] md:text-[14px] leading-relaxed text-indigo-100/70 max-w-md text-center md:text-left">
            We dream to find the solution to every challenge which students come across,
            while taking online classes. Providing quality classes seamlessly.
          </p>
          
          {/* Social icons */}
          <div className="mt-2 md:mt-0">
            <div className="flex items-center justify-center md:justify-start gap-2 md:gap-3">
              {[
                { Icon: FaFacebookF, href: '#' },
                { Icon: FaInstagram, href: '#' },
                { Icon: FaTwitter, href: '#' },
                { Icon: FaLinkedinIn, href: '#' },
                { Icon: FaYoutube, href: '#' },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white opacity-80 hover:opacity-100 hover:-translate-y-1 transition-all text-xs md:text-[15px] border border-white/20 hover:border-white/50 bg-white/5 hover:bg-white/10 shadow-sm"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Columns 3-5: Links + Quick Links + Contact — 2 col on mobile */}
        <div className="grid grid-cols-2 lg:col-span-3 lg:grid-cols-3 gap-4 md:gap-8">

          {/* Column 3: Links — desktop only */}
          <div className="hidden md:block">
            <h4 className="text-[14px] font-black mb-5 uppercase tracking-wider text-white">Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'Book Classes', to: '/register' },
                { label: 'Online Classes', to: '/courses' },
                { label: 'Explore Teachers', to: '/courses' },
                { label: 'Group & Private Classes', to: '/courses' },
                { label: 'Contact Us', to: '/contact-us' },
                { label: 'How To Register', to: '/register' }
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    to={item.to}
                    className="text-[13px] transition-colors font-medium text-indigo-100/60 hover:text-white flex items-center gap-1 group"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Quick Links */}
          <div>
            <h4 className="text-[14px] font-black mb-5 uppercase tracking-wider text-white">Quick Links</h4>

            {/* Mobile: Navbar page links (no Contact Us) */}
            <ul className="md:hidden space-y-2">
              {[
                { label: 'Home', to: '/' },
                { label: 'Tuitions', to: '/courses' },
                { label: 'Teachers', to: '/teachers' },
                { label: 'About Us', to: '/about' },
                { label: 'FAQs', to: '/faqs' },
              ].map((item, i) => (
                <li key={i}>
                  <Link to={item.to} className="text-[10px] transition-colors font-bold text-indigo-100/60 hover:text-white uppercase tracking-wider">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Desktop: Original quick links */}
            <ul className="hidden md:block space-y-3">
              {[
                { label: 'About Us', to: '/about' },
                { label: 'Privacy Policy', to: '/' },
                { label: 'Refund Policy', to: '/' },
                { label: 'Terms & Conditions', to: '/' },
                { label: 'Disclaimer', to: '/' },
                { label: 'Join As Teacher', to: '/register' }
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    to={item.to}
                    className="text-[13px] transition-colors font-medium text-indigo-100/60 hover:text-white flex items-center gap-1 group"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Contact Us */}
          <div className="lg:col-span-1">
            <h4 className="text-[14px] font-black mb-5 uppercase tracking-wider text-white">Contact Us</h4>
            <ul className="space-y-3.5 md:space-y-4 relative z-10">
              <li className="flex items-center gap-3">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center shrink-0 bg-white/10 text-white border border-white/5">
                  <HiOutlinePhone className="text-sm md:text-[15px]" />
                </div>
                <span className="text-[11px] md:text-[14px] font-bold text-indigo-100/70 leading-none whitespace-nowrap">+91 99126 71666</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center shrink-0 bg-white/10 text-white border border-white/5">
                  <HiOutlineMail className="text-sm md:text-[15px]" />
                </div>
                <span className="text-[11px] md:text-[14px] font-bold text-indigo-100/70 leading-none break-all">mye3etutions@gmail.com</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center shrink-0 bg-white/10 text-white border border-white/5">
                  <HiOutlineLocationMarker className="text-sm md:text-[15px]" />
                </div>
                <span className="text-[11px] md:text-[14px] font-bold text-indigo-100/70 leading-snug">Eluru, AP - 534002</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Email Subscribe — below grid, centered on mobile */}
        <div className="mt-6 md:hidden flex items-center border rounded-lg overflow-hidden border-white/20 hover:border-white/40 transition-colors shadow-sm bg-black/20">
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 text-[13px] outline-none placeholder-white/40 bg-transparent text-white w-full min-w-[50px]"
          />
          <button
            className="px-4 py-3 text-white flex shrink-0 items-center justify-center hover:opacity-90 transition-opacity"
            style={{ background: '#f97316' }}
          >
            <HiArrowRight className="text-lg" />
          </button>
        </div>

      </div>{/* end outer grid */}

      {/* ── Bottom Bar ── */}
      <div className="border-t pt-4 pb-20 md:py-5 px-6 md:px-10 text-center border-white/10">
        <p className="text-[10px] md:text-[12px] font-bold text-white/30 uppercase tracking-widest">
          © Copyright 2026 Mye3 e-Tuitions All Rights Reserved. <span className="mx-1 text-orange-500 font-black">|</span> Designed By <a href="https://webnappstudio.in/index.html" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors font-black">WebnApp Studio</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
