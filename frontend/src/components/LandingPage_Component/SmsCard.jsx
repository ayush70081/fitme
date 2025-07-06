import React from "react";
import fit from '../../assets/fit_couple_white.jpg';

const SmsCard = () => {
  return (
    <section id="about" className="bg-gradient-to-r from-pink-100 to-pink-200 rounded-3xl px-6 py-10 my-10 max-w-5xl mx-4 md:mx-auto"> 
        {/* "bg-gradient-to-r from-pink-100 to-pink-200 rounded-3xl px-6 py-10 my-10 max-w-5xl mx-auto"> */}
        {/* sm:px-6 md:px-10 rounded-[30px] mx-4 sm:mx-2 md:mx-6 */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Content */}
        <div className="text-center md:text-left max-w-xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
            Have queries about Imwell?
          </h2>
          <p className="text-gray-700 mb-6">
            Contact our experts and get personalized assistance to know ways Imwell can benefit your health.
          </p>
          <button className="bg-[#0c0c1d] hover:bg-[#1c1c2e] text-white px-5 py-2 rounded-full font-medium transition">
            Book a Call
          </button>
        </div>

        {/* Right Illustration */}
        <div className="w-full flex items-center justify-center max-w-sm">
          <img
            src={fit}// Replace with your image path
            alt="Book a call"
            className=" h-50 rounded-3xl"
          />
        </div>
      </div>
    </section>
  );
};

export default SmsCard;
