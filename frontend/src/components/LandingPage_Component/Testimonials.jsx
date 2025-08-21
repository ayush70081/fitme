import React from 'react';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Arjun Sharma",
      role: "Software Engineer, Bengaluru",
      text: "FitMe's AI Coach plans around my IT schedule. Quick answers and weekly routines keep me consistent even on late shifts.",
      rating: 5
    },
    {
      name: "Neha Patel",
      role: "Working Professional, Mumbai",
      text: "The macro-based meal plans work great with Indian meals. I hit protein goals without overthinking and save time on groceries.",
      rating: 5
    },
    {
      name: "Rahul Verma",
      role: "Entrepreneur, Delhi",
      text: "Smart scheduling and progress charts keep me accountable. I finally stuck to training for 12 weeks straight and feel stronger.",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#FAF7F2' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-prime-blue mb-4">
            What our customers say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real stories from people getting fitter with FitMe—AI coaching, smart meal planning, and clear progress.
          </p>
        </div>

                {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="text-center bg-white p-6 rounded-lg shadow-md">
              <div className="mb-6">
                <p className="text-gray-700 text-base leading-relaxed italic mb-4">
                  "{testimonial.text}"
                </p>
              </div>
              
              <div className="flex items-center justify-center mb-2">
                <div className="w-12 h-12 bg-prime-blue text-white rounded-full flex items-center justify-center font-bold mr-3">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 text-base">
                    {testimonial.name}
                  </div>
                  <div className="text-prime-blue text-sm">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
