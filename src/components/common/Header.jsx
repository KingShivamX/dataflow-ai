import React, { useState } from "react"
import { Link } from "react-router-dom"

const Header = () => {
    const [isOpen, setIsOpen] = useState(false)

    const toggleMenu = () => {
        setIsOpen(!isOpen)
    }

    return (
        <header className="bg-blue-600 p-4 transition-all duration-300 ease-in-out">
            <div className="container mx-auto flex flex-row justify-between items-center">
                <Link to={"/"} className="text-white text-2xl font-bold">
                    DataFlowAI
                </Link>
                <button className="md:hidden text-white" onClick={toggleMenu}>
                    ☰
                </button>
                <nav
                    className={`${
                        isOpen ? "block" : "hidden"
                    } md:flex transition-all duration-300 ease-in-out mt-4 md:mt-0`}
                >
                    <ul className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                        <li>
                            <Link
                                to="/dataset-selection"
                                className="text-white transition duration-300 ease-in-out hover:text-gray-300"
                            >
                                Dataset Selection
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/algorithm-implementation"
                                className="text-white transition duration-300 ease-in-out hover:text-gray-300"
                            >
                                Algorithm Implementation
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/visualization"
                                className="text-white transition duration-300 ease-in-out hover:text-gray-300"
                            >
                                Visualization
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    )
}

export default Header
