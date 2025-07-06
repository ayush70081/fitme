import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";


// Dummy data (can be replaced by user data later)
const data = [
  { date: "Week 1", weight: 75, stamina: 40 },
  { date: "Week 2", weight: 73.5, stamina: 45 },
  { date: "Week 3", weight: 72, stamina: 52 },
  { date: "Week 4", weight: 70.5, stamina: 60 },
];

const FitnessGrowthChart = () => {
  return (
    <motion.div
      className="p-4 rounded-2xl shadow bg-white"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-xl font-bold text-center mb-4 text-gray-800">
        Your Fitness Progress
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          {/* Background Grid */}
          <CartesianGrid strokeDasharray="3 3" />

          {/* Axis Labels */}
          <XAxis dataKey="date" stroke="#8884d8" />
          <YAxis stroke="#8884d8" />

          {/* Tooltip */}
          <Tooltip />

          {/* Legend */}
          <Legend />

          {/* Gradient for Weight Line */}
          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff7e5f" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#feb47b" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="staminaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6a11cb" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#2575fc" stopOpacity={0.2} />
            </linearGradient>
          </defs>

          {/* Lines */}
          <Line
            type="monotone"
            dataKey="weight"
            stroke="url(#weightGradient)"
            strokeWidth={3}
            dot={{ r: 6, fill: "#ff7e5f", stroke: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 8 }}
          />

          <Line
            type="monotone"
            dataKey="stamina"
            stroke="url(#staminaGradient)"
            strokeWidth={3}
            dot={{ r: 6, fill: "#6a11cb", stroke: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default FitnessGrowthChart;
