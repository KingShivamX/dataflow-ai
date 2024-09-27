import React, { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import * as tf from "@tensorflow/tfjs"
import Papa from "papaparse"

const AlgorithmImplementation = () => {
    const [selectedModel, setSelectedModel] = useState("")
    const location = useLocation()
    const navigate = useNavigate()
    const { selectedDataset } = location.state || {}

    const handleModelChange = (event) => {
        setSelectedModel(event.target.value)
        console.log("Selected Model:", event.target.value) // Log the selected model
    }

    const handleNext = async () => {
        if (selectedModel) {
            if (selectedModel === "linear-regression") {
                console.log(
                    "Training Linear Regression Model with dataset:",
                    selectedDataset
                )
                const model = await trainLinearRegressionModel(selectedDataset)
                console.log("Model trained. Navigating to Visualization.")
                await model.save("localstorage://my-model") // Save the model to local storage
                navigate("/visualization", {
                    state: {
                        selectedDataset,
                        selectedModel,
                    },
                })
            }
        }
    }

    const trainLinearRegressionModel = async (dataset) => {
        // Load and preprocess the dataset
        const data = await loadDataset(dataset)
        const { inputs, labels } = preprocessData(data)

        // Define the model
        const model = tf.sequential()
        model.add(tf.layers.dense({ units: 1, inputShape: [1] }))
        model.compile({ optimizer: "sgd", loss: "meanSquaredError" })

        // Train the model
        await model.fit(inputs, labels, { epochs: 100 })

        return model
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
        const labels = data
            .map((d) => d.y)
            .filter((y) => y !== null && y !== undefined)
        return {
            inputs: tf.tensor2d(inputs, [inputs.length, 1]),
            labels: tf.tensor2d(labels, [labels.length, 1]),
        }
    }

    return (
        <div className="container mx-auto p-4 h-screen flex flex-col justify-center items-center">
            <h2 className="text-3xl font-bold mb-4 text-center">
                Algorithm Implementation Page
            </h2>
            {selectedDataset && (
                <p className="mb-4 text-lg text-center">
                    Selected Dataset: {selectedDataset}
                </p>
            )}
            <div className="mb-4 w-full max-w-md">
                <label
                    htmlFor="model"
                    className="block text-lg font-medium mb-2"
                >
                    Select a model:
                </label>
                <select
                    id="model"
                    value={selectedModel}
                    onChange={handleModelChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                >
                    <option value="">--Please choose an option--</option>
                    <option value="linear-regression">Linear Regression</option>
                    {/* Add more models as needed */}
                </select>
            </div>
            {selectedModel && (
                <p className="mb-4 text-lg text-center">
                    You have selected: {selectedModel}
                </p>
            )}
            <button
                onClick={handleNext}
                disabled={!selectedModel}
                className={`w-full max-w-md p-2 text-white rounded-md ${
                    selectedModel
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-400 cursor-not-allowed"
                }`}
            >
                Next
            </button>
        </div>
    )
}

export default AlgorithmImplementation
