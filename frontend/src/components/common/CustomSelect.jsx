import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({ options, value, onChange, placeholder, icon: Icon, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => JSON.stringify(opt) === value || opt.value === value);

  return (
    <div className="space-y-3 w-full" ref={containerRef}>
      {label && (
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 opacity-70" />} {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-8 py-5 bg-slate-50 border-2 transition-all duration-300 rounded-3xl flex items-center justify-between group
            ${isOpen ? 'border-teal-600 bg-white ring-4 ring-teal-500/10' : 'border-transparent hover:bg-slate-100/50 shadow-inner'}
          `}
        >
          <span className={`font-black tracking-tight ${selectedOption ? 'text-slate-900' : 'text-slate-400'}`}>
            {selectedOption ? selectedOption.name || selectedOption.label : placeholder}
          </span>
          <ChevronDown className={`w-5 h-5 transition-transform duration-500 ${isOpen ? 'rotate-180 text-teal-600' : 'text-slate-300'}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute z-50 w-full mt-3 bg-white/80 backdrop-blur-2xl border border-slate-100 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden p-2"
            >
              <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
                {options.map((option, idx) => {
                  const optionValue = typeof option === 'string' ? option : (option.value || JSON.stringify(option));
                  const isSelected = value === optionValue;
                  
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onChange(optionValue);
                        setIsOpen(false);
                      }}
                      className={`
                        w-full px-6 py-4 rounded-2xl flex items-center justify-between text-left transition-all duration-200 group/item
                        ${isSelected ? 'bg-teal-600 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-700'}
                      `}
                    >
                      <span className="font-bold tracking-tight">{option.name || option.label || option}</span>
                      {isSelected && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <Check className="w-4 h-4" />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CustomSelect;
