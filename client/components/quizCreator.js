/* components/quizCreator.js */

/**
 * Quiz Creator - Handles the creation and editing of custom quizzes
 */
class QuizCreator {
    constructor() {
        this.currentQuiz = null;
        this.isEditing = false;
        this.questions = [];
        
        this.initializeElements();
        this.bindEvents();
    }

    /**
     * Initialize DOM element references
     */
    initializeElements() {
        this.creatorView = document.getElementById('creatorView');
        this.creatorForm = document.getElementById('creatorForm');
        this.quizTitleInput = document.getElementById('quizTitle');
        this.questionsList = document.getElementById('questionsList');
        this.addQuestionBtn = document.getElementById('addQuestionBtn');
        this.cancelCreateBtn = document.getElementById('cancelCreateBtn');
        this.cancelCreateBtn2 = document.getElementById('cancelCreateBtn2');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        this.creatorForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.addQuestionBtn.addEventListener('click', () => this.addQuestion());
        this.cancelCreateBtn.addEventListener('click', () => this.cancelCreation());
        this.cancelCreateBtn2.addEventListener('click', () => this.cancelCreation());
    }

    /**
     * Start creating a new quiz
     */
    startNewQuiz() {
        this.currentQuiz = null;
        this.isEditing = false;
        this.questions = [];
        
        this.quizTitleInput.value = '';
        this.questionsList.innerHTML = '';
        
        // Add first question
        this.addQuestion();
        
        this.showView('creator');
        this.quizTitleInput.focus();
    }

    /**
     * Start editing an existing quiz
     * @param {Object} quiz - Quiz object to edit
     */
    startEditQuiz(quiz) {
        this.currentQuiz = quiz;
        this.isEditing = true;
        this.questions = [...quiz.questions];
        
        this.quizTitleInput.value = quiz.quizTitle || '';
        this.renderQuestions();
        
        this.showView('creator');
        this.quizTitleInput.focus();
    }

    /**
     * Add a new question to the quiz
     */
    addQuestion() {
        const questionNumber = this.questions.length + 1;
        const question = {
            id: `q${questionNumber}`,
            questionText: '',
            options: ['', '', '', ''],
            correctIndex: 0
        };
        
        this.questions.push(question);
        this.renderQuestion(question, this.questions.length - 1);
    }

    /**
     * Render all questions
     */
    renderQuestions() {
        this.questionsList.innerHTML = '';
        this.questions.forEach((question, index) => {
            this.renderQuestion(question, index);
        });
    }

    /**
     * Render a single question
     * @param {Object} question - Question object
     * @param {number} index - Question index
     */
    renderQuestion(question, index) {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-creator';
        questionDiv.dataset.index = index;
        
        questionDiv.innerHTML = `
            <div class="question-header">
                <span class="question-number">Question ${index + 1}</span>
                <button type="button" class="remove-question-btn" ${this.questions.length === 1 ? 'disabled' : ''}>
                    Remove
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-text-${index}" class="form-label">Question Text</label>
                <input 
                    type="text" 
                    id="question-text-${index}"
                    class="form-input question-text-input" 
                    placeholder="Enter your question"
                    value="${question.questionText}"
                    required
                >
            </div>
            
            <div class="options-creator">
                <label class="form-label">Answer Options</label>
                ${question.options.map((option, optionIndex) => `
                    <div class="option-creator">
                        <input 
                            type="radio" 
                            id="correct-${index}-${optionIndex}"
                            name="correct-${index}"
                            class="option-radio"
                            value="${optionIndex}"
                            ${question.correctIndex === optionIndex ? 'checked' : ''}
                            aria-label="Mark as correct answer"
                        >
                        <input 
                            type="text" 
                            class="form-input option-input" 
                            placeholder="Option ${optionIndex + 1}"
                            value="${option}"
                            required
                            aria-label="Option ${optionIndex + 1} text"
                        >
                    </div>
                `).join('')}
            </div>
        `;
        
        // Bind events for this question
        this.bindQuestionEvents(questionDiv, index);
        
        this.questionsList.appendChild(questionDiv);
    }

