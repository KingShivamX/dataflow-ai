import React from "react"
import { Link } from "react-router-dom"

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-2xl sm:text-4xl font-bold text-blue-600 mb-4 text-center">
                Welcome to DataFlowAI
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 text-center mb-4">
                Learn, Model, and Visualize Your Data Effortlessly with
                DataFlowAI.
            </p>
            <p className="text-md sm:text-lg text-gray-600 text-center mb-2">
                Our app provides a comprehensive platform for data enthusiasts
                and professionals to explore and analyze datasets.
            </p>
            <p className="text-md sm:text-lg text-gray-600 text-center mb-2">
                With DataFlowAI, you can easily select datasets, implement
                algorithms, and visualize results in an intuitive interface.
            </p>
            <p className="text-md sm:text-lg text-gray-600 text-center">
                Join us on a journey to make data analysis accessible and
                efficient for everyone.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center mt-6 w-full">
                <Link
                    to="/dataset-selection"
                    className="px-6 py-2 bg-blue-600 text-white rounded-full text-center"
                >
                    Get Started
                </Link>
                <Link
                    to="/visualization"
                    className="px-6 py-2 bg-white text-blue-600 border border-blue-600 rounded-full text-center mt-2 sm:mt-0 sm:ml-4"
                >
                    Visualize
                </Link>
            </div>
        </div>
    )
}

export default Home
