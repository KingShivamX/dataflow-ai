import { useNavigate, useLocation } from "react-router-dom"
import { useTutorial } from "../contexts/TutorialContext"
import { useState } from "react"

const Home = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { startTutorial, resetTutorial, resetPageTutorial, visitedPages } = useTutorial()
    const currentPath = location.pathname

    const algorithms = [
        {
            path: "/linear-regression",
            infoPath: "/algorithm-info/linear-regression",
            name: "Linear Regression",
            description:
                "Predict continuous values by finding the best-fitting line through data points.",
            icon: "📈",
            level: "Beginner",
            tags: ["Regression", "Supervised"]
        },
        {
            path: "/logistic-regression",
            infoPath: "/algorithm-info/logistic-regression",
            name: "Logistic Regression",
            description:
                "Classify data into two categories using a probability-based approach.",
            icon: "🎯",
            level: "Intermediate",
            tags: ["Classification", "Supervised"]
        },
        {
            path: "/knn",
            infoPath: "/algorithm-info/knn",
            name: "K-Nearest Neighbors",
            description:
                "Classify points based on their closest neighbors in the feature space.",
            icon: "🎲",
            level: "Intermediate",
            tags: ["Classification", "Supervised"]
        },
        {
            path: "/kmeans",
            infoPath: "/algorithm-info/kmeans",
            name: "K-Means Clustering",
            description:
                "Group similar data points together into clusters automatically.",
            icon: "🎨",
            level: "Advanced",
            tags: ["Clustering", "Unsupervised"]
        },
        {
            path: "/decision-tree",
            infoPath: "/algorithm-info/decision-tree",
            name: "Decision Tree",
            description:
                "Classify data by asking a series of yes/no questions, creating a tree of decisions.",
            icon: "🌳",
            level: "Intermediate",
            tags: ["Classification", "Supervised"]
        },
        {
            path: "/naive-bayes",
            infoPath: "/algorithm-info/naive-bayes",
            name: "Naive Bayes",
            description:
                "Classify data using probability theory and Bayes' theorem.",
            icon: "📊",
            level: "Intermediate",
            tags: ["Classification", "Supervised"]
        }
    ]

    return (
        <div className="p-4 md:p-8 bg-gradient-to-br from-yellow-100 via-blue-50 to-yellow-100 relative min-h-screen">
            {/* Hero Section - Enhanced */}
            <div className="text-center mb-12 pt-10">
                <h1 className="welcome-title text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                    DataFlowAI
                </h1>
                <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto">
                    Explore and understand machine learning algorithms through
                    interactive visualizations
                </p>
                <div className="mt-6 flex justify-center space-x-4">
                    <button 
                        onClick={startTutorial}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-md"
                    >
                        Start Tutorial
                    </button>
                    <button 
                        onClick={resetTutorial}
                        className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg transition-colors shadow-md"
                    >
                        Reset All Tutorials
                    </button>
                </div>
            </div>
            
            {/* Info Section - Moved up above algorithm cards */}
            <div className="max-w-7xl mx-auto mb-16">
                <div className="flex flex-col md:flex-row gap-8 items-center justify-between p-6 rounded-xl bg-white shadow-lg">
                    <div className="w-full md:w-1/2 space-y-6">
                        <h2 className="text-3xl font-bold text-gray-800">
                            What is Machine Learning?
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Machine Learning is teaching computers to learn from
                            data, just like we learn from experience. Instead of
                            writing strict rules, we show the computer lots of
                            examples, and it figures out the patterns by itself!
                            Through mathematical algorithms and statistical
                            models, it can make predictions and uncover hidden
                            insights from complex datasets.
                        </p>
                        <div className="pt-4 flex gap-3">
                            <button 
                                onClick={() => navigate("/about")}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                            >
                                Learn More
                            </button>
                            <button 
                                onClick={() => navigate("/faqs")}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:opacity-80 transition-colors shadow-md"
                            >
                                FAQs
                            </button>
                        </div>
                    </div>
                    <div className="w-full md:w-1/3">
                        <img
                            src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNncxbHI4dzVxeDJpNmVnaHJzdTI3NHNleTRxMGxyMmFrdWJ3dDY4ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MCd33lAKSLajqWT60m/giphy.webp"
                            alt="Machine Learning Visualization"
                            className="rounded-xl shadow-2xl w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Algorithm Cards Section */}
            <div className="max-w-7xl mx-auto mb-16">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Interactive ML Algorithms</h2>
                <div className="algorithms-grid grid grid-cols-1 md:grid-cols-2 gap-8">
                    {algorithms.map((algo) => (
                        <div
                            key={algo.path}
                            onClick={() => navigate(algo.path)}
                            className="algorithm-card bg-white border-gray-100 hover:border-yellow-300 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer border overflow-hidden"
                            data-algorithm={algo.path.substring(1)}
                        >
                            <div className="flex flex-col h-full">
                                <div className="p-6 flex items-start gap-6">
                                    <div className="bg-yellow-50 p-4 rounded-xl">
                                        <span className="text-5xl">{algo.icon}</span>
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="text-2xl font-semibold text-gray-800">
                                                {algo.name}
                                            </h3>
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                algo.level === 'Beginner' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : algo.level === 'Intermediate'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-purple-100 text-purple-800'
                                            }`}>
                                                {algo.level}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-3">
                                            {algo.description}
                                        </p>
                                        <div className="flex gap-2 flex-wrap">
                                            {algo.tags.map(tag => (
                                                <span key={tag} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-auto p-4 bg-gray-50 border-gray-100 border-t flex justify-between items-center">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(algo.path);
                                        }}
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Try it now
                                    </button>
                                    {visitedPages[algo.path] && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                resetPageTutorial(algo.path);
                                            }}
                                            className="text-sm text-gray-500 hover:text-gray-700"
                                        >
                                            Reset tutorial
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Section */}
            <footer className="mt-12 py-6 border-t border-gray-200 text-gray-600">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            <p>© 2023 DataFlowAI | Built with React</p>
                        </div>
                        <div className="flex gap-8">
                            <a href="#" className="hover:underline">Terms</a>
                            <a href="#" className="hover:underline">Privacy</a>
                            <a href="#" className="hover:underline">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Home
