import React from 'react'
import Navbar from "../components/LandingPage_Component/Navbar";
import Hero from "../components/LandingPage_Component/Hero";
import WhyUs from "../components/LandingPage_Component/WhyUs";
import FeatureTab from "../components/LandingPage_Component/FetureTab";
import SmsCard from "../components/LandingPage_Component/SmsCard";
import TestimonialSlider from "../components/LandingPage_Component/Testimonials";
import FAQSection from '../components/LandingPage_Component/FAQSection';
import Footer from "../components/LandingPage_Component/Footer";
import PricingSection from "../components/LandingPage_Component/PricingSection";
const LandingPage = () => {
  return (
    <div className="font-sans scroll-smooth">

      <Navbar/>
      <Hero />
      <WhyUs/>
      <FeatureTab/>
      <SmsCard/>
      <TestimonialSlider/>
      <PricingSection/>
      <FAQSection />
      <Footer/>
    </div>
  )
}

export default LandingPage