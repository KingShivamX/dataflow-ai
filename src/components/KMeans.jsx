import React, { useEffect, useRef, useState } from "react"
import { Chart } from "chart.js/auto"
import { useNavigate } from "react-router-dom"

const KMeans = () => {
    const chartRef = useRef(null)
    const chartInstance = useRef(null)
    const navigate = useNavigate()

    const [points, setPoints] = useState([])
    const [centroids, setCentroids] = useState([])
    const [k, setK] = useState(3)
    const [iterations, setIterations] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const [clusters, setClusters] = useState([])

    // Calculate Euclidean distance between two points
    const calculateDistance = (p1, p2) => {
        if (!p1 || !p2) return Infinity
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
    }

    // Initialize random centroids
    const initializeCentroids = () => {
        const newCentroids = Array(k)
            .fill()
            .map(() => ({
                x: Math.random(),
                y: Math.random(),
            }))
        setCentroids(newCentroids)
        return newCentroids
    }

    // Assign points to nearest centroid
    const assignToClusters = (points, centroids) => {
        if (!points.length || !centroids.length) return []

        return points.map((point) => {
            const distances = centroids.map((centroid) =>
                calculateDistance(point, centroid)
            )
            const nearestCentroidIndex = distances.indexOf(
                Math.min(...distances)
            )
            return { ...point, cluster: nearestCentroidIndex }
        })
    }

    // Update centroid positions
    const updateCentroids = (clusteredPoints, k) => {
        if (!clusteredPoints.length) return []

        return Array(k)
            .fill()
            .map((_, i) => {
                const clusterPoints = clusteredPoints.filter(
                    (p) => p.cluster === i
                )
                if (clusterPoints.length === 0) {
                    // If no points in cluster, return random position
                    return {
                        x: Math.random(),
                        y: Math.random(),
                    }
                }

                return {
                    x:
                        clusterPoints.reduce((sum, p) => sum + p.x, 0) /
                        clusterPoints.length,
                    y:
                        clusterPoints.reduce((sum, p) => sum + p.y, 0) /
                        clusterPoints.length,
                }
            })
    }

    // Run one iteration of k-means
    const runIteration = () => {
        if (points.length < k) return false

        // Use current centroids from state
        const currentCentroids = [...centroids]
        const clusteredPoints = assignToClusters(points, currentCentroids)
        const newCentroids = updateCentroids(clusteredPoints, k)

        // Check for convergence
        const hasConverged = currentCentroids.every(
            (centroid, i) =>
                calculateDistance(centroid, newCentroids[i]) < 0.0001
        )

        setClusters(clusteredPoints)
        setCentroids(newCentroids)
        setIterations((prev) => prev + 1)

        return !hasConverged
    }

    // Start clustering process
    const startClustering = async () => {
        if (isRunning || points.length < k) return

        setIsRunning(true)
        setIterations(0)

        try {
            // Step 1: Initialize centroids with animation
            const initialCentroids = Array(k)
                .fill()
                .map(() => ({
                    x: Math.random(),
                    y: Math.random(),
                }))
            setCentroids(initialCentroids)

            // Initial pause to show random centroids
            await new Promise((resolve) => setTimeout(resolve, 1000))

            let currentCentroids = [...initialCentroids]
            let iterationCount = 0
            const MAX_ITERATIONS = 50

            while (iterationCount < MAX_ITERATIONS) {
                // Step 2: Assign points to clusters (with delay)
                const clusteredPoints = assignToClusters(
                    points,
                    currentCentroids
                )
                setClusters(clusteredPoints)
                await new Promise((resolve) => setTimeout(resolve, 500))

                // Step 3: Update centroids with interpolation
                const newCentroids = updateCentroids(clusteredPoints, k)

                // Animate centroid movement
                const STEPS = 10
                for (let step = 0; step <= STEPS; step++) {
                    const interpolatedCentroids = currentCentroids.map(
                        (oldCentroid, i) => ({
                            x:
                                oldCentroid.x +
                                (newCentroids[i].x - oldCentroid.x) *
                                    (step / STEPS),
                            y:
                                oldCentroid.y +
                                (newCentroids[i].y - oldCentroid.y) *
                                    (step / STEPS),
                        })
                    )
                    setCentroids(interpolatedCentroids)
                    await new Promise((resolve) => setTimeout(resolve, 50))
                }

                // Step 4: Check for convergence
                const hasConverged = currentCentroids.every(
                    (centroid, i) =>
                        calculateDistance(centroid, newCentroids[i]) < 0.00001
                )

                setIterations(iterationCount + 1)

                // If converged, stop
                if (hasConverged) break

                // Update for next iteration
                currentCentroids = [...newCentroids]
                iterationCount++
            }
        } catch (error) {
            console.error("Error in clustering:", error)
            setClusters([])
            setCentroids([])
            setIterations(0)
        } finally {
            setIsRunning(false)
        }
    }

    // Handle canvas click for adding points
    const handleCanvasClick = (event) => {
        if (!isRunning && chartRef.current) {
            const canvas = chartRef.current
            const rect = canvas.getBoundingClientRect()

            const scaleX = canvas.width / rect.width
            const scaleY = canvas.height / rect.height

            const x = ((event.clientX - rect.left) * scaleX) / canvas.width
            const y = 1 - ((event.clientY - rect.top) * scaleY) / canvas.height

            const xValue = Math.max(0, Math.min(1, x))
            const yValue = Math.max(0, Math.min(1, y))

            setPoints([...points, { x: xValue, y: yValue }])
        }
    }

    // Initialize and update chart
    useEffect(() => {
        if (!chartRef.current) return

        if (chartInstance.current) {
            chartInstance.current.destroy()
        }

        const ctx = chartRef.current.getContext("2d")
        const data = {
            datasets: [
                {
                    label: "Data Points",
                    data: points,
                    backgroundColor: clusters.length
                        ? clusters.map(
                              (p) =>
                                  `hsl(${
                                      ((p.cluster * 360) / k) % 360
                                  }, 70%, 70%)`
                          )
                        : Array(points.length).fill("rgba(54, 162, 235, 0.5)"),
                    pointRadius: 8,
                },
                {
                    label: "Centroids",
                    data: centroids,
                    backgroundColor: Array(k)
                        .fill()
                        .map(
                            (_, i) => `hsl(${((i * 360) / k) % 360}, 70%, 50%)`
                        ),
                    pointRadius: 12,
                    pointStyle: "triangle",
                },
            ],
        }

        chartInstance.current = new Chart(ctx, {
            type: "scatter",
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 100, // Shorter animation duration
                },
                transitions: {
                    active: {
                        animation: {
                            duration: 100,
                        },
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
            },
        })
    }, [points, centroids, clusters, k])

    // Also modify the clear function to reset everything properly
    const handleClear = () => {
        setPoints([])
        setCentroids([])
        setClusters([])
        setIterations(0)
        setIsRunning(false)
    }

    return (
        <div className="container mx-auto p-4 min-h-screen bg-gray-50">
            <div className="bg-white rounded-lg shadow-lg p-4">
                <h2 className="text-2xl font-bold mb-4">K-Means Clustering</h2>

                {/* Controls */}
                <div className="mb-4 flex gap-4 flex-wrap">
                    <button
                        onClick={startClustering}
                        disabled={isRunning || points.length < k}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isRunning ? "Clustering..." : "Start Clustering"}
                    </button>
                    <button
                        onClick={handleClear}
                        disabled={isRunning}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Clear All
                    </button>
                    <div className="flex items-center gap-2">
                        <label>Number of clusters (k):</label>
                        <input
                            type="number"
                            min="2"
                            max="6"
                            value={k}
                            onChange={(e) =>
                                setK(
                                    Math.min(
                                        6,
                                        Math.max(
                                            2,
                                            parseInt(e.target.value) || 2
                                        )
                                    )
                                )
                            }
                            disabled={isRunning}
                            className="w-16 px-2 py-1 border rounded"
                        />
                    </div>
                </div>

                {/* Status */}
                <div className="mb-4 text-sm">
                    <p>Number of points: {points.length}</p>
                    <p>Iterations: {iterations}</p>
                    <p className="font-medium">
                        Status:{" "}
                        {isRunning
                            ? "Clustering in progress..."
                            : points.length < k
                            ? `Add at least ${k} points to start`
                            : "Ready to cluster"}
                    </p>
                    {points.length < k && (
                        <p className="text-red-500">
                            Add at least {k} points to start clustering
                        </p>
                    )}
                </div>

                {/* Chart */}
                <div className="relative w-full h-[50vh] md:h-[67vh]">
                    <canvas
                        ref={chartRef}
                        onClick={handleCanvasClick}
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
                                <li>
                                    Click anywhere on the graph to add data
                                    points
                                </li>
                                <li>
                                    Add at least as many points as clusters (k)
                                </li>
                                <li>Try to create visible groups of points</li>
                            </ul>
                        </li>
                        <li className="mb-2">
                            <span className="font-medium">
                                Step 2: Set Parameters
                            </span>
                            <ul className="list-disc pl-4 mt-1">
                                <li>
                                    Choose number of clusters (k) between 2 and
                                    6
                                </li>
                                <li>More clusters = more detailed grouping</li>
                                <li>Recommended: start with k=3</li>
                            </ul>
                        </li>
                        <li className="mb-2">
                            <span className="font-medium">
                                Step 3: Run Clustering
                            </span>
                            <ul className="list-disc pl-4 mt-1">
                                <li>Click "Start Clustering" to begin</li>
                                <li>Watch as points are grouped by color</li>
                                <li>
                                    Triangles show cluster centers (centroids)
                                </li>
                                <li>Algorithm stops when groups stabilize</li>
                            </ul>
                        </li>
                    </ol>

                    <p className="font-medium mt-4 mb-2">
                        Understanding the Results:
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>
                            Points with the same color belong to the same
                            cluster
                        </li>
                        <li>Triangles show the center of each cluster</li>
                        <li>Iterations show how many steps were needed</li>
                        <li>You can clear and try different arrangements</li>
                    </ul>

                    <div className="mt-4 p-3 bg-blue-50 rounded">
                        <p className="font-medium">Tips:</p>
                        <ul className="list-disc pl-4 mt-1">
                            <li>Try creating distinct groups of points</li>
                            <li>
                                Experiment with different numbers of clusters
                            </li>
                            <li>
                                Notice how initial point placement affects
                                results
                            </li>
                            <li>Use "Clear All" to start fresh</li>
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

export default KMeans
