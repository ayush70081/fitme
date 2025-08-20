// PricingSection.jsx
import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PlanCard = ({ title, price, subtitle, features, ctaText, popular, secondaryCTA, onCtaClick }) => {
  return (
    <div className={`relative bg-white rounded-2xl border border-[#EADFD0] shadow-sm p-6 sm:p-7 flex flex-col transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 max-w-sm w-full mx-auto`}>
      {popular && (
        <span className="absolute -top-3 left-6 bg-black text-white text-[11px] px-2 py-1 rounded-full tracking-wide">POPULAR</span>
      )}

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 tracking-wide">{title}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-gray-900">₹{price}</span>
          <span className="text-sm text-gray-500">{subtitle}</span>
        </div>
      </div>

      <ul className="space-y-3 text-sm">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5 text-gray-900" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid grid-cols-1 gap-2">
        <button
          onClick={onCtaClick}
          className="w-full h-10 rounded-lg bg-black text-white text-sm font-medium hover:opacity-90 transition-colors"
        >
          {ctaText}
        </button>
        {secondaryCTA && (
          <button className="w-full h-10 rounded-lg border border-[#EADFD0] bg-[#FFF8ED] text-gray-900 text-sm font-medium hover:bg-[#F5EFE6] transition-colors flex items-center justify-center gap-2">
            {secondaryCTA} <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

const PricingSection = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleSelectPlan = () => {
    navigate('/register');
  };

  return (
    <section id="plans" className="py-16" style={{ backgroundColor: '#FAF7F2' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">Plans and Pricing</h2>
          <p className="mt-3 text-gray-600">Choose the perfect plan for your journey</p>
        </div>

        <div className="mt-10 grid gap-8 grid-cols-1 sm:grid-cols-2 justify-items-center max-w-4xl mx-auto">
          <PlanCard
            title="FREE"
            price="0"
            subtitle="per user / month"
            features={[
              'Basic workout tracking',
              'AI Coach intro prompts',
              'Community access',
              '1 saved plan',
            ]}
            ctaText="Get started"
            onCtaClick={handleGetStarted}
          />

          <PlanCard
            title="PRO"
            price="1,299"
            subtitle="per user / month"
            features={[
              'All Free features',
              'Advanced AI Coach',
              'Daily meal plan generator',
              'Unlimited saved plans',
            ]}
            ctaText="Select plan"
            popular
            onCtaClick={handleSelectPlan}
          />


        </div>
      </div>
    </section>
  );
};

export default PricingSection;
