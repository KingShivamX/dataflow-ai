import { useEffect, useRef, useState } from "react"
import { Chart } from "chart.js/auto"
import { useNavigate } from "react-router-dom"

const LinearRegression = () => {
    const chartRef = useRef(null)
    const chartInstance = useRef(null)
    const navigate = useNavigate()

    const [points, setPoints] = useState([])
    const [slope, setSlope] = useState(0)
    const [intercept, setIntercept] = useState(0)
    const [isTraining, setIsTraining] = useState(false)
    const [metrics, setMetrics] = useState({
        r2: 0,
        mse: 0,
        mae: 0,
    })
    const [showErrorLines, setShowErrorLines] = useState(false)
    const [isGeneratedPoints, setIsGeneratedPoints] = useState(false)

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
                            label: "Data Points",
                            data: points,
                            pointRadius: 5,
                            backgroundColor: "rgba(54, 162, 235, 1)",
                            animation: isGeneratedPoints,
                            animationDuration: isGeneratedPoints ? 800 : 0,
                        },
                        {
                            label: "Regression Line",
                            data: generateLinePoints(),
                            type: "line",
                            borderColor: "rgba(255, 99, 132, 1)",
                            borderWidth: 2,
                            fill: false,
                            animation: {
                                duration: isTraining ? 800 : 0,
                                easing: "easeInOutQuart",
                            },
                        },
                        ...(showErrorLines && slope !== 0
                            ? [
                                  {
                                      label: "Error Lines",
                                      data: generateErrorLines(),
                                      type: "line",
                                      borderColor: "rgba(255, 99, 132, 0.5)",
                                      borderWidth: 1,
                                      pointRadius: 3,
                                      //   animation: true,
                                  },
                              ]
                            : []),
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animations: {
                        tension: {
                            duration: isTraining ? 800 : 0,
                            easing: "easeInOutQuart",
                        },
                    },
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
                                label: function (context) {
                                    const point = context.raw
                                    if (point.isError) {
                                        return `Error: ${point.error.toFixed(
                                            4
                                        )}`
                                    }
                                    return `(${point.x.toFixed(
                                        2
                                    )}, ${point.y.toFixed(2)})`
                                },
                            },
                        },
                    },
                },
            })
        }
    }, [points, slope, intercept, showErrorLines, isGeneratedPoints])

    // Modify point addition to set isGeneratedPoints to false
    const handleCanvasClick = (event) => {
        if (!isTraining && chartRef.current) {
            setIsGeneratedPoints(false)
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

            setPoints([...points, { x: xValue, y: yValue }])
        }
    }

    // Modify line generation to respect 0-1 bounds
    const generateLinePoints = () => {
        if (points.length < 2) return []
        return [
            { x: 0, y: intercept },
            { x: 1, y: slope + intercept },
        ]
    }

    // Train the model
    const trainModel = async () => {
        setIsTraining(true)

        // Calculate means
        const xMean = points.reduce((sum, p) => sum + p.x, 0) / points.length
        const yMean = points.reduce((sum, p) => sum + p.y, 0) / points.length

        // Calculate slope and intercept
        const numerator = points.reduce(
            (sum, p) => sum + (p.x - xMean) * (p.y - yMean),
            0
        )
        const denominator = points.reduce(
            (sum, p) => sum + Math.pow(p.x - xMean, 2),
            0
        )

        const newSlope = numerator / denominator
        const newIntercept = yMean - newSlope * xMean

        // Calculate metrics
        const predictions = points.map((p) => newSlope * p.x + newIntercept)

        // Calculate R-squared
        const ssTotal = points.reduce(
            (sum, p) => sum + Math.pow(p.y - yMean, 2),
            0
        )
        const ssResidual = points.reduce(
            (sum, p, i) => sum + Math.pow(p.y - predictions[i], 2),
            0
        )
        const r2 = 1 - ssResidual / ssTotal

        // Calculate MSE (Mean Squared Error)
        const mse = ssResidual / points.length

        // Calculate MAE (Mean Absolute Error)
        const mae =
            points.reduce(
                (sum, p, i) => sum + Math.abs(p.y - predictions[i]),
                0
            ) / points.length

        setMetrics({ r2, mse, mae })
        setSlope(newSlope)
        setIntercept(newIntercept)

        setTimeout(() => {
            setIsTraining(false)
        }, 800)
    }

    // Modify generateRandomPoints to set isGeneratedPoints to true
    const generateRandomPoints = () => {
        setIsGeneratedPoints(true)
        const numPoints = 10 // You can make this adjustable if needed
        const newPoints = []

        // Generate points with some correlation for better visualization
        for (let i = 0; i < numPoints; i++) {
            const x = Math.random()
            // Add some noise to make it interesting
            const y = 0.7 * x + 0.15 + (Math.random() - 0.5) * 0.2
            newPoints.push({ x, y: Math.max(0, Math.min(1, y)) })
        }

        setPoints(newPoints)
        // Reset regression line
        setSlope(0)
        setIntercept(0)
    }

    // Modify clearPoints to reset isGeneratedPoints
    const clearPoints = () => {
        setPoints([])
        setSlope(0)
        setIntercept(0)
        setIsGeneratedPoints(false)
    }

    // Generate error lines for visualization
    const generateErrorLines = () => {
        const errorLines = []
        points.forEach((point) => {
            const predicted = slope * point.x + intercept
            errorLines.push(
                {
                    x: point.x,
                    y: point.y,
                    isError: true,
                    error: Math.abs(predicted - point.y),
                },
                {
                    x: point.x,
                    y: predicted,
                    isError: true,
                    error: Math.abs(predicted - point.y),
                },
                { x: null, y: null } // Creates a break in the line
            )
        })
        return errorLines
    }

    return (
        <div className="container mx-auto p-4 min-h-screen bg-gray-50">
            <div className="bg-white rounded-lg shadow-lg p-4">
                <h2 className="text-2xl font-bold mb-4">Linear Regression</h2>

                {/* Control buttons */}
                <div className="mb-4 flex gap-4 flex-wrap">
                    <button
                        onClick={() => {
                            if (showErrorLines) setShowErrorLines(false)
                            trainModel()
                        }}
                        disabled={points.length < 2 || isTraining}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Train Model
                    </button>

                    <button
                        onClick={generateRandomPoints}
                        disabled={isTraining}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Generate Random Points
                    </button>

                    <button
                        onClick={clearPoints}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Clear Points
                    </button>

                    <button
                        onClick={() => setShowErrorLines(!showErrorLines)}
                        disabled={slope === 0}
                        className={`px-4 py-2 ${
                            showErrorLines ? "bg-red-500" : "bg-blue-500"
                        } text-white rounded hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed`}
                    >
                        {showErrorLines ? "Hide Errors" : "Show Errors"}
                    </button>
                </div>
                {/* Stats display */}
                <div className="mb-4 text-sm text-gray-600">
                    <p>Number of points: {points.length}</p>
                    {points.length > 0 && slope !== 0 && (
                        <>
                            <p>
                                Equation: y = {slope.toFixed(3)}x +{" "}
                                {intercept.toFixed(3)}
                            </p>
                        </>
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
                        Click on the graph to add points manually, or use the
                        generate button for random points.
                    </p>
                    <p>You need at least 2 points to train the model.</p>
                </div>

                {/* Add this after the chart container */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Model Performance</h3>
                    <div className="text-sm">
                        {points.length > 0 && slope !== 0 && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white p-3 rounded border">
                                        <p className="font-medium mb-2">
                                            R² Score:
                                        </p>
                                        <p className="text-lg mb-1">
                                            {metrics.r2.toFixed(4)}
                                        </p>
                                        <div className="text-sm text-gray-600">
                                            Measures how well the model fits the
                                            data:
                                            <ul className="list-disc pl-4 mt-1 space-y-1">
                                                <li>1.0 = Perfect fit</li>
                                                <li>0.0 = Poor fit</li>
                                                <li>
                                                    Negative = Worse than
                                                    horizontal line
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="bg-white p-3 rounded border">
                                        <p className="font-medium mb-2">
                                            Mean Squared Error (MSE):
                                        </p>
                                        <p className="text-lg mb-1">
                                            {metrics.mse.toFixed(4)}
                                        </p>
                                        <div className="text-sm text-gray-600">
                                            Average of squared differences
                                            between predictions and actual
                                            values:
                                            <ul className="list-disc pl-4 mt-1 space-y-1">
                                                <li>
                                                    Penalizes larger errors more
                                                </li>
                                                <li>Always positive</li>
                                                <li>Lower is better</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="bg-white p-3 rounded border">
                                        <p className="font-medium mb-2">
                                            Mean Absolute Error (MAE):
                                        </p>
                                        <p className="text-lg mb-1">
                                            {metrics.mae.toFixed(4)}
                                        </p>
                                        <div className="text-sm text-gray-600">
                                            Average of absolute differences
                                            between predictions and actual
                                            values:
                                            <ul className="list-disc pl-4 mt-1 space-y-1">
                                                <li>Easier to interpret</li>
                                                <li>
                                                    Less sensitive to outliers
                                                    than MSE
                                                </li>
                                                <li>Lower is better</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 text-sm text-gray-600">
                                    <p className="font-medium mb-2">
                                        Understanding the Metrics:
                                    </p>
                                    <ul className="list-disc pl-4 space-y-2">
                                        <li>
                                            <span className="font-medium">
                                                R² (R-squared):
                                            </span>{" "}
                                            Shows how much of the data&apos;s
                                            variance is explained by the model.
                                            A value of 0.8 means 80% of the
                                            variance in y is predictable from x.
                                        </li>
                                        <li>
                                            <span className="font-medium">
                                                MSE:
                                            </span>{" "}
                                            Calculated by squaring the
                                            differences between predicted and
                                            actual values. Useful for training
                                            but harder to interpret due to
                                            squared units.
                                        </li>
                                        <li>
                                            <span className="font-medium">
                                                MAE:
                                            </span>{" "}
                                            Average distance between predicted
                                            and actual values. If MAE is 0.1,
                                            predictions are off by 0.1 units on
                                            average.
                                        </li>
                                        <li className="text-gray-500 italic">
                                            Note: For this visualization, all
                                            values are scaled between 0 and 1,
                                            so the errors (MSE and MAE) will
                                            also be between 0 and 1.
                                        </li>
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Home button moved to bottom */}
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

export default LinearRegression
