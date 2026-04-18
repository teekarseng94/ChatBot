
import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

type BillingCycle = 'ANNUALLY' | 'MONTHLY';

interface Plan {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  subtext?: {
    monthly: string;
    annual: string;
  };
}

const plans: Plan[] = [
  {
    name: 'STARTER',
    monthlyPrice: 0,
    annualPrice: 79,
    features: [
      '200 Contacts',
      '4 Channels',
      '1 Member',
      '1 Bot',
      'Facebook, Messenger, IG',
      'Telegram, Web Chat'
    ],
    subtext: {
      monthly: 'Free Forever',
      annual: 'RM948 annually'
    }
  },
  {
    name: 'ESSENTIAL',
    monthlyPrice: 99,
    annualPrice: 89,
    features: [
      '1000 Contacts',
      '16 Channels',
      '5 Members',
      '1 Bot',
      'WhatsApp Cloud API',
      'Facebook, Messenger, IG',
      'Telegram, WeChat, etc.',
      'Analytics Dashboard',
      'Unlimited Chatflows',
      'Developer API',
      'Webhook Integration',
      'AI Integration',
      'WooCommerce Integration',
      'Calendly Integration',
      'Shopify Integration',
      'Facebook Business Int.',
      'Cloudinary Integration',
      'Gmail, SMTP, MailChimp',
      'Google Sheets Integration',
      'Green tick for eligible WhatsApp'
    ],
    subtext: {
      monthly: 'RM1188 annually',
      annual: 'RM1068 annually'
    }
  },
  {
    name: 'GROWTH',
    monthlyPrice: 399,
    annualPrice: 299,
    features: [
      '5000 Contacts',
      '16 Channels',
      '5 Members',
      '2 Bots',
      'WhatsApp Cloud API',
      'Facebook, Messenger, IG',
      'Telegram, WeChat, etc.',
      'Analytics Dashboard',
      'Unlimited Chatflows',
      'Developer API',
      'Webhook Integration',
      'AI Integration',
      'WooCommerce Integration',
      'Calendly Integration',
      'Shopify Integration',
      'Facebook Business Int.',
      'Cloudinary Integration',
      'Gmail, SMTP, MailChimp',
      'Google Sheets Integration',
      'Green tick for eligible WhatsApp'
    ],
    subtext: {
      monthly: 'RM4788 annually',
      annual: 'RM3588 annually'
    }
  },
  {
    name: 'ULTIMATE',
    monthlyPrice: 999,
    annualPrice: 799,
    features: [
      '10000 Contacts',
      '16 Channels',
      '10 Members',
      '5 Bots',
      'WhatsApp Cloud API',
      'Facebook, Messenger, IG',
      'Telegram, WeChat, etc.',
      'Analytics Dashboard',
      'Unlimited Chatflows',
      'Developer API',
      'Webhook Integration',
      'AI Integration',
      'WooCommerce Integration',
      'Calendly Integration',
      'Shopify Integration',
      'Facebook Business Int.',
      'Cloudinary Integration',
      'Gmail, SMTP, MailChimp',
      'Google Sheets Integration',
      'Green tick for eligible WhatsApp'
    ],
    subtext: {
      monthly: 'RM11988 annually',
      annual: 'RM9588 annually'
    }
  }
];

export const Pricing: React.FC = () => {
  const [cycle, setCycle] = useState<BillingCycle>('ANNUALLY');

  return (
    <section id="pricing" className="bg-[#1a110a] dark:bg-black pt-24 pb-48 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-extrabold text-[#FF6B35] mb-4">Start with RM79</h2>
          <p className="text-[#a38b7a] dark:text-[#7a6a5d] font-medium mb-10">The best and affordable plan</p>
          
          <div className="inline-flex items-center bg-black/40 p-1 rounded-full border border-white/10">
            <button 
              onClick={() => setCycle('ANNUALLY')}
              className={`px-8 py-2 rounded-full font-bold text-xs transition-all ${cycle === 'ANNUALLY' ? 'bg-[#FF6B35] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              ANNUALLY
            </button>
            <button 
              onClick={() => setCycle('MONTHLY')}
              className={`px-8 py-2 rounded-full font-bold text-xs transition-all ${cycle === 'MONTHLY' ? 'bg-[#FF6B35] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              MONTHLY
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className="flex flex-col bg-white dark:bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl border border-transparent dark:border-slate-800 transition-colors"
            >
              <div className="bg-[#FF6B35] py-4 text-center">
                <span className="text-white font-extrabold tracking-widest text-lg uppercase">{plan.name}</span>
              </div>
              
              <div className="p-8 flex-grow flex flex-col">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-[#FF6B35] text-xl font-bold align-top mt-2">RM</span>
                    <span className="text-[#FF6B35] text-7xl font-black">
                      {cycle === 'ANNUALLY' ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 text-sm mt-8">/month</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#FF6B35] flex-shrink-0 mt-0.5" />
                      <span className="text-slate-400 dark:text-slate-500 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto text-center">
                  <button className="w-full bg-[#FF6B35] hover:bg-[#e85a29] text-white py-4 rounded-full font-black text-sm mb-4 transition-all shadow-lg shadow-orange-100 dark:shadow-none">
                    Get Started
                  </button>
                  <p className="text-[#FF6B35] text-xs font-bold whitespace-pre-line leading-relaxed">
                    {cycle === 'ANNUALLY' ? plan.subtext?.annual : plan.subtext?.monthly}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
