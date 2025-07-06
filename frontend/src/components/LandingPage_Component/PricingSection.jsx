// PricingSection.jsx
import React from 'react';

const PricingCard = ({ title, price, duration, features, isPopular }) => {
  return (
    <div className={`relative bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-between w-full max-w-sm transition-all duration-300 hover:shadow-xl ${isPopular ? 'border-2 border-indigo-600' : 'border border-gray-200'}`}>
      {isPopular && (
        <span className="absolute top-0 right-0 bg-indigo-600 text-white text-sm font-semibold px-4 py-1 rounded-bl-lg rounded-tr-lg">
          Most Popular
        </span>
      )}
      <div>
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        <div className="mt-4">
          <span className="text-4xl font-extrabold text-gray-900">${price}</span>
          <span className="text-gray-500"> /{duration}</span>
        </div>
        <ul className="mt-6 space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <button className={`mt-8 w-full py-3 rounded-lg font-semibold text-white transition-colors duration-300 ${isPopular ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-800 hover:bg-gray-900'}`}>
        Get Started
      </button>
    </div>
  );
};

const PricingSection = () => {
  const plans = [
    {
      title: "Free Plan",
      price: "0",
      duration: "1 month",
      features: [
        "Basic fitness tracking",
        "Access to limited workouts",
        "Community support",
        "1 user account"
      ],
      isPopular: false
    },
    {
      title: "Standard Plan",
      price: "29",
      duration: "3 months",
      features: [
        "All Free Plan features",
        "Access to all workouts",
        "Diet plan recommendations",
        "Priority email support",
        "5 user profiles"
      ],
      isPopular: true
    },
    {
      title: "Premium Plan",
      price: "49",
      duration: "6 months",
      features: [
        "All Standard Plan features",
        "24/7 chat support",
        "Personalized fitness coaching",
        "Meal tracking & analysis",
        "Unlimited user profiles"
      ],
      isPopular: false
    }
  ];

  return (
    <section id='plans' className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Choose Your Plan</h2>
          <p className="mt-4 text-lg text-gray-600">
            Select the perfect plan to track your fitness journey.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 justify-center">
          {plans.map((plan, index) => (
            <PricingCard key={index} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
