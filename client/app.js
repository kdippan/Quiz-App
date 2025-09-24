/* app.js - Main Application Controller */

/**
 * Main Application Class
 * Manages the overall application state and navigation
 */
class QuizApp {
    constructor() {
        this.currentView = 'home';
        
        this.initializeElements();
        this.bindEvents();
        this.showHomeView();
    }

    /**
     * Initialize DOM element references
     */
    initializeElements() {
        // Navigation
        this.homeBtn = document.getElementById('homeBtn');
        this.myQuizzesBtn = document.getElementById('myQuizzesBtn');
        
        // Views
        this.homeView = document.getElementById('homeView');
        this.myQuizzesView = document.getElementById('myQuizzesView');
        
        // Home view elements
        this.generateForm = document.getElementById('generateForm');
        this.topicInput = document.getElementById('topicInput');
        this.questionsCount = document.getElementById('questionsCount');
        this.difficulty = document.getElementById('difficulty');
        this.generateBtn = document.getElementById('generateBtn');
        this.createCustomBtn = document.getElementById('createCustomBtn');
        this.savedQuizzesList = document.getElementById('savedQuizzesList');
        
        // My Quizzes view elements
        this.myQuizzesGrid = document.getElementById('myQuizzesGrid');
        this.emptyQuizzesState = document.getElementById('emptyQuizzesState');
        this.createFirstQuizBtn = document.getElementById('createFirstQuizBtn');
        
        // Loading overlay
        this.loadingOverlay = document.getElementById('loadingOverlay');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Navigation
        this.homeBtn.addEventListener('click', () => this.showHomeView());
        this.myQuizzesBtn.addEventListener('click', () => this.showMyQuizzesView());
        
        // Home view
        this.generateForm.addEventListener('submit', (e) => this.handleGenerateQuiz(e));
        this.createCustomBtn.addEventListener('click', () => this.createCustomQuiz());
        this.createFirstQuizBtn.addEventListener('click', () => this.createCustomQuiz());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    /**
     * Show the home view
     */
    showHomeView() {
        this.setActiveView('home');
        this.updateNavigation('home');
        this.loadSavedQuizzes();
    }

    /**
     * Show the my quizzes view
     */
    showMyQuizzesView() {
        this.setActiveView('myQuizzes');
        this.updateNavigation('myQuizzes');
        this.loadMyQuizzes();
    }

    /**
     * Set the active view
     * @param {string} viewName - Name of the view to show
     */
    setActiveView(viewName) {
        const views = document.querySelectorAll('.view');
        views.forEach(view => view.classList.remove('active'));
        
        const targetView = document.getElementById(`${viewName}View`);
        if (targetView) {
            targetView.classList.add('active');
            this.currentView = viewName;
        }
    }

    /**
     * Update navigation button states
     * @param {string} activeView - Currently active view
     */
    updateNavigation(activeView) {
        // Reset all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.removeAttribute('aria-current');
        });
        
