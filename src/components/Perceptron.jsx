import React, { useEffect, useRef, useState } from "react"
import { Chart } from "chart.js/auto"
import { useNavigate } from "react-router-dom"

const Perceptron = () => {
    const chartRef = useRef(null)
    const chartInstance = useRef(null)
    const navigate = useNavigate()

    const [points, setPoints] = useState([])
    const [weights, setWeights] = useState({
        w1: Math.random() - 0.5,
        w2: Math.random() - 0.5,
    })
    const [bias, setBias] = useState(Math.random() - 0.5)
    const [isTraining, setIsTraining] = useState(false)
    const [epoch, setEpoch] = useState(0)
    const [learningRate, setLearningRate] = useState(0.1)
    const [accuracy, setAccuracy] = useState(0)

    // Activation function (step function)
    const predict = (x1, x2) => {
        const sum = weights.w1 * x1 + weights.w2 * x2 + bias
        return sum >= 0 ? 1 : 0
    }

    // Add points with left/right click
    const handleCanvasClick = (event) => {
        if (isTraining) return

        const canvas = chartRef.current
        const rect = canvas.getBoundingClientRect()

        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height

        const x = ((event.clientX - rect.left) * scaleX) / canvas.width
        const y = 1 - ((event.clientY - rect.top) * scaleY) / canvas.height

        const newPoint = {
            x: Math.max(0, Math.min(1, x)),
            y: Math.max(0, Math.min(1, y)),
            label: event.button === 2 ? 1 : 0, // right click = 1, left click = 0
        }

        setPoints([...points, newPoint])
    }

    // Train one epoch
    const trainEpoch = async () => {
        let correct = 0
        let hasError = false
        let totalError = 0

        // Shuffle points for training
        const shuffledPoints = [...points].sort(() => Math.random() - 0.5)

        for (const point of shuffledPoints) {
            const prediction = predict(point.x, point.y)
            const error = point.label - prediction
            totalError += Math.abs(error)

            if (error !== 0) {
                hasError = true
                // Update weights and bias with smaller steps
                const newWeights = {
                    w1: weights.w1 + learningRate * error * point.x,
                    w2: weights.w2 + learningRate * error * point.y,
                }
                const newBias = bias + learningRate * error

                setWeights(newWeights)
                setBias(newBias)
                await new Promise((resolve) => setTimeout(resolve, 50))
            } else {
                correct++
            }
        }

        const currentAccuracy = (correct / points.length) * 100
        setAccuracy(currentAccuracy)

        return { hasError, totalError }
    }

    // Start training process
    const startTraining = async () => {
        if (points.length < 2) return

        setIsTraining(true)
        setEpoch(0)

        // Increase max epochs and adjust convergence criteria
        const MAX_EPOCHS = 200 // Increased from 100
        let currentEpoch = 0
        let previousError = Infinity
        let stableCount = 0
        let bestWeights = { ...weights }
        let bestBias = bias
        let bestAccuracy = 0

        while (currentEpoch < MAX_EPOCHS) {
            const { hasError, totalError } = await trainEpoch()
            setEpoch(currentEpoch + 1)

            // Save best weights if accuracy improved
            if (accuracy > bestAccuracy) {
                bestWeights = { ...weights }
                bestBias = bias
                bestAccuracy = accuracy
            }

            // Perfect separation achieved
            if (!hasError) {
                break
            }

            // Check if error is stable
            if (Math.abs(previousError - totalError) < 0.0001) {
                stableCount++
                if (stableCount > 10) {
                    // Increased from 5
                    // Use best weights found
                    setWeights(bestWeights)
                    setBias(bestBias)
                    setAccuracy(bestAccuracy)
                    break
                }
            } else {
                stableCount = 0
            }

            previousError = totalError
            currentEpoch++

            await new Promise((resolve) => setTimeout(resolve, 100))
        }

        setIsTraining(false)
    }

    // Reset everything
    const handleClear = () => {
        setPoints([])
        setWeights({ w1: Math.random() - 0.5, w2: Math.random() - 0.5 })
        setBias(Math.random() - 0.5)
        setEpoch(0)
        setAccuracy(0)
        setIsTraining(false)
    }

    // Update chart
    useEffect(() => {
        if (!chartRef.current) return

        if (chartInstance.current) {
            chartInstance.current.destroy()
        }

        // Generate points for decision boundary line
        const generateDecisionBoundary = () => {
            // Don't show line if no points
            if (points.length === 0) return []

            // Handle horizontal line case
            if (Math.abs(weights.w2) < 0.0001) {
                if (Math.abs(weights.w1) < 0.0001) return []
                const x = -bias / weights.w1
                return x >= 0 && x <= 1
                    ? [
                          { x, y: 0 },
                          { x, y: 1 },
                      ]
                    : []
            }

            // Normal case
            const x = [0, 1]
            const y = x.map((xi) => (-weights.w1 * xi - bias) / weights.w2)

            // Check if line is within reasonable bounds
            if (y.some((yi) => !isFinite(yi) || yi < -2 || yi > 3)) return []

            return x.map((xi, i) => ({ x: xi, y: y[i] }))
        }

        const ctx = chartRef.current.getContext("2d")
        chartInstance.current = new Chart(ctx, {
            type: "scatter",
            data: {
                datasets: [
                    {
                        label: "Class 0",
                        data: points.filter((p) => p.label === 0),
                        backgroundColor: "rgba(255, 99, 132, 0.8)",
                        pointRadius: 8,
                    },
                    {
                        label: "Class 1",
                        data: points.filter((p) => p.label === 1),
                        backgroundColor: "rgba(54, 162, 235, 0.8)",
                        pointRadius: 8,
                    },
                    {
                        label: "Decision Boundary",
                        data: generateDecisionBoundary(),
                        type: "line",
                        borderColor: "rgba(75, 192, 192, 0.8)",
                        borderWidth: 2,
                        pointRadius: 0,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 50, // Faster animations
                },
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
            },
        })
    }, [points, weights, bias])

    // Prevent right-click menu
    useEffect(() => {
        const canvas = chartRef.current
        const handleContextMenu = (e) => e.preventDefault()
        canvas?.addEventListener("contextmenu", handleContextMenu)
        return () =>
            canvas?.removeEventListener("contextmenu", handleContextMenu)
    }, [])

    return (
        <div className="container mx-auto p-4 min-h-screen bg-gray-50">
            <div className="bg-white rounded-lg shadow-lg p-4">
                <h2 className="text-2xl font-bold mb-4">Perceptron Learning</h2>

                {/* Controls */}
                <div className="mb-4 flex gap-4 flex-wrap">
                    <button
                        onClick={startTraining}
                        disabled={isTraining || points.length < 2}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isTraining ? "Training..." : "Start Training"}
                    </button>
                    <button
                        onClick={handleClear}
                        disabled={isTraining}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Clear All
                    </button>
                    <div className="flex items-center gap-2">
                        <label>Learning Rate:</label>
                        <input
                            type="number"
                            min="0.01"
                            max="1"
                            step="0.01"
                            value={learningRate}
                            onChange={(e) =>
                                setLearningRate(Number(e.target.value))
                            }
                            disabled={isTraining}
                            className="w-20 px-2 py-1 border rounded"
                        />
                    </div>
                </div>

                {/* Status */}
                <div className="mb-4 text-sm">
                    <p>Number of points: {points.length}</p>
                    <p>Epochs: {epoch}</p>
                    <p>Accuracy: {accuracy.toFixed(1)}%</p>
                    <p className="font-medium">
                        Status:{" "}
                        {isTraining
                            ? "Training in progress..."
                            : points.length < 2
                            ? "Add at least 2 points (1 per class)"
                            : "Ready to train"}
                    </p>
                </div>

                {/* Chart */}
                <div className="relative h-[50vh] md:h-[67vh]">
                    <canvas
                        ref={chartRef}
                        onClick={handleCanvasClick}
                        onContextMenu={handleCanvasClick}
                        className="cursor-crosshair"
                    />
                </div>

                {/* Instructions */}
                <div className="mt-4 text-sm text-gray-600">
                    <p className="font-medium mb-2">How to Use:</p>
                    <ol className="list-decimal pl-4 space-y-2">
                        <li className="mb-2">
                            <span className="font-medium">
                                Step 1: Add Points
                            </span>
                            <ul className="list-disc pl-4 mt-1">
                                <li>Left click to add Class 0 points (red)</li>
                                <li>
                                    Right click to add Class 1 points (blue)
                                </li>
                                <li>
                                    Add points that can be separated by a line
                                </li>
                            </ul>
                        </li>
                        <li className="mb-2">
                            <span className="font-medium">
                                Step 2: Set Parameters
                            </span>
                            <ul className="list-disc pl-4 mt-1">
                                <li>Adjust learning rate (0.01 to 1.0)</li>
                                <li>Higher = faster but might overshoot</li>
                                <li>Lower = slower but more precise</li>
                            </ul>
                        </li>
                        <li className="mb-2">
                            <span className="font-medium">
                                Step 3: Train Model
                            </span>
                            <ul className="list-disc pl-4 mt-1">
                                <li>Click "Start Training" to begin</li>
                                <li>Watch the decision boundary adjust</li>
                                <li>
                                    Training stops when all points are correctly
                                    classified
                                </li>
                            </ul>
                        </li>
                    </ol>

                    <p className="font-medium mt-4 mb-2">
                        Understanding the Visualization:
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Red points = Class 0</li>
                        <li>Blue points = Class 1</li>
                        <li>Green line = Decision boundary</li>
                        <li>Points must be linearly separable</li>
                    </ul>

                    <div className="mt-4 p-3 bg-blue-50 rounded">
                        <p className="font-medium">Tips:</p>
                        <ul className="list-disc pl-4 mt-1">
                            <li>Start with clearly separated points</li>
                            <li>Try different learning rates</li>
                            <li>Watch how the boundary line moves</li>
                            <li>Use "Clear All" to try different patterns</li>
                        </ul>
                    </div>
                </div>
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

export default Perceptron
