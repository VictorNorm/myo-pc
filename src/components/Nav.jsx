import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';

function Nav() {
  const location = useLocation();
  const { isAuthenticated, clearAuth } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("adsdsd")
    clearAuth();
    navigate('/login'); 
  };
  
  const isParentActive = (paths) => {
    return paths.some(path => location.pathname === path);
  };

  const navItems = [
    {
      title: 'Programs',
      path: '/programs',
      dropdownItems: [
        { title: 'Create program', path: '/createProgramWithWorkouts' },
        // { title: 'Create program', path: '/programs' },
        { title: 'Edit program', path: '/editProgram' },
        { title: 'My programs', path: '/myprograms' }
      ]
    },
    {
      title: 'Exercises',
      path: '/exercises',
      dropdownItems: [
        { title: 'Exercises', path: '/exercises' },
        { title: 'Edit Exercises', path: '/editExercises' },
        { title: 'Add exercises to workout', path: '/addExercisesToWorkout' },
      ]
    },
    {
      title: 'Clients',
      path: '/clients',
      dropdownItems: [
        { title: 'Clients', path: '/clients' },
        { title: 'Spaceholder 1', path: '/spaceholder1' },
        { title: 'Spaceholder 2', path: '/spaceholder2' }
      ]
    }
  ];

  return (
    <nav className="nav">
      {/* Optional: Add logo */}
      <div className="nav-logo">
        Myo
      </div>
      
      <ul>
        {navItems.map((item, index) => (
          <li key={index} className="dropdown">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive || isParentActive(item.dropdownItems.map(i => i.path))
                  ? 'active'
                  : ''
              }
            >
              {item.title}
            </NavLink>
            <div className="dropdown-content">
              {item.dropdownItems.map((dropdownItem, dropdownIndex) => (
                <NavLink
                  key={dropdownIndex}
                  to={dropdownItem.path}
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  {dropdownItem.title}
                </NavLink>
              ))}
            </div>
          </li>
        ))}
      </ul>

      {/* Optional: Add right-side actions */}
      <div className="nav-actions">
        <button onClick={handleLogout} type='button' className="nav-logout">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Nav;