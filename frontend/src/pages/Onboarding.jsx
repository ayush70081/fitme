import React, { useState } from "react";
import Location from "../components/Onboarding/Location";
import Goal from "../components/Onboarding/Goal";
import Gender from "../components/Onboarding/Gender";
import Birthday from "../components/Onboarding/Birthday";
import Height from "../components/Onboarding/Height";
import Weight from "../components/Onboarding/Weight";
import FitnessExperience from "../components/Onboarding/FitnessExperience";
import PreferredWorkouts from "../components/Onboarding/PreferredWorkouts";
import DietaryPreferences from "../components/Onboarding/DietaryPreferences";
import Summary from "../components/Onboarding/Summary";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    // Basic info
    goal: "",
    gender: "",
    birthday: "",
    height: "",
    currentWeight: "",
    goalWeight: "",
    location: "",
    
    // Extended questionnaire
    fitnessExperience: "",
    preferredWorkouts: [],
    dietaryPreference: "",
    
    // Dynamic goal-specific fields
    targetMuscleGain: "",
    currentStrengthLevel: ""
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleChange = (input) => (e) => {
    let value = e.target.value;
    if (input === 'birthday') {
      // If user enters date in DD/MM/YYYY or D/M/YYYY format, convert to YYYY-MM-DD
      const match = value.match(/^(\d{1,2})[\/](\d{1,2})[\/](\d{4})$/);
      if (match) {
        const [, day, month, year] = match;
        const paddedDay = day.padStart(2, '0');
        const paddedMonth = month.padStart(2, '0');
        value = `${year}-${paddedMonth}-${paddedDay}`;
      }
    }
    setUserData({ ...userData, [input]: value });
  };

  // Special handler for array fields
  const handleArrayChange = (input) => (value) => {
    setUserData({ ...userData, [input]: value });
  };

  // General update data function for complex components
  const updateData = (data) => {
    setUserData({ ...userData, ...data });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Goal nextStep={nextStep} handleChange={handleChange} values={userData} />;
      case 2:
        return <Gender nextStep={nextStep} prevStep={prevStep} handleChange={handleChange} values={userData} />;
      case 3:
        return <Birthday nextStep={nextStep} prevStep={prevStep} handleChange={handleChange} values={userData} />;
      case 4:
        return <Height nextStep={nextStep} prevStep={prevStep} handleChange={handleChange} values={userData} />;
      case 5:
        return <Weight nextStep={nextStep} prevStep={prevStep} handleChange={handleChange} values={userData} />;
      case 6:
        return <FitnessExperience nextStep={nextStep} prevStep={prevStep} handleChange={handleChange} values={userData} />;
      case 7:
        return <PreferredWorkouts nextStep={nextStep} prevStep={prevStep} handleChange={handleArrayChange} values={{...userData, updateData}} />;
      case 8:
        return <DietaryPreferences nextStep={nextStep} prevStep={prevStep} handleChange={handleChange} values={{...userData, updateData}} />;
      case 9:
        return <Location nextStep={nextStep} prevStep={prevStep} handleChange={handleChange} values={userData} />;
      case 10:
        return <Summary prevStep={prevStep} values={userData} />;
      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Step {step} of 10</span>
            <span>{Math.round((step / 10) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-pink-500 to-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 10) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {renderStep()}
      </div>
    </div>
  );
};

export default Onboarding; 