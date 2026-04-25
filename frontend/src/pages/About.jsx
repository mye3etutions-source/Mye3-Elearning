import React from 'react';
import { 
  HiOutlineAcademicCap,
  HiOutlineOfficeBuilding,
  HiOutlineIdentification
} from 'react-icons/hi';
import { 
  FiAward, 
  FiSettings, 
  FiFileText,
  FiSearch 
} from 'react-icons/fi';
import { 
  FaFacebookF, 
  FaTwitter, 
  FaGooglePlusG, 
  FaYoutube, 
  FaWhatsapp 
} from 'react-icons/fa';

const About = () => {
  const features = [
    {
      icon: <FiAward className="w-[45px] h-[45px] text-[#222]" strokeWidth="1.2" />,
      title: 'Awards',
      desc: 'Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Morbi bibendum imperdiet bibendum.',
    },
    {
      icon: <FiSettings className="w-[45px] h-[45px] text-[#222]" strokeWidth="1.2" />,
      title: 'Research',
      desc: 'Etiam eget enim non magna vestibulum malesuada ut et lectus. Curabitur egestas risus massa, a malesuada erat ultrices non.',
    },
    {
      icon: <HiOutlineAcademicCap className="w-[48px] h-[48px] text-[#222]" />,
      title: 'Educations',
      desc: 'Maecenas venenatis, turpis ac tincidunt convallis, leo enim ultrices tortor, at faucibus neque sapien ac elit. Curabitur ut ipsum odio.',
    },
    {
      icon: <FiFileText className="w-[45px] h-[45px] text-[#222]" strokeWidth="1.2" />,
      title: 'Alumni',
      desc: 'Aliquam malesuada commodo lectus, at fermentum ligula finibus eu. Morbi nisi neque, suscipit non pulvinar vitae.',
    },
    {
      icon: <HiOutlineOfficeBuilding className="w-[45px] h-[45px] text-[#222]" />,
      title: 'Facilities',
      desc: 'Maecenas venenatis, turpis ac tincidunt convallis, leo enim ultrices tortor, at faucibus neque sapien ac elit. Curabitur ut ipsum odio.',
    },
    {
      icon: <HiOutlineIdentification className="w-[45px] h-[45px] text-[#222]" />,
      title: 'Departments',
      desc: 'Maecenas venenatis, turpis ac tincidunt convallis, leo enim ultrices tortor, at faucibus neque sapien ac elit. Curabitur ut ipsum odio.',
    },
  ];

  return (
    <div className="bg-white font-sans w-full flex flex-col">
      {/* Search Bar Strip */}
      <div className="bg-[#002147] py-[16px] px-4 w-full border-b border-[#001b3a]">
        <div className="max-w-[750px] mx-auto flex h-[52px] shadow-sm">
          <div className="flex-1 relative flex items-center bg-white rounded-l-sm overflow-hidden">
            <FiSearch className="text-[#999] w-[18px] h-[18px] ml-5 flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Search Course And Discount Courses"
              className="w-full py-2 px-4 text-[15px] text-[#555] outline-none h-full bg-transparent placeholder-[#999]"
            />
          </div>
          <button className="bg-[#f16126] text-white px-8 md:px-10 h-full text-[14px] font-semibold uppercase tracking-wide rounded-r-sm hover:bg-[#de551e] transition-colors flex-shrink-0">
            Search Course
          </button>
        </div>
      </div>

      {/* Main About Section */}
      <div className="max-w-[1140px] mx-auto px-4 py-20 pb-24">
        
        {/* Header */}
        <div className="text-center mb-20 mt-4 space-y-5">
          <h1 className="text-[40px] font-bold tracking-tight">
            <span className="text-[#002147]">About </span>
            <span className="text-[#f16126]">Mye3-e-Tuitions</span>
          </h1>
          <p className="text-[#64748b] max-w-4xl mx-auto text-[16px] leading-relaxed text-center">
            Mye3-e-Tuitions is a leading online platform dedicated to providing high-quality education and personalized learning experiences for students worldwide.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 max-w-[1140px] mx-auto">
          {features.map((feature, idx) => {
            const isRightBorder = idx % 3 !== 2;
            const isBottomBorder = idx < 3;
            return (
              <div 
                key={idx} 
                className={`
                  p-[35px] flex gap-[25px] border-[#eaeaea] hover:bg-[#fcfcfc] transition-colors
                  ${idx === features.length - 1 ? 'border-b-0 md:border-b-0' : 'border-b'}
                  ${!isBottomBorder ? 'md:border-b-0' : ''}
                  ${isRightBorder ? 'md:border-r' : ''}
                `}
              >
                <div className="flex-shrink-0 mt-1">
                  {feature.icon}
                </div>
                <div className="flex flex-col items-start text-left">
                  <h3 className="text-[20px] font-bold text-[#111] mb-2">{feature.title}</h3>
                  <p className="text-[14px] text-[#666] mb-5 leading-[1.6]">
                    {feature.desc}
                  </p>
                  <button className="bg-[#002147] text-white px-[18px] py-[8px] text-[12px] font-semibold rounded-sm hover:bg-[#001530] transition-colors tracking-wide">
                    Read more
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Orange Banner Section */}
      <div className="bg-[#f06522] py-[55px] px-4">
        <div className="max-w-[1140px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
          
          <div className="flex items-center gap-6 md:gap-14 md:w-3/4">
            
            {/* Perfectly matched bulb icon from reference */}
            <div className="relative flex-shrink-0 w-[80px] h-[80px] flex items-center justify-center">
              {/* Rays (8 Lines) */}
              <div className="absolute inset-0">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((degree) => (
                  <div 
                    key={degree}
                    className="absolute top-1/2 left-1/2 w-[12px] h-[2.5px] bg-[#fbc02d] rounded-full"
                    style={{ 
                      transform: `translate(-50%, -50%) rotate(${degree}deg) translate(32px)` 
                    }}
                  ></div>
                ))}
              </div>
              
              {/* Bulb SVG - precise shape with glare and base */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-[42px] h-[42px] bg-[#fbc02d] rounded-full relative">
                  {/* Glare */}
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
              <h2 className="text-[20px] md:text-[27px] font-bold uppercase mb-2 tracking-wide text-white">
                Therefore Always Free From Repetition
              </h2>
              <p className="text-white/95 text-[14px] md:text-[15px] leading-relaxed max-w-2xl">
                There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour.
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

export default About;
