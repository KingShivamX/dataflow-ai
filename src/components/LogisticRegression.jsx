import { useEffect, useRef, useState } from "react"
import { Chart } from "chart.js/auto"
import { useNavigate } from "react-router-dom"
import { useTutorial } from "../contexts/TutorialContext"
import AlgorithmInfoPanel from "./common/AlgorithmInfoPanel"

// Create a tooltip component
const Tooltip = ({ text, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    
    return (
        <div className="relative inline-block">
            <div
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
            >
                {children}
            </div>
            {isVisible && (
                <div className="absolute z-10 w-64 p-2 mt-2 text-sm text-white bg-gray-800 rounded shadow-lg">
                    {text}
                </div>
            )}
        </div>
    );
};

const LogisticRegression = () => {
    const chartRef = useRef(null)
    const chartInstance = useRef(null)
    const navigate = useNavigate()
    const { startTutorial, showTutorial, visitedPages } = useTutorial()
    const [showInfoPanel, setShowInfoPanel] = useState(true)

    const [points, setPoints] = useState([])
    const [currentClass, setCurrentClass] = useState(0) // 0 or 1
    const [weights, setWeights] = useState({ w1: 0, w2: 0, b: 0 })
    const [isTraining, setIsTraining] = useState(false)
    const [showDecisionBoundary, setShowDecisionBoundary] = useState(false)
    const [metrics, setMetrics] = useState({
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1: 0,
        threshold: 0.5,
    })
    const [shouldAnimateDecisionBoundary, setShouldAnimateDecisionBoundary] =
        useState(false)

    // Handle start tutorial from info panel
    const handleStartFromInfoPanel = () => {
        setShowInfoPanel(false)
        // Short delay to ensure the info panel is removed before starting tutorial
        setTimeout(() => {
            startTutorial()
        }, 300)
    }

    // Ensure tutorial starts automatically on first visit
    useEffect(() => {
        // Only check for auto-tutorial if not showing info panel
        if (!showInfoPanel) {
            const path = "/logistic-regression"
            if (!visitedPages[path] && !showTutorial) {
                // Small delay to ensure the component is fully rendered
                const timer = setTimeout(() => {
                    startTutorial()
                }, 700)
                return () => clearTimeout(timer)
            }
        }
    }, [startTutorial, showTutorial, visitedPages, showInfoPanel])

    // Sigmoid function
    const sigmoid = (z) => 1 / (1 + Math.exp(-z))

    // Initialize chart
    useEffect(() => {
        if (chartRef.current) {
            if (chartInstance.current) {
                chartInstance.current.destroy()
            }

            const ctx = chartRef.current.getContext("2d")
            chartInstance.current = new Chart(ctx, {
                type: "scatter",
                data: {
                    datasets: [
                        {
                            label: "Class 0",
                            data: points.filter((p) => p.class === 0),
                            backgroundColor: "rgba(54, 162, 235, 0.7)",
                            borderColor: "rgba(54, 162, 235, 1)",
                            borderWidth: 1,
                            pointRadius: 8,
                            animation: false,
                        },
                        {
                            label: "Class 1",
                            data: points.filter((p) => p.class === 1),
                            backgroundColor: "rgba(255, 99, 132, 0.7)",
                            borderColor: "rgba(255, 99, 132, 1)",
                            borderWidth: 1,
                            pointRadius: 8,
                            animation: false,
                        },
                        ...(showDecisionBoundary && weights.w1 !== 0
                            ? [
                                  {
                                      label: "Decision Boundary",
                                      data: generateDecisionBoundary(),
                                      type: "line",
                                      borderColor: "rgba(75, 192, 192, 1)",
                                      borderWidth: 2,
                                      fill: false,
                                      tension: 0.4,
                                      pointRadius: 0,
                                      animation: shouldAnimateDecisionBoundary
                                          ? {
                                                duration: 800,
                                                easing: "easeInOutQuart",
                                            }
                                          : false,
                                  },
                              ]
                            : []),
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            min: 0,
                            max: 1,
                            title: {
                                display: true,
                                text: "X₁",
                            },
                        },
                        y: {
                            min: 0,
                            max: 1,
                            title: {
                                display: true,
                                text: "X₂",
                            },
                        },
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const point = context.raw;
                                    const datasetLabel = context.dataset.label;
                                    
                                    if (!point.x && !point.y) return "";
                                    
                                    if (datasetLabel === "Decision Boundary") {
                                        return `Decision boundary at (${point.x.toFixed(2)}, ${point.y.toFixed(2)})`;
                                    }
                                    
                                    // For Class 0 and Class 1 points
                                    const coordinates = `Coordinates: (${point.x.toFixed(2)}, ${point.y.toFixed(2)})`;
                                    
                                    // If model is trained, show prediction probability
                                    if (weights.w1 !== 0) {
                                        const z = weights.w1 * point.x + weights.w2 * point.y + weights.b;
                                        const prob = sigmoid(z);
                                        const predictedClass = prob >= metrics.threshold ? 1 : 0;
                                        const actualClass = point.class;
                                        const isCorrect = predictedClass === actualClass;
                                        
                                        return [
                                            coordinates,
                                            `Probability of Class 1: ${prob.toFixed(4)}`,
                                            `Predicted class: ${predictedClass} ${isCorrect ? '✓' : '✗'}`,
                                            `Actual class: ${actualClass}`
                                        ];
                                    }
                                    
                                    return [coordinates, `Class: ${point.class}`];
                                },
                                title: function(context) {
                                    const datasetLabel = context[0].dataset.label;
                                    if (datasetLabel === "Decision Boundary") {
                                        return "Decision Boundary";
                                    }
                                    return datasetLabel;
                                }
                            }
                        },
                    },
                },
            })
        }
    }, [points, weights, showDecisionBoundary, shouldAnimateDecisionBoundary])

    // Handle canvas click for adding points
    const handleCanvasClick = (event) => {
        if (!isTraining && chartRef.current) {
            setShouldAnimateDecisionBoundary(false)
            const canvas = chartRef.current
            const rect = canvas.getBoundingClientRect()

            const scaleX = canvas.width / rect.width
            const scaleY = canvas.height / rect.height

            const x = ((event.clientX - rect.left) * scaleX) / canvas.width
            const y = 1 - ((event.clientY - rect.top) * scaleY) / canvas.height

            const xValue = Math.max(0, Math.min(1, x))
            const yValue = Math.max(0, Math.min(1, y))

            setPoints([
                ...points,
                { x: xValue, y: yValue, class: currentClass },
            ])
        }
    }

    // Generate decision boundary points
    const generateDecisionBoundary = () => {
        const { w1, w2, b } = weights
        const points = []
        const resolution = 50

        for (let x = -0.2; x <= 1.2; x += 1.2 / resolution) {
            const y = -(w1 * x + b) / w2
            if (y >= -0.2 && y <= 1.2) {
                points.push({ x, y })
            }
        }
        return points
    }

    // Train the model using gradient descent
    const trainModel = async () => {
        setIsTraining(true)
        let w1 = 0,
            w2 = 0,
            b = 0
        const learningRate = 0.1
        const epochs = 200
        const lambda = 0.01
        const miniBatchSize = 8

        for (let epoch = 0; epoch < epochs; epoch++) {
            const shuffledPoints = [...points].sort(() => Math.random() - 0.5)

            for (let i = 0; i < shuffledPoints.length; i += miniBatchSize) {
                const batch = shuffledPoints.slice(i, i + miniBatchSize)
                let dw1 = 0,
                    dw2 = 0,
                    db = 0

                batch.forEach((point) => {
                    const z = w1 * point.x + w2 * point.y + b
                    const a = sigmoid(z)
                    const error = a - point.class

                    dw1 += error * point.x
                    dw2 += error * point.y
                    db += error
                })

                dw1 = dw1 / batch.length + lambda * w1
                dw2 = dw2 / batch.length + lambda * w2
                db = db / batch.length

                w1 -= learningRate * dw1
                w2 -= learningRate * dw2
                b -= learningRate * db
            }

            if (epoch % 20 === 0) {
                setWeights({ w1, w2, b })
                await new Promise((resolve) => setTimeout(resolve, 50))
            }
        }

        setWeights({ w1, w2, b })

        const findOptimalThreshold = () => {
            let bestThreshold = 0.5
            let bestF1 = 0

            for (let threshold = 0.1; threshold <= 0.9; threshold += 0.1) {
                const predictions = points.map((point) => {
                    const z = w1 * point.x + w2 * point.y + b
                    return sigmoid(z) >= threshold ? 1 : 0
                })

                let tp = 0,
                    fp = 0,
                    fn = 0
                points.forEach((point, i) => {
                    if (point.class === 1 && predictions[i] === 1) tp++
                    if (point.class === 0 && predictions[i] === 1) fp++
                    if (point.class === 1 && predictions[i] === 0) fn++
                })

                const precision = tp / (tp + fp) || 0
                const recall = tp / (tp + fn) || 0
                const f1 = (2 * precision * recall) / (precision + recall) || 0

                if (f1 > bestF1) {
                    bestF1 = f1
                    bestThreshold = threshold
                }
            }
            return bestThreshold
        }

        const optimalThreshold = findOptimalThreshold()
        const predictions = points.map((point) => {
            const z = w1 * point.x + w2 * point.y + b
            return sigmoid(z) >= optimalThreshold ? 1 : 0
        })

        let tp = 0,
            fp = 0,
            tn = 0,
            fn = 0
        points.forEach((point, i) => {
            if (point.class === 1 && predictions[i] === 1) tp++
            if (point.class === 0 && predictions[i] === 1) fp++
            if (point.class === 0 && predictions[i] === 0) tn++
            if (point.class === 1 && predictions[i] === 0) fn++
        })

        const accuracy = (tp + tn) / points.length
        const precision = tp / (tp + fp) || 0
        const recall = tp / (tp + fn) || 0
        const f1 = (2 * precision * recall) / (precision + recall) || 0

        setMetrics({
            accuracy,
            precision,
            recall,
            f1,
            threshold: optimalThreshold,
        })
        setShouldAnimateDecisionBoundary(true)
        setIsTraining(false)
    }

    // Clear all points
    const clearPoints = () => {
        setPoints([])
        setWeights({ w1: 0, w2: 0, b: 0 })
        setShowDecisionBoundary(false)
        setShouldAnimateDecisionBoundary(false)
    }

    return (
        <div className="p-4 min-h-screen bg-gray-50">
            {showInfoPanel ? (
                <AlgorithmInfoPanel 
                    algorithm="logistic-regression" 
                    onStartTutorial={handleStartFromInfoPanel} 
                />
            ) : (
                <div className="bg-white rounded-lg shadow-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate('/')}
                                className="p-1 rounded-full hover:bg-gray-200"
                                title="Back to home"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <h2 className="text-2xl font-bold">Logistic Regression</h2>
                        </div>
                        <button
                            onClick={startTutorial}
                            className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                        >
                            Show Tutorial
                        </button>
                    </div>

                    {/* Class selector */}
                    <div className="mb-4 flex items-center space-x-4">
                        <span className="text-sm font-medium">
                            Select point class:
                        </span>
                        <Tooltip text="Class 0 (blue) represents the negative class in binary classification. Add points for this class on one side of where you want the decision boundary to appear.">
                            <div
                                className={`px-4 py-1 rounded cursor-pointer ${
                                    currentClass === 0
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 text-gray-700"
                                }`}
                                onClick={() => setCurrentClass(0)}
                                data-tutorial="class-0"
                            >
                                Class 0
                            </div>
                        </Tooltip>
                        <Tooltip text="Class 1 (red) represents the positive class in binary classification. Add points for this class on the opposite side from your Class 0 points.">
                            <div
                                className={`px-4 py-1 rounded cursor-pointer ${
                                    currentClass === 1
                                        ? "bg-red-500 text-white"
                                        : "bg-gray-200 text-gray-700"
                                }`}
                                onClick={() => setCurrentClass(1)}
                                data-tutorial="class-1"
                            >
                                Class 1
                            </div>
                        </Tooltip>
                    </div>

                    {/* Canvas */}
                    <div className="mb-6">
                        <canvas
                            ref={chartRef}
                            onClick={handleCanvasClick}
                            className="canvas w-full h-[500px] cursor-crosshair"
                        />
                    </div>

                    {/* Graph Information */}
                    <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold mb-3 text-gray-700">Graph Information</h3>
                        <div className="flex flex-wrap gap-5">
                            <div className="bg-white px-4 py-2 rounded-md shadow-sm border-l-4 border-blue-500">
                                <Tooltip text="The number of points affects how well your model can learn the decision boundary. You should add a balanced number of points for each class for best results.">
                                    <div className="cursor-help">
                                        <span className="text-gray-500 text-sm">Total points:</span>
                                        <p className="text-xl font-semibold">{points.length}</p>
                                    </div>
                                </Tooltip>
                            </div>
                            
                            <div className="bg-white px-4 py-2 rounded-md shadow-sm border-l-4 border-indigo-500">
                                <Tooltip text="A balanced dataset has roughly equal numbers of each class. Imbalanced datasets can bias the model toward the majority class.">
                                    <div className="cursor-help">
                                        <span className="text-gray-500 text-sm">Class distribution:</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full"></span>
                                            <p className="font-semibold">{points.filter(p => p.class === 0).length}</p>
                                            <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
                                            <p className="font-semibold">{points.filter(p => p.class === 1).length}</p>
                                        </div>
                                    </div>
                                </Tooltip>
                            </div>
                            
                            {weights.w1 !== 0 && (
                                <div className="bg-white px-4 py-2 rounded-md shadow-sm border-l-4 border-green-500">
                                    <Tooltip text="In logistic regression, the weights determine the decision boundary. The equation for the boundary is w1*x + w2*y + b = 0, which can be rearranged to y = -(w1/w2)*x - (b/w2).">
                                        <div className="cursor-help">
                                            <span className="text-gray-500 text-sm">Model weights:</span>
                                            <p className="text-sm font-medium mt-1">
                                                w1: {weights.w1.toFixed(3)}, w2: {weights.w2.toFixed(3)}, b: {weights.b.toFixed(3)}
                                            </p>
                                        </div>
                                    </Tooltip>
                                </div>
                            )}
                            
                            {weights.w1 !== 0 && (
                                <div className="bg-white px-4 py-2 rounded-md shadow-sm border-l-4 border-yellow-500">
                                    <Tooltip text="The classification threshold determines when a point is classified as Class 1. If the predicted probability is greater than or equal to this threshold, the point is assigned to Class 1. The optimal threshold is chosen to maximize the F1 score.">
                                        <div className="cursor-help">
                                            <span className="text-gray-500 text-sm">Classification threshold:</span>
                                            <p className="text-xl font-semibold">{metrics.threshold?.toFixed(3) || 0.5}</p>
                                        </div>
                                    </Tooltip>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="controls mb-4 flex flex-wrap gap-4">
                        <button
                            onClick={trainModel}
                            disabled={points.length < 4 || isTraining}
                            className="train-button px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            data-tutorial="train-logistic"
                        >
                            {isTraining ? "Training..." : "Train Model"}
                        </button>
                        
                        <Tooltip text="The decision boundary is the line that separates the two classes. Points on one side are classified as Class 0, while points on the other side are classified as Class 1. The model uses a sigmoid function to determine the probability of a point belonging to Class 1.">
                            <button
                                onClick={() => setShowDecisionBoundary(!showDecisionBoundary)}
                                disabled={weights.w1 === 0}
                                className={`boundary-button px-4 py-2 ${
                                    showDecisionBoundary
                                        ? "bg-orange-500"
                                        : "bg-blue-500"
                                } text-white rounded hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed`}
                                data-tutorial="show-boundary"
                            >
                                {showDecisionBoundary
                                    ? "Hide Decision Boundary"
                                    : "Show Decision Boundary"}
                            </button>
                        </Tooltip>
                        
                        <button
                            onClick={clearPoints}
                            className="clear-button px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            data-tutorial="clear-logistic"
                        >
                            Clear Points
                        </button>
                    </div>
                    
                    {/* Decision boundary explanation */}
                    {showDecisionBoundary && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-red-100 rounded-sm border border-gray-300 relative">
                                    <div className="absolute top-0 bottom-0 border-r-2 border-orange-500 left-1/2 transform -translate-x-1/2"></div>
                                </div>
                                <p className="text-sm text-blue-700">
                                    <strong>Decision Boundary:</strong> This line divides the feature space into two regions. Points to the left are classified as Class 0 (blue), 
                                    while points to the right are classified as Class 1 (red). The closer a point is to the boundary, the less certain the classification.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Metrics Display */}
                    {points.length > 0 && weights.w1 !== 0 && (
                        <div className="metrics mt-4 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold mb-2">
                                Model Performance
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white p-3 rounded border">
                                    <Tooltip text="Accuracy measures the proportion of correct predictions among the total number of cases examined. It's calculated as (TP + TN) / (TP + TN + FP + FN), where TP=True Positive, TN=True Negative, FP=False Positive, FN=False Negative.">
                                        <p className="font-medium cursor-help border-b border-dotted border-gray-300 inline-block">Accuracy:</p>
                                    </Tooltip>
                                    <p className="text-lg">
                                        {(metrics.accuracy * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded border">
                                    <Tooltip text="Precision measures how many of the predicted positive cases were actually positive. It's calculated as TP / (TP + FP). A high precision indicates a low false positive rate, meaning when the model predicts Class 1, it's usually correct.">
                                        <p className="font-medium cursor-help border-b border-dotted border-gray-300 inline-block">Precision:</p>
                                    </Tooltip>
                                    <p className="text-lg">
                                        {(metrics.precision * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded border">
                                    <Tooltip text="Recall (also known as sensitivity) measures how many of the actual positive cases the model correctly identified. It's calculated as TP / (TP + FN). A high recall indicates the model is good at finding all the positive cases.">
                                        <p className="font-medium cursor-help border-b border-dotted border-gray-300 inline-block">Recall:</p>
                                    </Tooltip>
                                    <p className="text-lg">
                                        {(metrics.recall * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded border">
                                    <Tooltip text="F1 Score is the harmonic mean of precision and recall, providing a balance between the two. It's calculated as 2 * (Precision * Recall) / (Precision + Recall). It's particularly useful when classes are imbalanced.">
                                        <p className="font-medium cursor-help border-b border-dotted border-gray-300 inline-block">F1 Score:</p>
                                    </Tooltip>
                                    <p className="text-lg">
                                        {(metrics.f1 * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 text-sm text-gray-600">
                                <p className="font-medium mb-2">
                                    Understanding the Metrics:
                                </p>
                                <ul className="list-disc pl-4 space-y-2">
                                    <li>
                                        <span className="font-medium">
                                            Accuracy:
                                        </span>{" "}
                                        Percentage of correct predictions (both
                                        classes)
                                    </li>
                                    <li>
                                        <span className="font-medium">
                                            Precision:
                                        </span>{" "}
                                        Of the points predicted as Class 1, how many
                                        were actually Class 1
                                    </li>
                                    <li>
                                        <span className="font-medium">Recall:</span>{" "}
                                        Of all actual Class 1 points, how many were
                                        correctly identified
                                    </li>
                                    <li>
                                        <span className="font-medium">
                                            F1 Score:
                                        </span>{" "}
                                        Harmonic mean of precision and recall,
                                        providing a balanced measure
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* Bottom back button - only show when info panel is hidden */}
            {!showInfoPanel && (
                <div className="flex justify-center mt-6 mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </button>
                </div>
            )}
        </div>
    )
}

export default LogisticRegression
