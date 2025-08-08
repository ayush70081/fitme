import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What can the AI Coach help with?",
    answer:
      "The AI Coach can answer fitness questions, generate workout routines, suggest recipes, and help you plan meals based on your goals and preferences.",
  },
  {
    question: "How are meal plans generated?",
    answer:
      "Meal plans are created using your calorie target, macro preferences, and dietary restrictions. You can customize meals and save daily plans for later.",
  },
  {
    question: "Can I save and load my workout or meal plans?",
    answer:
      "Yes. Use the Save options in Workouts or Nutrition to store plans locally. You can quickly load, rename, or delete saved plans anytime.",
  },
  {
    question: "Is my data secure?",
    answer:
      "We use secure authentication and follow best practices to protect your account data. Only you can access your saved content on your device.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes. You can get started for free and upgrade to Pro for advanced AI features, unlimited saved plans, and priority support.",
  },
  {
    question: "How do I change my password or account details?",
    answer:
      "Go to Settings → Security to change your password. Account info like name and avatar can be updated from Profile.",
  },
];

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="FAQs" className="py-16 px-4" style={{ backgroundColor: '#FAF7F2' }}>
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-[#EADFD0]">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Find answers to common questions about our platform and services.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((item, index) => (
            <div
              key={index}
              className="border-b last:border-none border-[#EADFD0] pb-4"
            >
              <button
                className="w-full flex items-center justify-between text-left"
                onClick={() => toggle(index)}
              >
                <span className="text-lg font-medium text-gray-800">{item.question}</span>
                <motion.div
                  animate={{ rotate: activeIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                </motion.div>
              </button>

              
            <AnimatePresence initial={false}>
            {activeIndex === index && (
                <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
                >
                <div className="py-2">
                    <p className="text-gray-800 text-sm leading-relaxed">
                    {item.answer}
                    </p>
                </div>
                </motion.div>
            )}
            </AnimatePresence>

            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      {/* bg-gradient-to-r from-pink-100 to-pink-200 rounded-3xl px-6 py-10 my-10 max-w-5xl mx-4 md:mx-auto */}
      <div className="mt-10 max-w-2xl mx-auto bg-[#F5EFE6] rounded-2xl shadow-lg px-6 py-8 text-center border border-[#EADFD0]">
        <div className="flex justify-center mb-3 -space-x-3">
          <img
            src="https://randomuser.me/api/portraits/men/42.jpg"
            className="w-9 h-9 rounded-full border-2 border-white"
            alt=""
          />
          <img
            src="https://randomuser.me/api/portraits/women/39.jpg"
            className="w-9 h-9 rounded-full border-2 border-white"
            alt=""
          />
          <img
            src="https://randomuser.me/api/portraits/men/56.jpg"
            className="w-9 h-9 rounded-full border-2 border-white"
            alt=""
          />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">
          Still have questions?
        </h3>
        <p className="text-sm text-gray-500 mt-1 mb-4">
          Our support team is here to help you out!
        </p>
        <button className="bg-black text-white px-5 py-2 rounded-md hover:bg-gray-900 transition">
          Get in Touch
        </button>
      </div>
    </section>
  );
};

export default FAQSection;
