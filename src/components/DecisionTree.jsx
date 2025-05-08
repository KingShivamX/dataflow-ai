import { useEffect, useRef, useState } from "react"
import { Chart } from "chart.js/auto"
import { useNavigate } from "react-router-dom"
import { useTutorial } from "../contexts/TutorialContext"
import AlgorithmInfoPanel from "./common/AlgorithmInfoPanel"

const DecisionTree = () => {
    const chartRef = useRef(null)
    const chartInstance = useRef(null)
    const treeContainerRef = useRef(null)
    const navigate = useNavigate()
    const { startTutorial, showTutorial, visitedPages } = useTutorial()
    const [showInfoPanel, setShowInfoPanel] = useState(true)

    const [points, setPoints] = useState([])
    const [currentClass, setCurrentClass] = useState(0)
    const [isTraining, setIsTraining] = useState(false)
    const [showDecisionBoundary, setShowDecisionBoundary] = useState(false)
    const [showTreeVisualization, setShowTreeVisualization] = useState(true)
    const [tree, setTree] = useState(null)
    const [metrics, setMetrics] = useState({
        accuracy: 0,
        depth: 0,
        leaves: 0,
        confusionMatrix: [[0, 0], [0, 0]]
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
            const path = "/decision-tree"
            if (!visitedPages[path] && !showTutorial) {
                // Small delay to ensure the component is fully rendered
                const timer = setTimeout(() => {
                    startTutorial()
                }, 700)
                return () => clearTimeout(timer)
            }
        }
    }, [startTutorial, showTutorial, visitedPages, showInfoPanel])

    // Node class for the decision tree
    class Node {
        constructor(feature = null, threshold = null, left = null, right = null, value = null) {
            this.feature = feature
            this.threshold = threshold
            this.left = left
            this.right = right
            this.value = value
        }
    }

    // Calculate Gini impurity
    const calculateGini = (y) => {
        const counts = y.reduce((acc, val) => {
            acc[val] = (acc[val] || 0) + 1
            return acc
        }, {})
        
        const probabilities = Object.values(counts).map(count => count / y.length)
        return 1 - probabilities.reduce((sum, p) => sum + p * p, 0)
    }

    // Find best split with improved Gini calculation
    const findBestSplit = (X, y) => {
        const nFeatures = 2 // x and y coordinates
        let bestGain = -1
        let bestFeature = null
        let bestThreshold = null

        const parentGini = calculateGini(y)
        
        // Try more potential thresholds by adding midpoints
        for (let feature = 0; feature < nFeatures; feature++) {
            // Get unique values and sort them
            const values = [...new Set(X.map(x => x[feature]))].sort((a, b) => a - b)
            
            // Generate thresholds including midpoints between consecutive values
            const thresholds = [];
            for (let i = 0; i < values.length; i++) {
                thresholds.push(values[i]);
                if (i < values.length - 1) {
                    // Add a midpoint between consecutive values
                    thresholds.push((values[i] + values[i + 1]) / 2);
                }
            }
            
            for (const threshold of thresholds) {
                const leftIndices = X.map((x, i) => i).filter(i => X[i][feature] < threshold)
                const rightIndices = X.map((x, i) => i).filter(i => X[i][feature] >= threshold)

                if (leftIndices.length === 0 || rightIndices.length === 0) continue

                const leftGini = calculateGini(leftIndices.map(i => y[i]))
                const rightGini = calculateGini(rightIndices.map(i => y[i]))

                const leftWeight = leftIndices.length / X.length
                const rightWeight = rightIndices.length / X.length

                const gain = parentGini - (leftWeight * leftGini + rightWeight * rightGini)

                if (gain > bestGain) {
                    bestGain = gain
                    bestFeature = feature
                    bestThreshold = threshold
                }
            }
        }

        return { bestFeature, bestThreshold, bestGain }
    }

    // Build decision tree
    const buildTree = (X, y, depth = 0, maxDepth = 7) => { // Increased max depth from 5 to 7
        const nSamples = X.length
        const nClasses = new Set(y).size

        // Base cases
        if (nSamples === 0) return new Node(null, null, null, null, 0);
        
        // If all samples are same class, return leaf node
        if (nClasses === 1) {
            return new Node(null, null, null, null, y[0])
        }
        
        // If max depth reached, return majority class
        if (depth >= maxDepth) {
            const counts = y.reduce((acc, val) => {
                acc[val] = (acc[val] || 0) + 1
                return acc
            }, {})
            const majorityClass = Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0]
            return new Node(null, null, null, null, parseInt(majorityClass))
        }

        // Find best split with better handling of equal values
        const { bestFeature, bestThreshold, bestGain } = findBestSplit(X, y)

        // If no good split found, return leaf with majority class
        if (bestGain <= 0.001) { // Using a small threshold instead of exactly 0
            const counts = y.reduce((acc, val) => {
                acc[val] = (acc[val] || 0) + 1
                return acc
            }, {})
            const majorityClass = Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0]
            return new Node(null, null, null, null, parseInt(majorityClass))
        }

        // Split data
        const leftIndices = X.map((x, i) => i).filter(i => X[i][bestFeature] < bestThreshold)
        const rightIndices = X.map((x, i) => i).filter(i => X[i][bestFeature] >= bestThreshold)

        // Add a minimum node size requirement
        if (leftIndices.length < 2 || rightIndices.length < 2) {
            const counts = y.reduce((acc, val) => {
                acc[val] = (acc[val] || 0) + 1
                return acc
            }, {})
            const majorityClass = Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0]
            return new Node(null, null, null, null, parseInt(majorityClass))
        }

        const leftX = leftIndices.map(i => X[i])
        const leftY = leftIndices.map(i => y[i])
        const rightX = rightIndices.map(i => X[i])
        const rightY = rightIndices.map(i => y[i])

        // Recursively build subtrees
        const leftChild = buildTree(leftX, leftY, depth + 1, maxDepth)
        const rightChild = buildTree(rightX, rightY, depth + 1, maxDepth)

        return new Node(bestFeature, bestThreshold, leftChild, rightChild)
    }

    // Train the model with more detailed progress tracking
    const trainModel = async () => {
        if (points.length < 2) return

        setIsTraining(true)

        // Prepare data
        const X = points.map(p => [p.x, p.y])
        const y = points.map(p => p.class)

        // Add a small delay to ensure UI updates (better user experience)
        await new Promise(resolve => setTimeout(resolve, 50));

        // Build tree
        const newTree = buildTree(X, y)
        setTree(newTree)

        // Calculate metrics
        const predictions = points.map(p => predict(newTree, [p.x, p.y]))
        const confusionMatrix = [[0, 0], [0, 0]]
        
        points.forEach((p, i) => {
            confusionMatrix[p.class][predictions[i]]++
        })

        const accuracy = (confusionMatrix[0][0] + confusionMatrix[1][1]) / points.length
        const depth = getTreeDepth(newTree)
        const leaves = countLeaves(newTree)

        setMetrics({
            accuracy,
            depth,
            leaves,
            confusionMatrix
        })

        setShowDecisionBoundary(true)
        setShowTreeVisualization(true)
        setIsTraining(false)
    }

    // Predict using the tree
    const predict = (node, x) => {
        if (node.value !== null) {
            return node.value
        }

        if (x[node.feature] < node.threshold) {
            return predict(node.left, x)
        } else {
            return predict(node.right, x)
        }
    }

    // Get tree depth
    const getTreeDepth = (node) => {
        if (node === null || node.value !== null) {
            return 0
        }
        return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right))
    }

    // Count leaves
    const countLeaves = (node) => {
        if (node === null) return 0
        if (node.value !== null) return 1
        return countLeaves(node.left) + countLeaves(node.right)
    }

    // Generate decision boundary points with higher resolution
    const generateDecisionBoundary = () => {
        if (!tree) return []

        const resolution = 80 // Increased from 50 to 80 for more detailed boundaries
        const points = []

        for (let x = 0; x <= 1; x += 1/resolution) {
            for (let y = 0; y <= 1; y += 1/resolution) {
                const prediction = predict(tree, [x, y])
                points.push({ x, y, class: prediction })
            }
        }

        return points
    }

    // Generate sample data for better decision tree visualization
    const generateSampleData = () => {
        setIsGeneratedPoints(true)
        
        // Create a more complex pattern that will benefit from a decision tree
        const newPoints = []
        
        // Create a checkboard-like pattern
        const regions = [
            { x: [0.05, 0.45], y: [0.55, 0.95], class: 0 },
            { x: [0.55, 0.95], y: [0.55, 0.95], class: 1 },
            { x: [0.05, 0.45], y: [0.05, 0.45], class: 1 },
            { x: [0.55, 0.95], y: [0.05, 0.45], class: 0 },
            // Add a smaller central region
            { x: [0.4, 0.6], y: [0.4, 0.6], class: 1 }
        ];
        
        // Add points from each region with some noise
        regions.forEach(region => {
            const pointsPerRegion = region.class === 0 ? 25 : 25; // balanced classes
            
            for (let i = 0; i < pointsPerRegion; i++) {
                // Add some randomness but keep points mostly in their regions
                const noise = 0.05; // 5% noise
                const x = Math.random() * (region.x[1] - region.x[0]) + region.x[0] + (Math.random() * noise * 2 - noise);
                const y = Math.random() * (region.y[1] - region.y[0]) + region.y[0] + (Math.random() * noise * 2 - noise);
                
                // Keep within valid range
                const xClamped = Math.max(0, Math.min(1, x));
                const yClamped = Math.max(0, Math.min(1, y));
                
                newPoints.push({ x: xClamped, y: yClamped, class: region.class });
            }
        });
        
        // Add some outliers to make it more interesting
        for (let i = 0; i < 10; i++) {
            const x = Math.random();
            const y = Math.random();
            const classVal = Math.random() > 0.5 ? 0 : 1;
            newPoints.push({ x, y, class: classVal });
        }
        
        setPoints(newPoints);
        
        // Reset model
        setTree(null);
        setShowDecisionBoundary(false);
        setMetrics({
            accuracy: 0,
            depth: 0,
            leaves: 0,
            confusionMatrix: [[0, 0], [0, 0]]
        });
    }
    
    // Clear all points and reset model
    const clearPoints = () => {
        setPoints([])
        setTree(null)
        setShowDecisionBoundary(false)
        setMetrics({
            accuracy: 0,
            depth: 0,
            leaves: 0,
            confusionMatrix: [[0, 0], [0, 0]]
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

    // Create the complete tree visualization SVG with improved layout
    const renderTreeVisualization = () => {
        if (!tree) return <div className="text-center py-6 text-gray-500">Train the model to visualize the decision tree</div>;
        
        // Calculate dimensions
        const svgWidth = 900;
        const levelHeight = 100;
        const depth = getTreeDepth(tree);
        const svgHeight = (depth + 1) * levelHeight + 100;
        
        // Simple tree layout calculations
        const calcXPosition = (level, position, totalWidth) => {
            // Center root node
            if (level === 0) return totalWidth / 2;
            
            const levelWidth = totalWidth * 0.8;
            const nodesInLevel = Math.pow(2, level);
            const nodeSpace = levelWidth / nodesInLevel;
            const startX = (totalWidth - levelWidth) / 2 + nodeSpace / 2;
            
            return startX + position * nodeSpace;
        };
        
        // Walk tree to collect all nodes with positions
        const nodes = [];
        const connections = [];
        
        function collectNodes(node, level = 0, position = 0, parentX = null, parentY = null) {
            if (!node) return;
            
            const x = calcXPosition(level, position, svgWidth);
            const y = 80 + level * levelHeight;
            
            // Add this node
            nodes.push({
                node,
                x,
                y,
                level,
                position
            });
            
            // Add connection to parent
            if (parentX !== null && parentY !== null) {
                connections.push({
                    x1: parentX,
                    y1: parentY,
                    x2: x,
                    y2: y,
                    feature: node.feature,
                    threshold: node.threshold,
                    isLeft: position % 2 === 0
                });
            }
            
            // Process children
            if (node.left) {
                collectNodes(node.left, level + 1, position * 2, x, y);
            }
            
            if (node.right) {
                collectNodes(node.right, level + 1, position * 2 + 1, x, y);
            }
        }
        
        collectNodes(tree);
        
        const nodeRadius = 30;
        const featureNames = ["X", "Y"];
                
        return (
            <div className="tree-visualization-container overflow-auto bg-gradient-to-b from-gray-50 to-white p-4 rounded-lg border border-gray-200" style={{maxHeight: "600px"}}>
                <h4 className="text-center text-gray-700 font-medium mb-3">Decision Tree Visualization</h4>
                
                <svg width={svgWidth} height={svgHeight} className="shadow-sm mx-auto">
                    {/* Define reusable filters */}
                    <defs>
                        <filter id="labelShadow" x="-10%" y="-10%" width="120%" height="120%">
                            <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.1" />
                        </filter>
                        <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.2" />
                        </filter>
                        <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="8"
                            refX="8"
                            refY="4"
                            orient="auto"
                            markerUnits="userSpaceOnUse"
                        >
                            <polygon points="0 0, 10 4, 0 8" fill="#2980b9" />
                        </marker>
                    </defs>
                    
                    {/* Background */}
                    <rect width={svgWidth} height={svgHeight} fill="#f8fafc" />
                    
                    {/* Level indicators */}
                    {Array.from({length: depth + 1}).map((_, i) => (
                        <g key={`level-${i}`}>
                            <line 
                                x1={50} 
                                y1={80 + i * levelHeight} 
                                x2={svgWidth - 50} 
                                y2={80 + i * levelHeight} 
                                stroke="#e0e0e0" 
                                strokeWidth="1"
                            />
                            <rect
                                x="5"
                                y={80 + i * levelHeight - 15}
                                width="40"
                                height="30"
                                rx="4"
                                fill="white"
                                stroke="#ddd"
                                strokeWidth="1"
                            />
                            <text 
                                x="25"
                                y={80 + i * levelHeight} 
                                fontSize="12" 
                                fill="#555"
                                textAnchor="middle"
                                dominantBaseline="middle"
                            >
                                Level {i}
                            </text>
                        </g>
                    ))}
                    
                    {/* Legend - completely redesigned */}
                    <g transform={`translate(${1100 - 210}, 15)`}>
                        <rect 
                            width="195" 
                            height="75" 
                            fill="white" 
                            rx="6" 
                            stroke="#e5e7eb" 
                            strokeWidth="1" 
                            filter="url(#labelShadow)" 
                        />
                        
                        <g transform="translate(15, 20)">
                            <circle 
                                cx="12" 
                                cy="0" 
                                r="12" 
                                fill="rgba(75, 192, 192, 0.95)" 
                                stroke="#2c3e50" 
                                strokeWidth="1" 
                            />
                            <text x="32" y="0" fill="#334155" fontSize="13" fontWeight="500" dominantBaseline="middle">Decision Node</text>
                        </g>
                        
                        <g transform="translate(15, 50)">
                            <circle 
                                cx="12" 
                                cy="0" 
                                r="12" 
                                fill="rgba(54, 162, 235, 0.95)" 
                                stroke="#2c3e50" 
                                strokeWidth="1" 
                            />
                            <text x="32" y="0" fill="#334155" fontSize="13" fontWeight="500" dominantBaseline="middle">Class 0</text>
                        </g>
                        
                        <g transform="translate(110, 50)">
                            <circle 
                                cx="12" 
                                cy="0" 
                                r="12" 
                                fill="rgba(255, 99, 132, 0.95)" 
                                stroke="#2c3e50" 
                                strokeWidth="1" 
                            />
                            <text x="32" y="0" fill="#334155" fontSize="13" fontWeight="500" dominantBaseline="middle">Class 1</text>
                        </g>
                    </g>
                    
                    {/* Connection lines */}
                    {connections.map((conn, i) => (
                        <g key={`conn-${i}`}>
                            {/* Background glow for visibility */}
                            <line 
                                x1={conn.x1} 
                                y1={conn.y1 + nodeRadius} 
                                x2={conn.x2} 
                                y2={conn.y2 - nodeRadius}
                                stroke="#d4e6f7" 
                                strokeWidth="8" 
                                strokeLinecap="round"
                            />
                            <line 
                                x1={conn.x1} 
                                y1={conn.y1 + nodeRadius} 
                                x2={conn.x2} 
                                y2={conn.y2 - nodeRadius}
                                stroke="#2980b9" 
                                strokeWidth="2.5" 
                                strokeLinecap="round"
                                markerEnd="url(#arrowhead)"
                            />
                            
                            {/* Label for the connection */}
                            <g transform={`translate(${(conn.x1 + conn.x2) / 2}, ${(conn.y1 + conn.y2) / 2})`}>
                                <rect 
                                    x="-40" 
                                    y="-12" 
                                    width="80" 
                                    height="24" 
                                    rx="5" 
                                    fill="rgba(255,255,255,0.95)" 
                                    stroke="#ddd" 
                                    strokeWidth="1" 
                                    filter="url(#labelShadow)" 
                                />
                                <text 
                                    x="0" 
                                    y="3" 
                                    textAnchor="middle" 
                                    fill="#444" 
                                    fontSize="10" 
                                    fontWeight="500"
                                    dominantBaseline="middle"
                                >
                                    {!conn.isLeft ? `${featureNames[conn.feature]} ≥ ${conn.threshold.toFixed(2)}` : 
                                                   `${featureNames[conn.feature]} < ${conn.threshold.toFixed(2)}`}
                                </text>
                            </g>
                        </g>
                    ))}
                    
                    {/* Nodes */}
                    {nodes.map((item, i) => {
                        const nodeColor = item.node.value !== null 
                            ? (item.node.value === 0 ? "rgba(54, 162, 235, 0.95)" : "rgba(255, 99, 132, 0.95)") 
                            : "rgba(75, 192, 192, 0.95)";
                            
                        return (
                            <g key={`node-${i}`}>
                                <circle 
                                    cx={item.x} 
                                    cy={item.y} 
                                    r={nodeRadius} 
                                    fill={nodeColor} 
                                    stroke="#333" 
                                    strokeWidth="1.5" 
                                    filter="url(#nodeShadow)"
                                />
                                
                                {item.node.value !== null ? (
                                    <text 
                                        x={item.x} 
                                        y={item.y} 
                                        textAnchor="middle" 
                                        fill="white" 
                                        fontWeight="bold" 
                                        fontSize="14" 
                                        dominantBaseline="middle"
                                    >
                                        Class {item.node.value}
                                    </text>
                                ) : (
                                    <>
                                        <text 
                                            x={item.x} 
                                            y={item.y - 5} 
                                            textAnchor="middle" 
                                            fill="white" 
                                            fontWeight="bold" 
                                            fontSize="13" 
                                            dominantBaseline="middle"
                                        >
                                            {featureNames[item.node.feature]}
                                        </text>
                                        <text 
                                            x={item.x} 
                                            y={item.y + 10} 
                                            textAnchor="middle" 
                                            fill="white" 
                                            fontSize="11"
                                        >
                                            ≥ {item.node.threshold.toFixed(2)}
                                        </text>
                                    </>
                                )}
                            </g>
                        );
                    })}
                </svg>
                
                <div className="mt-3 bg-white p-3 rounded border border-gray-200 text-sm">
                    <p className="font-medium text-gray-700 mb-1">Tree Statistics</p>
                    <div className="grid grid-cols-3">
                        <div className="text-center">
                            <span className="text-gray-600 mr-1">Depth:</span>
                            <span className="font-mono font-semibold">{metrics.depth}</span>
                        </div>
                        <div className="text-center">
                            <span className="text-gray-600 mr-1">Leaves:</span>
                            <span className="font-mono font-semibold">{metrics.leaves}</span>
                        </div>
                        <div className="text-center">
                            <span className="text-gray-600 mr-1">Accuracy:</span>
                            <span className="font-mono font-semibold">{(metrics.accuracy * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Direct tree rendering approach - fixed node positioning algorithm
    const renderDirectTree = (rootNode, totalWidth, startY, levelHeight, levelIndicatorWidth) => {
        if (!rootNode) return null;
        
        // Fixed Dimensions 
        const baseNodeRadius = 30;
        const featureNames = ["X", "Y"];
        
        // Calculate tree depth and width metrics
        const treeDepth = getTreeDepth(rootNode);
        const totalLeaves = countLeaves(rootNode);
        
        // Use smaller nodes for deeper trees
        const nodeRadius = treeDepth > 5 ? Math.max(20, 30 - (treeDepth - 4) * 2) : baseNodeRadius;
        
        // List to hold all elements
        const elements = [];
        
        // First pass: Collect nodes by level to determine width requirements
        const levelNodes = [];
        for (let i = 0; i <= treeDepth; i++) {
            levelNodes[i] = [];
        }
        
        // Traverse and count nodes at each level
        const countNodesPerLevel = (node, level = 0, index = 1) => {
            if (!node) return;
            
            // Track node in its level
            levelNodes[level].push({ node, index });
            
            if (node.left) {
                countNodesPerLevel(node.left, level + 1, index * 2);
            }
            
            if (node.right) {
                countNodesPerLevel(node.right, level + 1, index * 2 + 1);
            }
        };
        
        countNodesPerLevel(rootNode);
        
        // Sort nodes by index for proper left-to-right ordering
        levelNodes.forEach(level => {
            level.sort((a, b) => a.index - b.index);
        });
        
        // Calculate how much width we need per level based on node count
        const levelWidths = levelNodes.map(level => {
            const nodesInLevel = level.length;
            // Each node needs at least 2.5x nodeRadius spacing
            return nodesInLevel * nodeRadius * 2.5;
        });
        
        // The maximum width needed across all levels
        const requiredWidth = Math.max(...levelWidths);
        
        // Adjust the available width to ensure all nodes fit
        const effectiveWidth = Math.max(totalWidth - 2 * levelIndicatorWidth, requiredWidth);
        
        // Map to store positions for all nodes
        const nodePositions = new Map();
        
        // Calculate horizontal positions for each node
        for (let level = 0; level <= treeDepth; level++) {
            const nodes = levelNodes[level];
            const nodesInLevel = nodes.length;
            
            if (nodesInLevel === 0) continue;
            
            if (level === 0) {
                // Root node is always centered
                nodePositions.set("0-1", {
                    x: totalWidth / 2,
                    y: startY + (level * levelHeight)
                });
            } else {
                // For lower levels, space nodes evenly
                let availableWidth = Math.min(effectiveWidth, totalWidth - 2 * levelIndicatorWidth);
                
                // If we have many nodes at this level, ensure they don't get too crowded
                const minSpacing = nodeRadius * 2.2;
                const idealSpacing = availableWidth / (nodesInLevel + 1);
                
                // If nodes would be too crowded, expand the available width
                if (idealSpacing < minSpacing && nodesInLevel > 1) {
                    availableWidth = minSpacing * (nodesInLevel + 1);
                }
                
                const startX = (totalWidth - availableWidth) / 2 + (availableWidth / (nodesInLevel + 1));
                const spacing = availableWidth / (nodesInLevel + 1);
                
                nodes.forEach((node, idx) => {
                    nodePositions.set(`${level}-${node.index}`, {
                        x: startX + idx * spacing,
                        y: startY + (level * levelHeight)
                    });
                });
            }
        }
        
        // Second pass: Adjust positions to better align parents with children
        for (let level = 0; level < treeDepth; level++) {
            levelNodes[level].forEach(item => {
                const parentKey = `${level}-${item.index}`;
                const leftChildKey = `${level+1}-${item.index*2}`;
                const rightChildKey = `${level+1}-${item.index*2+1}`;
                
                const parent = nodePositions.get(parentKey);
                const leftChild = nodePositions.get(leftChildKey);
                const rightChild = nodePositions.get(rightChildKey);
                
                if (parent && leftChild && rightChild) {
                    // Parent should be centered between children
                    const midPoint = (leftChild.x + rightChild.x) / 2;
                    // Only adjust if the difference is significant, but avoid large jumps
                    const maxAdjustment = 40; // Limit how far parent nodes can move
                    if (Math.abs(parent.x - midPoint) > 5) {
                        parent.x = parent.x + Math.sign(midPoint - parent.x) * 
                                  Math.min(Math.abs(midPoint - parent.x), maxAdjustment);
                    }
                }
            });
        }
        
        // Rendering function for the tree with calculated positions
        const renderNode = (depth = 0, index = 1) => {
            const position = nodePositions.get(`${depth}-${index}`);
            if (!position) return;
            
            const node = levelNodes[depth].find(n => n.index === index)?.node;
            if (!node) return;
            
            const {x, y} = position;
            
            // Adjust node color based on type
            const nodeColor = node.value !== null 
                ? (node.value === 0 ? "rgba(54, 162, 235, 0.95)" : "rgba(255, 99, 132, 0.95)") 
                : "rgba(75, 192, 192, 0.95)";
            
            // Draw the node
            elements.push(
                <circle 
                    key={`node-${depth}-${index}`}
                    cx={x} 
                    cy={y} 
                    r={nodeRadius} 
                    fill={nodeColor} 
                    stroke="#333" 
                    strokeWidth="1.5" 
                    filter="url(#nodeShadow)"
                />
            );
            
            // Add node text
            const fontSize = Math.max(12, Math.min(15, nodeRadius * 0.5));
            
            if (node.value !== null) {
                // Leaf node
                elements.push(
                    <text 
                        key={`text-${depth}-${index}`}
                        x={x} 
                        y={y} 
                        textAnchor="middle" 
                        fill="white" 
                        fontWeight="bold" 
                        fontSize={fontSize} 
                        dominantBaseline="middle"
                    >
                        Class {node.value}
                    </text>
                );
            } else {
                // Decision node
                elements.push(
                    <text 
                        key={`text1-${depth}-${index}`}
                        x={x} 
                        y={y - 6} 
                        textAnchor="middle" 
                        fill="white" 
                        fontWeight="bold" 
                        fontSize={fontSize} 
                        dominantBaseline="middle"
                    >
                        {featureNames[node.feature]}
                    </text>
                );
                elements.push(
                    <text 
                        key={`text2-${depth}-${index}`}
                        x={x} 
                        y={y + 11} 
                        textAnchor="middle" 
                        fill="white" 
                        fontSize={Math.max(9, fontSize - 2)}
                    >
                        ≥ {node.threshold.toFixed(2)}
                    </text>
                );
            }
            
            // Add connections to children
            if (node.left) {
                const leftChildPos = nodePositions.get(`${depth+1}-${index*2}`);
                if (leftChildPos) {
                    const leftX = leftChildPos.x;
                    const leftY = leftChildPos.y;
                    
                    // Connection path - curved line for better visualization
                    elements.unshift(
                        <g key={`connL-${depth}-${index}`}>
                            {/* Background glow */}
                            <path
                                d={`M ${x} ${y + nodeRadius} 
                                   C ${x} ${y + levelHeight/3}, 
                                     ${leftX} ${leftY - levelHeight/3}, 
                                     ${leftX} ${leftY - nodeRadius}`}
                                stroke="#d4e6f7" 
                                strokeWidth={Math.max(6, 10 - depth)} 
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            {/* Actual line */}
                            <path
                                d={`M ${x} ${y + nodeRadius} 
                                   C ${x} ${y + levelHeight/3}, 
                                     ${leftX} ${leftY - levelHeight/3}, 
                                     ${leftX} ${leftY - nodeRadius}`}
                                stroke="#2980b9" 
                                strokeWidth={Math.max(2, 3.5 - (depth * 0.3))} 
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                markerEnd="url(#arrowheadChild)"
                            />
                            
                            {/* Label - smaller for deeper levels */}
                            <g transform={`translate(${(x + leftX) / 2}, ${(y + leftY) / 2 - 10})`}>
                                <rect 
                                    x="-36" 
                                    y="-12" 
                                    width="72" 
                                    height="24" 
                                    rx="5" 
                                    fill="rgba(248,252,255,0.96)" 
                                    stroke="#b8c9db" 
                                    strokeWidth="1.2" 
                                    filter="url(#labelShadow)" 
                                />
                                <text 
                                    x="0" 
                                    y="3" 
                                    textAnchor="middle" 
                                    fill="#2c3e50" 
                                    fontSize={Math.max(9, 12 - (depth * 0.6))} 
                                    fontWeight="500"
                                    dominantBaseline="middle"
                                >
                                    {featureNames[node.feature]} &lt; {node.threshold.toFixed(2)}
                                </text>
                            </g>
                        </g>
                    );
                    
                    renderNode(depth + 1, index * 2);
                }
            }
            
            if (node.right) {
                const rightChildPos = nodePositions.get(`${depth+1}-${index*2+1}`);
                if (rightChildPos) {
                    const rightX = rightChildPos.x;
                    const rightY = rightChildPos.y;
                    
                    // Connection path - curved line for better visualization
                    elements.unshift(
                        <g key={`connR-${depth}-${index}`}>
                            {/* Background glow */}
                            <path
                                d={`M ${x} ${y + nodeRadius} 
                                   C ${x} ${y + levelHeight/3}, 
                                     ${rightX} ${rightY - levelHeight/3}, 
                                     ${rightX} ${rightY - nodeRadius}`}
                                stroke="#d4e6f7" 
                                strokeWidth={Math.max(6, 10 - depth)} 
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            {/* Actual line */}
                            <path
                                d={`M ${x} ${y + nodeRadius} 
                                   C ${x} ${y + levelHeight/3}, 
                                     ${rightX} ${rightY - levelHeight/3}, 
                                     ${rightX} ${rightY - nodeRadius}`}
                                stroke="#2980b9" 
                                strokeWidth={Math.max(2, 3.5 - (depth * 0.3))} 
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                markerEnd="url(#arrowheadChild)"
                            />
                            
                            {/* Label - smaller for deeper levels */}
                            <g transform={`translate(${(x + rightX) / 2}, ${(y + rightY) / 2 - 10})`}>
                                <rect 
                                    x="-36" 
                                    y="-12" 
                                    width="72" 
                                    height="24" 
                                    rx="5" 
                                    fill="rgba(248,252,255,0.96)" 
                                    stroke="#b8c9db" 
                                    strokeWidth="1.2" 
                                    filter="url(#labelShadow)" 
                                />
                                <text 
                                    x="0" 
                                    y="3" 
                                    textAnchor="middle" 
                                    fill="#2c3e50" 
                                    fontSize={Math.max(9, 12 - (depth * 0.6))} 
                                    fontWeight="500"
                                    dominantBaseline="middle"
                                >
                                    {featureNames[node.feature]} ≥ {node.threshold.toFixed(2)}
                                </text>
                            </g>
                        </g>
                    );
                    
                    renderNode(depth + 1, index * 2 + 1);
                }
            }
        };
        
        // Start the rendering from the root
        renderNode();
        
        return elements;
    };

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
                        ...(showDecisionBoundary && tree
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
                                    if (context.dataset.label === "Decision Boundary") {
                                        return `Predicted: Class ${point.class}`;
                                    }
                                    return `(${point.x.toFixed(2)}, ${point.y.toFixed(2)}) - Class ${point.class}`;
                                }
                            }
                        }
                    }
                },
            })
        }
    }, [points, showDecisionBoundary, tree, isGeneratedPoints])

    return (
        <div className="container mx-auto px-4 py-8">
            {showInfoPanel ? (
                <AlgorithmInfoPanel 
                    algorithm="decision-tree" 
                    onStartTutorial={handleStartFromInfoPanel} 
                />
            ) : (
                <>
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="lg:w-3/4">
                            <div
                                className="canvas h-96 rounded-xl border border-gray-200 cursor-crosshair"
                                onClick={handleCanvasClick}
                                data-tutorial="canvas"
                            >
                                <canvas ref={chartRef} />
                            </div>
                            
                            <div className="controls flex flex-wrap justify-between gap-3 mt-4">
                                <div className="flex gap-2">
                                    <button
                                        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-blue-600 transition-colors shadow-sm"
                                        onClick={trainModel}
                                        disabled={points.length < 2 || isTraining}
                                        data-tutorial="train-tree"
                                    >
                                        {isTraining ? "Training..." : "Train Model"}
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
                                </div>
                                
                                <div className="flex gap-2">
                                    <button
                                        className={`px-4 py-2 rounded ${
                                            currentClass === 0
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-200 text-gray-700"
                                        }`}
                                        onClick={() => setCurrentClass(0)}
                                        data-tutorial="class-0"
                                    >
                                        Class 0
                                    </button>
                                    <button
                                        className={`px-4 py-2 rounded ${
                                            currentClass === 1
                                                ? "bg-red-500 text-white"
                                                : "bg-gray-200 text-gray-700"
                                        }`}
                                        onClick={() => setCurrentClass(1)}
                                        data-tutorial="class-1"
                                    >
                                        Class 1
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        className={`px-4 py-2 rounded ${
                                            showDecisionBoundary
                                                ? "bg-green-500 text-white"
                                                : "bg-gray-200 text-gray-700"
                                        }`}
                                        onClick={() => setShowDecisionBoundary(!showDecisionBoundary)}
                                        disabled={!tree}
                                        data-tutorial="show-boundary"
                                    >
                                        {showDecisionBoundary ? "Hide Boundary" : "Show Boundary"}
                                    </button>
                                    
                                    <button
                                        className={`px-4 py-2 rounded ${
                                            showTreeVisualization
                                                ? "bg-green-500 text-white"
                                                : "bg-gray-200 text-gray-700"
                                        }`}
                                        onClick={() => setShowTreeVisualization(!showTreeVisualization)}
                                        disabled={!tree}
                                        data-tutorial="show-tree"
                                    >
                                        {showTreeVisualization ? "Hide Tree" : "Show Tree"}
                                    </button>
                                    
                                    <button 
                                        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors shadow-sm" 
                                        onClick={handleStartFromInfoPanel}
                                        data-tutorial="start-tutorial"
                                    >
                                        Start Tutorial
                                    </button>
                                </div>
                            </div>
                            
                            {/* Tree Visualization */}
                            {tree && showTreeVisualization && (
                                <div className="mt-6 bg-white p-4 rounded-lg shadow">
                                    <h3 className="text-lg font-semibold mb-3 text-blue-600 border-b pb-2">
                                        Decision Tree Structure
                                    </h3>
                                    <div className="tree-visualization-container overflow-auto bg-gradient-to-b from-gray-50 to-white p-4 rounded-lg border border-gray-200" style={{maxHeight: "600px"}}>
                                        <h4 className="text-center text-gray-700 font-medium mb-3">Decision Tree Visualization</h4>
                                        
                                        <svg 
                                            width={1100} 
                                            height={tree ? Math.max(400, (getTreeDepth(tree) + 1) * 110 + 100) : 350} 
                                            ref={treeContainerRef} 
                                            className="shadow-sm mx-auto"
                                            viewBox={`0 0 1100 ${tree ? Math.max(400, (getTreeDepth(tree) + 1) * 110 + 100) : 350}`}
                                            preserveAspectRatio="xMidYMid meet"
                                            style={{minWidth: "1000px"}}
                                        >
                                            {/* Define reusable filters */}
                                            <defs>
                                                <filter id="labelShadow" x="-10%" y="-10%" width="120%" height="120%">
                                                    <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.1" />
                                                </filter>
                                                <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
                                                    <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.2" />
                                                </filter>
                                                <marker
                                                    id="arrowhead"
                                                    markerWidth="10"
                                                    markerHeight="8"
                                                    refX="8"
                                                    refY="4"
                                                    orient="auto"
                                                    markerUnits="userSpaceOnUse"
                                                >
                                                    <polygon points="0 0, 10 4, 0 8" fill="#2980b9" />
                                                </marker>
                                                <marker
                                                    id="arrowheadChild"
                                                    markerWidth="10"
                                                    markerHeight="8"
                                                    refX="8"
                                                    refY="4"
                                                    orient="auto"
                                                    markerUnits="userSpaceOnUse"
                                                >
                                                    <polygon points="0 0, 10 4, 0 8" fill="#2980b9" />
                                                </marker>
                                            </defs>
                                            
                                            {/* Background */}
                                            <rect width={1100} height={tree ? Math.max(400, (getTreeDepth(tree) + 1) * 110 + 100) : 350} fill="#f8fafc" />
                                            
                                            {/* Legend - completely redesigned */}
                                            <g transform={`translate(${1100 - 210}, 15)`}>
                                                <rect 
                                                    width="195" 
                                                    height="75" 
                                                    fill="white" 
                                                    rx="6" 
                                                    stroke="#e5e7eb" 
                                                    strokeWidth="1" 
                                                    filter="url(#labelShadow)" 
                                                />
                                                
                                                <g transform="translate(15, 20)">
                                                    <circle 
                                                        cx="12" 
                                                        cy="0" 
                                                        r="12" 
                                                        fill="rgba(75, 192, 192, 0.95)" 
                                                        stroke="#2c3e50" 
                                                        strokeWidth="1" 
                                                    />
                                                    <text x="32" y="0" fill="#334155" fontSize="13" fontWeight="500" dominantBaseline="middle">Decision Node</text>
                                                </g>
                                                
                                                <g transform="translate(15, 50)">
                                                    <circle 
                                                        cx="12" 
                                                        cy="0" 
                                                        r="12" 
                                                        fill="rgba(54, 162, 235, 0.95)" 
                                                        stroke="#2c3e50" 
                                                        strokeWidth="1" 
                                                    />
                                                    <text x="32" y="0" fill="#334155" fontSize="13" fontWeight="500" dominantBaseline="middle">Class 0</text>
                                                </g>
                                                
                                                <g transform="translate(110, 50)">
                                                    <circle 
                                                        cx="12" 
                                                        cy="0" 
                                                        r="12" 
                                                        fill="rgba(255, 99, 132, 0.95)" 
                                                        stroke="#2c3e50" 
                                                        strokeWidth="1" 
                                                    />
                                                    <text x="32" y="0" fill="#334155" fontSize="13" fontWeight="500" dominantBaseline="middle">Class 1</text>
                                                </g>
                                            </g>
                                            
                                            {/* Level indicators */}
                                            {tree && Array.from({length: getTreeDepth(tree) + 1}).map((_, i) => (
                                                <g key={`level-${i}`}>
                                                    <line 
                                                        x1={80} 
                                                        y1={80 + i * 100} 
                                                        x2={1020} 
                                                        y2={80 + i * 100} 
                                                        stroke="#e0e0e0" 
                                                        strokeWidth="1"
                                                    />
                                                    <rect
                                                        x="5"
                                                        y={80 + i * 100 - 15}
                                                        width="65"
                                                        height="30"
                                                        rx="4"
                                                        fill="white"
                                                        stroke="#ddd"
                                                        strokeWidth="1"
                                                    />
                                                    <text 
                                                        x="35"
                                                        y={80 + i * 100} 
                                                        fontSize="12" 
                                                        fill="#555"
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                    >
                                                        Level {i}
                                                    </text>
                                                </g>
                                            ))}
                                            
                                            {/* The actual tree */}
                                            {tree && renderDirectTree(tree, 1100, 80, 100, 80)}
                                        </svg>
                                        
                                        <div className="mt-3 bg-white p-3 rounded border border-gray-200 text-sm">
                                            <p className="font-medium text-gray-700 mb-1">Tree Statistics</p>
                                            <div className="grid grid-cols-3">
                                                <div className="text-center">
                                                    <span className="text-gray-600 mr-1">Depth:</span>
                                                    <span className="font-mono font-semibold">{metrics.depth}</span>
                                                </div>
                                                <div className="text-center">
                                                    <span className="text-gray-600 mr-1">Leaves:</span>
                                                    <span className="font-mono font-semibold">{metrics.leaves}</span>
                                                </div>
                                                <div className="text-center">
                                                    <span className="text-gray-600 mr-1">Accuracy:</span>
                                                    <span className="font-mono font-semibold">{(metrics.accuracy * 100).toFixed(1)}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-gray-600">
                                        <div className="flex items-center">
                                            <span className="w-3 h-3 rounded-full bg-blue-400 mr-2"></span>
                                            <span>Class 0 (Leaf Node)</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="w-3 h-3 rounded-full bg-red-400 mr-2"></span>
                                            <span>Class 1 (Leaf Node)</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="w-3 h-3 rounded-full bg-teal-400 mr-2"></span>
                                            <span>Decision Node (Split Point)</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="bg-white p-4 rounded-lg shadow mt-4">
                                <h3 className="text-lg font-semibold mb-3">Instructions</h3>
                                <div className="space-y-1 text-sm grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div>
                                        <p className="flex items-center"><span className="w-5 h-5 inline-flex items-center justify-center bg-blue-500 text-white rounded-full text-xs mr-2">1</span> Select a class using the class buttons</p>
                                        <p className="flex items-center mt-2"><span className="w-5 h-5 inline-flex items-center justify-center bg-blue-500 text-white rounded-full text-xs mr-2">2</span> Click on the canvas to add points of that class</p>
                                        <p className="flex items-center mt-2"><span className="w-5 h-5 inline-flex items-center justify-center bg-blue-500 text-white rounded-full text-xs mr-2">3</span> Or use "Generate Sample Data" for quick testing</p>
                                    </div>
                                    <div>
                                        <p className="flex items-center"><span className="w-5 h-5 inline-flex items-center justify-center bg-blue-500 text-white rounded-full text-xs mr-2">4</span> Click "Train Model" to build the decision tree</p>
                                        <p className="flex items-center mt-2"><span className="w-5 h-5 inline-flex items-center justify-center bg-blue-500 text-white rounded-full text-xs mr-2">5</span> Use "Show Boundary" to visualize the decision regions</p>
                                        <p className="flex items-center mt-2"><span className="w-5 h-5 inline-flex items-center justify-center bg-blue-500 text-white rounded-full text-xs mr-2">6</span> View the tree structure to understand the model's decisions</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/4 space-y-4">
                            <div className="bg-white p-4 rounded-lg shadow sticky top-4" data-tutorial="metrics">
                                <h3 className="text-lg font-semibold mb-3 text-blue-600">Performance Metrics</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="text-gray-600 font-medium">Accuracy:</span>
                                        <span className="text-lg font-mono font-medium">
                                            {(metrics.accuracy * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="text-gray-600 font-medium">Tree Depth:</span>
                                        <span className="text-lg font-mono font-medium">
                                            {metrics.depth}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="text-gray-600 font-medium">Number of Leaves:</span>
                                        <span className="text-lg font-mono font-medium">
                                            {metrics.leaves}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow">
                                <h3 className="text-lg font-semibold mb-3 text-blue-600">Confusion Matrix</h3>
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
                        </div>
                    </div>
                    
                    <div className="mt-6 bg-white p-5 rounded-lg shadow">
                        <h3 className="text-xl font-semibold mb-4 text-blue-600 border-b pb-2">Decision Tree: Key Concepts & Terminology</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="p-3 border rounded-lg">
                                <p className="font-medium text-gray-800 mb-1">Tree Depth</p>
                                <p className="text-gray-600 text-sm">The maximum number of levels in the decision tree from root to leaf. Deeper trees can capture more complex patterns but may overfit.</p>
                            </div>
                            
                            <div className="p-3 border rounded-lg">
                                <p className="font-medium text-gray-800 mb-1">Number of Leaves</p>
                                <p className="text-gray-600 text-sm">The count of terminal nodes (leaves) in the tree. Each leaf represents a prediction region.</p>
                            </div>
                            
                            <div className="p-3 border rounded-lg">
                                <p className="font-medium text-gray-800 mb-1">Accuracy</p>
                                <p className="text-gray-600 text-sm">The proportion of correctly classified points:</p>
                                <p className="italic text-gray-500 text-sm">Accuracy = (TP + TN) / (TP + TN + FP + FN)</p>
                            </div>
                            
                            <div className="p-3 border rounded-lg">
                                <p className="font-medium text-gray-800 mb-1">Gini Impurity</p>
                                <p className="text-gray-600 text-sm">A measure of impurity used to determine the best splits:</p>
                                <p className="italic text-gray-500 text-sm">Gini = 1 - Σ(p<sub>i</sub>²) where p<sub>i</sub> is the probability of class i</p>
                            </div>
                            
                            <div className="p-3 border rounded-lg">
                                <p className="font-medium text-gray-800 mb-1">Confusion Matrix Terms</p>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    <li><span className="font-medium">True Negative (TN):</span> Class 0 points correctly predicted as Class 0</li>
                                    <li><span className="font-medium">False Positive (FP):</span> Class 0 points incorrectly predicted as Class 1</li>
                                    <li><span className="font-medium">False Negative (FN):</span> Class 1 points incorrectly predicted as Class 0</li>
                                    <li><span className="font-medium">True Positive (TP):</span> Class 1 points correctly predicted as Class 1</li>
                                </ul>
                            </div>
                            
                            <div className="p-3 border rounded-lg">
                                <p className="font-medium text-gray-800 mb-1">Other Derived Metrics</p>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    <li><span className="font-medium">Precision:</span> TP / (TP + FP) - The accuracy of positive predictions</li>
                                    <li><span className="font-medium">Recall:</span> TP / (TP + FN) - The fraction of actual positives identified</li>
                                    <li><span className="font-medium">F1 Score:</span> 2 × (Precision × Recall) / (Precision + Recall) - Harmonic mean of precision and recall</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default DecisionTree 