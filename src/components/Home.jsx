import { useNavigate } from "react-router-dom"

const Home = () => {
    const navigate = useNavigate()

    const algorithms = [
        {
            path: "/linear-regression",
            name: "Linear Regression",
            description:
                "Predict continuous values by finding the best-fitting line through data points.",
            icon: "📈",
        },
        {
            path: "/logistic-regression",
            name: "Logistic Regression",
            description:
                "Classify data into two categories using a probability-based approach.",
            icon: "🎯",
        },
        {
            path: "/knn",
            name: "K-Nearest Neighbors",
            description:
                "Classify points based on their closest neighbors in the feature space.",
            icon: "🎲",
        },
        {
            path: "/kmeans",
            name: "K-Means Clustering",
            description:
                "Group similar data points together into clusters automatically.",
            icon: "🎨",
        },
    ]

    return (
        <div className="container mx-auto p-4 md:p-8 min-h-[84vh] bg-gradient-to-br from-yellow-100 via-blue-50 to-yellow-100">
            {/* Hero Section */}
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                    Welcome to DataFlowAI
                </h1>
                <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto">
                    Explore and understand machine learning algorithms through
                    interactive visualizations
                </p>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto">
                {/* Info Section */}
                <div className="flex flex-col md:flex-row gap-8 items-center justify-between mb-16">
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
                    </div>
                    <div className="w-full md:w-1/3">
                        <img
                            src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNncxbHI4dzVxeDJpNmVnaHJzdTI3NHNleTRxMGxyMmFrdWJ3dDY4ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MCd33lAKSLajqWT60m/giphy.webp"
                            alt="Machine Learning Visualization"
                            className="rounded-xl shadow-2xl w-full"
                        />
                    </div>
                </div>

                {/* Algorithms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {algorithms.map((algo) => (
                        <div
                            key={algo.path}
                            onClick={() => navigate(algo.path)}
                            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-yellow-300 h-[150px] flex items-center"
                        >
                            <div className="flex items-center gap-6 p-6 w-full">
                                <span className="text-5xl w-16 flex-shrink-0 flex items-center justify-center">
                                    {algo.icon}
                                </span>
                                <div className="flex-grow">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                        {algo.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm line-clamp-2">
                                        {algo.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Home
