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
                <div className="flex flex-col md:flex-row gap-8 items-center justify-center max-w-4xl mx-auto mt-8 md:mt-16">
                    <div className="w-full md:w-2/5">
                        <img
                            src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNncxbHI4dzVxeDJpNmVnaHJzdTI3NHNleTRxMGxyMmFrdWJ3dDY4ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MCd33lAKSLajqWT60m/giphy.webp"
                            alt="Machine Learning Visualization"
                            className="rounded-lg w-full shadow-lg"
                        />
                    </div>
                    <div className="w-full md:w-2/5 space-y-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            What is Machine Learning?
                        </h2>
                        <p className="text-gray-600 text-base md:text-lg">
                            Machine Learning is teaching computers to learn from
                            data, just like we learn from experience. Instead of
                            writing strict rules, we show the computer lots of
                            examples, and it figures out the patterns by itself!
                            Through mathematical algorithms and statistical
                            models, it can make predictions and uncover hidden
                            insights from complex datasets.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mt-8 mb-8 md:mb-16 md:mt-16  max-w-4xl mx-auto">
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
