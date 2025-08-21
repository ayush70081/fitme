import React from 'react';
import { Link } from 'react-router-dom';
import fit from '../../assets/fit_couple_white.jpg';

const HeroSection = () => {
  return (
    <section id="home" className="text-gray-900 py-16" style={{ backgroundColor: '#FAF7F2' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-10">
        {/* LEFT - Text Content */}
        <div className="flex-1 text-center md:text-left">

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-snug">
            Build the Body <br />
            <span className="text-prime-blue">You've Always Wanted</span>
          </h1>

          <p className="mt-4 text-gray-600 text-sm sm:text-base md:text-lg">
            Get personalized workout plans, nutrition guidance, and AI coaching to reach your fitness goals faster than ever before. Join thousands who've transformed their lives with FitMe.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              to="/login"
              className="w-full sm:w-auto duration-200 border border-prime-blue bg-prime-blue text-white font-medium px-6 py-2 rounded-md hover:opacity-90 text-center"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto duration-200 border border-prime-blue font-medium px-6 py-2 rounded-md hover:bg-prime-blue hover:text-white text-center"
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
