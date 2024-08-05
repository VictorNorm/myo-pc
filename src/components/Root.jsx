import React, { useState } from 'react';
import { Outlet, useLocation } from "react-router-dom";
import Nav from "./Nav";
import Header from "./Header";
import Sidebar from "./Sidebar"

export default function Root() {
    const location = useLocation();
    const hideNavPaths = ['/login', "/signup", "/verify-email"];
    const [workoutExercises, setWorkoutExercises] = useState({});

    const handleDragStart = (e, exercise) => {
      e.dataTransfer.setData('application/json', JSON.stringify(exercise));
    };

    const handleDragOver = (e) => {
      e.preventDefault();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      const droppedExercise = JSON.parse(e.dataTransfer.getData('application/json'));
      setWorkoutExercises((prevExercises) => {
        const group = droppedExercise.muscle_group;
        return {
          ...prevExercises,
          [group]: [...(prevExercises[group] || []), droppedExercise]
        };
      });
    };

    return (
      <>
        <div className="app-container">
          {location.pathname === '/addExercisesToWorkout' && <Sidebar onDragStart={handleDragStart} />}
          <div className="main-content">
            {!hideNavPaths.includes(location.pathname) && <Header />}
            {!hideNavPaths.includes(location.pathname) && <Nav />}
            <div 
              className="App"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Outlet context={{ workoutExercises }} />
            </div>
          </div>
        </div>
      </>
    );
  }
