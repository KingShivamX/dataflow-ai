import { useEffect, useRef, useState } from "react"
import { Chart } from "chart.js/auto"
import { useNavigate } from "react-router-dom"

const KNN = () => {
    const chartRef = useRef(null)
    const chartInstance = useRef(null)
    const navigate = useNavigate()

    const [points, setPoints] = useState([])
    const [currentClass, setCurrentClass] = useState(0) // 0, 1, or 2 now
    const [kValue, setKValue] = useState(3)
    const [testPoint, setTestPoint] = useState(null)
    const [nearestNeighbors, setNearestNeighbors] = useState([])
    const [prediction, setPrediction] = useState(null)
    const [metrics, setMetrics] = useState({
        confusionMatrix: null,
    })

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
                        },
                        {
                            label: "Class 1",
                            data: points.filter((p) => p.class === 1),
                            backgroundColor: "rgba(255, 99, 132, 0.5)",
                            pointRadius: 8,
                        },
                        {
                            label: "Class 2",
                            data: points.filter((p) => p.class === 2),
                            backgroundColor: "rgba(75, 192, 192, 0.5)", // Teal color for class 2
                            pointRadius: 8,
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
        <div className="container mx-auto p-4 min-h-screen bg-gray-50">
            <div className="bg-white rounded-lg shadow-lg p-4">
                <h2 className="text-2xl font-bold mb-4">K-Nearest Neighbors</h2>

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
                        onClick={() => setCurrentClass(2)}
                        className={`px-4 py-2 ${
                            currentClass === 2 ? "bg-teal-500" : "bg-gray-300"
                        } text-white rounded`}
                    >
                        Add Class 2
                    </button>
                    <button
                        onClick={() => {
                            setPoints([])
                            setTestPoint(null)
                            setNearestNeighbors([])
                            setPrediction(null)
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded"
                    >
                        Clear All
                    </button>
                    <div className="flex items-center gap-2">
                        <label>K value:</label>
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
                        />
                    </div>
                </div>

                {/* Mode indicator */}
                <div className="mb-4 text-sm">
                    <p>
                        Current Mode:{" "}
                        {testPoint
                            ? "Adding Test Point"
                            : "Adding Training Points"}
                    </p>
                    <p>Number of points: {points.length}</p>
                    {prediction !== null && (
                        <p>
                            Prediction: Class {prediction}{" "}
                            <span
                                className={
                                    prediction === 0
                                        ? "text-blue-500"
                                        : prediction === 1
                                        ? "text-red-500"
                                        : "text-teal-500"
                                }
                            >
                                (●)
                            </span>
                        </p>
                    )}
                </div>
                {/* Chart container */}
                <div className="relative w-full h-[50vh] md:h-[67vh]">
                    <canvas
                        ref={chartRef}
                        onClick={testPoint ? null : handleCanvasClick}
                        onContextMenu={(e) => {
                            e.preventDefault()
                            handleAddTestPoint(e)
                        }}
                        className="cursor-crosshair"
                    />
                </div>

                {/* Instructions */}
                <div className="mt-4 text-sm text-gray-600">
                    <p>
                        Left click to add training points of the selected class.
                    </p>
                    <p>Right click to add/move the test point.</p>
                    <p>
                        The test point will be classified based on the {kValue}{" "}
                        nearest neighbors.
                    </p>
                </div>

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
                                                True Positives (TP): Correctly
                                                predicted points of this class
                                            </li>
                                            <li>
                                                False Positives (FP): Other
                                                classes incorrectly predicted as
                                                this class
                                            </li>
                                            <li>
                                                False Negatives (FN): This class
                                                incorrectly predicted as other
                                                classes
                                            </li>
                                            <li className="text-gray-500">
                                                True Negatives (TN) are not used
                                                in multi-class problems as
                                                there&apos;s no clear &quot;negative&quot;
                                                class
                                            </li>
                                            <li>
                                                Precision: How many predictions
                                                of this class were correct
                                            </li>
                                            <li>
                                                Recall: How many actual points
                                                of this class were found
                                            </li>
                                            <li>
                                                F1 Score: Balanced measure
                                                between precision and recall
                                            </li>
                                        </ul>
                                    </div>
                                </>
                            )}
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

export default KNN
