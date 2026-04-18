
import React from 'react';
import { 
  Zap, 
  HelpCircle, 
  ShoppingBag, 
  UserCheck, 
  Calendar, 
  Clock 
} from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-transparent dark:border-slate-800">
    <div className="w-14 h-14 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{title}</h3>
    <p className="text-slate-400 dark:text-slate-500 leading-relaxed text-sm">
      {description}
    </p>
  </div>
);

export const Features: React.FC = () => {
  const features = [
    {
      icon: <Zap className="w-7 h-7 text-orange-500" />,
      title: "Instant Response",
      description: "Customers hate waiting. Immediately respond to customers' queries elevates positive customer experience."
    },
    {
      icon: <HelpCircle className="w-7 h-7 text-orange-500" />,
      title: "Automated FAQ",
      description: "Automate support to quickly answer frequently asked questions to eliminate customer's frustrations."
    },
    {
      icon: <ShoppingBag className="w-7 h-7 text-orange-500" />,
      title: "Simplify Shopping",
      description: "Most of the time, visitors who ask questions are ready buyers. Make it easy for them to buy from you."
    },
    {
      icon: <UserCheck className="w-7 h-7 text-orange-500" />,
      title: "Personalized Messages",
      description: "Customers appreciate respect. Address them by their name in every conversation increases customer affinity."
    },
    {
      icon: <Calendar className="w-7 h-7 text-orange-500" />,
      title: "Easy Bookings",
      description: "Make it easy for customer to book and reschedule appointments without having to call or send an email."
    },
    {
      icon: <Clock className="w-7 h-7 text-orange-500" />,
      title: "24/7 Availability",
      description: "It's crucial to ensure that customers can get assistance, support, and all the information they need even outside of your business hours."
    }
  ];

  return (
    <section className="py-24 bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
            Win customers and <span className="orange-squiggle">retain them</span> for life
          </h2>
          <p className="text-slate-400 dark:text-slate-500 text-lg">
            Maximize your customer lifetime value by retaining their loyalty and fostering long-lasting relationships through personalized chat interactions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
