import React from "react";
import { Link } from "react-router-dom";
import {
  FaRobot,
  FaUtensils,
  FaDumbbell,
  FaChartLine,
  FaArrowRight
} from "react-icons/fa";

const Features = () => {
  const FeatureCard = ({ feature }) => (
    <div 
      className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
    >
      {/* Icon */}
      <div className="flex items-center justify-center w-16 h-16 bg-gray-50 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
        {feature.icon}
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        {feature.title}
      </h3>
      <p className="text-gray-600 mb-6 leading-relaxed">
        {feature.description}
      </p>

      {/* Benefits */}
      <ul className="space-y-2 mb-6">
        {feature.benefits.map((benefit, idx) => (
          <li key={idx} className="flex items-center text-sm text-gray-700">
            <div className="w-1.5 h-1.5 bg-prime-blue rounded-full mr-3"></div>
            {benefit}
          </li>
        ))}
      </ul>

      {/* Learn More Link */}
      <Link 
        to="/register"
        className="inline-flex items-center text-prime-blue font-medium hover:text-blue-700 transition-colors group/link"
      >
        Learn More
        <FaArrowRight className="ml-2 text-sm group-hover/link:translate-x-1 transition-transform" />
      </Link>
    </div>
  );

  const features = [
    {
      icon: <FaRobot className="text-4xl text-blue-600" />,
      title: "AI-Powered Coach",
      description: "Get personalized workout recommendations and nutrition advice from our intelligent AI coach that learns from your progress and preferences.",
      benefits: ["24/7 Availability", "Personalized Guidance", "Adaptive Learning"]
    },
    {
      icon: <FaDumbbell className="text-4xl text-blue-700" />,
      title: "Workout Generator",
      description: "Create effective workout routines tailored to your fitness level, available equipment, and time constraints for maximum results.",
      benefits: ["Equipment Flexible", "Time Efficient", "Progressive Loading"]
    },
    {
      icon: <FaUtensils className="text-4xl text-green-600" />,
      title: "Smart Meal Planning",
      description: "Generate customized meal plans that match your dietary preferences, fitness goals, and nutritional requirements with precise macro tracking.",
      benefits: ["Custom Nutrition", "Macro Tracking", "Recipe Suggestions"]
    },
    {
      icon: <FaChartLine className="text-4xl text-blue-800" />,
      title: "Progress Analytics",
      description: "Track your fitness journey with comprehensive analytics, detailed progress reports, and actionable insights to stay motivated.",
      benefits: ["Visual Progress", "Performance Metrics", "Goal Tracking"]
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#FAF7F2' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to
            <span className="text-prime-blue block mt-2">Transform Your Fitness</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our comprehensive platform combines cutting-edge AI technology with proven fitness methodologies 
            to deliver personalized results that adapt to your unique lifestyle and goals.
          </p>
        </div>

        {/* Top 2 Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
          {features.slice(0, 2).map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>

        {/* Bottom 2 Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          {features.slice(2, 4).map((feature, index) => (
            <FeatureCard key={index + 2} feature={feature} />
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white border-2 border-gray-200 rounded-2xl p-8 lg:p-12">
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Transformation?
          </h3>
          <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
            Join thousands of users who have already transformed their lives with FitMe's 
            intelligent fitness platform. Start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-prime-blue text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-all"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="border-2 border-prime-blue text-prime-blue font-semibold px-8 py-3 rounded-lg hover:bg-gray-50 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
