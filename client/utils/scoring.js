/* utils/scoring.js */

/**
 * Calculates the quiz score based on user answers and correct answers
 * @param {Array} userAnswers - Array of user selected answer indices
 * @param {Array} correctAnswers - Array of correct answer indices
 * @returns {Object} - Score object with percentage, count, total, and grade
 */
function calculateScore(userAnswers, correctAnswers) {
    if (!Array.isArray(userAnswers) || !Array.isArray(correctAnswers)) {
        throw new Error('Both userAnswers and correctAnswers must be arrays');
    }
    
    if (userAnswers.length !== correctAnswers.length) {
        throw new Error('User answers and correct answers arrays must have the same length');
    }
    
    const total = correctAnswers.length;
    let correct = 0;
    
    for (let i = 0; i < total; i++) {
        if (userAnswers[i] === correctAnswers[i]) {
            correct++;
        }
    }
    
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const grade = getGrade(percentage);
    
    return {
        correct,
        total,
        percentage,
        grade,
        passed: percentage >= 60 // 60% passing threshold
    };
}

/**
 * Determines the letter grade based on percentage score
 * @param {number} percentage - Score percentage (0-100)
 * @returns {string} - Letter grade
 */
function getGrade(percentage) {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
}

/**
 * Generates detailed results for each question
 * @param {Object} quiz - Quiz object with questions
 * @param {Array} userAnswers - Array of user selected answer indices
 * @returns {Array} - Array of result objects for each question
 */
function generateQuestionResults(quiz, userAnswers) {
    if (!quiz || !quiz.questions || !Array.isArray(userAnswers)) {
        throw new Error('Invalid quiz or userAnswers provided');
    }
    
    return quiz.questions.map((question, index) => {
        const userAnswerIndex = userAnswers[index];
        const correctIndex = question.correctIndex;
        const isCorrect = userAnswerIndex === correctIndex;
        
        return {
            questionId: question.id,
            questionText: question.questionText,
            options: question.options,
            userAnswerIndex,
            correctIndex,
            userAnswer: userAnswerIndex >= 0 ? question.options[userAnswerIndex] : 'No answer',
            correctAnswer: question.options[correctIndex],
            isCorrect,
            answered: userAnswerIndex >= 0
        };
    });
}

/**
 * Validates if all questions in a quiz are answered
 * @param {Array} userAnswers - Array of user selected answer indices
 * @returns {Object} - Validation result with status and missing questions
 */
function validateAnswers(userAnswers) {
    const unanswered = [];
    
    userAnswers.forEach((answer, index) => {
        if (answer === null || answer === undefined || answer < 0) {
            unanswered.push(index + 1);
        }
    });
    
    return {
        isComplete: unanswered.length === 0,
        unanswered,
        totalAnswered: userAnswers.length - unanswered.length,
        totalQuestions: userAnswers.length
    };
}

/**
 * Formats time in seconds to MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        calculateScore,
        getGrade,
        generateQuestionResults,
        validateAnswers,
        formatTime
    };
} else {
    // Browser environment - attach to window
    window.ScoringUtils = {
        calculateScore,
        getGrade,
        generateQuestionResults,
        validateAnswers,
        formatTime
    };
}