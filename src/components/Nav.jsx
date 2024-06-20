import React from 'react'
import { NavLink } from 'react-router-dom';

function Nav() {
  // Define the active style
  const activeStyle = {
    fontSize: "bold",
    // You can add more styles as needed
  };

  return (
    <div className='nav'>
      <ul>
        <li className="dropdown">
          <NavLink to="/programs" style={({ isActive }) => 
            isActive ? activeStyle : undefined
          }>Programs</NavLink>
          <div className="dropdown-content">
            <NavLink to="/programs" style={({ isActive }) => 
              isActive ? activeStyle : undefined
            }>Create program</NavLink>
            <NavLink to="/myprograms" style={({ isActive }) => 
              isActive ? activeStyle : undefined
            }>My programs</NavLink>
            <NavLink to="/clientprograms" style={({ isActive }) => 
              isActive ? activeStyle : undefined
            }>Client programs</NavLink>
          </div>
        </li>
        <li className="dropdown">
          <NavLink to="/exercises" style={({ isActive }) => 
            isActive ? activeStyle : undefined
          }>Exercises</NavLink>
          <div className="dropdown-content">
            <NavLink to="/exercises" style={({ isActive }) => 
              isActive ? activeStyle : undefined
            }>Exercises</NavLink>
            <NavLink to="/spaceholder1" style={({ isActive }) => 
              isActive ? activeStyle : undefined
            }>Spaceholder</NavLink>
            <NavLink to="/spaceholder2" style={({ isActive }) => 
              isActive ? activeStyle : undefined
            }>Spaceholder</NavLink>
          </div>
        </li>
        <li className="dropdown">
          <NavLink to="/clients" style={({ isActive }) => 
            isActive ? activeStyle : undefined
          }>Clients</NavLink>
          <div className="dropdown-content">
            <NavLink to="/clients" style={({ isActive }) => 
              isActive ? activeStyle : undefined
            }>Clients</NavLink>
            <NavLink to="/spaceholder1" style={({ isActive }) => 
              isActive ? activeStyle : undefined
            }>Spaceholder</NavLink>
            <NavLink to="/spaceholder2" style={({ isActive }) => 
              isActive ? activeStyle : undefined
            }>Spaceholder</NavLink>
          </div>
        </li>
      </ul>
    </div>
  );
}

export default Nav