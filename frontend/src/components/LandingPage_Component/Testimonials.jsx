import React, { useRef } from 'react';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

const testimonials = [
  {
    name: "Priya Sharma",
    image: "https://randomuser.me/api/portraits/women/12.jpg?nat=in",
    text: "This portal has been a game-changer for me. The wellness articles are insightful, and the telehealth service is convenient. It's like having a health companion in my pocket.",
    stars: 5,
  },
  {
    name: "Rajesh Kumar",
    image: "https://randomuser.me/api/portraits/men/22.jpg?nat=in",
    text: "I've been using this platform for a while now, and it's been a reliable source of health information. The advice is practical, and the community support is fantastic.",
    stars: 4,
  },
  {
    name: "Anjali Patel",
    image: "https://randomuser.me/api/portraits/women/33.jpg?nat=in",
    text: "I can't thank this portal enough. It connected me with qualified health experts, and the telehealth consultation provided peace of mind.",
    stars: 5,
  },
  {
    name: "Vikram Singh",
    image: "https://randomuser.me/api/portraits/men/41.jpg?nat=in",
    text: "FitMe has transformed my fitness journey completely. The personalized workout plans and nutrition guidance are exactly what I needed to achieve my goals.",
    stars: 5,
  },
  {
    name: "Meera Reddy",
    image: "https://randomuser.me/api/portraits/women/27.jpg?nat=in",
    text: "The AI coach feature is incredible! It understands my needs and provides tailored recommendations that actually work. Highly recommend for anyone serious about fitness.",
    stars: 5,
  },
  {
    name: "Arjun Gupta",
    image: "https://randomuser.me/api/portraits/men/15.jpg?nat=in",
    text: "As someone with a busy schedule, FitMe helps me stay consistent with my fitness goals. The meal planning and tracking features are user-friendly and effective.",
    stars: 4,
  },
  {
    name: "Kavita Jain",
    image: "https://randomuser.me/api/portraits/women/48.jpg?nat=in",
    text: "The progress tracking and analytics have been eye-opening. I can see real improvements in my fitness levels, and the app keeps me motivated every day.",
    stars: 5,
  },
];

const Testimonials = () => {
  const scrollRef = useRef();

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (direction === 'left') current.scrollLeft -= 300;
    if (direction === 'right') current.scrollLeft += 300;
  };

  return (
    <section className="bg-prime-blue py-10 relative text-center sm:px-6 md:px-10 rounded-[30px] mx-4 sm:mx-2 md:mx-6">
      <p className="text-sm text-white mb-2">3940+ Happy FitMe Users</p>
      <h2 className="text-3xl text-white font-semibold mb-10">Don’t just take our words</h2>

      <div className="relative">
        <div
          className="flex gap-6 overflow-x-auto px-4 scrollbar-hide scroll-smooth"
          ref={scrollRef}
        >
          {testimonials.map((t, index) => (
          <div
            key={index}
            className="w-[90vw] sm:min-w-[320px] sm:max-w-sm bg-white p-6 rounded-3xl shadow-md flex-shrink-0 mx-auto"
          >
            <div className="flex items-center gap-4 mb-4">
              <img
                src={t.image}
                alt={t.name}
                className="w-16 h-16 rounded-2xl object-cover"
              />
              <div className="text-left">
                <p className="text-gray-800 font-medium">{t.name}</p>
                <p className="text-yellow-400">
                  {"★".repeat(t.stars)}{"☆".repeat(5 - t.stars)}
                </p>
              </div>
            </div>
            <p className="text-gray-700 text-left text-sm">{t.text}</p>
          </div>
        ))}

        </div>

        <div className="translate-y-[12px] flex justify-center items-center gap-3 w-full">
          <button
            onClick={() => scroll('left')}
            className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
          >
            <FiArrowLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
          >
            <FiArrowRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
