import { useNavigate } from "react-router-dom"

const Header = () => {
    const navigate = useNavigate()
    return (
        <>
            <header className="bg-yellow-400 p-4 cursor-pointer flex justify-start items-center min-h-[8vh]">
                <h1
                    className="text-3xl font-bold cursor-pointer bg-gradient-to-r from-black via-gray-900 to-black bg-clip-text text-transparent"
                    onClick={() => navigate("/")}
                >
                    Data<span className="text-blue-500">Flow</span>
                    <span className="text-black">AI</span>
                </h1>
            </header>
        </>
    )
}

export default Header
