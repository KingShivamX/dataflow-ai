import { useEffect, useRef, useState } from "react"
import { Chart } from "chart.js/auto"
import { useNavigate } from "react-router-dom"
import { useTutorial } from "../contexts/TutorialContext"

// Create a reusable tooltip component
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

// Create a reusable calculation step component
const CalculationStep = ({ title, children, formula, example, isActive }) => {
    return (
        <div className={`p-3 border rounded-lg mt-2 ${isActive ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`font-medium ${isActive ? 'text-yellow-700' : 'text-gray-700'}`}>{title}</h4>
            <div className="mt-1 text-sm">{children}</div>
            {formula && (
                <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                    <div className="font-mono text-center">{formula}</div>
                    {example && <div className="mt-1 text-xs text-gray-500">{example}</div>}
                </div>
            )}
        </div>
    );
};

const KMeans = () => {
    const chartRef = useRef(null)
    const chartInstance = useRef(null)
    const navigate = useNavigate()
    const { startTutorial } = useTutorial()

    const [points, setPoints] = useState([])
    const [centroids, setCentroids] = useState([])
    const [k, setK] = useState(3)
    const [iterations, setIterations] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const [clusters, setClusters] = useState([])
    
    // Add additional state for explanations
    const [currentStep, setCurrentStep] = useState(0) // 0: not started, 1: initialization, 2: assignment, 3: update
    const [clusterStats, setClusterStats] = useState([])
    const [distanceCalculations, setDistanceCalculations] = useState([])
    const [showExplanations, setShowExplanations] = useState(true)
    const [totalInertia, setTotalInertia] = useState(0)

    // Add additional state for cursor position tracking and hover information
    const [cursorPosition, setCursorPosition] = useState(null)
    const [hoverPoint, setHoverPoint] = useState(null)
    const [hoverInfo, setHoverInfo] = useState(null)
    const [animationHistory, setAnimationHistory] = useState([])
    const [selectedCentroid, setSelectedCentroid] = useState(null)

    // Add step control states
    const [manualMode, setManualMode] = useState(true)
    const [waitingForNext, setWaitingForNext] = useState(false)
    const [stepProgress, setStepProgress] = useState(0) // Within a step progress
    const [nextStep, setNextStep] = useState(null) // Function to trigger next step
    const [autoRunSpeed, setAutoRunSpeed] = useState(1) // 1 = normal, 2 = slow, 0.5 = fast

    // Add state for detailed calculation display
    const [focusedPoint, setFocusedPoint] = useState(null)
    const [showCalculationDetails, setShowCalculationDetails] = useState(true)
    const [pointsToProcess, setPointsToProcess] = useState([])
    const [currentPointIndex, setCurrentPointIndex] = useState(0)

    // Calculate Euclidean distance between two points
    const calculateDistance = (p1, p2) => {
        if (!p1 || !p2) return Infinity
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
    }

    // Modified version of assignToClusters that processes one point at a time
    const processNextPoint = () => {
        if (!pointsToProcess.length || currentPointIndex >= pointsToProcess.length) {
            return false;
        }
        
        const point = pointsToProcess[currentPointIndex];
        setFocusedPoint(point);
        
        // Calculate distances to all centroids
        const distances = centroids.map((centroid, i) => {
            const dist = calculateDistance(point, centroid);
            return { centroidIdx: i, distance: dist };
        });
        
        // Sort distances to find the minimum
        distances.sort((a, b) => a.distance - b.distance);
        const nearestCentroidIndex = distances[0].centroidIdx;
        
        // Store calculation for display
        const calculation = {
            point,
            pointIndex: currentPointIndex,
            distances: distances.map(d => ({
                centroidIdx: d.centroidIdx,
                distance: d.distance,
                calculation: {
                    x1: point.x,
                    y1: point.y,
                    x2: centroids[d.centroidIdx].x,
                    y2: centroids[d.centroidIdx].y,
                    xDiff: (point.x - centroids[d.centroidIdx].x).toFixed(4),
                    yDiff: (point.y - centroids[d.centroidIdx].y).toFixed(4),
                    xDiffSquared: Math.pow(point.x - centroids[d.centroidIdx].x, 2).toFixed(4),
                    yDiffSquared: Math.pow(point.y - centroids[d.centroidIdx].y, 2).toFixed(4),
                    sum: (Math.pow(point.x - centroids[d.centroidIdx].x, 2) + 
                          Math.pow(point.y - centroids[d.centroidIdx].y, 2)).toFixed(4),
                    result: Math.sqrt(
                        Math.pow(point.x - centroids[d.centroidIdx].x, 2) + 
                        Math.pow(point.y - centroids[d.centroidIdx].y, 2)
                    ).toFixed(4)
                }
            })),
            assignedCluster: nearestCentroidIndex
        };
        
        setDistanceCalculations([calculation]);
        
        // Increment for next time
        setCurrentPointIndex(currentPointIndex + 1);
        return true;
    }
    
    // Step-by-step assignment process
    const assignClustersStepped = async (points, centroids) => {
        if (!points.length || !centroids.length) return [];
        
        // Setup for step-by-step processing
        setPointsToProcess([...points]);
        setCurrentPointIndex(0);
        setClusters([]);
        
        const clusterPointsMap = Array(k).fill().map(() => []);
        let clusteredPoints = [];
        
        // Process first point immediately
        processNextPoint();
        
        // Wait for user to process remaining points one by one
        while (currentPointIndex < points.length) {
            setWaitingForNext(true);
            await new Promise(resolve => setNextStep(() => resolve));
            
            // Process the assignment for the current point
            const pointProcessed = processNextPoint();
            if (!pointProcessed) break;
        }
        
        // Once all points have been processed one by one, assign them all at once
        clusteredPoints = points.map((point) => {
            const distances = centroids.map((centroid, i) => 
                calculateDistance(point, centroid)
            );
            const nearestCentroidIndex = distances.indexOf(Math.min(...distances));
            
            // Add to the cluster grouping for statistics
            clusterPointsMap[nearestCentroidIndex].push({...point, cluster: nearestCentroidIndex});
            
            return { ...point, cluster: nearestCentroidIndex };
        });
        
        // Calculate statistics for each cluster
        const stats = clusterPointsMap.map((clusterPoints, i) => {
            if (clusterPoints.length === 0) {
                return { 
                    id: i, 
                    count: 0, 
                    inertia: 0,
                    avgDistance: 0,
                    isEmpty: true 
                };
            }
            
            const centroid = centroids[i];
            const totalDistance = clusterPoints.reduce(
                (sum, p) => sum + calculateDistance(p, centroid), 0
            );
            const inertia = clusterPoints.reduce(
                (sum, p) => sum + Math.pow(calculateDistance(p, centroid), 2), 0
            );
            
            return {
                id: i,
                count: clusterPoints.length,
                inertia: inertia,
                avgDistance: totalDistance / clusterPoints.length,
                isEmpty: false
            };
        });
        
        // Calculate total inertia
        const totalInertia = stats.reduce((sum, s) => sum + s.inertia, 0);
        setTotalInertia(totalInertia);
        setClusterStats(stats);
        
        return clusteredPoints;
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

    // Handle canvas mousemove to show hover information
    const handleCanvasMouseMove = (event) => {
        if (chartRef.current) {
            const canvas = chartRef.current
            const rect = canvas.getBoundingClientRect()

            const scaleX = canvas.width / rect.width
            const scaleY = canvas.height / rect.height

            const x = ((event.clientX - rect.left) * scaleX) / canvas.width
            const y = 1 - ((event.clientY - rect.top) * scaleY) / canvas.height

            const xValue = Math.max(0, Math.min(1, x))
            const yValue = Math.max(0, Math.min(1, y))

            setCursorPosition({ x: xValue, y: yValue })
            
            // Check if hovering over a point or centroid
            if (points.length || centroids.length) {
                // Check points first
                const hoverDistance = 0.02; // Threshold for considering hover
                
                // Check centroids (they're more important)
                let foundCentroid = null;
                for (let i = 0; i < centroids.length; i++) {
                    const dist = calculateDistance(
                        { x: xValue, y: yValue },
                        centroids[i]
                    );
                    if (dist < hoverDistance) {
                        foundCentroid = { ...centroids[i], index: i, type: 'centroid' };
                        break;
                    }
                }
                
                if (foundCentroid) {
                    setHoverPoint(foundCentroid);
                    setSelectedCentroid(foundCentroid.index);
                    
                    // Find cluster info
                    if (clusterStats.length > 0) {
                        const stats = clusterStats[foundCentroid.index];
                        
                        // Calculate centroid movement history if available
                        let movementInfo = "";
                        if (animationHistory.length > 0) {
                            const history = animationHistory.filter(h => 
                                h.centroids && h.centroids[foundCentroid.index]
                            );
                            
                            if (history.length > 1) {
                                const firstPosition = history[0].centroids[foundCentroid.index];
                                const lastPosition = history[history.length - 1].centroids[foundCentroid.index];
                                const totalDistance = calculateDistance(firstPosition, lastPosition);
                                
                                movementInfo = `
                                    <div class="mt-2">
                                        <p class="font-medium">Centroid Movement:</p>
                                        <p>Initial: (${firstPosition.x.toFixed(3)}, ${firstPosition.y.toFixed(3)})</p>
                                        <p>Final: (${lastPosition.x.toFixed(3)}, ${lastPosition.y.toFixed(3)})</p>
                                        <p>Total distance: ${totalDistance.toFixed(4)}</p>
                                    </div>
                                `;
                            }
                        }
                        
                        setHoverInfo(`
                            <div>
                                <p class="font-medium">Centroid ${foundCentroid.index}</p>
                                <p>Position: (${foundCentroid.x.toFixed(3)}, ${foundCentroid.y.toFixed(3)})</p>
                                <p>Points: ${stats?.count || 0}</p>
                                <p>Avg Distance: ${stats?.avgDistance.toFixed(4) || 0}</p>
                                <p>Inertia: ${stats?.inertia.toFixed(4) || 0}</p>
                                ${movementInfo}
                            </div>
                        `);
                    } else {
                        setHoverInfo(`
                            <div>
                                <p class="font-medium">Centroid ${foundCentroid.index}</p>
                                <p>Position: (${foundCentroid.x.toFixed(3)}, ${foundCentroid.y.toFixed(3)})</p>
                                <p>No clustering data yet</p>
                            </div>
                        `);
                    }
                    return;
                }
                
                // Check data points if no centroid was found
                let foundPoint = null;
                let minDist = hoverDistance;
                
                for (let i = 0; i < points.length; i++) {
                    const dist = calculateDistance(
                        { x: xValue, y: yValue },
                        points[i]
                    );
                    if (dist < minDist) {
                        minDist = dist;
                        foundPoint = { ...points[i], index: i, type: 'point' };
                    }
                }
                
                if (foundPoint) {
                    setHoverPoint(foundPoint);
                    
                    // Find cluster info if points are clustered
                    if (clusters.length > 0) {
                        const clusterInfo = clusters.find(p => 
                            p.x === foundPoint.x && p.y === foundPoint.y
                        );
                        
                        if (clusterInfo) {
                            const clusterIndex = clusterInfo.cluster;
                            const centroid = centroids[clusterIndex];
                            const distance = calculateDistance(foundPoint, centroid);
                            
                            // Show calculation for this point's assignment
                            let calculationInfo = "";
                            const pointDistances = distanceCalculations.find(d => 
                                d.point.x === foundPoint.x && d.point.y === foundPoint.y
                            );
                            
                            if (pointDistances) {
                                calculationInfo = `
                                    <div class="mt-2">
                                        <p class="font-medium">Distance Calculations:</p>
                                        ${pointDistances.distances.map(d => 
                                            `<p>To Centroid ${d.centroidIdx}: √(${(foundPoint.x - centroids[d.centroidIdx].x).toFixed(3)}² + ${(foundPoint.y - centroids[d.centroidIdx].y).toFixed(3)}²) = ${d.distance.toFixed(4)}${d.centroidIdx === clusterIndex ? ' (closest)' : ''}</p>`
                                        ).join('')}
                                    </div>
                                `;
                            }
                            
                            setHoverInfo(`
                                <div>
                                    <p class="font-medium">Point ${foundPoint.index}</p>
                                    <p>Position: (${foundPoint.x.toFixed(3)}, ${foundPoint.y.toFixed(3)})</p>
                                    <p>Assigned to Cluster ${clusterIndex}</p>
                                    <p>Distance to centroid: ${distance.toFixed(4)}</p>
                                    ${calculationInfo}
                                </div>
                            `);
                        } else {
                            setHoverInfo(`
                                <div>
                                    <p class="font-medium">Point ${foundPoint.index}</p>
                                    <p>Position: (${foundPoint.x.toFixed(3)}, ${foundPoint.y.toFixed(3)})</p>
                                    <p>Not yet clustered</p>
                                </div>
                            `);
                        }
                    } else {
                        setHoverInfo(`
                            <div>
                                <p class="font-medium">Point ${foundPoint.index}</p>
                                <p>Position: (${foundPoint.x.toFixed(3)}, ${foundPoint.y.toFixed(3)})</p>
                                <p>Not yet clustered</p>
                            </div>
                        `);
                    }
                } else {
                    setHoverPoint(null);
                    setHoverInfo(null);
                }
            } else {
                setHoverPoint(null);
                setHoverInfo(null);
            }
        }
    }
    
    const handleCanvasMouseLeave = () => {
        setCursorPosition(null);
        setHoverPoint(null);
        setHoverInfo(null);
        setSelectedCentroid(null);
    }

    // Controls for moving through the algorithm
    const continueToNextStep = () => {
        if (nextStep) {
            nextStep();
            setWaitingForNext(false);
        }
    }
    
    // Start clustering process with step-by-step visualization
    const startClustering = async () => {
        if (isRunning || points.length < k) return

        setIsRunning(true)
        setIterations(0)
        setCurrentStep(0) // Reset step
        setStepProgress(0)
        
        // Reset history
        setAnimationHistory([]);

        try {
            // Step 1: Initialize centroids with animation
            setCurrentStep(1) // Initialization step
            setStepProgress(0)
            
            // Wait for user to start if in manual mode
            if (manualMode) {
                setWaitingForNext(true)
                await new Promise(resolve => setNextStep(() => resolve))
            }
            
            // Initialize random centroids
            const initialCentroids = Array(k)
                .fill()
                .map(() => ({
                    x: Math.random(),
                    y: Math.random(),
                }))
            setCentroids(initialCentroids)
            
            // Record this step
            setAnimationHistory(prev => [...prev, {
                step: 1,
                iteration: 0,
                centroids: [...initialCentroids],
                description: "Random initialization of centroids"
            }]);

            // Give time to see the initial centroids
            setStepProgress(100)
            if (manualMode) {
                setWaitingForNext(true)
                await new Promise(resolve => setNextStep(() => resolve))
            } else {
                await new Promise((resolve) => setTimeout(resolve, 1000 * autoRunSpeed))
            }

            let currentCentroids = [...initialCentroids]
            let iterationCount = 0
            const MAX_ITERATIONS = 50

            while (iterationCount < MAX_ITERATIONS) {
                // Step 2: Assign points to clusters (step by step)
                setCurrentStep(2) // Assignment step
                setStepProgress(0)
                
                const clusteredPoints = await assignClustersStepped(
                    points,
                    currentCentroids
                )
                setClusters(clusteredPoints)
                
                // Give time to see the assignments
                setStepProgress(100)
                if (manualMode) {
                    setWaitingForNext(true)
                    await new Promise(resolve => setNextStep(() => resolve))
                } else {
                    await new Promise((resolve) => setTimeout(resolve, 500 * autoRunSpeed))
                }

                // Step 3: Update centroids
                setCurrentStep(3) // Update step
                setStepProgress(0)
                
                // Calculate new centroid positions
                const newCentroids = updateCentroids(clusteredPoints, k)
                
                // Calculate how much each centroid moved
                const centroidMovements = currentCentroids.map((oldC, i) => ({
                    from: {...oldC},
                    to: {...newCentroids[i]},
                    distance: calculateDistance(oldC, newCentroids[i])
                }));

                // Show detailed centroid update process
                if (manualMode) {
                    // Show movement details for each centroid one by one
                    for (let i = 0; i < k; i++) {
                        setSelectedCentroid(i);
                        
                        // Update information panel
                        const centroidDetails = {
                            oldPosition: currentCentroids[i],
                            newPosition: newCentroids[i],
                            movement: centroidMovements[i],
                            clusterPoints: clusteredPoints.filter(p => p.cluster === i),
                            index: i
                        };
                        
                        // Update the UI to show this centroid's information
                        setHoverPoint({...newCentroids[i], index: i, type: 'centroid'});
                        
                        // Wait for user to continue
                        if (centroidMovements[i].distance > 0.0001) {
                            setWaitingForNext(true);
                            await new Promise(resolve => setNextStep(() => resolve));
                        }
                        
                        // Update just this centroid
                        setCentroids(prev => {
                            const updated = [...prev];
                            updated[i] = newCentroids[i];
                            return updated;
                        });
                        
                        setStepProgress((i + 1) / k * 100);
                    }
                    
                    // Final update to ensure all centroids are set
                    setCentroids(newCentroids);
                    
                    // Record centroid update in history
                    setAnimationHistory(prev => [...prev, {
                        step: 3,
                        iteration: iterationCount + 1,
                        centroids: [...newCentroids],
                        clusters: [...clusteredPoints],
                        clusterStats: [...clusterStats],
                        movements: centroidMovements,
                        description: `Iteration ${iterationCount + 1}: Centroids updated to new positions`
                    }]);
                    
                    setStepProgress(100);
                    
                    // Clear selection
                    setSelectedCentroid(null);
                    setHoverPoint(null);
                    
                    setWaitingForNext(true);
                    await new Promise(resolve => setNextStep(() => resolve));
                } else {
                    // For auto mode, animate the movement
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
                        setStepProgress(Math.floor((step / STEPS) * 100))
                        
                        // Only record key steps in history to avoid bloat
                        if (step === STEPS) {
                            setAnimationHistory(prev => [...prev, {
                                step: 3,
                                iteration: iterationCount + 1,
                                centroids: [...interpolatedCentroids],
                                clusters: [...clusteredPoints],
                                clusterStats: [...clusterStats],
                                movements: centroidMovements,
                                description: `Iteration ${iterationCount + 1}: Centroids updated to new positions`
                            }]);
                            setStepProgress(100)
                        }
                        
                        await new Promise((resolve) => setTimeout(resolve, 50 * autoRunSpeed))
                    }
                }

                // Step 4: Check for convergence
                setCurrentStep(4); // Convergence check step
                setStepProgress(50);
                
                const hasConverged = currentCentroids.every(
                    (centroid, i) =>
                        calculateDistance(centroid, newCentroids[i]) < 0.00001
                )

                setIterations(iterationCount + 1)
                setStepProgress(100);

                // If converged, stop
                if (hasConverged) {
                    // Record convergence
                    setAnimationHistory(prev => [...prev, {
                        step: 4,
                        iteration: iterationCount + 1,
                        centroids: [...newCentroids],
                        clusters: [...clusteredPoints],
                        clusterStats: [...clusterStats],
                        description: `Converged after ${iterationCount + 1} iterations`
                    }]);
                    
                    if (manualMode) {
                        setWaitingForNext(true)
                        await new Promise(resolve => setNextStep(() => resolve))
                    }
                    break;
                }

                // Update for next iteration
                currentCentroids = [...newCentroids]
                iterationCount++
                
                // Before starting the next iteration in manual mode, wait for user
                if (manualMode) {
                    setWaitingForNext(true)
                    setCurrentStep(0) // Between iterations
                    await new Promise(resolve => setNextStep(() => resolve))
                }
            }
            
            // If reached max iterations without convergence
            if (iterationCount >= MAX_ITERATIONS) {
                setAnimationHistory(prev => [...prev, {
                    step: 4,
                    iteration: iterationCount,
                    centroids: [...currentCentroids],
                    description: `Reached maximum iterations (${MAX_ITERATIONS})`
                }]);
                
                setCurrentStep(4) // Max iterations reached
                if (manualMode) {
                    setWaitingForNext(true)
                    await new Promise(resolve => setNextStep(() => resolve))
                }
            }
        } catch (error) {
            console.error("Error in clustering:", error)
            setClusters([])
            setCentroids([])
            setIterations(0)
            setAnimationHistory([]);
        } finally {
            setCurrentStep(0)
            setIsRunning(false)
            setWaitingForNext(false)
            setNextStep(null)
            setHoverPoint(null)
            setSelectedCentroid(null)
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
                    duration: 0, // Shorter animation duration
                },
                transitions: {
                    active: {
                        animation: {
                            duration: 0,
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
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const point = context.raw;
                                const datasetLabel = context.dataset.label;
                                
                                if (!point) return "";
                                
                                // Centroid tooltip
                                if (datasetLabel === "Centroids") {
                                    const centroidIndex = centroids.findIndex(c => 
                                        c.x === point.x && c.y === point.y
                                    );
                                    
                                    const stats = clusterStats.find(s => s.id === centroidIndex);
                                    
                                    if (stats) {
                                        return [
                                            `Centroid ${centroidIndex} at (${point.x.toFixed(3)}, ${point.y.toFixed(3)})`,
                                            `Points in cluster: ${stats.count}`,
                                            `Avg distance: ${stats.avgDistance.toFixed(4)}`,
                                            `Inertia: ${stats.inertia.toFixed(4)}`
                                        ];
                                    }
                                    
                                    return `Centroid at (${point.x.toFixed(3)}, ${point.y.toFixed(3)})`;
                                }
                                
                                // Data point tooltip
                                if (clusters.length) {
                                    // Find this point in clusters
                                    const clusterInfo = clusters.find(p => 
                                        p.x === point.x && p.y === point.y
                                    );
                                    
                                    if (clusterInfo) {
                                        const clusterIndex = clusterInfo.cluster;
                                        const centroid = centroids[clusterIndex];
                                        const distance = calculateDistance(point, centroid);
                                        
                                        return [
                                            `Point at (${point.x.toFixed(3)}, ${point.y.toFixed(3)})`,
                                            `Assigned to cluster ${clusterIndex}`,
                                            `Distance to centroid: ${distance.toFixed(4)}`
                                        ];
                                    }
                                }
                                
                                return `Point at (${point.x.toFixed(3)}, ${point.y.toFixed(3)})`;
                            },
                            title: function(context) {
                                const datasetLabel = context[0].dataset.label;
                                if (datasetLabel === "Centroids") {
                                    return "Cluster Centroid";
                                }
                                return "Data Point";
                            }
                        }
                    }
                }
            },
        })
    }, [points, centroids, clusters, k, clusterStats])

    // Also modify the clear function to reset everything properly
    const handleClear = () => {
        setPoints([])
        setCentroids([])
        setClusters([])
        setIterations(0)
        setIsRunning(false)
        setWaitingForNext(false)
        setNextStep(null)
        setCurrentStep(0)
        setStepProgress(0)
        setAnimationHistory([])
    }

    return (
        <div className="p-4 min-h-screen bg-gray-50">
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
                        <h2 className="text-2xl font-bold">K-Means Clustering</h2>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={startTutorial}
                            className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                        >
                            Show Tutorial
                        </button>
                    </div>
                </div>

                {/* Controls */}
                <div className="cluster-controls mb-4 flex gap-4 flex-wrap">
                    {!isRunning ? (
                        <>
                            <Tooltip text="Start the K-Means clustering algorithm. In manual mode, you'll control each step.">
                                <button
                                    onClick={startClustering}
                                    disabled={points.length < k}
                                    className="start-clustering-button px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    data-tutorial="start-clustering"
                                >
                                    Start Clustering
                                </button>
                            </Tooltip>
                            <Tooltip text="Clear all points and reset the clustering process.">
                                <button
                                    onClick={handleClear}
                                    className="clear-kmeans-button px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                    data-tutorial="clear-kmeans"
                                >
                                    Clear All
                                </button>
                            </Tooltip>
                        </>
                    ) : (
                        <>
                            {waitingForNext && (
                                <Tooltip text="Continue to the next step of the algorithm">
                                    <button
                                        onClick={continueToNextStep}
                                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 animate-pulse"
                                    >
                                        Next Step →
                                    </button>
                                </Tooltip>
                            )}
                            <Tooltip text="Stop the current clustering process">
                                <button
                                    onClick={handleClear}
                                    className="clear-kmeans-button px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Stop & Reset
                                </button>
                            </Tooltip>
                        </>
                    )}
                    <div className="flex items-center gap-2">
                        <Tooltip text="The K value determines how many clusters the algorithm will create. Choose a value based on how many natural groups you think exist in your data.">
                            <label className="cursor-help border-b border-dotted border-gray-400">Number of clusters (k):</label>
                        </Tooltip>
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
                            data-tutorial="k-clusters"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Tooltip text="In manual mode, you control when to advance to the next step. In auto mode, the algorithm runs automatically.">
                            <label className="cursor-help border-b border-dotted border-gray-400">Manual step-by-step:</label>
                        </Tooltip>
                        <input
                            type="checkbox"
                            checked={manualMode}
                            onChange={(e) => setManualMode(e.target.checked)}
                            disabled={isRunning}
                            className="w-4 h-4"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Tooltip text="Toggle detailed explanations of the clustering process.">
                            <label className="cursor-help border-b border-dotted border-gray-400">Show explanations:</label>
                        </Tooltip>
                        <input
                            type="checkbox"
                            checked={showExplanations}
                            onChange={(e) => setShowExplanations(e.target.checked)}
                            className="w-4 h-4"
                        />
                    </div>
                </div>

                {/* Status with enhanced metrics */}
                <div className="kmeans-status mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200" data-tutorial="kmeans-status">
                    <div className="flex flex-wrap gap-5">
                        <div>
                            <p className="text-sm text-gray-500">Points</p>
                            <p className="text-xl font-semibold">{points.length}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Clusters (K)</p>
                            <p className="text-xl font-semibold">{k}</p>
                        </div>
                        <div>
                            <Tooltip text="Number of iterations it took for the algorithm to converge. Each iteration includes reassigning points to clusters and recalculating centroids.">
                                <div className="cursor-help">
                                    <p className="text-sm text-gray-500 border-b border-dotted border-gray-400">Iterations</p>
                                    <p className="text-xl font-semibold">{iterations}</p>
                                </div>
                            </Tooltip>
                        </div>
                        {clusters.length > 0 && (
                            <div>
                                <Tooltip text="Total inertia is the sum of squared distances from each point to its assigned centroid. Lower values indicate tighter, more cohesive clusters.">
                                    <div className="cursor-help">
                                        <p className="text-sm text-gray-500 border-b border-dotted border-gray-400">Total Inertia</p>
                                        <p className="text-xl font-semibold">{totalInertia.toFixed(4)}</p>
                                    </div>
                                </Tooltip>
                            </div>
                        )}
                    </div>
                    <div className="mt-3">
                        <div className="flex justify-between items-center">
                            <p className="font-medium">
                                Status: {" "}
                                {isRunning
                                    ? currentStep === 0 
                                        ? "Ready for next iteration..." 
                                        : currentStep === 1 
                                            ? "Initializing random centroids..." 
                                            : currentStep === 2 
                                                ? "Assigning points to nearest centroids..." 
                                                : currentStep === 3
                                                    ? "Updating centroid positions..."
                                                    : "Checking convergence..."
                                    : points.length < k
                                    ? `Add at least ${k} points to start`
                                    : "Ready to cluster"}
                            </p>
                            {waitingForNext && (
                                <div className="text-green-600 font-medium animate-pulse">
                                    Click "Next Step" to continue →
                                </div>
                            )}
                        </div>
                        
                        {/* Step progress bar */}
                        {isRunning && (
                            <div className="mt-2">
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${
                                            currentStep === 1 ? 'bg-green-500' :
                                            currentStep === 2 ? 'bg-yellow-500' :
                                            currentStep === 3 ? 'bg-blue-500' : 'bg-purple-500'
                                        }`} 
                                        style={{ width: `${stepProgress}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>Step: {
                                        currentStep === 1 ? "Initialize Centroids" :
                                        currentStep === 2 ? "Assign Points to Clusters" :
                                        currentStep === 3 ? "Update Centroid Positions" :
                                        currentStep === 4 ? "Convergence Check" : "Between Iterations"
                                    }</span>
                                    <span>Iteration: {iterations}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main content - Side by side layout */}
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Left side - Canvas */}
                    <div className="lg:w-1/2 mb-4 lg:mb-0">
                        <div className="relative">
                            <canvas
                                ref={chartRef}
                                onClick={handleCanvasClick}
                                onMouseMove={handleCanvasMouseMove}
                                onMouseLeave={handleCanvasMouseLeave}
                                className="canvas w-full h-[500px] cursor-crosshair border border-gray-200 rounded-lg"
                            />
                            
                            {/* Display cursor position */}
                            {cursorPosition && (
                                <div className="absolute top-2 right-2 bg-white bg-opacity-80 p-2 rounded text-xs">
                                    Position: ({cursorPosition.x.toFixed(3)}, {cursorPosition.y.toFixed(3)})
                                </div>
                            )}
                            
                            {/* Hover information tooltip */}
                            {hoverInfo && (
                                <div className="absolute bottom-2 left-2 bg-white bg-opacity-95 p-3 rounded-lg shadow-lg border border-gray-200 max-w-sm">
                                    <div dangerouslySetInnerHTML={{ __html: hoverInfo }} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right side - Live calculations and explanations */}
                    <div className="lg:w-1/2 overflow-auto" style={{maxHeight: '500px'}}>
                        {/* Live calculation info */}
                        <div className="bg-white p-3 rounded-lg border border-gray-200 mb-4">
                            <h3 className="text-lg font-semibold mb-2">Live Information</h3>
                            
                            {currentStep === 0 && !clusters.length && (
                                <div className="text-gray-500 italic">
                                    {points.length === 0 
                                        ? "Click on the graph to add points." 
                                        : points.length < k 
                                            ? `Add at least ${k} points to start clustering.` 
                                            : "Ready to start clustering. Click 'Start Clustering'."}
                                </div>
                            )}
                            
                            {currentStep > 0 && (
                                <div className="p-2 bg-yellow-50 rounded border border-yellow-200 mb-2">
                                    <p className="font-medium">
                                        {currentStep === 1 
                                            ? "Initializing random centroids..." 
                                            : currentStep === 2 
                                                ? `Assigning points to nearest centroids (${currentPointIndex}/${pointsToProcess.length})...` 
                                                : "Updating centroid positions..."}
                                    </p>
                                </div>
                            )}
                            
                            {/* Selected point/centroid info (if exists) */}
                            {hoverPoint && (
                                <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                    <p className="font-medium">
                                        {hoverPoint.type === 'centroid' 
                                            ? `Centroid ${hoverPoint.index}` 
                                            : `Point ${hoverPoint.index}`}
                                    </p>
                                    <p>Position: ({hoverPoint.x.toFixed(3)}, {hoverPoint.y.toFixed(3)})</p>
                                    
                                    {/* Show point-specific details */}
                                    {hoverPoint.type === 'point' && clusters.length > 0 && (
                                        <>
                                            {clusters.find(p => p.x === hoverPoint.x && p.y === hoverPoint.y)?.cluster !== undefined && (
                                                <div className="mt-1">
                                                    <p>
                                                        Assigned to Cluster: {clusters.find(p => p.x === hoverPoint.x && p.y === hoverPoint.y)?.cluster}
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    
                                    {/* Show centroid-specific details */}
                                    {hoverPoint.type === 'centroid' && clusterStats.length > 0 && (
                                        <div className="mt-1">
                                            <p>Points in cluster: {clusterStats[hoverPoint.index]?.count || 0}</p>
                                            <p>Average distance: {clusterStats[hoverPoint.index]?.avgDistance.toFixed(4) || 0}</p>
                                            <p>Cluster inertia: {clusterStats[hoverPoint.index]?.inertia.toFixed(4) || 0}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                            
                        {/* Display current distance calculations during assignment step */}
                        {distanceCalculations.length > 0 && currentStep === 2 && (
                            <div className="bg-white p-3 rounded-lg border border-yellow-200 mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-medium text-yellow-800">Current Point Assignment:</h4>
                                    {waitingForNext && pointsToProcess.length > 0 && (
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <span>Processing point {currentPointIndex} of {pointsToProcess.length}</span>
                                            <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-yellow-500" 
                                                    style={{ width: `${(currentPointIndex / pointsToProcess.length) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="bg-yellow-50 p-3 rounded text-sm">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                                        <div className="bg-white p-1 rounded-lg border border-yellow-200 inline-flex items-center gap-1">
                                            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                                            <span className="font-medium">Point {distanceCalculations[0].pointIndex}:</span> 
                                            <span>({distanceCalculations[0].point.x.toFixed(3)}, {distanceCalculations[0].point.y.toFixed(3)})</span>
                                        </div>
                                        
                                        <div className="bg-white p-1 rounded-lg border border-yellow-200 flex items-center gap-1">
                                            <div 
                                                className="w-4 h-4 rounded-full" 
                                                style={{backgroundColor: `hsl(${((distanceCalculations[0].assignedCluster * 360) / k) % 360}, 70%, 50%)`}}
                                            ></div>
                                            <span className="font-medium">Assigned to Cluster {distanceCalculations[0].assignedCluster}</span> 
                                            <span>({centroids[distanceCalculations[0].assignedCluster].x.toFixed(3)}, {centroids[distanceCalculations[0].assignedCluster].y.toFixed(3)})</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-2 font-medium">Distance Calculations:</div>
                                    
                                    {/* Show detailed step-by-step calculation for each centroid */}
                                    {distanceCalculations[0].distances.map((dist, i) => {
                                        const calc = dist.calculation;
                                        const isClosest = dist.centroidIdx === distanceCalculations[0].assignedCluster;
                                        
                                        return (
                                            <div 
                                                key={i} 
                                                className={`mb-3 p-2 rounded-lg border ${isClosest ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div 
                                                        className="w-3 h-3 rounded-full" 
                                                        style={{backgroundColor: `hsl(${((dist.centroidIdx * 360) / k) % 360}, 70%, 50%)`}}
                                                    ></div>
                                                    <span className="font-medium">
                                                        Distance to Centroid {dist.centroidIdx}: {dist.distance.toFixed(4)}
                                                        {isClosest && <span className="text-green-700 ml-1">(closest)</span>}
                                                    </span>
                                                </div>
                                                
                                                {showCalculationDetails && (
                                                    <div className="ml-5 text-xs">
                                                        <div className="grid grid-cols-2 gap-x-2">
                                                            <div>Point: ({calc.x1.toFixed(3)}, {calc.y1.toFixed(3)})</div>
                                                            <div>Centroid: ({calc.x2.toFixed(3)}, {calc.y2.toFixed(3)})</div>
                                                        </div>
                                                        <div className="mt-1 p-2 bg-gray-50 rounded font-mono">
                                                            <p>Step 1: Find coordinate differences</p>
                                                            <p>x₁ - x₂ = {calc.x1.toFixed(3)} - {calc.x2.toFixed(3)} = {calc.xDiff}</p>
                                                            <p>y₁ - y₂ = {calc.y1.toFixed(3)} - {calc.y2.toFixed(3)} = {calc.yDiff}</p>
                                                            
                                                            <p className="mt-1">Step 2: Square the differences</p>
                                                            <p>(x₁ - x₂)² = {calc.xDiff}² = {calc.xDiffSquared}</p>
                                                            <p>(y₁ - y₂)² = {calc.yDiff}² = {calc.yDiffSquared}</p>
                                                            
                                                            <p className="mt-1">Step 3: Sum the squares</p>
                                                            <p>{calc.xDiffSquared} + {calc.yDiffSquared} = {calc.sum}</p>
                                                            
                                                            <p className="mt-1">Step 4: Take the square root</p>
                                                            <p>√{calc.sum} = {calc.result}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div className="mt-1 flex justify-end">
                                                    <button 
                                                        onClick={() => setShowCalculationDetails(!showCalculationDetails)}
                                                        className="text-xs text-blue-600 underline"
                                                    >
                                                        {showCalculationDetails ? 'Hide steps' : 'Show steps'}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    
                                    <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200 text-sm">
                                        <p className="font-medium text-green-800">Assignment Decision:</p>
                                        <p className="mt-1">This point is assigned to Cluster {distanceCalculations[0].assignedCluster} because it has the smallest distance ({distanceCalculations[0].distances.find(d => d.centroidIdx === distanceCalculations[0].assignedCluster)?.distance.toFixed(4)}).</p>
                                    </div>
                                </div>
                                
                                {waitingForNext && pointsToProcess.length > currentPointIndex && (
                                    <div className="mt-3 text-center">
                                        <p className="text-sm text-gray-600 mb-2">Click 'Next Step' to continue with the next point</p>
                                        <button
                                            onClick={continueToNextStep}
                                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                        >
                                            Process Next Point →
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                            
                        {/* Display centroid update calculations during step 3 */}
                        {currentStep === 3 && selectedCentroid !== null && (
                            <div className="bg-white p-3 rounded-lg border border-blue-200 mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-medium text-blue-800">Updating Centroid Position:</h4>
                                    <div className="text-xs text-gray-500">
                                        Centroid {selectedCentroid + 1} of {k}
                                    </div>
                                </div>
                                
                                <div className="bg-blue-50 p-3 rounded text-sm">
                                    <div 
                                        className="p-2 mb-3 rounded-lg border inline-flex items-center gap-1"
                                        style={{
                                            borderColor: `hsl(${((selectedCentroid * 360) / k) % 360}, 70%, 50%)`,
                                            backgroundColor: `hsl(${((selectedCentroid * 360) / k) % 360}, 95%, 95%)`
                                        }}
                                    >
                                        <div 
                                            className="w-4 h-4 rounded-full" 
                                            style={{backgroundColor: `hsl(${((selectedCentroid * 360) / k) % 360}, 70%, 50%)`}}
                                        ></div>
                                        <span className="font-medium">Centroid {selectedCentroid}</span>
                                    </div>
                                    
                                    {/* Filter points in this cluster */}
                                    {clusters.length > 0 && (
                                        <>
                                            <div className="mb-2 font-medium">Points in this cluster:</div>
                                            <div className="max-h-24 overflow-y-auto mb-3 p-2 bg-white rounded border border-blue-100">
                                                {clusters.filter(p => p.cluster === selectedCentroid).length > 0 ? (
                                                    <div className="grid grid-cols-2 gap-1">
                                                        {clusters.filter(p => p.cluster === selectedCentroid).map((p, i) => (
                                                            <div key={i} className="text-xs">
                                                                Point {i}: ({p.x.toFixed(3)}, {p.y.toFixed(3)})
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-500 italic">No points in this cluster</div>
                                                )}
                                            </div>
                                            
                                            <div className="p-2 bg-white rounded border border-blue-100 mb-3">
                                                <div className="font-medium mb-1">Calculation:</div>
                                                <div className="font-mono text-xs">
                                                    {clusters.filter(p => p.cluster === selectedCentroid).length > 0 ? (
                                                        <>
                                                            <div className="mb-2">
                                                                <div>Step 1: Sum all x-coordinates and y-coordinates of points in this cluster</div>
                                                                <div className="ml-4">
                                                                    <div>Sum of x = {clusters.filter(p => p.cluster === selectedCentroid)
                                                                        .reduce((sum, p) => sum + p.x, 0).toFixed(3)}</div>
                                                                    <div>Sum of y = {clusters.filter(p => p.cluster === selectedCentroid)
                                                                        .reduce((sum, p) => sum + p.y, 0).toFixed(3)}</div>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="mb-2">
                                                                <div>Step 2: Divide by number of points ({clusters.filter(p => p.cluster === selectedCentroid).length})</div>
                                                                <div className="ml-4">
                                                                    <div>New x = {(clusters.filter(p => p.cluster === selectedCentroid)
                                                                        .reduce((sum, p) => sum + p.x, 0) / 
                                                                        clusters.filter(p => p.cluster === selectedCentroid).length).toFixed(3)}</div>
                                                                    <div>New y = {(clusters.filter(p => p.cluster === selectedCentroid)
                                                                        .reduce((sum, p) => sum + p.y, 0) / 
                                                                        clusters.filter(p => p.cluster === selectedCentroid).length).toFixed(3)}</div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div>No points in cluster, position will be randomly reassigned.</div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="mb-2 font-medium">Centroid Movement:</div>
                                            <div className="p-2 bg-white rounded border border-blue-100">
                                                <div className="flex justify-between mb-1">
                                                    <div>Old position:</div>
                                                    <div>({centroids[selectedCentroid]?.x.toFixed(3)}, {centroids[selectedCentroid]?.y.toFixed(3)})</div>
                                                </div>
                                                <div className="flex justify-between mb-1">
                                                    <div>New position:</div>
                                                    <div>
                                                        {clusters.filter(p => p.cluster === selectedCentroid).length > 0 ? (
                                                            `(${(clusters.filter(p => p.cluster === selectedCentroid)
                                                                .reduce((sum, p) => sum + p.x, 0) / 
                                                                clusters.filter(p => p.cluster === selectedCentroid).length).toFixed(3)}, 
                                                             ${(clusters.filter(p => p.cluster === selectedCentroid)
                                                                .reduce((sum, p) => sum + p.y, 0) / 
                                                                clusters.filter(p => p.cluster === selectedCentroid).length).toFixed(3)})`
                                                        ) : (
                                                            "Random new position"
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                
                                {waitingForNext && (
                                    <div className="mt-3 text-center">
                                        <button
                                            onClick={continueToNextStep}
                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Update Centroid →
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                            
                        {/* Cluster details (when available) */}
                        {clusters.length > 0 && !(distanceCalculations.length > 0 && currentStep === 2) && !(currentStep === 3 && selectedCentroid !== null) && (
                            <div className="bg-white p-3 rounded-lg border border-gray-200 mb-4">
                                <h4 className="font-medium mb-2">Cluster Statistics:</h4>
                                <div className="space-y-2">
                                    {clusterStats.map((stats, i) => (
                                        <div 
                                            key={i} 
                                            className={`p-2 rounded-lg border ${selectedCentroid === i ? 'ring-2 ring-blue-500' : ''}`}
                                            style={{
                                                borderColor: `hsl(${((i * 360) / k) % 360}, 70%, 50%)`,
                                                backgroundColor: `hsl(${((i * 360) / k) % 360}, 95%, 95%)`
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="w-4 h-4 rounded-full" 
                                                    style={{backgroundColor: `hsl(${((i * 360) / k) % 360}, 70%, 50%)`}}
                                                ></div>
                                                <h5 className="font-medium" style={{ color: `hsl(${((i * 360) / k) % 360}, 70%, 30%)` }}>
                                                    Cluster {i}
                                                </h5>
                                            </div>
                                            <div className="grid grid-cols-2 text-xs mt-1">
                                                <p><span className="font-medium">Points:</span> {stats.count}</p>
                                                <p><span className="font-medium">Inertia:</span> {stats.inertia.toFixed(4)}</p>
                                                <p><span className="font-medium">Avg Distance:</span> {stats.avgDistance.toFixed(4)}</p>
                                                <p><span className="font-medium">Centroid:</span> ({centroids[i]?.x.toFixed(2)}, {centroids[i]?.y.toFixed(2)})</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Inertia summary */}
                                <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                                    <div className="flex justify-between items-center">
                                        <p className="font-medium">Total Inertia:</p>
                                        <p className="font-mono">{totalInertia.toFixed(4)}</p>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Lower inertia indicates tighter, better-defined clusters.
                                    </p>
                                </div>
                            </div>
                        )}
                            
                        {/* Algorithm steps */}
                        <div className="bg-white p-3 rounded-lg border border-gray-200 mb-4">
                            <h4 className="font-medium mb-2">Algorithm Steps:</h4>
                            <div className="flex flex-col gap-2">
                                <div className={`p-2 rounded border ${currentStep === 1 ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}>
                                    <p className="font-medium">1. Initialize Centroids</p>
                                    <p className="text-xs">Place {k} random initial centroids in the data space</p>
                                </div>
                                <div className={`p-2 rounded border ${currentStep === 2 ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}>
                                    <p className="font-medium">2. Assign Points to Clusters</p>
                                    <p className="text-xs">Calculate distances from each point to all centroids</p>
                                </div>
                                <div className={`p-2 rounded border ${currentStep === 3 ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}>
                                    <p className="font-medium">3. Update Centroids</p>
                                    <p className="text-xs">Recalculate each centroid position as the average of its cluster points</p>
                                </div>
                                <div className="p-2 rounded border bg-gray-50 border-gray-200">
                                    <p className="font-medium">4. Check Convergence</p>
                                    <p className="text-xs">If centroids stop moving significantly or max iterations reached, stop</p>
                                </div>
                            </div>
                        </div>
                            
                        {/* Recent history/timeline (when available) */}
                        {animationHistory.length > 0 && (
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <h4 className="font-medium mb-2">Recent Activity:</h4>
                                <div className="timeline relative pl-6 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 before:bg-blue-200">
                                    {animationHistory.slice(-3).map((step, index) => (
                                        <div key={index} className={`timeline-item mb-3 relative before:content-[''] before:absolute before:left-[-6px] before:top-1.5 before:w-2 before:h-2 before:rounded-full ${
                                            step.step === 1 ? 'before:bg-green-500' : 
                                            step.step === 2 ? 'before:bg-yellow-500' : 
                                            step.step === 3 ? 'before:bg-blue-500' : 'before:bg-purple-500'
                                        }`}>
                                            <p className="text-sm font-medium">{step.description}</p>
                                            
                                            {step.step === 3 && step.movements && selectedCentroid !== null && (
                                                <div className="mt-1 ml-2 text-xs p-2 bg-blue-50 rounded">
                                                    <p>Centroid {selectedCentroid} moved:</p>
                                                    <p>From: ({step.movements[selectedCentroid].from.x.toFixed(3)}, {step.movements[selectedCentroid].from.y.toFixed(3)})</p>
                                                    <p>To: ({step.movements[selectedCentroid].to.x.toFixed(3)}, {step.movements[selectedCentroid].to.y.toFixed(3)})</p>
                                                    <p>Distance: {step.movements[selectedCentroid].distance.toFixed(4)}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Algorithm Animation and Explanation - Now collapsed for clarity */}
                {showExplanations && (
                    <div className="algorithm-explanation mt-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <details>
                            <summary className="text-lg font-semibold cursor-pointer">
                                How K-Means Clustering Works (Click to expand)
                            </summary>
                            <div className="mt-3">
                                {/* Algorithm steps */}
                                <div className="algorithm-steps mb-4">
                                    <div className="flex flex-col md:flex-row gap-3">
                                        <CalculationStep 
                                            title="Step 1: Initialize Centroids" 
                                            isActive={currentStep === 1}
                                            formula="Place K random points as initial centroids"
                                        >
                                            <p>The algorithm starts by randomly placing {k} centroids (shown as triangles) in the data space. 
                                            These initial positions greatly influence the final clustering result.</p>
                                        </CalculationStep>
                                        
                                        <CalculationStep 
                                            title="Step 2: Assign Points to Clusters" 
                                            isActive={currentStep === 2}
                                            formula="distance = √((x₂ - x₁)² + (y₂ - y₁)²)"
                                            example="For each point, calculate distance to each centroid and assign to nearest one"
                                        >
                                            <p>Each data point is assigned to its closest centroid using the Euclidean distance formula.
                                            Points are colored based on their assigned cluster.</p>
                                        </CalculationStep>
                                        
                                        <CalculationStep 
                                            title="Step 3: Update Centroids" 
                                            isActive={currentStep === 3}
                                            formula="new_centroid = (mean(x), mean(y))"
                                            example="Average the coordinates of all points in the cluster"
                                        >
                                            <p>Each centroid is recalculated as the average position (center of mass) of all points assigned to its cluster. 
                                            If a cluster has no points, the centroid is repositioned randomly.</p>
                                        </CalculationStep>
                                    </div>
                                    
                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            <span className="font-medium">Key insight:</span> Steps 2 and 3 are repeated until either:
                                            <ol className="list-decimal ml-5 mt-1">
                                                <li>Centroids stop moving significantly (convergence)</li>
                                                <li>The maximum number of iterations is reached</li>
                                            </ol>
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Detailed calculations if clusters exist */}
                                {clusters.length > 0 && (
                                    <div className="cluster-details mt-4">
                                        <h4 className="font-medium mb-2">Cluster Details:</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {clusterStats.map((stats, i) => (
                                                <div 
                                                    key={i} 
                                                    className="cluster-card p-3 rounded-lg border"
                                                    style={{
                                                        borderColor: `hsl(${((i * 360) / k) % 360}, 70%, 50%)`,
                                                        backgroundColor: `hsl(${((i * 360) / k) % 360}, 95%, 95%)`
                                                    }}
                                                >
                                                    <h5 className="font-medium" style={{ color: `hsl(${((i * 360) / k) % 360}, 70%, 30%)` }}>
                                                        Cluster {i}
                                                    </h5>
                                                    <div className="text-sm mt-1">
                                                        <p><span className="font-medium">Points:</span> {stats.count}</p>
                                                        <p><span className="font-medium">Centroid:</span> ({centroids[i]?.x.toFixed(3)}, {centroids[i]?.y.toFixed(3)})</p>
                                                        <p><span className="font-medium">Avg Distance:</span> {stats.avgDistance.toFixed(4)}</p>
                                                        <p><span className="font-medium">Inertia:</span> {stats.inertia.toFixed(4)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="inertia-explanation mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                                            <h4 className="font-medium mb-1">What is Inertia?</h4>
                                            <p className="text-sm text-gray-700">
                                                Inertia is the sum of squared distances of points to their closest centroid. It measures how internally coherent
                                                clusters are. The lower the inertia, the better the clustering.
                                            </p>
                                            <div className="mt-2 p-2 bg-white rounded">
                                                <p className="text-center font-mono">Inertia = Σ(distance²) = {totalInertia.toFixed(4)}</p>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2">
                                                This is what K-Means aims to minimize. Each iteration attempts to reduce this value.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Distance calculations sample */}
                                {distanceCalculations.length > 0 && currentStep === 2 && (
                                    <div className="distance-calculations mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <h4 className="font-medium mb-2 text-yellow-800">Sample Distance Calculation:</h4>
                                        <div className="bg-white p-2 rounded text-sm">
                                            <p className="font-medium">Point ({distanceCalculations[0].point.x.toFixed(3)}, {distanceCalculations[0].point.y.toFixed(3)}):</p>
                                            <ul className="ml-5 mt-1 list-disc">
                                                {distanceCalculations[0].distances.map((dist, i) => (
                                                    <li key={i} className={dist.centroidIdx === distanceCalculations[0].distances[0].centroidIdx ? "font-bold" : ""}>
                                                        Distance to Centroid {dist.centroidIdx}: {dist.distance.toFixed(4)} 
                                                        {dist.centroidIdx === distanceCalculations[0].distances[0].centroidIdx ? " (closest)" : ""}
                                                    </li>
                                                ))}
                                            </ul>
                                            <p className="mt-2 text-xs text-gray-600">
                                                The point is assigned to Cluster {distanceCalculations[0].distances[0].centroidIdx} since it has the smallest distance.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Animation History Timeline */}
                                {animationHistory.length > 0 && (
                                    <div className="animation-history mt-6 border-t pt-4">
                                        <h4 className="font-medium mb-3">Clustering Algorithm Progress:</h4>
                                        
                                        <div className="timeline relative pl-8 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 before:bg-blue-200">
                                            {animationHistory.map((step, index) => (
                                                <div key={index} className={`timeline-item mb-4 relative before:content-[''] before:absolute before:left-[-8px] before:top-1.5 before:w-3 before:h-3 before:rounded-full ${
                                                    step.step === 1 ? 'before:bg-green-500' : 
                                                    step.step === 2 ? 'before:bg-yellow-500' : 
                                                    step.step === 3 ? 'before:bg-blue-500' : 'before:bg-purple-500'
                                                }`}>
                                                    <p className="font-medium">{step.description}</p>
                                                    
                                                    {step.step === 2 && step.clusterStats && (
                                                        <div className="mt-1 ml-2 text-sm">
                                                            <p className="text-gray-600">Assignment results:</p>
                                                            <div className="flex flex-wrap gap-2 mt-1">
                                                                {step.clusterStats.map((stat, i) => (
                                                                    <span 
                                                                        key={i} 
                                                                        className={`px-2 py-1 rounded text-xs ${selectedCentroid === i ? 'ring-2 ring-blue-500' : ''}`}
                                                                        style={{
                                                                            backgroundColor: `hsl(${((i * 360) / k) % 360}, 85%, 90%)`,
                                                                            color: `hsl(${((i * 360) / k) % 360}, 70%, 30%)`
                                                                        }}
                                                                    >
                                                                        Cluster {i}: {stat.count} points
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {step.step === 3 && step.movements && (
                                                        <div className="mt-1 ml-2 text-sm">
                                                            <p className="text-gray-600">Centroid movements:</p>
                                                            <div className="flex flex-col gap-1 mt-1">
                                                                {step.movements.map((move, i) => (
                                                                    <div 
                                                                        key={i} 
                                                                        className={`text-xs ${selectedCentroid === i ? 'font-bold' : ''}`}
                                                                    >
                                                                        <span className="inline-block w-4 h-4 mr-1 rounded-full" 
                                                                            style={{backgroundColor: `hsl(${((i * 360) / k) % 360}, 70%, 50%)`}}></span>
                                                                        Centroid {i}: ({move.from.x.toFixed(3)}, {move.from.y.toFixed(3)}) → 
                                                                        ({move.to.x.toFixed(3)}, {move.to.y.toFixed(3)}), 
                                                                        moved {move.distance.toFixed(4)}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {step.step === 4 && (
                                                        <div className="mt-1 ml-2 p-2 bg-green-50 rounded text-sm">
                                                            <p className="text-green-700">Final inertia: {totalInertia.toFixed(4)}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </details>
                    </div>
                )}
            </div>
            
            {/* Bottom back button */}
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
        </div>
    )
}

export default KMeans
