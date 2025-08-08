import React, { useState } from "react";
import { FaCalendarAlt, FaUtensils, FaDumbbell, FaChartLine } from "react-icons/fa";
import { BiBot } from "react-icons/bi";
import fit from '../../assets/fit_couple_white.jpg';

const features = [
  {
    name: "AI Coach",
    icon: <BiBot className="text-gray-900 text-3xl" />,
    description:
      "Chat with an AI coach to get workout ideas, nutrition tips, and quick answers tailored to your goals.",
    img: fit,
  },
  {
    name: "Meal Planning",
    icon: <FaUtensils className="text-gray-900 text-3xl" />,
    description:
      "Generate balanced daily plans with macros that match your targets and dietary preferences.",
    img: fit,
  },
  {
    name: "Workout Generator",
    icon: <FaDumbbell className="text-gray-900 text-3xl" />,
    description:
      "Create smart routines by goal, experience level, available time, and equipment.",
    img: fit,
  },
  {
    name: "Progress Tracking",
    icon: <FaChartLine className="text-gray-900 text-3xl" />,
    description:
      "Track sessions, weight, and calories with clean visuals and actionable insights.",
    img: fit,
  },
  {
    name: "Routine & Reminders",
    icon: <FaCalendarAlt className="text-gray-900 text-3xl" />,
    description:
      "Plan workouts and meals into your day and stay consistent with gentle reminders.",
    img: fit,
  },
];

const FeatureTab = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="features" className="bg-prime-blue text-white py-16 px-4 mt-0 sm:px-6 md:px-10 rounded-[30px] mx-4 sm:mx-2 md:mx-6">
      <h2 className="text-center text-3xl md:text-4xl font-semibold mb-6 text-white">
        Stay one step ahead with our <span className="text-white">awesome features</span>.
      </h2>

      {/* Tab Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {features.map((feature, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`px-5 py-2 rounded-full font-medium text-sm ${
              activeIndex === index
                ? "bg-white text-black"
                : "bg-[#1c1c2e] text-white hover:bg-white hover:text-black"
            } transition-all`}
          >
            {feature.name}
          </button>
        ))}
      </div>

      {/* Feature Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10 max-w-6xl mx-auto">
        {/* Left - Text & Icon */}
        <div className="bg-[#1c1c2e] rounded-2xl p-8 space-y-5 shadow-lg">
          <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg">
            {features[activeIndex].icon}
          </div>
          <h3 className="text-2xl font-semibold">{features[activeIndex].name}</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            {features[activeIndex].description}
          </p>
          <button className="mt-4 bg-white text-black px-5 py-2 rounded-md font-medium hover:opacity-90 transition">
            Learn More
          </button>
        </div>

        {/* Right - Image */}
        <div className="flex justify-center items-center">
          <img
            src={features[activeIndex].img}
            alt={features[activeIndex].name}
            className="rounded-xl shadow-xl w-full max-w-md"
          />
        </div>
      </div>
    </section>
  );
};

export default FeatureTab;
