import React, { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import * as tf from "@tensorflow/tfjs"
import Papa from "papaparse"
import { Line } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js"

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

const Visualization = () => {
    const location = useLocation()
    const { selectedDataset, selectedModel } = location.state || {}
    const [predictions, setPredictions] = useState([])
    const [chartData, setChartData] = useState(null)

    useEffect(() => {
        if (selectedModel === "linear-regression") {
            tf.loadLayersModel("localstorage://my-model")
                .then((model) => {
                    console.log("Loaded model:", model) // Log the loaded model
                    visualizeModel(model)
                })
                .catch((err) => console.error("Error loading model:", err))
        }
    }, [selectedModel])

    const visualizeModel = async (model) => {
        const data = await loadDataset(selectedDataset)
        const { inputs, originalData } = preprocessData(data)
        const preds = model.predict(inputs).dataSync()
        console.log("Predictions:", preds) // Log the predictions
        setPredictions(preds)

        // Prepare data for chart
        const chartData = {
            labels: originalData.map((d) => d.x),
            datasets: [
                {
                    label: "Original Data",
                    data: originalData.map((d) => ({ x: d.x, y: d.y })),
                    borderColor: "blue",
                    backgroundColor: "blue",
                    showLine: false,
                },
                {
                    label: "Regression Line",
                    data: originalData.map((d, i) => ({ x: d.x, y: preds[i] })),
                    borderColor: "red",
                    backgroundColor: "red",
                    fill: false,
                },
            ],
        }
        setChartData(chartData)
    }

    const loadDataset = async (dataset) => {
        return new Promise((resolve, reject) => {
            Papa.parse(`/datasets/${dataset}.csv`, {
                download: true,
                header: true,
                dynamicTyping: true,
                complete: (results) => {
                    console.log("Dataset loaded:", results.data) // Log the loaded dataset
                    resolve(results.data)
                },
                error: (error) => {
                    console.error("Error loading dataset:", error) // Log any errors
                    reject(error)
                },
            })
        })
    }

    const preprocessData = (data) => {
        const inputs = data
            .map((d) => d.x)
            .filter((x) => x !== null && x !== undefined)
        const originalData = data.filter(
            (d) =>
                d.x !== null &&
                d.x !== undefined &&
                d.y !== null &&
                d.y !== undefined
        )
        return {
            inputs: tf.tensor2d(inputs, [inputs.length, 1]),
            originalData: originalData,
        }
    }

    return (
        <div className="container mx-auto p-4 h-screen flex flex-col justify-center items-center">
            <h2 className="text-3xl font-bold mb-4 text-center">
                Visualization Page
            </h2>
            {selectedDataset && (
                <p className="mb-4 text-lg text-center">
                    Selected Dataset: {selectedDataset}
                </p>
            )}
            {selectedModel && (
                <p className="mb-4 text-lg text-center">
                    Selected Model: {selectedModel}
                </p>
            )}
            <div className="w-full max-w-md">
                <h3 className="text-xl font-semibold mb-2 text-center">
                    Predictions:
                </h3>
                <ul className="list-disc list-inside">
                    {predictions.map((pred, index) => (
                        <li key={index} className="text-lg">
                            Prediction {index + 1}: {pred}
                        </li>
                    ))}
                </ul>
            </div>
            {chartData && (
                <div className="w-full max-w-2xl mt-8">
                    <Line
                        data={chartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                        }}
                    />
                </div>
            )}
        </div>
    )
}

export default Visualization
