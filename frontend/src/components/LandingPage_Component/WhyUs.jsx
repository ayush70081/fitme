// WhyUsSection.jsx
import React from "react";
import { FaCalendarAlt, FaExchangeAlt, FaFileMedical, FaWallet, FaHeartbeat } from "react-icons/fa";
import { BiBot } from "react-icons/bi";

const features = [
  {
    icon: <BiBot className="text-2xl text-pink-400" />,
    title: "Easy-to-Use",
    description: "Intuitive interface, streamlined appointment scheduling, secure messaging, and user-friendly health ...",
  },
  {
    icon: <FaCalendarAlt className="text-2xl text-pink-400" />,
    title: "Book appointments",
    description: "Book face-to-face or remote online appointments with your GP, nurse or clinician at a time that suits you ...",
  },
  {
    icon: <FaExchangeAlt className="text-2xl text-pink-400" />,
    title: "Order repeat prescriptions",
    description: "Order your repeat prescriptions online, with convenient delivery of your prescription to your local pharmacy ...",
  },
  {
    icon: <FaFileMedical className="text-2xl text-pink-400" />,
    title: "Share your medical record",
    description: "Securely share your information with healthcare professionals of your choosing, without the need to ...",
  },
  {
    icon: <FaWallet className="text-2xl text-pink-400" />,
    title: "Save Time. Save Money",
    description: "Efficient appointment booking, cost-effective telemedicine options, and streamlined billing processes to ...",
  },
  {
    icon: <FaHeartbeat className="text-2xl text-pink-400" />,
    title: "Grow Health",
    description: "Personalized wellness plans, health tracking, and access to educational resources for continuous health ...",
  },
];

const WhyUs = () => {
  return (
    <section id="why us" className="bg-white text-black py-16 px-4 sm:px-6 md:px-12 rounded-t-[40px]">
      <div className="max-w-7xl mx-auto text-center">
        <span className="inline-block bg-pink-100 text-pink-600 text-xs font-semibold px-4 py-1 rounded-full mb-4 uppercase">
          Why Should Us?
        </span>
        <h2 className="text-3xl sm:text-4xl font-semibold leading-snug">
          For your physical & mental health. For clinicians & hospitals. <br />
          For all of it in one place. For life.
        </h2>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-left space-y-3 bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">

              <div className="w-10 h-10 flex items-center justify-center bg-pink-100 rounded-md">
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
