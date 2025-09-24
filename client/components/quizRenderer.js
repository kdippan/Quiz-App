/* components/quizRenderer.js */

/**
 * Quiz Renderer - Handles the display and interaction of quiz taking
 */
class QuizRenderer {
    constructor() {
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.startTime = null;
        this.timerInterval = null;
        this.showFeedback = true;
        
        this.initializeElements();
        this.bindEvents();
    }

    /**
     * Initialize DOM element references
     */
    initializeElements() {
        // Views
        this.quizView = document.getElementById('quizView');
        this.resultsView = document.getElementById('resultsView');
        
        // Quiz elements
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.questionText = document.getElementById('questionText');
        this.optionsList = document.getElementById('optionsList');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.quitQuizBtn = document.getElementById('quitQuizBtn');
        this.feedback = document.getElementById('feedback');
        
        // Results elements
        this.scorePercentage = document.getElementById('scorePercentage');
        this.scoreText = document.getElementById('scoreText');
        this.scoreGrade = document.getElementById('scoreGrade');
        this.reviewList = document.getElementById('reviewList');
        this.retakeBtn = document.getElementById('retakeBtn');
        this.saveQuizBtn = document.getElementById('saveQuizBtn');
        this.homeFromResultsBtn = document.getElementById('homeFromResultsBtn');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        this.prevBtn.addEventListener('click', () => this.previousQuestion());
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.quitQuizBtn.addEventListener('click', () => this.quitQuiz());
        this.retakeBtn.addEventListener('click', () => this.retakeQuiz());
        this.saveQuizBtn.addEventListener('click', () => this.saveCurrentQuiz());
        this.homeFromResultsBtn.addEventListener('click', () => this.goHome());
    }

    /**
     * Start a new quiz
     * @param {Object} quiz - Quiz object with questions
     */
    startQuiz(quiz) {
        if (!quiz || !quiz.questions || quiz.questions.length === 0) {
            this.showError('Invalid quiz data');
            return;
        }

        this.currentQuiz = quiz;
        this.currentQuestionIndex = 0;
        this.userAnswers = new Array(quiz.questions.length).fill(-1);
        this.startTime = Date.now();
        
        this.showView('quiz');
        this.renderCurrentQuestion();
        this.updateProgress();
        this.updateNavigation();
    }

