# DataFlowAI - Interactive Machine Learning Visualizations

DataFlowAI is an interactive web application that helps users understand four fundamental machine learning algorithms through visual demonstrations.

## Algorithms Overview

### 1. Linear Regression

#### What is Linear Regression?

Linear Regression is a supervised learning algorithm that predicts a continuous output value based on one or more input features. It finds the best-fitting straight line (or hyperplane in higher dimensions) through the data points by minimizing the sum of squared errors.

#### Implementation Details

-   **Data Points**: Users can add points manually by clicking or generate random points
-   **Training Process**:
    -   Uses gradient descent to find optimal slope and intercept
    -   Animated line fitting during training
    -   Shows error lines between points and predictions
-   **Performance Metrics**:
    -   **R² Score (0 to 1)**: Measures how well the model fits the data
        -   1.0 = Perfect fit
        -   0.0 = Poor fit
        -   Negative = Worse than horizontal line
    -   **Mean Squared Error (MSE)**: Average of squared differences between predictions and actual values
        -   Penalizes larger errors more heavily
        -   Always positive
        -   Lower is better
    -   **Mean Absolute Error (MAE)**: Average of absolute differences between predictions and actual values
        -   Easier to interpret
        -   Less sensitive to outliers than MSE
        -   Lower is better

### 2. Logistic Regression

#### What is Logistic Regression?

Logistic Regression is a classification algorithm that predicts binary outcomes (0 or 1). It uses a sigmoid function to transform linear predictions into probabilities between 0 and 1.

#### Implementation Details

-   **Data Points**: Users can add points of two classes (0 and 1)
-   **Training Process**:
    -   Uses gradient descent with mini-batch processing
    -   L2 regularization to prevent overfitting
    -   Animated decision boundary
    -   Optimal threshold finding
-   **Performance Metrics**:
    -   **Accuracy**: Percentage of correct predictions (both classes)
    -   **Precision**: Of points predicted as Class 1, how many were actually Class 1
    -   **Recall**: Of all actual Class 1 points, how many were correctly identified
    -   **F1 Score**: Harmonic mean of precision and recall
    -   **Decision Boundary**: Shows the line where probability = 0.5
    -   **Probability Tooltips**: Shows P(class=1) for any point

### 3. K-Nearest Neighbors (KNN)

#### What is KNN?

KNN is a simple, non-parametric classification algorithm that classifies points based on the majority class of their k nearest neighbors. It's an example of instance-based learning.

#### Implementation Details

-   **Data Points**: Users can add training points of three classes
-   **Test Point**: Right-click to add/move test point
-   **Classification Process**:
    -   Calculates Euclidean distance to all training points
    -   Finds k nearest neighbors
    -   Predicts class based on majority vote
    -   Visualizes nearest neighbors with highlighted circles
-   **Performance Metrics** (using Leave-One-Out Cross Validation):
    -   **Confusion Matrix**: Shows prediction distribution for each class
    -   **Per-Class Metrics**:
        -   True Positives (TP): Correctly predicted points of this class
        -   False Positives (FP): Other classes predicted as this class
        -   False Negatives (FN): This class predicted as other classes
        -   Precision: TP / (TP + FP)
        -   Recall: TP / (TP + FN)
        -   F1 Score: 2 _ (Precision _ Recall) / (Precision + Recall)

### 4. K-Means Clustering

#### What is K-Means?

K-Means is an unsupervised learning algorithm that groups similar data points into k clusters. It iteratively assigns points to the nearest centroid and updates centroid positions.

#### Implementation Details

-   **Data Points**: Users can add points by clicking
-   **Clustering Process**:
    -   Randomly initializes k centroids
    -   Animated assignment of points to nearest centroid
    -   Smooth centroid movement during updates
    -   Convergence detection
-   **Interactive Features**:
    -   Adjustable number of clusters (k)
    -   Color-coded clusters
    -   Animated clustering process
    -   Triangle markers for centroids
-   **Status Information**:
    -   Number of points
    -   Current iteration
    -   Convergence status

## Technical Implementation Details

### Common Features Across All Models

-   Interactive canvas using Chart.js
-   Real-time visualization updates
-   Responsive design
-   Error handling and input validation
-   Clear and reset functionality
-   Informative tooltips and instructions

### Animation and Visualization

-   Smooth transitions for model updates
-   Color-coded classes and clusters
-   Clear visual distinction between different elements
-   Responsive canvas sizing
-   Cross-browser compatibility

### User Interface

-   Intuitive point addition with left/right clicks
-   Clear control buttons with appropriate disabled states
-   Real-time metric updates
-   Detailed instructions and explanations
-   Mobile-responsive design

### Performance Optimizations

-   Efficient data structure usage
-   Optimized animation frames
-   Debounced event handlers
-   Proper cleanup of chart instances
-   Memory leak prevention

## Usage Instructions

Each algorithm has specific interaction patterns:

1. **Linear Regression**: Click to add points, train model to fit line
2. **Logistic Regression**: Add points of two classes, train to find decision boundary
3. **KNN**: Add training points, right-click for test point
4. **K-Means**: Add points, adjust k, watch clustering animation

## Technical Requirements

-   Modern web browser with JavaScript enabled
-   Recommended minimum screen width: 768px
-   Touch device support for basic interactions

## Libraries Used

-   React for UI components
-   Chart.js for visualizations
-   TailwindCSS for styling
-   React Router for navigation

## Future Improvements

-   Additional algorithms
-   More interactive features
-   Dataset import/export
-   Mobile optimization
-   Advanced visualization options
