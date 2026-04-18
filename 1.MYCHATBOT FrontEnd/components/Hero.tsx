
import React from 'react';
import { Check } from 'lucide-react';

export const Hero: React.FC = () => {
  const scrollToPricing = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('pricing');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          
          <div className="mb-12 lg:mb-0">
            <p className="text-slate-400 dark:text-slate-500 font-medium mb-4">The Best WhatsApp AI</p>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white leading-tight mb-8">
              Outperform Your Competition with <span className="text-[#FF6B35]">WhatsApp Chatbot</span>
            </h1>
            
            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-slate-500 dark:text-slate-400">Capture more leads from all touch points.</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-slate-500 dark:text-slate-400">Win more sales with follow-up chatbots.</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-slate-500 dark:text-slate-400">Retain more customers with service chatbot.</span>
              </li>
            </ul>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={scrollToPricing}
                className="bg-[#FF6B35] hover:bg-[#e85a29] text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg shadow-orange-200 dark:shadow-none"
              >
                START FREE
              </button>
              <button className="border-2 border-orange-200 dark:border-orange-900/50 hover:border-orange-500 text-orange-500 px-10 py-4 rounded-full font-bold transition-all">
                LOGIN
              </button>
            </div>
          </div>

          <div className="relative">
            {/* Yellow Background Shape */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-yellow-400/20 dark:bg-orange-400/10 rounded-full blur-3xl -z-10"></div>
            
            {/* Main Image Illustration */}
            <div className="relative z-10">
              <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                {/* Simulated Chat Interface */}
                <div className="absolute -top-4 -left-12 z-20 w-48 bg-[#FF6B35] text-white p-3 rounded-2xl rounded-bl-none shadow-xl transform -rotate-3">
                   <p className="text-xs">Hi, How can I help you?</p>
                </div>

                <div className="absolute top-16 right-0 z-20 w-56 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 transition-colors">
                   <p className="text-xs text-slate-600 dark:text-slate-300">I need more info about your recent offer.</p>
                </div>

                <div className="absolute top-48 -left-8 z-20 w-52 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 transition-colors flex items-center gap-2">
                   <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                    <span className="text-[10px]">😊</span>
                   </div>
                   <p className="text-xs text-slate-600 dark:text-slate-300">Sure! Just give me a second!</p>
                </div>

                <div className="absolute bottom-20 -right-4 z-20 w-40 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 transition-colors">
                   <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2 mb-2">
                      <img src="https://picsum.photos/100/100?random=1" className="w-full h-12 object-cover rounded" alt="Product" />
                   </div>
                   <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">Play</p>
                   <div className="h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 w-1/3"></div>
                   </div>
                </div>

                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                   <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Thanks! ❤️</span>
                </div>

                {/* Hero Woman Image */}
                <div className="relative rounded-full overflow-hidden border-8 border-white dark:border-slate-800 shadow-2xl transition-colors">
                  <img 
                    src="https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=686&auto=format&fit=crop" 
                    className="w-full h-full object-cover grayscale brightness-110 sepia-[0.2]" 
                    alt="Chatbot User" 
                  />
                  <div className="absolute inset-0 bg-orange-500/10 mix-blend-overlay"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