        // Set active button
        if (activeView === 'home') {
            this.homeBtn.setAttribute('aria-current', 'page');
        } else if (activeView === 'myQuizzes') {
            this.myQuizzesBtn.setAttribute('aria-current', 'page');
        }
    }

    /**
     * Handle quiz generation form submission
     * @param {Event} e - Form submit event
     */
    async handleGenerateQuiz(e) {
        e.preventDefault();
        
        const topic = this.topicInput.value.trim();
        const count = parseInt(this.questionsCount.value);
        const difficultyLevel = this.difficulty.value;
        
        if (!topic) {
            this.showToast('Please enter a topic', 'error');
            this.topicInput.focus();
            return;
        }
        
        try {
            this.showLoading(true);
            this.setGenerateButtonLoading(true);
            
            const quiz = await this.generateQuizFromServer(topic, count, difficultyLevel);
            
            if (quiz && quiz.questions && quiz.questions.length > 0) {
                // Mark as generated quiz
                quiz.isGenerated = true;
                quiz.id = this.generateId();
                
                // Start the quiz
                window.quizRenderer.startQuiz(quiz);
                this.showToast('Quiz generated successfully!', 'success');
            } else {
                throw new Error('Invalid quiz format received');
            }
            
        } catch (error) {
            console.error('Quiz generation error:', error);
            this.showToast(error.message || 'Failed to generate quiz. Please try again.', 'error');
        } finally {
            this.showLoading(false);
            this.setGenerateButtonLoading(false);
        }
    }

    /**
     * Generate quiz from server API
     * @param {string} topic - Quiz topic
     * @param {number} count - Number of questions
     * @param {string} difficulty - Difficulty level
     * @returns {Promise<Object>} Quiz object
     */
    async generateQuizFromServer(topic, count, difficulty) {
        const response = await fetch('/api/generate-quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topic,
                number_of_questions: count,
                difficulty
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to generate quiz');
        }
        
        return data.quiz;
    }

    /**
     * Create a new custom quiz
     */
    createCustomQuiz() {
        window.quizCreator.startNewQuiz();
    }

    /**
     * Load and display saved quizzes in home view
     */
    loadSavedQuizzes() {
        const quizzes = localStorageManager.getAllQuizzes();
        this.savedQuizzesList.innerHTML = '';
        
        if (quizzes.length === 0) {
            this.savedQuizzesList.innerHTML = `
                <div class="empty-state">
                    <p class="empty-text">No saved quizzes yet.</p>
                </div>
            `;
            return;
        }
        
        // Show latest 5 quizzes
        const recentQuizzes = quizzes
            .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
            .slice(0, 5);
        
        recentQuizzes.forEach(quiz => {
            const quizItem = document.createElement('div');
            quizItem.className = 'saved-quiz-item';
            
            quizItem.innerHTML = `
                <div>
                    <div class="saved-quiz-title">${this.escapeHtml(quiz.quizTitle)}</div>
                    <div class="saved-quiz-meta">${quiz.questions.length} questions</div>
                </div>
                <div class="saved-quiz-actions">
                    <button class="btn btn-primary" onclick="app.takeQuiz('${quiz.id}')">Take</button>
                    <button class="btn btn-secondary" onclick="app.editQuiz('${quiz.id}')">Edit</button>
                </div>
            `;
            
            this.savedQuizzesList.appendChild(quizItem);
        });
        
        // Add "View All" link if there are more quizzes
        if (quizzes.length > 5) {
            const viewAllItem = document.createElement('div');
            viewAllItem.className = 'saved-quiz-item';
            viewAllItem.innerHTML = `
                <div>
                    <div class="saved-quiz-title">View all quizzes</div>
                    <div class="saved-quiz-meta">${quizzes.length} total quizzes</div>
                </div>
                <div class="saved-quiz-actions">
                    <button class="btn btn-secondary" onclick="app.showMyQuizzesView()">View All</button>
                </div>
            `;
            this.savedQuizzesList.appendChild(viewAllItem);
        }
    }

    /**
     * Load and display all quizzes in my quizzes view
     */
    loadMyQuizzes() {
        const quizzes = localStorageManager.getAllQuizzes();
        this.myQuizzesGrid.innerHTML = '';
        
        if (quizzes.length === 0) {
            this.emptyQuizzesState.classList.remove('hidden');
            this.myQuizzesGrid.classList.add('hidden');
            return;
        }
        
        this.emptyQuizzesState.classList.add('hidden');
        this.myQuizzesGrid.classList.remove('hidden');
        
        // Sort quizzes by most recent first
        const sortedQuizzes = quizzes.sort((a, b) => 
            new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        );
        
        sortedQuizzes.forEach(quiz => {
            const quizCard = document.createElement('div');
            quizCard.className = 'quiz-card';
            
            const createdDate = new Date(quiz.createdAt).toLocaleDateString();
            const updatedDate = quiz.updatedAt ? new Date(quiz.updatedAt).toLocaleDateString() : null;
            
            quizCard.innerHTML = `
                <div class="quiz-card-title">${this.escapeHtml(quiz.quizTitle)}</div>
                <div class="quiz-card-meta">
                    ${quiz.questions.length} questions • Created ${createdDate}
                    ${updatedDate && updatedDate !== createdDate ? ` • Updated ${updatedDate}` : ''}
                </div>
                <div class="quiz-card-actions">
                    <button class="btn btn-primary" onclick="app.takeQuiz('${quiz.id}')">Take Quiz</button>
                    <button class="btn btn-secondary" onclick="app.editQuiz('${quiz.id}')">Edit</button>
                    <button class="btn btn-text" onclick="app.deleteQuiz('${quiz.id}', '${this.escapeHtml(quiz.quizTitle)}')">Delete</button>
                </div>
            `;
            
            this.myQuizzesGrid.appendChild(quizCard);
        });
    }

    /**
     * Take a saved quiz
     * @param {string} quizId - ID of the quiz to take
     */
    takeQuiz(quizId) {
        const quiz = localStorageManager.getQuiz(quizId);
        if (quiz) {
            window.quizRenderer.startQuiz(quiz);
        } else {
            this.showToast('Quiz not found', 'error');
        }
    }

    /**
     * Edit a saved quiz
     * @param {string} quizId - ID of the quiz to edit
     */
    editQuiz(quizId) {
        const quiz = localStorageManager.getQuiz(quizId);
        if (quiz) {
            window.quizCreator.startEditQuiz(quiz);
        } else {
            this.showToast('Quiz not found', 'error');
        }
    }

    /**
     * Delete a saved quiz
     * @param {string} quizId - ID of the quiz to delete
     * @param {string} quizTitle - Title of the quiz (for confirmation)
     */
    deleteQuiz(quizId, quizTitle) {
        if (confirm(`Are you sure you want to delete "${quizTitle}"? This action cannot be undone.`)) {
            if (localStorageManager.deleteQuiz(quizId)) {
                this.showToast('Quiz deleted successfully', 'success');
                this.loadMyQuizzes();
                this.loadSavedQuizzes(); // Refresh home view as well
            } else {
                this.showToast('Failed to delete quiz', 'error');
            }
        }
    }

    /**
     * Show/hide loading overlay
     * @param {boolean} show - Whether to show loading
     */
    showLoading(show) {
        if (show) {
            this.loadingOverlay.classList.remove('hidden');
        } else {
            this.loadingOverlay.classList.add('hidden');
        }
    }

    /**
     * Set generate button loading state
     * @param {boolean} loading - Whether button is loading
     */
    setGenerateButtonLoading(loading) {
        const btnText = this.generateBtn.querySelector('.btn-text');
        const btnLoading = this.generateBtn.querySelector('.btn-loading');
        
        if (loading) {
            this.generateBtn.disabled = true;
            btnText.classList.add('hidden');
            btnLoading.classList.remove('hidden');
        } else {
            this.generateBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
        }
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + N: New quiz
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.createCustomQuiz();
        }
        
        // Escape: Go home
        if (e.key === 'Escape' && this.currentView !== 'home') {
            this.showHomeView();
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
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Generate a unique ID
     * @returns {string} Unique identifier
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Import quizzes from JSON file
     * @param {File} file - JSON file to import
     */
    async importQuizzes(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            localStorageManager.importData(data, true);
            this.showToast('Quizzes imported successfully!', 'success');
            this.loadMyQuizzes();
            this.loadSavedQuizzes();
        } catch (error) {
            console.error('Import error:', error);
            this.showToast('Failed to import quizzes', 'error');
        }
    }

    /**
     * Export all quizzes as JSON file
     */
    exportQuizzes() {
        try {
            const data = localStorageManager.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `quiz-app-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            this.showToast('Quizzes exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showToast('Failed to export quizzes', 'error');
        }
    }

    /**
     * Check if localStorage is available and warn if not
     */
    checkStorageAvailability() {
        if (!localStorageManager.isAvailable()) {
            this.showToast('Local storage is not available. Quiz data will not be saved.', 'error');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new QuizApp();
    window.app.checkStorageAvailability();
    
    // Add some helpful console messages
    console.log('🎯 Quiz App loaded successfully!');
    console.log('💡 Tip: Press Ctrl+N (or Cmd+N) to create a new quiz');
    console.log('💡 Tip: Press Escape to go back to home');
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizApp;
}