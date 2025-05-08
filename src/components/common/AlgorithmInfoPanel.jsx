import React from 'react';
import { algorithmData } from '../../data/algorithmData';
import { useNavigate } from 'react-router-dom';

const AlgorithmInfoPanel = ({ algorithm, onStartTutorial }) => {
  const algorithmInfo = algorithmData[algorithm];
  const navigate = useNavigate();

  if (!algorithmInfo) {
    return null;
  }

  return (
    <div className="mb-8 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{algorithmInfo.title}</h1>
            <p className="text-gray-700 text-lg mb-6">{algorithmInfo.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Key Concepts</h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  {algorithmInfo.concepts.map((concept, index) => (
                    <li key={index}>{concept}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Real-World Applications</h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  {algorithmInfo.realWorldUses.map((use, index) => (
                    <li key={index}>{use}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Important Points</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                {algorithmInfo.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="md:w-1/3 flex justify-center">
            <div className="w-64 h-64 rounded-lg overflow-hidden shadow-md">
              <img 
                src={algorithmInfo.image} 
                alt={`${algorithmInfo.title} visualization`} 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-4 mt-6">
          <button
            onClick={onStartTutorial}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md"
          >
            Start Interactive Tutorial
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmInfoPanel; 