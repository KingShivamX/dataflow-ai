import React from "react"
import { useNavigate } from "react-router-dom"

const Home = () => {
    const navigate = useNavigate()

    const algorithms = [
        { path: "/linear-regression", name: "Linear Regression" },
        { path: "/knn", name: "K-Nearest Neighbors" },
        { path: "/kmeans", name: "K-Means Clustering" },
        { path: "/perceptron", name: "Simple Neural Network" },
    ]

    return (
        <>
            <div className="container mx-auto p-4 md:p-8 min-h-[84vh] flex flex-col justify-start items-center bg-gradient-to-br from-yellow-100 via-blue-50 to-yellow-100">
                <div className="flex flex-col justify-start items-center text-center">
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent hover:bg-yellow-500 transition-colors">
                        Welcome to DataFlowAI
                    </h1>
                    <h3 className="text-lg md:text-xl font-bold mt-2">
                        Data<span className="text-blue-500">Flow</span>AI is a
                        platform for visualizing machine learning algorithms.
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 mt-8 mb-8 md:mb-16 md:mt-16  max-w-4xl mx-auto">
                    {algorithms.map((algo) => (
                        <div
                            key={algo.path}
                            onClick={() => navigate(algo.path)}
                            className="w-full bg-white/80 backdrop-blur-sm rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex items-center justify-center cursor-pointer p-4 h-32"
                        >
                            <h3 className="text-xl font-semibold text-gray-800 hover:text-yellow-500 transition-colors">
                                {algo.name}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default Home
