import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTutorial } from "../../contexts/TutorialContext";

const algorithmData = {
  "linear-regression": {
    title: "Linear Regression",
    description: "Linear Regression is a supervised learning algorithm used to predict continuous values. It works by finding the best-fitting line through a set of data points.",
    concepts: [
      "The goal is to find a linear relationship between input features and a target variable",
      "Uses the method of least squares to minimize the sum of squared differences between observed and predicted values",
      "The resulting line is defined by y = mx + b, where m is the slope and b is the y-intercept"
    ],
    realWorldUses: [
      "Predicting house prices based on features like size, location, etc.",
      "Forecasting sales based on advertising expenditure",
      "Estimating student performance based on study hours"
    ],
    keyPoints: [
      "Simple to understand and implement",
      "Works best with linear relationships",
      "Performance is measured using metrics like R², MSE, and MAE"
    ],
    image: "/images/linear-regression-info.svg"
  },
  "logistic-regression": {
    title: "Logistic Regression",
    description: "Logistic Regression is a supervised learning algorithm used for binary classification problems. It estimates the probability of an instance belonging to a particular class.",
    concepts: [
      "Uses the logistic (sigmoid) function to transform linear predictions into probability values between 0 and 1",
      "Decision boundary is the line where the probability equals 0.5",
      "Optimized using maximum likelihood estimation"
    ],
    realWorldUses: [
      "Predicting whether an email is spam or not",
      "Determining if a transaction is fraudulent",
      "Medical diagnosis (presence or absence of disease)"
    ],
    keyPoints: [
      "Despite the name, it's a classification algorithm, not regression",
      "Provides probability estimates, not just classifications",
      "Works well for linearly separable classes"
    ],
    image: "/images/logistic-regression-info.svg"
  },
  "knn": {
    title: "K-Nearest Neighbors (KNN)",
    description: "KNN is a simple, instance-based learning algorithm that classifies new data points based on the majority class of their k nearest neighbors.",
    concepts: [
      "Non-parametric algorithm that doesn't make assumptions about the data distribution",
      "Classification is based on proximity to other data points",
      "The value of k (number of neighbors to consider) is a hyperparameter"
    ],
    realWorldUses: [
      "Recommendation systems",
      "Credit scoring",
      "Image recognition"
    ],
    keyPoints: [
      "Simple to understand and implement",
      "No training phase - new predictions are made by computing distances to all data points",
      "Performance depends heavily on the choice of k and distance metric"
    ],
    image: "/images/knn-info.svg"
  },
  "kmeans": {
    title: "K-Means Clustering",
    description: "K-Means is an unsupervised learning algorithm that partitions data into k distinct clusters based on distance to the nearest cluster center.",
    concepts: [
      "Iteratively assigns data points to clusters and updates cluster centers",
      "Aims to minimize the sum of squared distances from points to their cluster centers",
      "The number of clusters (k) must be specified in advance"
    ],
    realWorldUses: [
      "Customer segmentation",
      "Image compression",
      "Anomaly detection"
    ],
    keyPoints: [
      "Simple and efficient algorithm for clustering",
      "Results can vary based on initial random selection of centroids",
      "Works best with spherical clusters of similar size"
    ],
    image: "/images/kmeans-info.svg"
  }
};

const AlgorithmInfo = () => {
  const { algorithm } = useParams();
  const navigate = useNavigate();
  const { startTutorial } = useTutorial();
  
  const algorithmInfo = algorithmData[algorithm];
  
  if (!algorithmInfo) {
    navigate("/");
    return null;
  }
  
  const handleStartTutorial = () => {
    navigate(`/${algorithm}`);
    
    // Give the page time to load before starting the tutorial
    setTimeout(() => {
      startTutorial();
    }, 500);
  };
  
  useEffect(() => {
    // Scroll to top when the component mounts
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{algorithmInfo.title}</h1>
      
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex justify-center mb-8">
            <div className="w-64 h-64 rounded-lg overflow-hidden shadow-md">
              <img 
                src={algorithmInfo.image} 
                alt={`${algorithmInfo.title} visualization`} 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          
          <p className="text-gray-700 text-lg mb-6">{algorithmInfo.description}</p>
          
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Key Concepts</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                {algorithmInfo.concepts.map((concept, index) => (
                  <li key={index}>{concept}</li>
                ))}
              </ul>
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Real-World Applications</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                {algorithmInfo.realWorldUses.map((use, index) => (
                  <li key={index}>{use}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Important Points</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              {algorithmInfo.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
          
          <div className="flex justify-center mt-8">
            <button
              onClick={handleStartTutorial}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md"
            >
              Start Interactive Tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmInfo; 