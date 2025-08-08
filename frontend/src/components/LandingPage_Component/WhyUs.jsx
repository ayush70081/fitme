// WhyUsSection.jsx
import React from "react";
import { FaCalendarAlt, FaWallet, FaDumbbell, FaUtensils, FaChartLine } from "react-icons/fa";
import { BiBot } from "react-icons/bi";

const features = [
  {
    icon: <BiBot className="text-2xl text-gray-900" />,
    title: "AI Coach Guidance",
    description: "Chat with an AI coach for workouts, recipes, and habit tips tailored to you.",
  },
  {
    icon: <FaDumbbell className="text-2xl text-gray-900" />,
    title: "Personalized Workouts",
    description: "Generate smart routines by goal, experience level, and equipment.",
  },
  {
    icon: <FaUtensils className="text-2xl text-gray-900" />,
    title: "Daily Meal Plans",
    description: "Balanced plans with macros that match your targets and preferences.",
  },
  {
    icon: <FaChartLine className="text-2xl text-gray-900" />,
    title: "Progress Tracking",
    description: "Track workouts, weight, and nutrition with clean, actionable insights.",
  },
  {
    icon: <FaCalendarAlt className="text-2xl text-gray-900" />,
    title: "Routine Scheduling",
    description: "Plan sessions and meals; gentle reminders help you stay consistent.",
  },
  {
    icon: <FaWallet className="text-2xl text-gray-900" />,
    title: "Simple & Affordable",
    description: "Start free. Upgrade when you need more—no clutter, no ads.",
  },
];

const WhyUs = () => {
  return (
    <section id="why us" className="bg-white text-black py-16 px-4 sm:px-6 md:px-12 rounded-t-[40px]">
      <div className="max-w-7xl mx-auto text-center">
        <span className="inline-block bg-[#F5EFE6] text-gray-900 text-xs font-semibold px-4 py-1 rounded-full mb-4 uppercase border border-[#EADFD0]">
          Why Choose FitMe+
        </span>
        <h2 className="text-3xl sm:text-4xl font-semibold leading-snug">
          Workouts, nutrition, and AI coaching — all in one clean, focused app.
        </h2>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-left space-y-3 bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">

              <div className="w-10 h-10 flex items-center justify-center bg-[#F5EFE6] rounded-md border border-[#EADFD0]">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-lg">{feature.title}</h3>
              <p className="text-sm text-gray-600">
                {feature.description}
                
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
