import { useNavigate } from "react-router-dom"

const Header = () => {
    const navigate = useNavigate()
    return (
        <header className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 shadow-md">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <h1
                        onClick={() => navigate("/")}
                        className="text-3xl font-bold cursor-pointer hover:scale-105 transition-transform duration-200"
                    >
                        Data
                        <span className="text-blue-600">Flow</span>
                        <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            AI
                        </span>
                    </h1>
                    <nav className="hidden md:flex gap-6">
                        <button
                            onClick={() => navigate("/")}
                            className="text-gray-700 hover:text-gray-900 transition-colors"
                        >
                            Home
                        </button>
                        <a
                            href="https://github.com/KingShivamX"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-700 hover:text-gray-900 transition-colors"
                        >
                            GitHub
                        </a>
                    </nav>
                </div>
            </div>
        </header>
    )
}

export default Header
