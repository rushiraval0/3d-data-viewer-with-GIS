import React, { createContext, useContext, useState } from "react";

const ActivityContext = createContext();

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return context;
};

export const ActivityProvider = ({ children }) => {
  const [activities, setActivities] = useState([]);

  const addActivity = (activity) => {
    setActivities((prev) =>
      [
        {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...activity,
        },
        ...prev,
      ].slice(0, 10)
    );
  };

  const clearActivities = () => {
    setActivities([]);
  };

  return (
    <ActivityContext.Provider
      value={{ activities, addActivity, clearActivities }}
    >
      {children}
    </ActivityContext.Provider>
  );
};
