import React from 'react';

const StepProgressCard = () => {
  const goal = 8000;
  const walked = 4000;
  const remaining = goal - walked;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - walked / goal);

  return (
    <div className="w-80 h-52 bg-white rounded-2xl shadow-md p-4 font-sans">
      {/* Title */}
      <h2 className="text-lg font-semibold text-black mb-2">Walking</h2>

      {/* Subcard */}
      <div className="flex items-center justify-between bg-yellow-100 rounded-2xl p-4 h-36">
        {/* Step Details */}
        <div className="flex flex-col justify-evenly h-full">
          <div>
            <p className="text-gray-500 text-sm font-medium">Walked 🏃‍♂️</p>
            <p className="text-black text-sm font-bold">{walked} steps</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">My Goal 🍉</p>
            <p className="text-black text-sm font-bold">{goal} steps</p>
          </div>
        </div>

        {/* Circular Progress Bar */}
        <div className="relative w-24 h-24">
          <svg className="transform -rotate-90" width="96" height="96">
            {/* Background Circle */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#e5e7eb"
              strokeWidth="6"
              fill="none"
            />
            {/* Progress Circle */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#f472b6"
              strokeWidth="6"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          {/* Remaining Steps Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-black text-lg font-bold">{remaining}</p>
            <span className="text-gray-500 text-sm">left</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepProgressCard;
