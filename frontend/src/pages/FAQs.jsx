import React, { useState } from 'react';
import { FiSearch, FiPlus, FiMinus } from 'react-icons/fi';

const FAQItem = ({ question, answer, isOpen, onClick }) => (
  <div 
    className={`border rounded-lg mb-4 transition-all duration-300 ${isOpen ? 'border-[#f16126] shadow-md bg-white' : 'border-slate-200 bg-[#f8fafc]'}`}
  >
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 text-left group"
    >
      <span className={`text-[16px] font-bold transition-colors ${isOpen ? 'text-[#f16126]' : 'text-[#002147] group-hover:text-[#f16126]'}`}>
        {question}
      </span>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-[#f16126] text-white rotate-180' : 'bg-slate-200 text-slate-500'}`}>
        {isOpen ? <FiMinus /> : <FiPlus />}
      </div>
    </button>
    <div 
      className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 border-t border-slate-100' : 'max-h-0 opacity-0'}`}
    >
      <div className="p-6 text-[15px] text-[#555] leading-relaxed bg-white">
        {answer}
      </div>
    </div>
  </div>
);

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('General');

  const faqData = {
    General: [
      {
        question: "What is Mye3-e-Tuitions?",
        answer: "Mye3-e-Tuitions is an advanced online learning platform that connects students with expert teachers for personalized, one-on-one and group learning experiences across various subjects and skill sets."
      },
      {
        question: "How do I sign up as a student?",
        answer: "Click on the 'Enrol Now' button at the top header or visit the 'Register' page. Fill in your details, select your grade and subjects, and you'll be ready to start your learning journey."
      },
      {
        question: "Is there a free demo class available?",
        answer: "Yes, we offer a complimentary demo class for all new students. This helps you understand the platform and choose the right teacher for your learning needs."
      }
    ],
    Enrollment: [
      {
        question: "How do I book a specific course?",
        answer: "Navigate to our 'Tuitions' menu or 'Store', browse through the categories, select your preferred course, and follow the simple booking process."
      },
      {
        question: "Can I change my teacher later?",
        answer: "Absolutely. We want our students to be completely comfortable. If you're not satisfied with a tutor, you can request a change through your student dashboard."
      }
    ],
    Payments: [
      {
        question: "What payment methods are supported?",
        answer: "We support multiple secure payment methods including UPI, Credit/Debit Cards, Net Banking, and popular e-wallets."
      },
      {
        question: "Are there any hidden charges?",
        answer: "No, we believe in complete transparency. All costs are clearly mentioned at the time of booking with no hidden fees."
      }
    ]
  };

  const tabs = Object.keys(faqData);

  return (
    <div className="bg-white font-sans w-full min-h-screen flex flex-col">
      {/* Search Bar Strip (Consistent UI) */}
      <div className="bg-[#002147] py-[16px] px-4 w-full border-b border-[#001b3a]">
        <div className="max-w-[750px] mx-auto flex h-[52px] shadow-sm">
          <div className="flex-1 relative flex items-center bg-white rounded-l-sm overflow-hidden">
            <FiSearch className="text-[#999] w-[18px] h-[18px] ml-5 flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Search Your Questions Here..."
              className="w-full py-2 px-4 text-[15px] text-[#555] outline-none h-full bg-transparent placeholder-[#999]"
            />
          </div>
          <button className="bg-[#f16126] text-white px-8 md:px-10 h-full text-[14px] font-semibold uppercase tracking-wide rounded-r-sm hover:bg-[#de551e] transition-colors flex-shrink-0">
            Search
          </button>
        </div>
      </div>

      <div className="max-w-[1140px] mx-auto px-4 py-20 pb-28 w-full">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-[42px] font-bold tracking-tight">
            <span className="text-[#002147]">FAQ </span>
            <span className="text-[#f16126]">Questions</span>
          </h1>
          <p className="text-[#64748b] max-w-3xl mx-auto text-[16px] leading-relaxed">
            Find answers to commonly asked questions about our online classes, enrollment process, and technical support.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Categories Sidebar */}
          <div className="lg:w-1/4 w-full flex flex-col gap-3">
            <h3 className="text-[#002147] text-[18px] font-black uppercase mb-4 tracking-widest pl-2 border-l-4 border-[#f16126]">Categories</h3>
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setOpenIndex(0); }}
                className={`w-full text-left px-6 py-4 rounded-lg font-bold text-[14px] transition-all uppercase tracking-wide ${activeTab === tab ? 'bg-[#002147] text-white shadow-lg translate-x-2' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* FAQ Accordion List */}
          <div className="lg:w-3/4 w-full">
            <div className="mb-6">
              <h2 className="text-[24px] font-black text-[#002147] uppercase tracking-tight">{activeTab} Info</h2>
              <div className="w-16 h-1.5 bg-[#f16126] mt-2 rounded-full"></div>
            </div>
            <div className="space-y-2">
              {faqData[activeTab].map((faq, idx) => (
                <FAQItem
                  key={idx}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openIndex === idx}
                  onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orange Banner Section (UI Consistency) */}
      <div className="bg-[#f06522] py-[55px] px-4">
        <div className="max-w-[1140px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-14">
          <div className="flex items-center gap-6 md:gap-14 md:w-3/4">
            {/* Perfectly matched bulb icon */}
            <div className="relative flex-shrink-0 w-[80px] h-[80px] flex items-center justify-center">
              <div className="absolute inset-0">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((degree) => (
                  <div 
                    key={degree}
                    className="absolute top-1/2 left-1/2 w-[12px] h-[2.5px] bg-[#fbc02d] rounded-full"
                    style={{ transform: `translate(-50%, -50%) rotate(${degree}deg) translate(32px)` }}
                  ></div>
                ))}
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-[42px] h-[42px] bg-[#fbc02d] rounded-full relative">
                  <div className="absolute top-[6px] left-[8px] w-[8px] h-[12px] border-l-[3px] border-t-[3px] border-white/40 rounded-tl-full"></div>
                </div>
                <div className="w-[18px] h-[12px] bg-[#34495e] mt-[-3px] flex flex-col gap-[2px] items-center py-[1px] rounded-b-sm">
                  <div className="w-full h-[2px] bg-black/20"></div>
                  <div className="w-[80%] h-[2px] bg-black/20"></div>
                  <div className="w-[60%] h-[2px] bg-black/20"></div>
                </div>
              </div>
            </div>
            
            <div className="text-white">
              <h2 className="text-[20px] md:text-[27px] font-bold uppercase mb-2 tracking-wide">
                Therefore Always Free From Repetition
              </h2>
              <p className="text-white/95 text-[14px] md:text-[15px] leading-relaxed max-w-2xl">
                Still have questions? Our support team is here to help you 24/7. Contact us for any technical or enrollment assistance.
              </p>
            </div>
          </div>
          <div className="md:w-1/4 flex md:justify-end w-full pl-24 md:pl-0">
            <button className="border-[1.5px] border-white text-white font-medium px-8 py-[12px] text-[14.5px] rounded-[30px] hover:bg-white hover:text-[#f06522] transition-colors shadow-sm tracking-wide whitespace-nowrap">
              Book This Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQs;
