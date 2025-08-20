import React from 'react';
import { Link } from 'react-router-dom';
import fit from '../../assets/fit_couple_white.jpg';

const HeroSection = () => {
  return (
    <section id="home" className="bg-prime-blue text-white py-16 px-4 sm:px-6 md:px-10 rounded-[30px] mx-4 sm:mx-2 md:mx-6  ">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
        {/* LEFT - Text Content */}
        <div className="flex-1 text-center md:text-left">

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-snug">
            Build the Body <br />
            <span className="text-gray-300">You've Always Wanted</span>
          </h1>

          <p className="mt-4 text-gray-300 text-sm sm:text-base md:text-lg">
            Get personalized workout plans, nutrition guidance, and AI coaching to reach your fitness goals faster than ever before. Join thousands who've transformed their lives with FitMe.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              to="/login"
              className="w-full sm:w-auto duration-200 border border-white bg-white text-black font-medium px-6 py-2 rounded-md hover:bg-[#1a1a2e] hover:text-white text-center"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto duration-200 border border-white font-medium px-6 py-2 rounded-md hover:bg-white hover:text-black text-center"
            >
              Register Now!
            </Link>
          </div>

        </div>

        {/* RIGHT - Image Section */}
        <div className="w-full sm:w-[300px] md:w-[400px] lg:w-[432px] aspect-square z-10 rounded-[30px] overflow-hidden shadow-lg">
          <img src={fit} alt="elderly using phone" className="object-cover w-full h-full" />
        </div>
      </div>
    </section>

  );
};

export default HeroSection;
