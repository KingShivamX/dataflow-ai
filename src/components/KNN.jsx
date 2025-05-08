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

const KNN = () => {
    const chartRef = useRef(null)
    const chartInstance = useRef(null)
    const navigate = useNavigate()
    const { startTutorial, showTutorial, visitedPages } = useTutorial()
    const [showInfoPanel, setShowInfoPanel] = useState(true)

    const [points, setPoints] = useState([])
    const [currentClass, setCurrentClass] = useState(0) // 0, 1, or 2 now
    const [kValue, setKValue] = useState(3)
    const [testPoint, setTestPoint] = useState(null)
    const [nearestNeighbors, setNearestNeighbors] = useState([])
    const [prediction, setPrediction] = useState(null)
    const [metrics, setMetrics] = useState({
        confusionMatrix: null,
    })

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
            const path = "/knn"
            if (!visitedPages[path] && !showTutorial) {
                // Small delay to ensure the component is fully rendered
                const timer = setTimeout(() => {
                    startTutorial()
                }, 700)
                return () => clearTimeout(timer)
            }
        }
    }, [startTutorial, showTutorial, visitedPages, showInfoPanel])

    // Calculate Euclidean distance between two points
    const calculateDistance = (p1, p2) => {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
    }

    // Predict class for a test point (modified for 3 classes)
    const predictClass = (point) => {
        const distances = points.map((p) => ({
            point: p,
            distance: calculateDistance(p, point),
        }))

        const nearest = distances
            .sort((a, b) => a.distance - b.distance)
            .slice(0, kValue)

        setNearestNeighbors(nearest)

        // Count classes among nearest neighbors
        const classCounts = nearest.reduce((counts, n) => {
            counts[n.point.class] = (counts[n.point.class] || 0) + 1
            return counts
        }, {})

        // Find class with maximum votes
        const predictedClass = Object.entries(classCounts).reduce(
            (max, [classLabel, count]) =>
                count > (classCounts[max] || 0) ? parseInt(classLabel) : max,
            0
        )

        setPrediction(predictedClass)
        return predictedClass
    }

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
                            backgroundColor: "rgba(54, 162, 235, 0.5)",
                            pointRadius: 8,
                            animation: false,
                        },
                        {
                            label: "Class 1",
                            data: points.filter((p) => p.class === 1),
                            backgroundColor: "rgba(255, 99, 132, 0.5)",
                            pointRadius: 8,
                            animation: false,
                        },

                        {
                            label: "Class 2",
                            data: points.filter((p) => p.class === 2),
                            backgroundColor: "rgba(75, 192, 192, 0.5)", // Teal color for class 2
                            pointRadius: 8,
                            animation: false,
                        },
                        ...(testPoint
                            ? [
                                  {
                                      label: "Test Point",
                                      data: [testPoint],
                                      backgroundColor:
                                          prediction === null
                                              ? "rgba(255, 206, 86, 0.5)"
                                              : prediction === 0
                                              ? "rgba(54, 162, 235, 0.5)"
                                              : prediction === 1
                                              ? "rgba(255, 99, 132, 0.5)"
                                              : "rgba(75, 192, 192, 0.5)",
                                      pointRadius: 12,
                                      pointStyle: "triangle",
                                  },
                                  {
                                      label: "Nearest Neighbors",
                                      data: nearestNeighbors.map(
                                          (n) => n.point
                                      ),
                                      backgroundColor:
                                          "rgba(255, 206, 86, 0.5)",
                                      pointRadius: 12,
                                      pointBorderWidth: 2,
                                      pointBorderColor: "rgba(255, 206, 86, 1)",
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
                                text: "X",
                            },
                        },
                        y: {
                            min: 0,
                            max: 1,
                            title: {
                                display: true,
                                text: "Y",
                            },
                        },
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const point = context.raw;
                                    const datasetLabel = context.dataset.label;
                                    
                                    if (!point) return "";
                                    
                                    // Test point tooltip
                                    if (datasetLabel === "Test Point") {
                                        if (prediction !== null) {
                                            return [
                                                `Coordinates: (${point.x.toFixed(2)}, ${point.y.toFixed(2)})`,
                                                `Predicted Class: ${prediction}`,
                                                `Based on ${kValue} nearest neighbors`
                                            ];
                                        }
                                        return `Test point at (${point.x.toFixed(2)}, ${point.y.toFixed(2)})`;
                                    }
                                    
                                    // Nearest neighbor tooltip
                                    if (datasetLabel === "Nearest Neighbors") {
                                        // Find this neighbor in the nearestNeighbors array
                                        const neighbor = nearestNeighbors.find(n => 
                                            n.point.x === point.x && n.point.y === point.y
                                        );
                                        
                                        if (neighbor) {
                                            return [
                                                `Coordinates: (${point.x.toFixed(2)}, ${point.y.toFixed(2)})`,
                                                `Class: ${point.class}`,
                                                `Distance to test point: ${neighbor.distance.toFixed(4)}`
                                            ];
                                        }
                                    }
                                    
                                    // Training points tooltip
                                    return [
                                        `Coordinates: (${point.x.toFixed(2)}, ${point.y.toFixed(2)})`,
                                        `Class: ${point.class}`
                                    ];
                                },
                                title: function(context) {
                                    const datasetLabel = context[0].dataset.label;
                                    if (datasetLabel === "Test Point") {
                                        return "Test Point";
                                    } else if (datasetLabel === "Nearest Neighbors") {
                                        return "Nearest Neighbor";
                                    }
                                    return datasetLabel;
                                }
                            }
                        }
                    }
                },
            })
        }
    }, [points, testPoint, nearestNeighbors, prediction])

    // Handle canvas click for adding points
    const handleCanvasClick = (event) => {
        if (chartRef.current) {
            const canvas = chartRef.current
            const rect = canvas.getBoundingClientRect()

            // Get the scaling factor of the canvas
            const scaleX = canvas.width / rect.width
            const scaleY = canvas.height / rect.height

            // Calculate the position considering the scale
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

    // Add test point
    const handleAddTestPoint = (event) => {
        if (chartRef.current) {
            const canvas = chartRef.current
            const rect = canvas.getBoundingClientRect()

            // Get the scaling factor of the canvas
            const scaleX = canvas.width / rect.width
            const scaleY = canvas.height / rect.height

            // Calculate the position considering the scale
            const x = ((event.clientX - rect.left) * scaleX) / canvas.width
            const y = 1 - ((event.clientY - rect.top) * scaleY) / canvas.height

            const xValue = Math.max(0, Math.min(1, x))
            const yValue = Math.max(0, Math.min(1, y))

            const newTestPoint = { x: xValue, y: yValue }
            setTestPoint(newTestPoint)
            if (points.length >= kValue) {
                predictClass(newTestPoint)
            }
        }
    }

    // Add function to calculate metrics using leave-one-out cross validation
    const calculateMetrics = () => {
        if (points.length < kValue) return

        const matrix = Array(3)
            .fill()
            .map(() => Array(3).fill(0))

        // Leave-one-out cross validation
        points.forEach((testPoint, idx) => {
            const otherPoints = points.filter((_, i) => i !== idx)

            // Calculate distances
            const distances = otherPoints.map((p) => ({
                point: p,
                distance: calculateDistance(p, testPoint),
            }))

            // Get k nearest
            const nearest = distances
                .sort((a, b) => a.distance - b.distance)
                .slice(0, kValue)

            // Predict class
            const classCounts = nearest.reduce((counts, n) => {
                counts[n.point.class] = (counts[n.point.class] || 0) + 1
                return counts
            }, {})

            const predictedClass = Object.entries(classCounts).reduce(
                (max, [classLabel, count]) =>
                    count > (classCounts[max] || 0)
                        ? parseInt(classLabel)
                        : max,
                0
            )

            // Update confusion matrix
            matrix[testPoint.class][predictedClass]++
        })

        setMetrics({
            confusionMatrix: matrix,
        })
    }

    // Call calculateMetrics when points or k changes
    useEffect(() => {
        calculateMetrics()
    }, [points, kValue])

    // Add this function to calculate per-class metrics
    const calculateClassMetrics = (matrix, classIndex) => {
        const tp = matrix[classIndex][classIndex]
        let fp = 0,
            fn = 0

        // Calculate FP and FN
        for (let i = 0; i < matrix.length; i++) {
            if (i !== classIndex) {
                fp += matrix[i][classIndex] // Other classes predicted as this class
                fn += matrix[classIndex][i] // This class predicted as other classes
            }
        }

        const precision = tp / (tp + fp) || 0
        const recall = tp / (tp + fn) || 0
        const f1 = (2 * (precision * recall)) / (precision + recall) || 0

        return { tp, fp, fn, precision, recall, f1 }
    }

    return (
        <div className="p-4 min-h-screen bg-gray-50">
            {showInfoPanel ? (
                <AlgorithmInfoPanel 
                    algorithm="knn" 
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
                            <h2 className="text-2xl font-bold">K-Nearest Neighbors</h2>
                        </div>
                        <button
                            onClick={startTutorial}
                            className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                        >
                            Show Tutorial
                        </button>
                    </div>

                    {/* Mode selectors */}
                    <div className="mb-4 flex flex-wrap gap-4">
                        <div className="mr-4">
                            <span className="mr-2">Add point:</span>
                            <div className="flex space-x-2">
                                <Tooltip text="Class 0 (blue) points will be one of the categories in your training data. Add several points in a pattern to represent a distinct group.">
                                    <div
                                        className={`px-3 py-1 rounded cursor-pointer ${
                                            currentClass === 0
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-200 text-gray-700"
                                        }`}
                                        onClick={() => setCurrentClass(0)}
                                        data-tutorial="knn-class-0"
                                    >
                                        Class 0
                                    </div>
                                </Tooltip>
                                <Tooltip text="Class 1 (red) points represent a second category. Place these points in a different area from Class 0 to create a meaningful classification problem.">
                                    <div
                                        className={`px-3 py-1 rounded cursor-pointer ${
                                            currentClass === 1
                                                ? "bg-red-500 text-white"
                                                : "bg-gray-200 text-gray-700"
                                        }`}
                                        onClick={() => setCurrentClass(1)}
                                        data-tutorial="knn-class-1"
                                    >
                                        Class 1
                                    </div>
                                </Tooltip>
                                <Tooltip text="Class 2 (teal) points add a third category to create a more complex classification problem. The KNN algorithm can handle multiple classes naturally.">
                                    <div
                                        className={`px-3 py-1 rounded cursor-pointer ${
                                            currentClass === 2
                                                ? "bg-teal-500 text-white"
                                                : "bg-gray-200 text-gray-700"
                                        }`}
                                        onClick={() => setCurrentClass(2)}
                                        data-tutorial="knn-class-2"
                                    >
                                        Class 2
                                    </div>
                                </Tooltip>
                            </div>
                        </div>
                        <div className="k-slider flex items-center gap-2">
                            <Tooltip text="The 'k' value determines how many nearest neighbors are considered when classifying a new point. A smaller k creates more complex decision boundaries that closely fit the training data, while a larger k creates smoother boundaries. If k is too small, the model may overfit; if k is too large, it may ignore important patterns.">
                                <label className="cursor-help border-b border-dotted border-gray-400">K value:</label>
                            </Tooltip>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={kValue}
                                onChange={(e) =>
                                    setKValue(
                                        Math.min(
                                            10,
                                            Math.max(
                                                1,
                                                parseInt(e.target.value) || 1
                                            )
                                        )
                                    )
                                }
                                className="w-16 px-2 py-1 border rounded"
                                data-tutorial="k-value"
                                title="Number of neighbors to consider (1-10)"
                            />
                        </div>
                    </div>

                    {/* Add a graph information section similar to Linear/Logistic Regression */}
                    <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold mb-3 text-gray-700">KNN Information</h3>
                        <div className="flex flex-wrap gap-5">
                            <div className="bg-white px-4 py-2 rounded-md shadow-sm border-l-4 border-blue-500">
                                <Tooltip text="The number of points affects how well your KNN model works. More training points generally provide better classification results.">
                                    <div className="cursor-help">
                                        <span className="text-gray-500 text-sm">Total points:</span>
                                        <p className="text-xl font-semibold">{points.length}</p>
                                    </div>
                                </Tooltip>
                            </div>
                            
                            <div className="bg-white px-4 py-2 rounded-md shadow-sm border-l-4 border-indigo-500">
                                <Tooltip text="The K value determines how many neighbors influence the classification. Smaller values make the model more sensitive to local patterns, while larger values create smoother decision boundaries.">
                                    <div className="cursor-help">
                                        <span className="text-gray-500 text-sm">Current K value:</span>
                                        <p className="text-xl font-semibold">{kValue}</p>
                                    </div>
                                </Tooltip>
                            </div>
                            
                            <div className="bg-white px-4 py-2 rounded-md shadow-sm border-l-4 border-green-500">
                                <Tooltip text="A balanced distribution of classes helps the KNN algorithm perform better. Large imbalances can bias predictions toward the majority class.">
                                    <div className="cursor-help">
                                        <span className="text-gray-500 text-sm">Class distribution:</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full"></span>
                                            <p className="font-semibold">{points.filter(p => p.class === 0).length}</p>
                                            <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
                                            <p className="font-semibold">{points.filter(p => p.class === 1).length}</p>
                                            <span className="inline-block w-3 h-3 bg-teal-500 rounded-full"></span>
                                            <p className="font-semibold">{points.filter(p => p.class === 2).length}</p>
                                        </div>
                                    </div>
                                </Tooltip>
                            </div>
                        </div>
                    </div>

                    {/* Canvas */}
                    <div className="mb-6">
                        <canvas
                            ref={chartRef}
                            onClick={handleCanvasClick}
                            className="canvas w-full h-[500px] cursor-crosshair"
                        />
                    </div>

                    {/* Controls */}
                    <div className="controls mb-4 flex flex-wrap gap-4">
                        <Tooltip text="After adding training points, click this button and then click anywhere on the canvas to add a test point. The KNN algorithm will classify it based on the K nearest neighbors from your training data.">
                            <button 
                                onClick={handleAddTestPoint} 
                                className="test-point-button px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                data-tutorial="add-test-point"
                            >
                                Add Test Point
                            </button>
                        </Tooltip>
                        <button
                            onClick={() => {
                                setPoints([])
                                setTestPoint(null)
                                setNearestNeighbors([])
                                setPrediction(null)
                            }}
                            className="clear-knn-button px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            data-tutorial="clear-knn"
                        >
                            Clear All
                        </button>
                    </div>

                    {/* Explanation section */}
                    {testPoint && (
                        <div className="prediction-results mt-4 p-4 bg-gray-50 rounded-lg" data-tutorial="prediction-results">
                            <h3 className="text-lg font-semibold mb-3 text-gray-700">Prediction Results</h3>
                            
                            {/* Visual explanation of KNN */}
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <div className="min-w-[50px] h-[50px] bg-gray-100 rounded-sm border border-gray-300 relative flex-shrink-0">
                                        <div className="absolute w-4 h-4 bg-yellow-500 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                                        <div className="absolute w-3 h-3 bg-blue-500 rounded-full top-[25%] left-[25%] transform -translate-x-1/2 -translate-y-1/2"></div>
                                        <div className="absolute w-3 h-3 bg-red-500 rounded-full bottom-[25%] right-[25%] transform translate-x-1/2 translate-y-1/2"></div>
                                        <div className="absolute w-full h-full border-2 border-dashed border-gray-400 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-blue-700">
                                            <strong>How KNN works:</strong> The algorithm finds the {kValue} closest training points to your test point 
                                            (yellow). It then assigns the most common class among these neighbors as the prediction. The circle 
                                            represents the neighborhood being considered.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <Tooltip text="The test point is classified based on a majority vote of its K nearest neighbors. If there's a tie, the algorithm typically selects the class that appears first.">
                                    <p className="mb-2 cursor-help inline-block border-b border-dotted border-gray-400">
                                        Test point is classified as{" "}
                                        <strong className={`text-${prediction === 0 ? 'blue' : prediction === 1 ? 'red' : 'teal'}-500`}>
                                            Class {prediction}
                                        </strong> based on the{" "}
                                        {kValue} nearest neighbors.
                                    </p>
                                </Tooltip>
                            </div>
                            
                            <h4 className="font-medium mb-2">Nearest Neighbors:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {nearestNeighbors.map((neighbor, i) => (
                                    <div
                                        key={i}
                                        className={`bg-white p-3 rounded border-l-4 ${
                                            neighbor.point.class === 0 
                                                ? "border-blue-500" 
                                                : neighbor.point.class === 1 
                                                    ? "border-red-500" 
                                                    : "border-teal-500"
                                        }`}
                                    >
                                        <Tooltip text={`This is the ${i+1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} closest point to your test point. The distance is calculated using Euclidean distance (straight-line distance) in the feature space.`}>
                                            <p className="font-medium cursor-help border-b border-dotted border-gray-300 inline-block">
                                                Neighbor {i + 1}:
                                            </p>
                                        </Tooltip>
                                        <p>
                                            Class: <span className={`font-medium text-${
                                                neighbor.point.class === 0 
                                                    ? "blue" 
                                                    : neighbor.point.class === 1 
                                                        ? "red" 
                                                        : "teal"
                                            }-500`}>{neighbor.point.class}</span>
                                        </p>
                                        <p>
                                            Distance: {neighbor.distance.toFixed(4)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Modify the metrics display section */}
                    {points.length >= kValue && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold mb-2">
                                Model Performance
                            </h3>
                            <div className="text-sm">
                                {metrics.confusionMatrix && (
                                    <>
                                        <div className="mt-4">
                                            <p className="mb-2 font-medium">
                                                Confusion Matrix:
                                            </p>
                                            <div className="grid grid-cols-3 gap-1 text-center">
                                                {metrics.confusionMatrix.map(
                                                    (row, i) =>
                                                        row.map((cell, j) => (
                                                            <div
                                                                key={`${i}-${j}`}
                                                                className={`p-2 ${
                                                                    i === j
                                                                        ? "bg-green-100"
                                                                        : "bg-red-50"
                                                                }`}
                                                            >
                                                                {cell}
                                                            </div>
                                                        ))
                                                )}
                                            </div>
                                        </div>

                                        {/* Per-class metrics */}
                                        <div className="mt-6">
                                            <p className="font-medium mb-2">
                                                Per-Class Metrics:
                                            </p>
                                            <div className="grid grid-cols-1 gap-4">
                                                {[0, 1, 2].map((classIndex) => {
                                                    const classMetrics =
                                                        calculateClassMetrics(
                                                            metrics.confusionMatrix,
                                                            classIndex
                                                        )
                                                    return (
                                                        <div
                                                            key={classIndex}
                                                            className="bg-white p-3 rounded border"
                                                        >
                                                            <p className="font-medium mb-2">
                                                                Class {classIndex}:
                                                            </p>
                                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                                <div>
                                                                    <p>
                                                                        True
                                                                        Positives
                                                                        (TP):{" "}
                                                                        {
                                                                            classMetrics.tp
                                                                        }
                                                                    </p>
                                                                    <p>
                                                                        False
                                                                        Positives
                                                                        (FP):{" "}
                                                                        {
                                                                            classMetrics.fp
                                                                        }
                                                                    </p>
                                                                    <p>
                                                                        False
                                                                        Negatives
                                                                        (FN):{" "}
                                                                        {
                                                                            classMetrics.fn
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p>
                                                                        Precision:{" "}
                                                                        {(
                                                                            classMetrics.precision *
                                                                            100
                                                                        ).toFixed(
                                                                            1
                                                                        )}
                                                                        %
                                                                    </p>
                                                                    <p>
                                                                        Recall:{" "}
                                                                        {(
                                                                            classMetrics.recall *
                                                                            100
                                                                        ).toFixed(
                                                                            1
                                                                        )}
                                                                        %
                                                                    </p>
                                                                    <p>
                                                                        F1 Score:{" "}
                                                                        {(
                                                                            classMetrics.f1 *
                                                                            100
                                                                        ).toFixed(
                                                                            1
                                                                        )}
                                                                        %
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        <div className="mt-4 text-sm text-gray-600">
                                            <p className="font-medium mb-2">
                                                Understanding the Metrics:
                                            </p>
                                            <ul className="list-disc pl-5 space-y-1">
                                                <li>
                                                    <span className="font-medium">True Positives (TP):</span> Correctly
                                                    predicted points of this class (diagonal cells in confusion matrix)
                                                </li>
                                                <li>
                                                    <span className="font-medium">False Positives (FP):</span> Other
                                                    classes incorrectly predicted as
                                                    this class (points mistakenly labeled as this class)
                                                </li>
                                                <li>
                                                    <span className="font-medium">False Negatives (FN):</span> This class
                                                    incorrectly predicted as other
                                                    classes (points of this class the model missed)
                                                </li>
                                                <li className="text-gray-500">
                                                    True Negatives (TN) are not used
                                                    in multi-class problems as
                                                    there&apos;s no clear
                                                    &quot;negative&quot; class
                                                </li>
                                                <li>
                                                    <span className="font-medium">Precision:</span> How many predictions
                                                    of this class were correct (TP / (TP + FP))
                                                </li>
                                                <li>
                                                    <span className="font-medium">Recall:</span> How many actual points
                                                    of this class were found (TP / (TP + FN))
                                                </li>
                                                <li>
                                                    <span className="font-medium">F1 Score:</span> Balanced measure
                                                    between precision and recall (2 * (Precision * Recall) / (Precision + Recall))
                                                </li>
                                            </ul>
                                        </div>
                                        
                                        {/* Add a more detailed explanation with visual aid */}
                                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="font-medium mb-2 text-blue-700">
                                                Reading the Confusion Matrix:
                                            </p>
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="grid grid-cols-3 gap-1 text-center w-24">
                                                    <div className="p-1 text-xs bg-gray-200 border border-gray-300">C0</div>
                                                    <div className="p-1 text-xs bg-gray-200 border border-gray-300">C1</div>
                                                    <div className="p-1 text-xs bg-gray-200 border border-gray-300">C2</div>
                                                    <div className="p-1 text-xs bg-gray-200 border border-gray-300">C0</div>
                                                    <div className="p-1 text-xs bg-green-100 border border-gray-300">5</div>
                                                    <div className="p-1 text-xs bg-red-50 border border-gray-300">1</div>
                                                    <div className="p-1 text-xs bg-gray-200 border border-gray-300">C1</div>
                                                    <div className="p-1 text-xs bg-red-50 border border-gray-300">2</div>
                                                    <div className="p-1 text-xs bg-green-100 border border-gray-300">7</div>
                                                </div>
                                                <div className="text-sm text-blue-800">
                                                    <p>• Rows: Actual class</p>
                                                    <p>• Columns: Predicted class</p>
                                                    <p>• Green cells: True Positives</p>
                                                    <p>• Red cells: Misclassifications</p>
                                                </div>
                                            </div>
                                            
                                            <p className="text-sm text-blue-700 mb-2">
                                                <span className="font-medium">For Class 0:</span>
                                            </p>
                                            <ul className="list-disc pl-5 text-sm text-blue-800 mb-3">
                                                <li>TP: 5 (Class 0 points correctly predicted as Class 0)</li>
                                                <li>FP: 2 (Class 1 points incorrectly predicted as Class 0)</li>
                                                <li>FN: 1 (Class 0 points incorrectly predicted as Class 1)</li>
                                                <li>Precision: 5/(5+2) = 0.71 or 71%</li>
                                                <li>Recall: 5/(5+1) = 0.83 or 83%</li>
                                            </ul>
                                            
                                            <p className="text-sm text-blue-700">
                                                <span className="font-medium">What This Means:</span> Metrics help you understand where your model is performing well or struggling. For example, low recall for a class means your model is missing many points of that class, while low precision means your model is incorrectly assigning other classes to it.
                                            </p>
                                        </div>
                                    </>
                                )}
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

export default KNN
