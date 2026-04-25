import React, { useState } from 'react';
import { FiSearch, FiPhone, FiMail, FiMapPin, FiSend } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/inquiries', {
        ...formData,
        source: 'Contact Page'
      });
      toast.success("Message Sent! We'll get back to you shortly.");
      setFormData({ name: '', email: '', mobile: '', subject: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
    }
  };

  return (
    <div className="bg-white font-sans w-full min-h-screen flex flex-col">
      {/* Top Search Strip (Consistent UI) */}
      <div className="bg-[#002147] py-3 md:py-[16px] px-3 md:px-4 w-full border-b border-[#001b3a]">
        <div className="max-w-[750px] mx-auto flex h-11 md:h-[52px] shadow-sm">
          <div className="flex-1 relative flex items-center bg-white rounded-l-md overflow-hidden">
            <FiSearch className="text-slate-400 w-4 h-4 md:w-[18px] md:h-[18px] ml-4 md:ml-5 flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Search..."
              className="w-full py-2 px-3 md:px-4 text-xs md:text-[15px] text-[#002147] outline-none h-full bg-transparent font-bold placeholder-slate-400"
            />
          </div>
          <button className="bg-[#f16126] text-white px-5 md:px-10 h-full text-[10px] md:text-[14px] font-black uppercase tracking-widest rounded-r-md hover:bg-[#de551e] transition-colors flex-shrink-0">
            Search
          </button>
        </div>
      </div>

      <div className="max-w-[1140px] mx-auto px-4 py-8 md:py-20 pb-12 md:pb-28 w-full">
        {/* Page Header */}
        <div className="text-center mb-8 md:mb-20 space-y-1.5 md:space-y-4">
          <h1 className="text-2xl md:text-[42px] font-black tracking-tighter uppercase text-[#002147]">
            Contact <span className="text-[#f16126]">Us</span>
          </h1>
          <p className="text-[#64748b] max-w-xl mx-auto text-[10px] md:text-[16px] leading-relaxed font-bold px-4">
            Got questions about our courses or need assistance? Reach out to us anytime.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 md:gap-16 items-start">
          {/* Left: Contact Info Column */}
          <div className="lg:w-[40%] w-full space-y-5 md:space-y-10">
            <div className="relative">
              <h2 className="text-lg md:text-[26px] font-black text-[#002147] uppercase tracking-tighter mb-1.5 md:mb-2">Get In Touch</h2>
              <div className="w-8 md:w-16 h-1 md:h-1.5 bg-[#f16126] rounded-full"></div>
            </div>

            <p className="text-[#64748b] font-bold text-[10px] md:text-[15px] leading-relaxed">
              We are here to support your learning journey every step of the way. Feel free to reach out.
            </p>

            <ul className="space-y-4 md:space-y-8">
              <li className="flex items-center gap-3.5 md:gap-5 group">
                <div className="w-9 h-9 md:w-14 md:h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-[#f16126] text-sm md:text-xl group-hover:bg-[#f16126] group-hover:text-white transition-all shadow-sm">
                  <FiPhone />
                </div>
                <div>
                  <h4 className="text-[8px] md:text-[13px] font-black text-[#002147] uppercase tracking-widest mb-0 md:mb-1">Phone</h4>
                  <p className="text-[11px] md:text-[15px] font-black text-slate-500">+91 99126 71666</p>
                </div>
              </li>

              <li className="flex items-center gap-3.5 md:gap-5 group">
                <div className="w-9 h-9 md:w-14 md:h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-[#f16126] text-sm md:text-xl group-hover:bg-[#f16126] group-hover:text-white transition-all shadow-sm">
                  <FiMail />
                </div>
                <div>
                  <h4 className="text-[8px] md:text-[13px] font-black text-[#002147] uppercase tracking-widest mb-0 md:mb-1">Email</h4>
                  <p className="text-[11px] md:text-[15px] font-black text-slate-500 text-xs md:text-base">mye3etutions@gmail.com</p>
                </div>
              </li>

              <li className="flex items-center gap-3.5 md:gap-5 group">
                <div className="w-9 h-9 md:w-14 md:h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-[#f16126] text-sm md:text-xl group-hover:bg-[#f16126] group-hover:text-white transition-all shadow-sm">
                  <FiMapPin />
                </div>
                <div>
                  <h4 className="text-[8px] md:text-[13px] font-black text-[#002147] uppercase tracking-widest mb-0 md:mb-1">Address</h4>
                  <p className="text-[11px] md:text-[15px] font-black text-slate-500 leading-snug">
                    Eluru, Andhra Pradesh - 534002
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Right: Contact Form Column */}
          <div className="lg:w-[60%] w-full relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#f16126] rounded-l-2xl md:hidden z-20 shadow-[0_0_15px_rgba(241,97,38,0.2)]" />
            
            <div className="bg-white p-5 md:p-10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-slate-100 relative z-10">
              <h3 className="text-base md:text-[20px] font-black text-[#002147] mb-5 md:mb-8 uppercase tracking-tighter">Send Us A Message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                  <div className="space-y-1 focus-within:text-[#f16126]">
                    <label className="text-[8px] md:text-[12px] font-black uppercase tracking-wider text-slate-400">Your Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Enter Full Name" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 md:py-3 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:border-[#f16126] focus:bg-white transition-all text-[10px] md:text-sm text-[#002147] font-bold placeholder-slate-400" 
                    />
                  </div>
                  <div className="space-y-1 focus-within:text-[#f16126]">
                    <label className="text-[8px] md:text-[12px] font-black uppercase tracking-wider text-slate-400">Your Email</label>
                    <input 
                      type="email" 
                      required
                      placeholder="Enter Email Address" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 md:py-3 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:border-[#f16126] focus:bg-white transition-all text-[10px] md:text-sm text-[#002147] font-bold placeholder-slate-400" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                  <div className="space-y-1 focus-within:text-[#f16126]">
                    <label className="text-[8px] md:text-[12px] font-black uppercase tracking-wider text-slate-400">Mobile No</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="+91 XXXXX" 
                      value={formData.mobile}
                      onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                      className="w-full px-4 py-2 md:py-3 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:border-[#f16126] focus:bg-white transition-all text-[10px] md:text-sm text-[#002147] font-bold placeholder-slate-400" 
                    />
                  </div>
                  <div className="space-y-1 focus-within:text-[#f16126]">
                    <label className="text-[8px] md:text-[12px] font-black uppercase tracking-wider text-slate-400">Subject</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Topic" 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-4 py-2 md:py-3 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:border-[#f16126] focus:bg-white transition-all text-[10px] md:text-sm text-[#002147] font-bold placeholder-slate-400" 
                    />
                  </div>
                </div>

                <div className="space-y-1 focus-within:text-[#f16126]">
                  <label className="text-[8px] md:text-[12px] font-black uppercase tracking-wider text-slate-400">Your Message</label>
                  <textarea 
                    rows="3"
                    required
                    placeholder="Write your query here..." 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-2 md:py-3 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:border-[#f16126] focus:bg-white transition-all text-[10px] md:text-sm text-[#002147] font-bold placeholder-slate-400"
                  ></textarea>
                </div>

                <button className="w-full bg-[#002147] text-white py-3 md:py-4 rounded-lg font-black text-[9px] md:text-[14px] uppercase tracking-widest flex items-center justify-center gap-2 md:gap-3 hover:bg-[#f16126] transition-all shadow-lg active:scale-95">
                  <FiSend className="text-xs md:text-lg" />
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Google Maps Placeholder */}
      <div className="w-full h-[450px] bg-slate-100 grayscale hover:grayscale-0 transition-all duration-700">
        <iframe 
          src="https://maps.google.com/maps?q=Eluru,%20Andhra%20Pradesh%20-%20534002&t=&z=13&ie=UTF8&iwloc=&output=embed" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen="" 
          loading="lazy"
          title="Mye3-e-Tuitions Office Map"
        ></iframe>
      </div>

      {/* Orange Banner (UI Consistency) */}
      <div className="bg-[#f06522] py-8 md:py-[55px] px-4">
        <div className="max-w-[1140px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-14">
          <div className="flex items-center gap-6 md:gap-14 md:w-3/4">
            {/* Perfectly matched bulb icon - Scaled for Mobile */}
            <div className="relative flex-shrink-0 w-12 h-12 md:w-[80px] md:h-[80px] flex items-center justify-center">
              <div className="absolute inset-0">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((degree) => (
                  <div 
                    key={degree}
                    className="absolute top-1/2 left-1/2 w-2 h-[1px] md:w-[12px] md:h-[2.5px] bg-[#fbc02d] rounded-full"
                    style={{ transform: `translate(-50%, -50%) rotate(${degree}deg) translate(${window.innerWidth < 768 ? 20 : 32}px)` }}
                  ></div>
                ))}
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-[24px] h-[24px] md:w-[42px] md:h-[42px] bg-[#fbc02d] rounded-full relative">
                  <div className="absolute top-[3px] left-[5px] md:top-[6px] md:left-[8px] w-[5px] h-[8px] md:w-[8px] md:h-[12px] border-l-[2px] md:border-l-[3px] border-t-[2px] md:border-t-[3px] border-white/40 rounded-tl-full"></div>
                </div>
                <div className="w-[12px] h-[8px] md:w-[18px] md:h-[12px] bg-[#34495e] mt-[-2px] md:mt-[-3px] flex flex-col gap-[1px] md:gap-[2px] items-center py-[1px] rounded-b-sm">
                  <div className="w-full h-[1px] md:h-[2px] bg-black/20"></div>
                  <div className="w-[80%] h-[1px] md:h-[2px] bg-black/20"></div>
                </div>
              </div>
            </div>
            
            <div className="text-white text-center md:text-left">
              <h2 className="text-base md:text-[27px] font-black uppercase mb-1 md:mb-2 tracking-tight">
                Always Free From Repetition
              </h2>
              <p className="text-white/95 text-[10px] md:text-[15px] leading-relaxed max-w-xl font-bold">
                Ready to transform your future? Connect with our experts today for guidance.
              </p>
            </div>
          </div>
          <div className="md:w-1/4 h-full flex md:justify-end w-full justify-center">
            <button className="border md:border-[1.5px] border-white text-white font-black px-6 md:px-8 py-2.5 md:py-[12px] text-[10px] md:text-[14.5px] rounded-full hover:bg-white hover:text-[#f06522] transition-colors shadow-sm tracking-widest whitespace-nowrap">
              Book Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
