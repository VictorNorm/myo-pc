import React from 'react'
import { NavLink } from 'react-router-dom';

function Nav() {
  // Define the active style
  const activeStyle = {
    borderBottom: "2px solid white",
    // You can add more styles as needed
  };

  return (
    <div className='nav'>
        <ul>
            <li>
              <NavLink to="/programs" style={({ isActive }) => 
                isActive ? activeStyle : undefined
              }>Programs</NavLink>
            </li>
            <li>
              <NavLink to="/exercises" style={({ isActive }) => 
                isActive ? activeStyle : undefined
              }>Exercises</NavLink>
            </li>
            <li>
              <NavLink to="/clients" style={({ isActive }) => 
                isActive ? activeStyle : undefined
              }>Clients</NavLink>
            </li>
        </ul>
    </div>
  )
}

export default Nav