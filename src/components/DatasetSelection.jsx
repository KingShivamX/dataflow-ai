import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

const DatasetSelection = () => {
    const [selectedDataset, setSelectedDataset] = useState("")
    const navigate = useNavigate()

    const handleDatasetChange = (event) => {
        setSelectedDataset(event.target.value)
        console.log("Selected Dataset:", event.target.value) // Log the selected dataset
    }

    const handleNext = () => {
        if (selectedDataset) {
            console.log("Navigating to Algorithm Implementation with dataset:", selectedDataset)
            navigate("/algorithm-implementation", {
                state: { selectedDataset },
            })
        }
    }

    return (
        <div className="container mx-auto p-4 h-screen flex flex-col justify-center items-center">
            <h2 className="text-3xl font-bold mb-4 text-center">
                Dataset Selection Page
            </h2>
            <div className="mb-4 w-full max-w-md">
                <label
                    htmlFor="dataset"
                    className="block text-lg font-medium mb-2"
                >
                    Select a dataset:
                </label>
                <select
                    id="dataset"
                    value={selectedDataset}
                    onChange={handleDatasetChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                >
                    <option value="">--Please choose an option--</option>
                    <option value="dataset1">Dataset 1</option>
                    <option value="dataset2">Dataset 2</option>
                    <option value="dataset3">Dataset 3</option>
                </select>
            </div>
            {selectedDataset && (
                <p className="mb-4 text-lg text-center">
                    You have selected:{" "}
                    <span className="font-semibold">{selectedDataset}</span>
                </p>
            )}
            <button
                onClick={handleNext}
                disabled={!selectedDataset}
                className={`w-full max-w-md p-2 text-white rounded-md ${
                    selectedDataset
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-400 cursor-not-allowed"
                }`}
            >
                Next
            </button>
        </div>
    )
}

export default DatasetSelection
