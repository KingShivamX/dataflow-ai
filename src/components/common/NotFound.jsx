import { useNavigate } from "react-router-dom"

const NotFound = () => {
    const navigate = useNavigate()

    return (
        <div className="min-h-[84vh] flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-4">4😱4</h1>
            <p className="text-xl mb-4">
                Oops! Looks like this page took a wrong turn and got lost in the
                digital wilderness!
            </p>
            <p className="text-lg mb-8 text-gray-600 italic">
                Maybe it went on vacation? 🏖️
            </p>
            <div className="mb-8">
                <img
                    src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMGNmYTJiNzktZGE0NC00NzBjLWI5ZDYtNDM3ZWM5ZTQyZWNiXQ/14uQ3cOFteDaU/giphy.gif"
                    alt="John Travolta confused"
                    className="rounded-lg w-64"
                />
            </div>
            <button
                onClick={() => navigate("/")}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center"
            >
                Take Me Home 🏃‍♂️
            </button>
        </div>
    )
}

export default NotFound
