import React, { useState, useEffect } from "react";

// Helper to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().slice(0, 10);
};

const DailyRoutine = () => {
  // Load tasks from localStorage, but only if date matches today
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("dailyTasks");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.date === getTodayDate() && Array.isArray(parsed.tasks)) {
          return parsed.tasks.map((task) => ({
            ...task,
            addedTime: new Date(task.addedTime),
          }));
        }
      } catch {}
    }
    // If no valid tasks for today, start empty
    return [];
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [newTask, setNewTask] = useState({
    category: "",
    name: "",
    calories: ""
  });

  const colors = ["bg-green-100", "bg-yellow-100", "bg-orange-100", "bg-blue-100", "bg-pink-100"];

  // Default time slots
  const defaultTimeSlots = [
    "7:00 AM",
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "7:00 PM",
  ];

  // Helper to parse time string (e.g., '8:00 PM') to minutes since midnight
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  // Collect all unique times from tasks
  const taskTimes = tasks.map(task => task.time).filter(Boolean);
  const allTimesSet = new Set([...defaultTimeSlots, ...taskTimes]);
  const allTimesSorted = Array.from(allTimesSet).sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));

  // When tasks change, save with today's date
  useEffect(() => {
    localStorage.setItem(
      "dailyTasks",
      JSON.stringify({ date: getTodayDate(), tasks })
    );
  }, [tasks]);

  // When checking for temporary tasks, also check if date changed (in case app left open overnight)
  useEffect(() => {
    const checkTemporaryTasks = () => {
      const now = new Date();
      // If date changed, clear tasks
      if (getTodayDate() !== (JSON.parse(localStorage.getItem("dailyTasks") || '{}').date)) {
        setTasks([]);
        localStorage.setItem(
          "dailyTasks",
          JSON.stringify({ date: getTodayDate(), tasks: [] })
        );
        return;
      }
      const updatedTasks = tasks.filter((task) => {
        const timeDiff = (now - new Date(task.addedTime)) / (1000 * 60 * 60);
        return timeDiff < 12;
      });
      setTasks(updatedTasks);
    };

    const interval = setInterval(checkTemporaryTasks, 60 * 1000);
    return () => clearInterval(interval);
  }, [tasks]);

  const toggleTaskCompletion = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);
  };

  const openModal = (time) => {
    setSelectedTime(time);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setNewTask({ category: "", name: "", calories: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
  };

  const addTask = () => {
    if (newTask.category && newTask.name && newTask.calories) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const taskToAdd = {
        time: selectedTime,
        category: newTask.category,
        name: newTask.name,
        calories: parseFloat(newTask.calories),
        completed: false,
        color: randomColor,
        addedTime: new Date(),
      };
      setTasks([...tasks, taskToAdd]);
      closeModal();
    } else {
      alert("Please fill in all fields!");
    }
  };

  return (
    <div className={`relative w-full max-w-md mx-auto p-4 ${showModal ? "backdrop-blur-sm" : ""}`}>
      <div className={`transition-all ${showModal ? "pointer-events-none" : ""}`}>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Daily Routine Overview</h2>

        {/* Timeline */}
        <div className="space-y-2">
          {allTimesSorted.map((time, index) => {
            const taskAtTime = tasks.find((task) => task.time === time);

            return (
              <div key={index} className="flex items-center">
                {/* Time Label */}
                <div className="w-20 text-sm text-gray-600">{time}</div>

                {/* Task or Add Button */}
                <div className="flex-1">
                  {taskAtTime ? (
                    <div
                      className={`flex items-center justify-between p-3 rounded-lg shadow-sm ${taskAtTime.color} transition-all ${
                        taskAtTime.completed ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={taskAtTime.completed}
                          onChange={() => toggleTaskCompletion(tasks.indexOf(taskAtTime))}
                          className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{taskAtTime.category}</p>
                          <p className="text-sm text-gray-600">{taskAtTime.name}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{taskAtTime.calories} kcal</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1 h-px bg-gray-300"></div>
                      <button
                        className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                        onClick={() => openModal(time)}
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4v16m8-8H4"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Add New Task at {selectedTime}</h3>
            <div className="space-y-4">
              <input
                type="text"
                name="category"
                value={newTask.category}
                onChange={handleInputChange}
                placeholder="Category (e.g., Breakfast)"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="name"
                value={newTask.name}
                onChange={handleInputChange}
                placeholder="Task Name (e.g., Oatmeal)"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                name="calories"
                value={newTask.calories}
                onChange={handleInputChange}
                placeholder="Calories (e.g., 280)"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex space-x-2">
                <button
                  onClick={addTask}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all"
                >
                  Add Task
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyRoutine;
