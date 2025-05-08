import { useEffect, useRef, useState } from "react"
import { Chart } from "chart.js/auto"
import { useNavigate } from "react-router-dom"
import { useTutorial } from "../contexts/TutorialContext"
import AlgorithmInfoPanel from "./common/AlgorithmInfoPanel"

const LinearRegression = () => {
    const chartRef = useRef(null)
    const chartInstance = useRef(null)
    const navigate = useNavigate()
    const { startTutorial } = useTutorial()
    const [showInfoPanel, setShowInfoPanel] = useState(true)

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

    const handleStartTutorial = () => {
        setShowInfoPanel(false)
        startTutorial()
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
                                    const point = context.raw;
                                    const datasetLabel = context.dataset.label;
                                    
                                    if (point.isError) {
                                        return `Error: ${point.error.toFixed(4)}`;
                                    }
                                    
                                    if (datasetLabel === "Data Points") {
                                        return [
                                            `Coordinates: (${point.x.toFixed(2)}, ${point.y.toFixed(2)})`,
                                            slope !== 0 ? `Predicted value: ${(slope * point.x + intercept).toFixed(4)}` : '',
                                            slope !== 0 ? `Error: ${Math.abs(point.y - (slope * point.x + intercept)).toFixed(4)}` : ''
                                        ].filter(Boolean);
                                    }
                                    
                                    if (datasetLabel === "Regression Line") {
                                        return `y = ${slope.toFixed(3)}x + ${intercept.toFixed(3)} (at x=${point.x.toFixed(2)})`;
                                    }
                                    
                                    return `(${point.x.toFixed(2)}, ${point.y.toFixed(2)})`;
                                },
                                title: function(context) {
                                    const datasetLabel = context[0].dataset.label;
                                    if (datasetLabel === "Data Points") {
                                        return "Data Point Info";
                                    } else if (datasetLabel === "Regression Line") {
                                        return "Regression Line";
                                    } else if (datasetLabel === "Error Lines") {
                                        return "Error Measurement";
                                    }
                                    return datasetLabel;
                                }
                            }
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

    // Function to get description based on R2 value
    const getR2Description = (r2) => {
        if (r2 >= 0.8) return "Excellent fit";
        if (r2 >= 0.6) return "Good fit";
        if (r2 >= 0.4) return "Fair fit";
        if (r2 >= 0.2) return "Poor fit";
        return "Very poor fit";
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

    return (
        <div className="w-full max-w-7xl mx-auto p-4">
            {showInfoPanel ? (
                <AlgorithmInfoPanel 
                    algorithm="linear-regression" 
                    onStartTutorial={handleStartTutorial} 
                />
            ) : (
                <>
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="lg:w-3/4">
                            <div
                                className="canvas h-96 rounded-xl border border-gray-200 cursor-crosshair"
                                onClick={handleCanvasClick}
                            >
                                <canvas ref={chartRef} />
                </div>

                            <div className="controls flex flex-wrap justify-between gap-3 mt-4">
                    <button
                                    className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                                    onClick={trainModel}
                        disabled={points.length < 2 || isTraining}
                        data-tutorial="train-model"
                    >
                        Train Model
                    </button>

                    <button
                                    className="bg-purple-500 text-white px-4 py-2 rounded"
                        onClick={generateRandomPoints}
                        data-tutorial="random-points"
                    >
                        Generate Random Points
                    </button>

                    <button
                                    className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
                            onClick={() => setShowErrorLines(!showErrorLines)}
                            disabled={slope === 0}
                            data-tutorial="show-errors"
                        >
                            {showErrorLines ? "Hide Errors" : "Show Errors"}
                        </button>
                                
                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded"
                                    onClick={clearPoints}
                                >
                                    Clear Points
                                </button>
                            </div>
                        </div>
                        
                        <div className="lg:w-1/4 flex flex-col gap-6">
                            <div className="bg-white shadow-md rounded-xl p-6">
                                <h2 className="text-xl font-bold mb-4">Model Parameters</h2>
                                <div className="flex flex-col gap-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Slope (m)</p>
                                        <p className="text-xl font-mono">{slope.toFixed(4)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Y-Intercept (b)</p>
                                        <p className="text-xl font-mono">{intercept.toFixed(4)}</p>
                            </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Equation</p>
                                        <p className="text-xl font-mono">
                                            y = {slope.toFixed(2)}x + {intercept.toFixed(2)}
                                        </p>
                                    </div>
                    </div>
                </div>

                            <div className="metrics bg-white shadow-md rounded-xl p-6">
                                <h2 className="text-xl font-bold mb-4">Model Metrics</h2>
                                <div className="flex flex-col gap-3">
                                    <div>
                                        <p className="text-sm text-gray-500">R² (Coefficient of Determination)</p>
                                        <p className="text-xl font-mono">
                                            {metrics.r2.toFixed(4)}
                                            <span className="text-sm ml-2 text-gray-400">
                                                {getR2Description(metrics.r2)}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">MSE (Mean Squared Error)</p>
                                        <p className="text-xl font-mono">{metrics.mse.toFixed(6)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">MAE (Mean Absolute Error)</p>
                                        <p className="text-xl font-mono">{metrics.mae.toFixed(6)}</p>
                                    </div>
                                </div>
                    </div>
                </div>
            </div>
            
                    <div className="mt-8 p-6 bg-white shadow-md rounded-xl">
                        <h2 className="text-2xl font-bold mb-4">Instructions</h2>
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="md:w-1/2">
                                <h3 className="text-lg font-semibold mb-2">How to Use This Tool</h3>
                                <ol className="list-decimal pl-5 space-y-2">
                                    <li>Click on the canvas to add data points or use "Generate Random Points"</li>
                                    <li>Click "Train Model" to fit a linear regression line to your data</li>
                                    <li>Use "Show Errors" to visualize the residuals (errors) between each point and the regression line</li>
                                    <li>Observe how the metrics change as you add or modify points</li>
                                </ol>
                            </div>
                            <div className="md:w-1/2">
                                <h3 className="text-lg font-semibold mb-2">Understanding the Metrics</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>R²:</strong> Measures how well the model fits the data (1.0 = perfect fit, 0 = no fit)</li>
                                    <li><strong>MSE:</strong> Average of squared differences between predicted and actual values</li>
                                    <li><strong>MAE:</strong> Average absolute difference between predicted and actual values</li>
                                </ul>
                                <p className="mt-4">
                <button
                                        onClick={startTutorial}
                                        className="text-blue-500 underline"
                >
                                        Restart Tutorial
                </button>
                                </p>
                            </div>
                        </div>
            </div>
                </>
            )}
        </div>
    )
}

export default LinearRegression
