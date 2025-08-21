import React from 'react'
import Navbar from "../components/LandingPage_Component/Navbar";
import Hero from "../components/LandingPage_Component/Hero";
import Features from "../components/LandingPage_Component/Features";

import Testimonials from "../components/LandingPage_Component/Testimonials";
import FAQSection from '../components/LandingPage_Component/FAQSection';
import Footer from "../components/LandingPage_Component/Footer";
import PricingSection from "../components/LandingPage_Component/PricingSection";
const LandingPage = () => {
  return (
    <div className="font-sans scroll-smooth">

      <Navbar/>
      <Hero />
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-250"></div>
      <Features/>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-250"></div>
      <Testimonials/>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-250"></div>
      <PricingSection/>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-250"></div>
      <FAQSection />
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-250"></div>
      <Footer/>
    </div>
  )
}

export default LandingPage