    /**
     * Render the current question
     */
    renderCurrentQuestion() {
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        
        // Update question text
        this.questionText.textContent = question.questionText;
        
        // Clear previous options
        this.optionsList.innerHTML = '';
        
        // Create option buttons
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-item';
            button.textContent = option;
            button.setAttribute('role', 'radio');
            button.setAttribute('aria-checked', 'false');
            button.setAttribute('tabindex', '0');
            
            // Check if this option was previously selected
            if (this.userAnswers[this.currentQuestionIndex] === index) {
                button.classList.add('selected');
                button.setAttribute('aria-checked', 'true');
            }
            
            button.addEventListener('click', () => this.selectOption(index));
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.selectOption(index);
                }
            });
            
            this.optionsList.appendChild(button);
        });
        
        // Clear previous feedback
        this.feedback.innerHTML = '';
        this.feedback.className = 'feedback';
    }

    /**
     * Handle option selection
     * @param {number} optionIndex - Selected option index
     */
    selectOption(optionIndex) {
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        
        // Clear previous selections
        const options = this.optionsList.querySelectorAll('.option-item');
        options.forEach(option => {
            option.classList.remove('selected', 'correct', 'incorrect');
            option.setAttribute('aria-checked', 'false');
        });
        
        // Mark selected option
        const selectedOption = options[optionIndex];
        selectedOption.classList.add('selected');
        selectedOption.setAttribute('aria-checked', 'true');
        
        // Store answer
        this.userAnswers[this.currentQuestionIndex] = optionIndex;
        
        // Show immediate feedback if enabled
        if (this.showFeedback) {
            this.showAnswerFeedback(optionIndex, question.correctIndex);
        }
        
        // Update navigation
        this.updateNavigation();
        
        // Auto-advance after a short delay if this is the correct answer
        if (optionIndex === question.correctIndex && this.showFeedback) {
            setTimeout(() => {
                if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
                    this.nextQuestion();
                } else {
                    this.finishQuiz();
                }
            }, 1500);
        }
    }

    /**
     * Show feedback for the selected answer
     * @param {number} selectedIndex - User's selected answer index
     * @param {number} correctIndex - Correct answer index
     */
    showAnswerFeedback(selectedIndex, correctIndex) {
        const options = this.optionsList.querySelectorAll('.option-item');
        const isCorrect = selectedIndex === correctIndex;
        
        // Highlight correct answer
        options[correctIndex].classList.add('correct');
        
        // Highlight incorrect selection if wrong
        if (!isCorrect) {
            options[selectedIndex].classList.add('incorrect');
        }
        
        // Show feedback message
        this.feedback.innerHTML = isCorrect 
            ? '<strong>Correct!</strong> Well done.' 
            : `<strong>Incorrect.</strong> The correct answer is: ${this.currentQuiz.questions[this.currentQuestionIndex].options[correctIndex]}`;
        
        this.feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    }

    /**
     * Move to the previous question
     */
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.renderCurrentQuestion();
            this.updateProgress();
            this.updateNavigation();
        }
    }

    /**
     * Move to the next question
     */
    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
            this.currentQuestionIndex++;
            this.renderCurrentQuestion();
            this.updateProgress();
            this.updateNavigation();
        } else {
            this.finishQuiz();
        }
    }

    /**
     * Update progress bar and text
     */
    updateProgress() {
        const progress = ((this.currentQuestionIndex + 1) / this.currentQuiz.questions.length) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.progressText.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.currentQuiz.questions.length}`;
    }

    /**
     * Update navigation button states
     */
    updateNavigation() {
        this.prevBtn.disabled = this.currentQuestionIndex === 0;
        
        const hasAnswered = this.userAnswers[this.currentQuestionIndex] >= 0;
        const isLastQuestion = this.currentQuestionIndex === this.currentQuiz.questions.length - 1;
        
        this.nextBtn.disabled = !hasAnswered;
        this.nextBtn.textContent = isLastQuestion ? 'Finish' : 'Next';
    }

    /**
     * Finish the quiz and show results
     */
    finishQuiz() {
        const endTime = Date.now();
        const timeTaken = Math.floor((endTime - this.startTime) / 1000);
        
        // Calculate score
        const correctAnswers = this.currentQuiz.questions.map(q => q.correctIndex);
        const score = window.ScoringUtils.calculateScore(this.userAnswers, correctAnswers);
        const questionResults = window.ScoringUtils.generateQuestionResults(this.currentQuiz, this.userAnswers);
        
        // Display results
        this.displayResults(score, questionResults, timeTaken);
        
        // Save result to localStorage
        localStorageManager.saveResult({
            quizId: this.currentQuiz.id,
            quizTitle: this.currentQuiz.quizTitle,
            score: score,
            timeTaken: timeTaken,
            userAnswers: this.userAnswers,
            questionResults: questionResults
        });
    }

    /**
     * Display quiz results
     * @param {Object} score - Score object
     * @param {Array} questionResults - Detailed results for each question
     * @param {number} timeTaken - Time taken in seconds
     */
    displayResults(score, questionResults, timeTaken) {
        // Update score display
        this.scorePercentage.textContent = `${score.percentage}%`;
        this.scoreText.textContent = `You scored ${score.correct} out of ${score.total}`;
        this.scoreGrade.textContent = `Grade: ${score.grade}`;
        
        // Update score circle color based on grade
        const scoreCircle = this.scorePercentage.parentElement;
        scoreCircle.style.background = this.getGradeColor(score.grade);
        
        // Generate question review
        this.reviewList.innerHTML = '';
        questionResults.forEach((result, index) => {
            const reviewItem = document.createElement('div');
            reviewItem.className = `review-item ${result.isCorrect ? 'correct' : 'incorrect'}`;
            
            reviewItem.innerHTML = `
                <div class="review-question">
                    <strong>Question ${index + 1}:</strong> ${result.questionText}
                </div>
                <div class="review-answer">
                    <div><strong>Your answer:</strong> ${result.userAnswer}</div>
                    <div><strong>Correct answer:</strong> ${result.correctAnswer}</div>
                    ${result.isCorrect ? '<div class="review-status">✓ Correct</div>' : '<div class="review-status">✗ Incorrect</div>'}
                </div>
            `;
            
            this.reviewList.appendChild(reviewItem);
        });
        
        // Show/hide save button based on whether this is a generated quiz
        if (this.currentQuiz.isGenerated) {
            this.saveQuizBtn.style.display = 'inline-flex';
        } else {
            this.saveQuizBtn.style.display = 'none';
        }
        
        this.showView('results');
    }

    /**
     * Get color for grade
     * @param {string} grade - Letter grade
     * @returns {string} CSS color value
     */
    getGradeColor(grade) {
        const colors = {
            'A': '#10b981',
            'B': '#059669',
            'C': '#f59e0b',
            'D': '#d97706',
            'F': '#ef4444'
        };
        return colors[grade] || '#6b7280';
    }

    /**
     * Quit the current quiz
     */
    quitQuiz() {
        if (confirm('Are you sure you want to quit this quiz? Your progress will be lost.')) {
            this.goHome();
        }
    }

    /**
     * Retake the current quiz
     */
    retakeQuiz() {
        if (this.currentQuiz) {
            this.startQuiz(this.currentQuiz);
        }
    }

    /**
     * Save the current generated quiz to localStorage
     */
    saveCurrentQuiz() {
        if (!this.currentQuiz) return;
        
        try {
            // Remove the isGenerated flag and add metadata
            const quizToSave = {
                ...this.currentQuiz,
                isGenerated: false,
                savedAt: new Date().toISOString()
            };
            
            const quizId = localStorageManager.saveQuiz(quizToSave);
            this.showToast('Quiz saved successfully!', 'success');
            
            // Update save button
            this.saveQuizBtn.textContent = 'Saved!';
            this.saveQuizBtn.disabled = true;
            
        } catch (error) {
            console.error('Error saving quiz:', error);
            this.showToast('Failed to save quiz', 'error');
        }
    }

    /**
     * Go back to home view
     */
    goHome() {
        this.showView('home');
        // Trigger home view update
        if (window.app && window.app.showHomeView) {
            window.app.showHomeView();
        }
    }

    /**
     * Show a specific view
     * @param {string} viewName - Name of the view to show
     */
    showView(viewName) {
        const views = document.querySelectorAll('.view');
        views.forEach(view => view.classList.remove('active'));
        
        const targetView = document.getElementById(`${viewName}View`);
        if (targetView) {
            targetView.classList.add('active');
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        this.showToast(message, 'error');
    }

    /**
     * Show toast notification
     * @param {string} message - Message to show
     * @param {string} type - Toast type (success, error, info)
     */
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }

    /**
     * Toggle feedback mode
     * @param {boolean} enabled - Whether to show immediate feedback
     */
    setFeedbackMode(enabled) {
        this.showFeedback = enabled;
    }
}

// Create global instance
const quizRenderer = new QuizRenderer();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizRenderer;
} else {
    window.QuizRenderer = QuizRenderer;
    window.quizRenderer = quizRenderer;
}