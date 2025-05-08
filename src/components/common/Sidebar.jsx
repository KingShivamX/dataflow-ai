import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ onToggle }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  const menuItems = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'About', path: '/about', icon: 'ℹ️' },
    { name: 'Information', path: '/information', icon: '📚' },
    { name: 'FAQs', path: '/faqs', icon: '❓' },
  ];

  return (
    <div 
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } fixed left-0 top-0 h-screen bg-gray-800 transition-all duration-300 z-10`}
    >
      {/* Sidebar Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-white">
            Data<span className="text-blue-400">Flow</span>
            <span className="text-yellow-400">AI</span>
          </h1>
        )}
        <button 
          onClick={toggleSidebar} 
          className="text-white hover:bg-gray-700 p-2 rounded-md"
        >
          {isCollapsed ? '≡' : '◀'}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path} className="mb-2">
              <div
                onClick={() => navigate(item.path)}
                className={`
                  flex items-center px-4 py-3 cursor-pointer transition-colors
                  ${location.pathname === item.path ? 'bg-gray-700 text-yellow-400' : 'text-gray-300 hover:bg-gray-700'}
                `}
              >
                <div className="flex items-center">
                  <span className="text-xl">{item.icon}</span>
                  {!isCollapsed && <span className="ml-4">{item.name}</span>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Utility Buttons */}
      <div className="absolute bottom-6 left-0 right-0 px-4">
        <div className="flex flex-col space-y-2">          
          {/* Help Button */}
          <button
            onClick={() => navigate('/faqs')}
            className="flex items-center justify-center text-white hover:bg-gray-700 p-3 rounded-md transition-colors"
            title="Get help"
          >
            {isCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Help & Support</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 