    /**
     * Bind events for a specific question
     * @param {HTMLElement} questionDiv - Question div element
     * @param {number} index - Question index
     */
    bindQuestionEvents(questionDiv, index) {
        // Remove question button
        const removeBtn = questionDiv.querySelector('.remove-question-btn');
        removeBtn.addEventListener('click', () => this.removeQuestion(index));
        
        // Question text input
        const questionTextInput = questionDiv.querySelector('.question-text-input');
        questionTextInput.addEventListener('input', (e) => {
            this.questions[index].questionText = e.target.value;
        });
        
        // Option inputs
        const optionInputs = questionDiv.querySelectorAll('.option-input');
        optionInputs.forEach((input, optionIndex) => {
            input.addEventListener('input', (e) => {
                this.questions[index].options[optionIndex] = e.target.value;
            });
        });
        
        // Correct answer radio buttons
        const radioButtons = questionDiv.querySelectorAll('.option-radio');
        radioButtons.forEach((radio, optionIndex) => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.questions[index].correctIndex = optionIndex;
                }
            });
        });
    }

    /**
     * Remove a question
     * @param {number} index - Index of question to remove
     */
    removeQuestion(index) {
        if (this.questions.length <= 1) {
            this.showToast('A quiz must have at least one question', 'error');
            return;
        }
        
        this.questions.splice(index, 1);
        this.renderQuestions();
    }

    /**
     * Handle form submission
     * @param {Event} e - Form submit event
     */
    handleSubmit(e) {
        e.preventDefault();
        
        const quizTitle = this.quizTitleInput.value.trim();
        if (!quizTitle) {
            this.showToast('Please enter a quiz title', 'error');
            this.quizTitleInput.focus();
            return;
        }
        
        // Validate questions
        const validationResult = this.validateQuestions();
        if (!validationResult.isValid) {
            this.showToast(validationResult.message, 'error');
            return;
        }
        
        // Create quiz object
        const quiz = {
            id: this.currentQuiz ? this.currentQuiz.id : undefined,
            quizTitle,
            questions: [...this.questions],
            isGenerated: false,
            createdBy: 'user'
        };
        
        try {
            // Save quiz
            const quizId = localStorageManager.saveQuiz(quiz);
            
            const message = this.isEditing ? 'Quiz updated successfully!' : 'Quiz created successfully!';
            this.showToast(message, 'success');
            
            // Go back to home or my quizzes view
            setTimeout(() => {
                this.goHome();
            }, 1000);
            
        } catch (error) {
            console.error('Error saving quiz:', error);
            this.showToast('Failed to save quiz', 'error');
        }
    }

    /**
     * Validate all questions
     * @returns {Object} Validation result
     */
    validateQuestions() {
        if (this.questions.length === 0) {
            return {
                isValid: false,
                message: 'A quiz must have at least one question'
            };
        }
        
        for (let i = 0; i < this.questions.length; i++) {
            const question = this.questions[i];
            
            // Check question text
            if (!question.questionText.trim()) {
                return {
                    isValid: false,
                    message: `Question ${i + 1} is missing question text`
                };
            }
            
            // Check options
            const filledOptions = question.options.filter(option => option.trim() !== '');
            if (filledOptions.length < 2) {
                return {
                    isValid: false,
                    message: `Question ${i + 1} must have at least 2 options`
                };
            }
            
            // Check if correct answer option is filled
            const correctOption = question.options[question.correctIndex];
            if (!correctOption || !correctOption.trim()) {
                return {
                    isValid: false,
                    message: `Question ${i + 1}: The selected correct answer option is empty`
                };
            }
        }
        
        return { isValid: true };
    }

    /**
     * Cancel quiz creation/editing
     */
    cancelCreation() {
        if (this.hasUnsavedChanges()) {
            if (!confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                return;
            }
        }
        
        this.goHome();
    }

    /**
     * Check if there are unsaved changes
     * @returns {boolean} True if there are unsaved changes
     */
    hasUnsavedChanges() {
        const quizTitle = this.quizTitleInput.value.trim();
        
        // If editing, compare with original
        if (this.isEditing && this.currentQuiz) {
            if (quizTitle !== this.currentQuiz.quizTitle) return true;
            if (JSON.stringify(this.questions) !== JSON.stringify(this.currentQuiz.questions)) return true;
            return false;
        }
        
        // If creating new, check if any fields are filled
        if (quizTitle) return true;
        
        return this.questions.some(question => {
            if (question.questionText.trim()) return true;
            return question.options.some(option => option.trim());
        });
    }

    /**
     * Go back to home view
     */
    goHome() {
        this.showView('home');
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
     * Import quiz from JSON data
     * @param {Object} quizData - Quiz data to import
     */
    importQuiz(quizData) {
        try {
            if (!quizData.quizTitle || !Array.isArray(quizData.questions)) {
                throw new Error('Invalid quiz format');
            }
            
            this.questions = quizData.questions.map((question, index) => ({
                id: question.id || `q${index + 1}`,
                questionText: question.questionText || '',
                options: Array.isArray(question.options) ? question.options : ['', '', '', ''],
                correctIndex: typeof question.correctIndex === 'number' ? question.correctIndex : 0
            }));
            
            this.quizTitleInput.value = quizData.quizTitle;
            this.renderQuestions();
            
            this.showToast('Quiz imported successfully!', 'success');
        } catch (error) {
            console.error('Error importing quiz:', error);
            this.showToast('Failed to import quiz', 'error');
        }
    }

    /**
     * Export current quiz as JSON
     * @returns {Object} Quiz data object
     */
    exportQuiz() {
        const validationResult = this.validateQuestions();
        if (!validationResult.isValid) {
            this.showToast('Cannot export invalid quiz: ' + validationResult.message, 'error');
            return null;
        }
        
        return {
            quizTitle: this.quizTitleInput.value.trim(),
            questions: [...this.questions],
            exportDate: new Date().toISOString()
        };
    }
}

// Create global instance
const quizCreator = new QuizCreator();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizCreator;
} else {
    window.QuizCreator = QuizCreator;
    window.quizCreator = quizCreator;
}