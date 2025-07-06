import React, { useState, useEffect } from "react";

const DailyRoutine = () => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("dailyTasks");
    return savedTasks
      ? JSON.parse(savedTasks).map((task) => ({
          ...task,
          addedTime: new Date(task.addedTime),
        }))
      : [
          {
            time: "7:00 AM",
            category: "Breakfast",
            name: "Overnight oat",
            calories: 280,
            completed: false,
            color: "bg-green-100",
            isPermanent: true,
            addedTime: new Date(),
          },
          {
            time: "9:00 AM",
            category: "Snacks",
            name: "Banana",
            calories: 88.7,
            completed: false,
            color: "bg-yellow-100",
            isPermanent: true,
            addedTime: new Date(),
          },
          {
            time: "1:00 PM",
            category: "Lunch",
            name: "Banana",
            calories: 88.7,
            completed: false,
            color: "bg-orange-100",
            isPermanent: true,
            addedTime: new Date(),
          },
        ];
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [newTask, setNewTask] = useState({
    category: "",
    name: "",
    calories: "",
    isPermanent: true,
  });

  const colors = ["bg-green-100", "bg-yellow-100", "bg-orange-100", "bg-blue-100", "bg-pink-100"];

  const timeSlots = [
    "7:00 AM",
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
  ];

  useEffect(() => {
    localStorage.setItem("dailyTasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const checkTemporaryTasks = () => {
      const now = new Date();
      const updatedTasks = tasks.filter((task) => {
        if (!task.isPermanent) {
          const timeDiff = (now - new Date(task.addedTime)) / (1000 * 60 * 60);
          return timeDiff < 12;
        }
        return true;
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
    setNewTask({ category: "", name: "", calories: "", isPermanent: true });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
  };

  const handlePermanenceChange = (e) => {
    setNewTask({ ...newTask, isPermanent: e.target.value === "permanent" });
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
        isPermanent: newTask.isPermanent,
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
          {timeSlots.map((time, index) => {
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
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Save this task as:</p>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="permanence"
                      value="permanent"
                      checked={newTask.isPermanent}
                      onChange={handlePermanenceChange}
                      className="mr-2"
                    />
                    Permanent
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="permanence"
                      value="temporary"
                      checked={!newTask.isPermanent}
                      onChange={handlePermanenceChange}
                      className="mr-2"
                    />
                    Temporary (12 hours)
                  </label>
                </div>
              </div>
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
