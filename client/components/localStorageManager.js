/* components/localStorageManager.js */

/**
 * LocalStorage manager for quiz data
 * Handles CRUD operations for custom quizzes
 */
class LocalStorageManager {
    constructor() {
        this.QUIZZES_KEY = 'quiz-app-quizzes';
        this.RESULTS_KEY = 'quiz-app-results';
    }

    /**
     * Get all saved quizzes
     * @returns {Array} Array of quiz objects
     */
    getAllQuizzes() {
        try {
            const data = localStorage.getItem(this.QUIZZES_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading quizzes from localStorage:', error);
            return [];
        }
    }

    /**
     * Save a quiz to localStorage
     * @param {Object} quiz - Quiz object to save
     * @returns {string} - Generated quiz ID
     */
    saveQuiz(quiz) {
        try {
            const quizzes = this.getAllQuizzes();
            const quizId = quiz.id || this.generateId();
            
            const quizToSave = {
                ...quiz,
                id: quizId,
                createdAt: quiz.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Check if quiz already exists (update scenario)
            const existingIndex = quizzes.findIndex(q => q.id === quizId);
            if (existingIndex >= 0) {
                quizzes[existingIndex] = quizToSave;
            } else {
                quizzes.push(quizToSave);
            }

            localStorage.setItem(this.QUIZZES_KEY, JSON.stringify(quizzes));
            return quizId;
        } catch (error) {
            console.error('Error saving quiz to localStorage:', error);
            throw new Error('Failed to save quiz');
        }
    }

    /**
     * Get a specific quiz by ID
     * @param {string} quizId - Quiz ID
     * @returns {Object|null} Quiz object or null if not found
     */
    getQuiz(quizId) {
        try {
            const quizzes = this.getAllQuizzes();
            return quizzes.find(quiz => quiz.id === quizId) || null;
        } catch (error) {
            console.error('Error loading quiz from localStorage:', error);
            return null;
        }
    }

    /**
     * Delete a quiz by ID
     * @param {string} quizId - Quiz ID to delete
     * @returns {boolean} Success status
     */
    deleteQuiz(quizId) {
        try {
            const quizzes = this.getAllQuizzes();
            const filteredQuizzes = quizzes.filter(quiz => quiz.id !== quizId);
            
            if (filteredQuizzes.length === quizzes.length) {
                return false; // Quiz not found
            }
            
            localStorage.setItem(this.QUIZZES_KEY, JSON.stringify(filteredQuizzes));
            return true;
        } catch (error) {
            console.error('Error deleting quiz from localStorage:', error);
            return false;
        }
    }

    /**
     * Update an existing quiz
     * @param {string} quizId - Quiz ID to update
     * @param {Object} updatedQuiz - Updated quiz data
     * @returns {boolean} Success status
     */
    updateQuiz(quizId, updatedQuiz) {
        try {
            const quizzes = this.getAllQuizzes();
            const quizIndex = quizzes.findIndex(quiz => quiz.id === quizId);
            
            if (quizIndex === -1) {
                return false; // Quiz not found
            }
            
            quizzes[quizIndex] = {
                ...quizzes[quizIndex],
                ...updatedQuiz,
                id: quizId, // Ensure ID doesn't change
                updatedAt: new Date().toISOString()
            };
            
            localStorage.setItem(this.QUIZZES_KEY, JSON.stringify(quizzes));
            return true;
        } catch (error) {
            console.error('Error updating quiz in localStorage:', error);
            return false;
        }
    }

    /**
     * Save quiz result/score
     * @param {Object} result - Result object with quiz info and score
     */
    saveResult(result) {
        try {
            const results = this.getAllResults();
            const resultToSave = {
                ...result,
                id: this.generateId(),
                timestamp: new Date().toISOString()
            };
            
            results.push(resultToSave);
            
            // Keep only last 50 results to prevent localStorage bloat
            const trimmedResults = results.slice(-50);
            localStorage.setItem(this.RESULTS_KEY, JSON.stringify(trimmedResults));
        } catch (error) {
            console.error('Error saving result to localStorage:', error);
        }
    }

    /**
     * Get all quiz results
     * @returns {Array} Array of result objects
     */
    getAllResults() {
        try {
            const data = localStorage.getItem(this.RESULTS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading results from localStorage:', error);
            return [];
        }
    }

    /**
     * Get results for a specific quiz
     * @param {string} quizId - Quiz ID
     * @returns {Array} Array of result objects for the quiz
     */
    getQuizResults(quizId) {
        return this.getAllResults().filter(result => result.quizId === quizId);
    }

    /**
     * Clear all data from localStorage
     */
    clearAll() {
        try {
            localStorage.removeItem(this.QUIZZES_KEY);
            localStorage.removeItem(this.RESULTS_KEY);
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }

    /**
     * Export all data as JSON
     * @returns {Object} Object containing all quizzes and results
     */
    exportData() {
        return {
            quizzes: this.getAllQuizzes(),
            results: this.getAllResults(),
            exportDate: new Date().toISOString()
        };
    }

    /**
     * Import data from JSON
     * @param {Object} data - Data object to import
     * @param {boolean} merge - Whether to merge with existing data or replace
     */
    importData(data, merge = false) {
        try {
            if (!merge) {
                this.clearAll();
            }
            
            if (data.quizzes && Array.isArray(data.quizzes)) {
                const existingQuizzes = merge ? this.getAllQuizzes() : [];
                const allQuizzes = [...existingQuizzes, ...data.quizzes];
                localStorage.setItem(this.QUIZZES_KEY, JSON.stringify(allQuizzes));
            }
            
            if (data.results && Array.isArray(data.results)) {
                const existingResults = merge ? this.getAllResults() : [];
                const allResults = [...existingResults, ...data.results];
                localStorage.setItem(this.RESULTS_KEY, JSON.stringify(allResults));
            }
        } catch (error) {
            console.error('Error importing data:', error);
            throw new Error('Failed to import data');
        }
    }

    /**
     * Generate a unique ID
     * @returns {string} Unique identifier
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Check if localStorage is available
     * @returns {boolean} localStorage availability
     */
    isAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get storage usage information
     * @returns {Object} Storage usage stats
     */
    getStorageInfo() {
        try {
            const quizzes = this.getAllQuizzes();
            const results = this.getAllResults();
            const quizzesSize = JSON.stringify(quizzes).length;
            const resultsSize = JSON.stringify(results).length;
            
            return {
                quizCount: quizzes.length,
                resultCount: results.length,
                quizzesSize,
                resultsSize,
                totalSize: quizzesSize + resultsSize
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return null;
        }
    }
}

// Create global instance
const localStorageManager = new LocalStorageManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = LocalStorageManager;
} else {
    // Browser environment - attach to window
    window.LocalStorageManager = LocalStorageManager;
    window.localStorageManager = localStorageManager;
}