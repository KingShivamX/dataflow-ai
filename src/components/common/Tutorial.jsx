import { useEffect, useState } from "react";
import Joyride, { STATUS } from "react-joyride";
import { useLocation } from "react-router-dom";
import { useTutorial } from "../../contexts/TutorialContext";

const Tutorial = () => {
  const {
    showTutorial,
    setShowTutorial,
    tutorialStep,
    setTutorialStep,
    endTutorial,
  } = useTutorial();
  const location = useLocation();
  const [steps, setSteps] = useState([]);

  // Define different steps based on the current page
  useEffect(() => {
    const path = location.pathname;
    
    if (path === "/") {
      setSteps([
        {
          target: ".welcome-title",
          content: "Welcome to DataFlowAI! This platform helps you learn machine learning algorithms through interactive visualizations.",
          disableBeacon: true,
          placement: "bottom",
        },
        {
          target: ".algorithms-grid",
          content: "Here you can see all the available machine learning algorithms. Click on any card to explore its visualization.",
          placement: "top",
        },
        {
          target: '.algorithm-card[data-algorithm="linear-regression"]',
          content: "Try Linear Regression first - it's one of the simplest algorithms to understand!",
          placement: "left",
        },
        {
          target: "header h1",
          content: "Click on the logo anytime to return to the home page.",
          placement: "bottom",
        },
      ]);
    } else if (path.includes("/linear-regression")) {
      setSteps([
        {
          target: ".canvas",
          content: "This is your workspace. Click anywhere on this canvas to add data points. Try adding at least 5-6 points that form a pattern.",
          disableBeacon: true,
        },
        {
          target: ".controls",
          content: "These controls let you interact with the model. Each button performs a different action.",
          placement: "top",
        },
        {
          target: "[data-tutorial='train-model']",
          content: "After adding points, click 'Train Model' to find the best-fitting line through your data points. The line will automatically adjust to minimize the error.",
          placement: "bottom",
        },
        {
          target: "[data-tutorial='random-points']",
          content: "Don't want to add points manually? Click here to generate random points with a pattern.",
          placement: "bottom",
        },
        {
          target: "[data-tutorial='show-errors']",
          content: "After training, click here to visualize the errors (distance between each point and the line). This shows how well your model fits the data.",
          placement: "bottom", 
        },
        {
          target: ".metrics",
          content: "This section shows metrics that evaluate your model's performance. Lower MSE and MAE values and R² values closer to 1 indicate better models.",
          placement: "top",
        }
      ]);
    } else if (path.includes("/logistic-regression")) {
      // Logistic regression specific steps
      setSteps([
        {
          target: ".canvas",
          content: "This canvas is where you'll create classification data. Click to add points of different classes.",
          disableBeacon: true,
        },
        {
          target: "[data-tutorial='class-0']",
          content: "Click here to select Class 0 (blue points). Then click on the canvas to add points for this class, typically on one side of where you want the decision boundary.",
          placement: "bottom",
        },
        {
          target: "[data-tutorial='class-1']",
          content: "Click here to select Class 1 (red points). Then add these points on the opposite side from your Class 0 points.",
          placement: "bottom",
        },
        {
          target: ".controls",
          content: "After adding points for both classes, use these controls to train the model and visualize the decision boundary.",
          placement: "top",
        },
        {
          target: "[data-tutorial='train-logistic']",
          content: "Click here to train the model. This will find the optimal decision boundary between your classes using logistic regression.",
          placement: "bottom",
        },
        {
          target: "[data-tutorial='show-boundary']",
          content: "After training, click here to show the decision boundary. Points on different sides will be classified into different classes.",
          placement: "bottom",
        },
        {
          target: ".metrics",
          content: "These metrics show how well your model separates the classes. Higher accuracy, precision, and recall indicate better classification.",
          placement: "top",
        }
      ]);
    } else if (path.includes("/knn")) {
      // KNN specific steps
      setSteps([
        {
          target: ".canvas",
          content: "In K-Nearest Neighbors, points are classified based on their neighbors. First, add training points of different classes on this canvas.",
          disableBeacon: true,
        },
        {
          target: "[data-tutorial='knn-class-0']",
          content: "Click here to select Class 0, then click on the canvas to add points for this class. Try to create a cluster of points.",
          placement: "bottom",
        },
        {
          target: "[data-tutorial='knn-class-1']",
          content: "Click here to select Class 1, then add these points in a different area of the canvas.",
          placement: "bottom",
        },
        {
          target: "[data-tutorial='knn-class-2']",  
          content: "You can also add Class 2 points to create a three-class problem. This makes the classification more complex.",
          placement: "bottom",
        },
        {
          target: "[data-tutorial='k-value']",
          content: "Adjust this 'k' value to change how many neighbors influence the classification. Lower values create more complex boundaries while higher values make smoother boundaries.",
          placement: "bottom",
        },
        {
          target: "[data-tutorial='add-test-point']",
          content: "After adding training points, click this button and then click on the canvas to add a test point. KNN will classify it based on its nearest neighbors.",
          placement: "bottom",
        },
        {
          target: "[data-tutorial='prediction-results']",
          content: "After adding a test point, you'll see which class it was assigned to, along with the neighbors that influenced this decision.",
          placement: "top",
        }
      ]);
    } else if (path.includes("/kmeans")) {
      // K-Means specific steps
      setSteps([
        {
          target: ".canvas",
          content: "K-Means clustering groups similar data points. Click on this canvas to add data points. Try to create visible clusters or patterns.",
          disableBeacon: true,
        },
        {
          target: "[data-tutorial='k-clusters']",
          content: "Set the number of clusters (k) you want to identify in your data. This determines how many groups the algorithm will find.",
          placement: "right",
        },
        {
          target: "[data-tutorial='start-clustering']",
          content: "After adding points, click here to start the clustering process. Watch as the algorithm iteratively assigns points to clusters and updates the centroids.",
          placement: "bottom",
        },
        {
          target: ".cluster-controls",
          content: "These controls let you run the algorithm, clear the canvas, and adjust the number of clusters. Experiment with different settings to see how it affects the results.",
          placement: "top",
        },
        {
          target: "[data-tutorial='kmeans-status']",
          content: "This status indicator shows if your model is ready to run. You need at least as many points as clusters.",
          placement: "bottom",
        },
        {
          target: "p.iterations-count",
          content: "After clustering, this shows how many iterations were needed to converge. More iterations usually means the clusters were less obvious.",
          placement: "right",
        }
      ]);
    } else if (path === "/decision-tree") {
      setSteps([
        {
          target: ".canvas",
          content: "This canvas is where you'll create classification data. Click to add points of different classes.",
          disableBeacon: true,
        },
        {
          target: "[data-tutorial='class-0']",
          content: "Click here to select Class 0 (blue points). Then click on the canvas to add points for this class.",
          placement: "bottom",
        },
        {
          target: "[data-tutorial='class-1']",
          content: "Click here to select Class 1 (red points). Then add these points in a different area of the canvas.",
          placement: "bottom",
        },
        {
          target: ".controls",
          content: "After adding points for both classes, use these controls to train the model and visualize the decision tree.",
          placement: "top",
        },
        {
          target: "[data-tutorial='train-tree']",
          content: "Click here to train the model. This will build a decision tree that splits the data based on feature values.",
          placement: "bottom",
        },
        {
          target: "[data-tutorial='show-boundary']",
          content: "After training, click here to show the decision boundary. The boundary shows how the tree splits the feature space.",
          placement: "bottom",
        },
        {
          target: ".metrics",
          content: "These metrics show how well your model separates the classes. You can see the tree depth, number of leaves, and accuracy.",
          placement: "top",
        }
      ]);
    } else if (path === "/naive-bayes") {
      setSteps([
        {
          target: ".canvas",
          content: "This canvas is where you'll create classification data. Click to add points of different classes.",
          disableBeacon: true,
        },
        {
          target: "[data-tutorial='class-0']",
          content: "Click here to select Class 0 (blue points). Then click on the canvas to add points for this class.",
          placement: "bottom",
        },
        {
          target: "[data-tutorial='class-1']",
          content: "Click here to select Class 1 (red points). Then add these points in a different area of the canvas.",
          placement: "bottom",
        },
        {
          target: ".controls",
          content: "After adding points for both classes, use these controls to train the model and visualize the decision boundary.",
          placement: "top",
        },
        {
          target: "[data-tutorial='train-bayes']",
          content: "Click here to train the model. This will calculate class probabilities and feature statistics using Bayes' theorem.",
          placement: "bottom",
        },
        {
          target: "[data-tutorial='show-boundary']",
          content: "After training, click here to show the decision boundary. The boundary shows where the class probabilities are equal.",
          placement: "bottom",
        },
        {
          target: ".metrics",
          content: "These metrics show how well your model separates the classes. You can see the accuracy and class probabilities.",
          placement: "top",
        }
      ]);
    }
  }, [location.pathname]);

  const handleJoyrideCallback = (data) => {
    const { status, index } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      endTutorial();
    } else {
      setTutorialStep(index);
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={showTutorial}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "#f59e0b", // Yellow 500 from Tailwind
          textColor: "#374151", // Gray 700 from Tailwind
        },
        tooltip: {
          borderRadius: "0.5rem",
          padding: "1rem",
        },
        buttonNext: {
          backgroundColor: "#f59e0b", // Yellow 500 from Tailwind
        },
        buttonBack: {
          color: "#4b5563", // Gray 600 from Tailwind
        },
      }}
    />
  );
};

export default Tutorial; 