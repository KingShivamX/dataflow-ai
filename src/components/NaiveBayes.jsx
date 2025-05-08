import { useEffect, useRef, useState } from "react"
import { Chart } from "chart.js/auto"
import { useNavigate } from "react-router-dom"
import { useTutorial } from "../contexts/TutorialContext"
import AlgorithmInfoPanel from "./common/AlgorithmInfoPanel"

const NaiveBayes = () => {
    const chartRef = useRef(null)
    const chartInstance = useRef(null)
    const navigate = useNavigate()
    const { startTutorial, showTutorial, visitedPages } = useTutorial()
    const [showInfoPanel, setShowInfoPanel] = useState(true)

    const [points, setPoints] = useState([])
    const [currentClass, setCurrentClass] = useState(0)
    const [isTraining, setIsTraining] = useState(false)
    const [showDecisionBoundary, setShowDecisionBoundary] = useState(false)
    const [model, setModel] = useState(null)
    const [metrics, setMetrics] = useState({
        accuracy: 0,
        confusionMatrix: [[0, 0], [0, 0]],
        classProbabilities: [0, 0]
    })
    const [isGeneratedPoints, setIsGeneratedPoints] = useState(false)

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
            const path = "/naive-bayes"
            if (!visitedPages[path] && !showTutorial) {
                // Small delay to ensure the component is fully rendered
                const timer = setTimeout(() => {
                    startTutorial()
                }, 700)
                return () => clearTimeout(timer)
            }
        }
    }, [startTutorial, showTutorial, visitedPages, showInfoPanel])

    // Calculate mean and standard deviation for a feature
    const calculateStats = (values) => {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
        return { mean, std: Math.sqrt(variance) }
    }

    // Train the model
    const trainModel = async () => {
        if (points.length < 2) return

        setIsTraining(true)

        // Calculate class priors
        const classCounts = points.reduce((acc, p) => {
            acc[p.class] = (acc[p.class] || 0) + 1
            return acc
        }, {})
        const priors = [classCounts[0] / points.length || 0, classCounts[1] / points.length || 0]

        // Calculate feature statistics for each class
        const stats = [0, 1].map(c => {
            const classPoints = points.filter(p => p.class === c)
            if (classPoints.length === 0) {
                return {
                    x: { mean: 0, std: 0.00001 }, // Avoid division by zero
                    y: { mean: 0, std: 0.00001 }
                }
            }
            return {
                x: calculateStats(classPoints.map(p => p.x)),
                y: calculateStats(classPoints.map(p => p.y))
            }
        })

        // Create temporary model object to use for predictions
        const tempModel = { priors, stats }
        
        // Calculate metrics
        const predictions = points.map(p => predict(tempModel, p))
        const confusionMatrix = [[0, 0], [0, 0]]
        
        points.forEach((p, i) => {
            confusionMatrix[p.class][predictions[i]]++
        })

        const accuracy = (confusionMatrix[0][0] + confusionMatrix[1][1]) / points.length

        // Now update the state with our calculated values
        setModel(tempModel)
        setMetrics({
            accuracy,
            confusionMatrix,
            classProbabilities: priors
        })

        setShowDecisionBoundary(true)
        setIsTraining(false)
    }

    // Calculate Gaussian probability
    const gaussianProbability = (x, mean, std) => {
        try {
            // Minimum std to avoid division by zero
            const safeStd = Math.max(std, 0.00001)
            
            // Avoid underflow by capping the exponent
            const exponentValue = -Math.pow(x - mean, 2) / (2 * Math.pow(safeStd, 2))
            
            // Limit exponent to avoid numerical issues
            const safePower = Math.max(exponentValue, -50)
            
            const exponent = Math.exp(safePower)
            return (1 / (safeStd * Math.sqrt(2 * Math.PI))) * exponent
        } catch (error) {
            console.error("Error calculating Gaussian probability:", error)
            return 0.00001 // Return a small non-zero value
        }
    }

    // Predict class for a point
    const predict = (model, point) => {
        if (!model || !model.priors || !model.stats) {
            console.error("Model not properly initialized for prediction")
            return 0
        }

        const { priors, stats } = model

        try {
            // Calculate likelihood for each class
            const likelihoods = [0, 1].map(c => {
                const classStats = stats[c]
                if (!classStats || !classStats.x || !classStats.y) {
                    return 0
                }

                // Avoid division by zero
                const xStd = Math.max(classStats.x.std, 0.00001)
                const yStd = Math.max(classStats.y.std, 0.00001)

                const xProb = gaussianProbability(point.x, classStats.x.mean, xStd)
                const yProb = gaussianProbability(point.y, classStats.y.mean, yStd)
                
                return priors[c] * xProb * yProb
            })

            // Return class with highest posterior probability
            return likelihoods[0] > likelihoods[1] ? 0 : 1
        } catch (error) {
            console.error("Error in prediction:", error)
            return 0
        }
    }

    // Generate decision boundary points
    const generateDecisionBoundary = () => {
        if (!model) return []

        // Lower resolution to improve performance
        const resolution = 30
        const boundaryPoints = []

        try {
            for (let x = 0; x <= 1; x += 1/resolution) {
                for (let y = 0; y <= 1; y += 1/resolution) {
                    const prediction = predict(model, { x, y })
                    boundaryPoints.push({ x, y, class: prediction })
                }
            }
            return boundaryPoints
        } catch (error) {
            console.error("Error generating decision boundary:", error)
            return []
        }
    }

    // Generate Gaussian distributed sample data for better visualization
    const generateSampleData = () => {
        setIsGeneratedPoints(true)
        
        const newPoints = []
        
        // Generate Gaussian distributed points for class 0 (two clusters)
        // First cluster
        const mean1X = 0.3
        const mean1Y = 0.7
        const std1 = 0.08
        for (let i = 0; i < 25; i++) {
            // Box-Muller transform for normal distribution
            const u1 = Math.random()
            const u2 = Math.random()
            const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
            const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2)
            
            const x = mean1X + z1 * std1
            const y = mean1Y + z2 * std1
            
            // Ensure points are within bounds
            if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
                newPoints.push({ x, y, class: 0 })
            }
        }
        
        // Second cluster for class 0
        const mean2X = 0.7
        const mean2Y = 0.3
        const std2 = 0.08
        for (let i = 0; i < 25; i++) {
            const u1 = Math.random()
            const u2 = Math.random()
            const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
            const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2)
            
            const x = mean2X + z1 * std2
            const y = mean2Y + z2 * std2
            
            if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
                newPoints.push({ x, y, class: 0 })
            }
        }
        
        // Generate Gaussian distributed points for class 1 (two clusters)
        // First cluster
        const mean3X = 0.3
        const mean3Y = 0.3
        const std3 = 0.08
        for (let i = 0; i < 25; i++) {
            const u1 = Math.random()
            const u2 = Math.random()
            const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
            const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2)
            
            const x = mean3X + z1 * std3
            const y = mean3Y + z2 * std3
            
            if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
                newPoints.push({ x, y, class: 1 })
            }
        }
        
        // Second cluster for class 1
        const mean4X = 0.7
        const mean4Y = 0.7
        const std4 = 0.08
        for (let i = 0; i < 25; i++) {
            const u1 = Math.random()
            const u2 = Math.random()
            const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
            const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2)
            
            const x = mean4X + z1 * std4
            const y = mean4Y + z2 * std4
            
            if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
                newPoints.push({ x, y, class: 1 })
            }
        }
        
        setPoints(newPoints)
        
        // Reset model
        setModel(null)
        setShowDecisionBoundary(false)
        setMetrics({
            accuracy: 0,
            confusionMatrix: [[0, 0], [0, 0]],
            classProbabilities: [0, 0]
        })
    }
    
    // Clear all points and reset model
    const clearPoints = () => {
        setPoints([])
        setModel(null)
        setShowDecisionBoundary(false)
        setMetrics({
            accuracy: 0,
            confusionMatrix: [[0, 0], [0, 0]],
            classProbabilities: [0, 0]
        })
        setIsGeneratedPoints(false)
    }

    // Handle canvas click
    const handleCanvasClick = (event) => {
        if (!isTraining && chartRef.current) {
            setIsGeneratedPoints(false)
            const canvas = chartRef.current
            const rect = canvas.getBoundingClientRect()

            const scaleX = canvas.width / rect.width
            const scaleY = canvas.height / rect.height

            const x = ((event.clientX - rect.left) * scaleX) / canvas.width
            const y = 1 - ((event.clientY - rect.top) * scaleY) / canvas.height

            const xValue = Math.max(0, Math.min(1, x))
            const yValue = Math.max(0, Math.min(1, y))

            setPoints([...points, { x: xValue, y: yValue, class: currentClass }])
        }
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
                            data: points.filter(p => p.class === 0),
                            backgroundColor: "rgba(54, 162, 235, 1)",
                            pointRadius: 5,
                            animation: isGeneratedPoints,
                            animationDuration: isGeneratedPoints ? 800 : 0,
                        },
                        {
                            label: "Class 1",
                            data: points.filter(p => p.class === 1),
                            backgroundColor: "rgba(255, 99, 132, 1)",
                            pointRadius: 5,
                            animation: isGeneratedPoints,
                            animationDuration: isGeneratedPoints ? 800 : 0,
                        },
                        ...(showDecisionBoundary && model
                            ? [{
                                label: "Decision Boundary",
                                data: generateDecisionBoundary(),
                                backgroundColor: context => {
                                    const point = context.raw
                                    return point.class === 0
                                        ? "rgba(54, 162, 235, 0.1)"
                                        : "rgba(255, 99, 132, 0.1)"
                                },
                                pointRadius: 1,
                            }]
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
                                font: {
                                    weight: 'bold'
                                }
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        },
                        y: {
                            min: 0,
                            max: 1,
                            title: {
                                display: true,
                                text: "Y",
                                font: {
                                    weight: 'bold'
                                }
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        },
                    },
                    plugins: {
                        legend: {
                            labels: {
                                usePointStyle: true,
                                boxWidth: 6,
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const point = context.raw;
                                    if (context.dataset.label === "Decision Boundary") {
                                        return `Predicted: Class ${point.class}`;
                                    }
                                    return `(${point.x.toFixed(2)}, ${point.y.toFixed(2)}) - Class ${point.class}`;
                                }
                            },
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            padding: 10,
                            titleFont: {
                                size: 14
                            },
                            bodyFont: {
                                size: 13
                            }
                        }
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeOutQuart'
                    }
                },
            })
        }
    }, [points, showDecisionBoundary, model, isGeneratedPoints])
    
    // Function to render the probability distribution visualization
    const renderGaussianDistribution = (classIndex, feature) => {
        if (!model) return null;
        
        const stats = model.stats[classIndex][feature];
        const mean = stats.mean;
        const std = stats.std;
        
        // Generate points for the distribution curve
        const points = [];
        for (let x = mean - 3 * std; x <= mean + 3 * std; x += std / 10) {
            const normalizedX = (x - (mean - 3 * std)) / (6 * std); // Normalize to 0-1 for display
            const y = Math.exp(-0.5 * Math.pow((x - mean) / std, 2)) / (std * Math.sqrt(2 * Math.PI));
            const normalizedY = y / (1 / (std * Math.sqrt(2 * Math.PI))); // Normalize to 0-1 for display
            points.push({ x: normalizedX, y: normalizedY });
        }
        
        const color = classIndex === 0 ? "rgba(54, 162, 235, 1)" : "rgba(255, 99, 132, 1)";
        
        return (
            <div className="h-20 w-full relative">
                <div className="absolute top-0 left-0 w-full h-full flex items-end">
                    {points.map((p, i) => (
                        <div 
                            key={i}
                            style={{
                                height: `${p.y * 100}%`,
                                width: `${100 / points.length}%`,
                                backgroundColor: color,
                                opacity: 0.5
                            }}
                        />
                    ))}
                </div>
                <div 
                    className="absolute h-1 bg-gray-800" 
                    style={{ 
                        width: '2px', 
                        left: `${((mean - (mean - 3 * std)) / (6 * std)) * 100}%`,
                        top: '0',
                        height: '100%'
                    }}
                />
                <div className="absolute bottom-0 left-0 w-full text-xs text-center font-mono">
                    μ = {mean.toFixed(2)}
                </div>
            </div>
        );
    };

    // Function to visualize the Naive Bayes decision process
    const renderDecisionProcess = () => {
        if (!model || points.length === 0) return null;
        
        // Pick a representative point from each class (or use predefined points)
        const pointsByClass = {};
        points.forEach(p => {
            if (!pointsByClass[p.class] || Math.random() > 0.7) {
                pointsByClass[p.class] = p;
            }
        });
        
        // If we don't have points from both classes, create sample points
        if (!pointsByClass[0]) {
            pointsByClass[0] = { x: 0.3, y: 0.7, class: 0 };
        }
        if (!pointsByClass[1]) {
            pointsByClass[1] = { x: 0.7, y: 0.3, class: 1 };
        }
        
        // Calculate probabilities for each point
        const pointProbs = Object.values(pointsByClass).map(point => {
            // Get class priors
            const priors = model.priors;
            
            // Calculate feature likelihoods
            const likelihoods = [0, 1].map(c => {
                const classStats = model.stats[c];
                
                // Calculate probabilities for each feature
                const xProb = gaussianProbability(point.x, classStats.x.mean, classStats.x.std);
                const yProb = gaussianProbability(point.y, classStats.y.mean, classStats.y.std);
                
                // Combined likelihood (multiply probabilities)
                return {
                    xProb,
                    yProb,
                    combined: xProb * yProb,
                    posterior: priors[c] * xProb * yProb
                };
            });
            
            // Normalize posteriors to get probabilities that sum to 1
            const total = likelihoods.reduce((sum, l) => sum + l.posterior, 0);
            const normalizedPosteriors = likelihoods.map(l => ({
                ...l,
                normalizedPosterior: total > 0 ? l.posterior / total : 0
            }));
            
            return {
                point,
                priors,
                likelihoods: normalizedPosteriors,
                prediction: normalizedPosteriors[0].normalizedPosterior > normalizedPosteriors[1].normalizedPosterior ? 0 : 1
            };
        });
        
        return (
            <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">
                    Naive Bayes Decision Process Visualization
                </h3>
                
                <div className="text-sm text-gray-600 mb-4">
                    This visualization shows how Naive Bayes calculates probabilities and makes decisions for sample points:
                </div>
                
                {pointProbs.map((analysis, index) => {
                    const point = analysis.point;
                    const correct = analysis.prediction === point.class;
                    
                    return (
                        <div key={index} className="mb-6 last:mb-0 p-4 border rounded-lg bg-gray-50">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-4 h-4 rounded-full ${point.class === 0 ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                                <div className="font-medium">Point ({point.x.toFixed(2)}, {point.y.toFixed(2)}) from Class {point.class}</div>
                                <div className={`ml-auto px-2 py-1 text-xs rounded-full ${correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {correct ? 'Correctly Classified' : 'Misclassified'}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Prior Probabilities */}
                                <div className="space-y-2">
                                    <div className="font-medium text-sm">Prior Probabilities P(Class)</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-2 bg-blue-50 rounded border border-blue-100 text-center">
                                            <div className="text-xs text-gray-500">P(Class 0)</div>
                                            <div className="font-mono font-medium">{analysis.priors[0].toFixed(3)}</div>
                                        </div>
                                        <div className="p-2 bg-red-50 rounded border border-red-100 text-center">
                                            <div className="text-xs text-gray-500">P(Class 1)</div>
                                            <div className="font-mono font-medium">{analysis.priors[1].toFixed(3)}</div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Feature Likelihoods */}
                                <div className="space-y-2">
                                    <div className="font-medium text-sm">Feature Likelihoods P(Feature|Class)</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">P(X={point.x.toFixed(2)}|Class)</div>
                                            <div className="flex gap-1 text-xs">
                                                <div className="flex-1 p-1 bg-blue-50 rounded border border-blue-100 text-center">
                                                    <div>Class 0</div>
                                                    <div className="font-mono">{analysis.likelihoods[0].xProb.toFixed(3)}</div>
                                                </div>
                                                <div className="flex-1 p-1 bg-red-50 rounded border border-red-100 text-center">
                                                    <div>Class 1</div>
                                                    <div className="font-mono">{analysis.likelihoods[1].xProb.toFixed(3)}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">P(Y={point.y.toFixed(2)}|Class)</div>
                                            <div className="flex gap-1 text-xs">
                                                <div className="flex-1 p-1 bg-blue-50 rounded border border-blue-100 text-center">
                                                    <div>Class 0</div>
                                                    <div className="font-mono">{analysis.likelihoods[0].yProb.toFixed(3)}</div>
                                                </div>
                                                <div className="flex-1 p-1 bg-red-50 rounded border border-red-100 text-center">
                                                    <div>Class 1</div>
                                                    <div className="font-mono">{analysis.likelihoods[1].yProb.toFixed(3)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-3 border-t">
                                <div className="font-medium text-sm mb-2">Final Posteriors P(Class|Features)</div>
                                <div className="flex items-center">
                                    <div className="grid grid-cols-2 gap-2 flex-1">
                                        <div className="p-2 bg-blue-50 rounded border border-blue-100 text-center relative">
                                            <div className="text-xs text-gray-500">P(Class 0|Point)</div>
                                            <div className="font-mono font-medium text-lg">{(analysis.likelihoods[0].normalizedPosterior * 100).toFixed(1)}%</div>
                                            <div className="absolute inset-0 bg-blue-200 opacity-20" 
                                                style={{width: `${analysis.likelihoods[0].normalizedPosterior * 100}%`}}></div>
                                        </div>
                                        <div className="p-2 bg-red-50 rounded border border-red-100 text-center relative">
                                            <div className="text-xs text-gray-500">P(Class 1|Point)</div>
                                            <div className="font-mono font-medium text-lg">{(analysis.likelihoods[1].normalizedPosterior * 100).toFixed(1)}%</div>
                                            <div className="absolute inset-0 bg-red-200 opacity-20" 
                                                style={{width: `${analysis.likelihoods[1].normalizedPosterior * 100}%`}}></div>
                                        </div>
                                    </div>
                                    <div className="ml-4 p-3 rounded-lg border border-gray-200 text-center bg-white">
                                        <div className="text-xs text-gray-500">Decision</div>
                                        <div className={`font-medium ${analysis.prediction === 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                            Class {analysis.prediction}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-3 text-xs text-gray-500">
                                    <div className="font-medium mb-1">How it works:</div>
                                    <ol className="list-decimal pl-5 space-y-1">
                                        <li>Start with prior probabilities P(Class) based on class frequency in training data</li>
                                        <li>Calculate likelihood of each feature given class P(Feature|Class) using Gaussian distribution</li>
                                        <li>Multiply priors and likelihoods to get unnormalized posterior probabilities</li>
                                        <li>Normalize to get final posterior probabilities P(Class|Features)</li>
                                        <li>Classify based on highest posterior probability</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {showInfoPanel ? (
                <AlgorithmInfoPanel 
                    algorithm="naive-bayes" 
                    onStartTutorial={handleStartFromInfoPanel} 
                />
            ) : (
                <>
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="lg:w-3/4">
                            <div
                                className="canvas h-96 rounded-xl border border-gray-200 cursor-crosshair bg-white shadow-sm"
                                onClick={handleCanvasClick}
                                data-tutorial="canvas"
                            >
                                <canvas ref={chartRef} />
                            </div>
                            
                            <div className="controls flex flex-wrap justify-between gap-3 mt-4">
                                <button
                                    className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-blue-600 transition-colors shadow-sm"
                                    onClick={trainModel}
                                    disabled={points.length < 2 || isTraining}
                                    data-tutorial="train-bayes"
                                >
                                    {isTraining ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Training...
                                        </span>
                                    ) : "Train Model"}
                                </button>
                                
                                <button
                                    className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors shadow-sm"
                                    onClick={generateSampleData}
                                    data-tutorial="sample-data"
                                >
                                    Generate Sample Data
                                </button>
                                
                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors shadow-sm"
                                    onClick={clearPoints}
                                >
                                    Clear Points
                                </button>
                                
                                <div className="flex gap-2">
                                    <button
                                        className={`px-4 py-2 rounded transition-colors shadow-sm ${
                                            currentClass === 0
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }`}
                                        onClick={() => setCurrentClass(0)}
                                        data-tutorial="class-0"
                                    >
                                        Class 0
                                    </button>
                                    <button
                                        className={`px-4 py-2 rounded transition-colors shadow-sm ${
                                            currentClass === 1
                                                ? "bg-red-500 text-white"
                                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }`}
                                        onClick={() => setCurrentClass(1)}
                                        data-tutorial="class-1"
                                    >
                                        Class 1
                                    </button>
                                </div>

                                <button
                                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors shadow-sm" 
                                    onClick={handleStartFromInfoPanel}
                                    data-tutorial="start-tutorial"
                                >
                                    Start Interactive Tutorial
                                </button>

                                <button
                                    className={`px-4 py-2 rounded transition-colors shadow-sm ${
                                        showDecisionBoundary
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                    onClick={() => setShowDecisionBoundary(!showDecisionBoundary)}
                                    disabled={!model}
                                    data-tutorial="show-boundary"
                                >
                                    {showDecisionBoundary ? "Hide Boundary" : "Show Boundary"}
                                </button>
                            </div>
                            
                            {/* Instructions Panel */}
                            <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
                                <h3 className="text-lg font-semibold mb-3 text-gray-800">How to Use This Tool</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <p className="flex items-start">
                                            <span className="w-5 h-5 mt-0.5 inline-flex items-center justify-center bg-blue-500 text-white rounded-full text-xs mr-2 flex-shrink-0">1</span> 
                                            <span>Select a class using the class buttons</span>
                                        </p>
                                        <p className="flex items-start">
                                            <span className="w-5 h-5 mt-0.5 inline-flex items-center justify-center bg-blue-500 text-white rounded-full text-xs mr-2 flex-shrink-0">2</span> 
                                            <span>Click on the canvas to add points of that class</span>
                                        </p>
                                        <p className="flex items-start">
                                            <span className="w-5 h-5 mt-0.5 inline-flex items-center justify-center bg-blue-500 text-white rounded-full text-xs mr-2 flex-shrink-0">3</span> 
                                            <span>Or use "Generate Sample Data" for quick testing</span>
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="flex items-start">
                                            <span className="w-5 h-5 mt-0.5 inline-flex items-center justify-center bg-blue-500 text-white rounded-full text-xs mr-2 flex-shrink-0">4</span> 
                                            <span>Click "Train Model" to build the Naive Bayes classifier</span>
                                        </p>
                                        <p className="flex items-start">
                                            <span className="w-5 h-5 mt-0.5 inline-flex items-center justify-center bg-blue-500 text-white rounded-full text-xs mr-2 flex-shrink-0">5</span> 
                                            <span>Use "Show Boundary" to visualize the decision regions</span>
                                        </p>
                                        <p className="flex items-start">
                                            <span className="w-5 h-5 mt-0.5 inline-flex items-center justify-center bg-blue-500 text-white rounded-full text-xs mr-2 flex-shrink-0">6</span> 
                                            <span>Observe metrics and class statistics to evaluate model</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Probability Distribution Visualization - only show when model is trained */}
                            {model && (
                                <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
                                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Feature Probability Distributions</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-medium mb-2 text-sm text-center">X Feature Distribution</h4>
                                            <div className="border rounded-lg p-3 bg-gray-50">
                                                <div className="mb-2">
                                                    <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
                                                    <span className="text-sm">Class 0</span>
                                                </div>
                                                {renderGaussianDistribution(0, 'x')}
                                                <div className="mt-4 mb-2">
                                                    <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                                                    <span className="text-sm">Class 1</span>
                                                </div>
                                                {renderGaussianDistribution(1, 'x')}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium mb-2 text-sm text-center">Y Feature Distribution</h4>
                                            <div className="border rounded-lg p-3 bg-gray-50">
                                                <div className="mb-2">
                                                    <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
                                                    <span className="text-sm">Class 0</span>
                                                </div>
                                                {renderGaussianDistribution(0, 'y')}
                                                <div className="mt-4 mb-2">
                                                    <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                                                    <span className="text-sm">Class 1</span>
                                                </div>
                                                {renderGaussianDistribution(1, 'y')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 text-xs text-gray-500 text-center">
                                        These charts show the Gaussian probability distributions used by the model. 
                                        The vertical line indicates the mean value.
                                    </div>
                                </div>
                            )}

                            {/* Decision Process Visualization - only show when model is trained */}
                            {model && renderDecisionProcess()}
                        </div>

                        <div className="lg:w-1/4 space-y-4">
                            <div className="bg-white p-4 rounded-lg shadow-sm sticky top-4" data-tutorial="metrics">
                                <h3 className="text-lg font-semibold mb-3 text-blue-600 border-b pb-2">Performance Metrics</h3>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 font-medium">Accuracy:</span>
                                            <span className="text-lg font-mono font-medium">
                                                {(metrics.accuracy * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                            <div 
                                                className="bg-blue-600 h-2.5 rounded-full" 
                                                style={{width: `${(metrics.accuracy * 100)}%`}}>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <div className="bg-blue-50 rounded p-2 border border-blue-100">
                                            <div className="text-sm text-gray-600">Class 0 Prior</div>
                                            <div className="text-xl font-mono font-medium text-center">
                                                {(metrics.classProbabilities[0] * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                        <div className="bg-red-50 rounded p-2 border border-red-100">
                                            <div className="text-sm text-gray-600">Class 1 Prior</div>
                                            <div className="text-xl font-mono font-medium text-center">
                                                {(metrics.classProbabilities[1] * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h3 className="text-lg font-semibold mb-3 text-blue-600 border-b pb-2">Confusion Matrix</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="text-center p-2 bg-blue-50 rounded border border-blue-100">
                                        <div className="font-medium text-sm">True Negatives</div>
                                        <div className="text-2xl font-mono">{metrics.confusionMatrix[0][0]}</div>
                                        <div className="text-xs text-gray-500">Class 0 correctly predicted</div>
                                    </div>
                                    <div className="text-center p-2 bg-red-50 rounded border border-red-100">
                                        <div className="font-medium text-sm">False Positives</div>
                                        <div className="text-2xl font-mono">{metrics.confusionMatrix[0][1]}</div>
                                        <div className="text-xs text-gray-500">Class 0 incorrectly predicted as 1</div>
                                    </div>
                                    <div className="text-center p-2 bg-blue-50 rounded border border-blue-100">
                                        <div className="font-medium text-sm">False Negatives</div>
                                        <div className="text-2xl font-mono">{metrics.confusionMatrix[1][0]}</div>
                                        <div className="text-xs text-gray-500">Class 1 incorrectly predicted as 0</div>
                                    </div>
                                    <div className="text-center p-2 bg-red-50 rounded border border-red-100">
                                        <div className="font-medium text-sm">True Positives</div>
                                        <div className="text-2xl font-mono">{metrics.confusionMatrix[1][1]}</div>
                                        <div className="text-xs text-gray-500">Class 1 correctly predicted</div>
                                    </div>
                                </div>
                            </div>

                            {model && (
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <h3 className="text-lg font-semibold mb-3 text-blue-600 border-b pb-2">Class Statistics</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[0, 1].map(c => (
                                            <div key={c} className={`p-3 rounded-lg ${c === 0 ? 'bg-blue-50 border border-blue-100' : 'bg-red-50 border border-red-100'}`}>
                                                <h4 className="font-medium text-center mb-2 pb-1 border-b border-gray-200">Class {c}</h4>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">X Mean:</span>
                                                        <span className="font-mono">{model.stats[c].x.mean.toFixed(3)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">X Std:</span>
                                                        <span className="font-mono">{model.stats[c].x.std.toFixed(3)}</span>
                                                    </div>
                                                    <div className="flex justify-between mt-1 pt-1 border-t border-gray-200">
                                                        <span className="text-gray-600">Y Mean:</span>
                                                        <span className="font-mono">{model.stats[c].y.mean.toFixed(3)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Y Std:</span>
                                                        <span className="font-mono">{model.stats[c].y.std.toFixed(3)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-2 text-xs text-center text-gray-500">
                                        These statistics define the Gaussian distributions used for classification.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Terminology section */}
                    <div className="mt-6 bg-white p-5 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold mb-4 text-blue-600 border-b pb-2">Naive Bayes: Key Concepts & Terminology</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="p-3 border rounded-lg bg-gray-50">
                                <p className="font-medium text-gray-800 mb-1">Bayes' Theorem</p>
                                <p className="text-gray-600 text-sm">The fundamental formula behind Naive Bayes:</p>
                                <p className="italic text-gray-500 text-sm">P(class|features) = P(features|class) × P(class) / P(features)</p>
                            </div>
                            
                            <div className="p-3 border rounded-lg bg-gray-50">
                                <p className="font-medium text-gray-800 mb-1">Class Prior</p>
                                <p className="text-gray-600 text-sm">The probability of each class in the training data:</p>
                                <p className="italic text-gray-500 text-sm">P(class) = (count of class samples) / (total samples)</p>
                            </div>
                            
                            <div className="p-3 border rounded-lg bg-gray-50">
                                <p className="font-medium text-gray-800 mb-1">Gaussian Probability Density</p>
                                <p className="text-gray-600 text-sm">For continuous features, probability is calculated using normal distribution:</p>
                                <p className="italic text-gray-500 text-sm">P(x|class) = (1/√(2πσ²)) × e^(-(x-μ)²/(2σ²))</p>
                            </div>
                            
                            <div className="p-3 border rounded-lg bg-gray-50">
                                <p className="font-medium text-gray-800 mb-1">Feature Statistics</p>
                                <p className="text-gray-600 text-sm">For each feature (X and Y) in each class:</p>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    <li><span className="font-medium">Mean (μ):</span> Average value of the feature</li>
                                    <li><span className="font-medium">Std (σ):</span> Standard deviation, measuring spread of values</li>
                                </ul>
                            </div>
                            
                            <div className="p-3 border rounded-lg bg-gray-50">
                                <p className="font-medium text-gray-800 mb-1">Accuracy</p>
                                <p className="text-gray-600 text-sm">The proportion of correctly classified points:</p>
                                <p className="italic text-gray-500 text-sm">Accuracy = (TP + TN) / (TP + TN + FP + FN)</p>
                            </div>
                            
                            <div className="p-3 border rounded-lg bg-gray-50">
                                <p className="font-medium text-gray-800 mb-1">Confusion Matrix Terms</p>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    <li><span className="font-medium">True Negative (TN):</span> Class 0 points correctly predicted as Class 0</li>
                                    <li><span className="font-medium">False Positive (FP):</span> Class 0 points incorrectly predicted as Class 1</li>
                                    <li><span className="font-medium">False Negative (FN):</span> Class 1 points incorrectly predicted as Class 0</li>
                                    <li><span className="font-medium">True Positive (TP):</span> Class 1 points correctly predicted as Class 1</li>
                                </ul>
                            </div>
                            
                            <div className="p-3 border rounded-lg bg-gray-50">
                                <p className="font-medium text-gray-800 mb-1">The "Naive" Assumption</p>
                                <p className="text-gray-600 text-sm">Features are assumed to be independent of each other given the class. This simplifies calculations but may not reflect reality.</p>
                            </div>
                            
                            <div className="p-3 border rounded-lg bg-gray-50">
                                <p className="font-medium text-gray-800 mb-1">Decision Boundary</p>
                                <p className="text-gray-600 text-sm">The boundary where P(class=0|features) = P(class=1|features), meaning both classes are equally likely.</p>
                            </div>
                            
                            <div className="p-3 border rounded-lg bg-gray-50">
                                <p className="font-medium text-gray-800 mb-1">Likelihood Calculation</p>
                                <p className="text-gray-600 text-sm">For each feature, we calculate how likely a given value belongs to each class using the Gaussian (normal) distribution.</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default NaiveBayes 