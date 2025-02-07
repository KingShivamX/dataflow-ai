import { useEffect, useRef, useState } from "react"
import { Chart } from "chart.js/auto"
import { useNavigate } from "react-router-dom"

const LogisticRegression = () => {
    const chartRef = useRef(null)
    const chartInstance = useRef(null)
    const navigate = useNavigate()

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
                                    const point = context.raw
                                    if (!point.x) return ""
                                    const z =
                                        weights.w1 * point.x +
                                        weights.w2 * point.y +
                                        weights.b
                                    const prob = sigmoid(z)
                                    return `(${point.x.toFixed(
                                        2
                                    )}, ${point.y.toFixed(
                                        2
                                    )}) - P(class=1) = ${prob.toFixed(3)}`
                                },
                            },
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
        <div className="container mx-auto p-4 min-h-screen bg-gray-50">
            <div className="bg-white rounded-lg shadow-lg p-4">
                <h2 className="text-2xl font-bold mb-4">Logistic Regression</h2>

                {/* Control buttons */}
                <div className="mb-4 flex gap-4 flex-wrap">
                    <button
                        onClick={() => setCurrentClass(0)}
                        className={`px-4 py-2 ${
                            currentClass === 0 ? "bg-blue-500" : "bg-gray-300"
                        } text-white rounded`}
                    >
                        Add Class 0
                    </button>
                    <button
                        onClick={() => setCurrentClass(1)}
                        className={`px-4 py-2 ${
                            currentClass === 1 ? "bg-red-500" : "bg-gray-300"
                        } text-white rounded`}
                    >
                        Add Class 1
                    </button>
                    <button
                        onClick={() => {
                            if (showDecisionBoundary)
                                setShowDecisionBoundary(false)
                            trainModel()
                        }}
                        disabled={points.length < 2 || isTraining}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Train Model
                    </button>
                    <button
                        onClick={clearPoints}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Clear Points
                    </button>
                    <button
                        onClick={() =>
                            setShowDecisionBoundary(!showDecisionBoundary)
                        }
                        disabled={weights.w1 === 0}
                        className={`px-4 py-2 ${
                            showDecisionBoundary ? "bg-red-500" : "bg-blue-500"
                        } text-white rounded hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed`}
                    >
                        {showDecisionBoundary
                            ? "Hide Decision Boundary"
                            : "Show Decision Boundary"}
                    </button>
                </div>

                {/* Stats display */}
                <div className="mb-4 text-sm text-gray-600">
                    <p>Number of points: {points.length}</p>
                    {points.length > 0 && weights.w1 !== 0 && (
                        <p>
                            Equation: z = {weights.w1.toFixed(3)}x₁ +{" "}
                            {weights.w2.toFixed(3)}x₂ + {weights.b.toFixed(3)}
                        </p>
                    )}
                </div>

                {/* Chart container */}
                <div className="relative w-full h-[50vh] md:h-[67vh]">
                    <canvas
                        ref={chartRef}
                        onClick={handleCanvasClick}
                        className="cursor-crosshair"
                    />
                </div>

                {/* Instructions */}
                <div className="mt-4 text-sm text-gray-600">
                    <p>
                        Click on the graph to add points of the selected class.
                    </p>
                    <p>You need at least 2 points to train the model.</p>
                </div>

                {/* Metrics Display */}
                {points.length > 0 && weights.w1 !== 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold mb-2">
                            Model Performance
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white p-3 rounded border">
                                <p className="font-medium">Accuracy:</p>
                                <p className="text-lg">
                                    {(metrics.accuracy * 100).toFixed(1)}%
                                </p>
                            </div>
                            <div className="bg-white p-3 rounded border">
                                <p className="font-medium">Precision:</p>
                                <p className="text-lg">
                                    {(metrics.precision * 100).toFixed(1)}%
                                </p>
                            </div>
                            <div className="bg-white p-3 rounded border">
                                <p className="font-medium">Recall:</p>
                                <p className="text-lg">
                                    {(metrics.recall * 100).toFixed(1)}%
                                </p>
                            </div>
                            <div className="bg-white p-3 rounded border">
                                <p className="font-medium">F1 Score:</p>
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

            {/* Home button */}
            <div className="mt-4 flex justify-start">
                <button
                    onClick={() => navigate("/")}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Back to Home
                </button>
            </div>
        </div>
    )
}

export default LogisticRegression
