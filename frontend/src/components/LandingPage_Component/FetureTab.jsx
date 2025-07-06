import React, { useState } from "react";
import { FaCalendarAlt, FaUtensils, FaHeartbeat, FaComments, FaVideo } from "react-icons/fa";
import fit from '../../assets/fit_couple_white.jpg';

const features = [
  {
    name: "Online Bookings",
    icon: <FaCalendarAlt className="text-pink-300 text-3xl" />,
    description:
      "Boost your productivity with our Focus Time feature. Effortlessly block out distractions and dedicate uninterrupted periods to your most important tasks.",
    img: fit, // Replace with actual path
  },
  {
    name: "Meal Planning",
    icon: <FaUtensils className="text-pink-300 text-3xl" />,
    description:
      "Plan your meals effortlessly with our intelligent meal planner, which tailors meals based on your health goals and preferences.",
    img: fit,
  },
  {
    name: "Activity Tracking",
    icon: <FaHeartbeat className="text-pink-300 text-3xl" />,
    description:
      "Track your physical activity with precision. Our tracker syncs with wearable devices and provides daily wellness insights.",
    img: fit,
  },
  {
    name: "Chat with doc",
    icon: <FaComments className="text-pink-300 text-3xl" />,
    description:
      "Instantly connect with certified doctors for quick consultations, advice, and follow-ups from the comfort of your home.",
    img: fit,
  },
  {
    name: "Video Consultation",
    icon: <FaVideo className="text-pink-300 text-3xl" />,
    description:
      "Schedule and attend secure video consultations with your healthcare provider. No waiting rooms. Just click and connect.",
    img: fit,
  },
];

const FeatureTab = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="features" className="bg-prime-blue text-white py-16 px-4 mt-0 sm:px-6 md:px-10 rounded-[30px] mx-4 sm:mx-2 md:mx-6">
      <h2 className="text-center text-3xl md:text-4xl font-semibold mb-6">
        Stay one step ahead with our <span className="text-pink-300">awesome features</span>.
      </h2>

      {/* Tab Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {features.map((feature, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`px-5 py-2 rounded-full font-medium text-sm ${
              activeIndex === index
                ? "bg-pink-300 text-black"
                : "bg-[#1c1c2e] text-white hover:bg-pink-300 hover:text-black"
            } transition-all`}
          >
            {feature.name}
          </button>
        ))}
      </div>

      {/* Feature Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10 max-w-7xl mx-auto">
        {/* Left - Text & Icon */}
        <div className="bg-[#1c1c2e] rounded-2xl p-8 space-y-5 shadow-lg">
          <div className="w-12 h-12 flex items-center justify-center bg-pink-200 rounded-lg">
            {features[activeIndex].icon}
          </div>
          <h3 className="text-2xl font-semibold">{features[activeIndex].name}</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            {features[activeIndex].description}
          </p>
          <button className="mt-4 bg-pink-300 text-black px-5 py-2 rounded-md font-medium hover:bg-pink-400 transition">
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
