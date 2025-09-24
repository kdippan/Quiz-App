/* server/middleware/validateRequest.js */

/**
 * Validates the quiz generation request parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function validateQuizRequest(req, res, next) {
  const { topic, number_of_questions, difficulty } = req.body;

  // Validate topic
  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Topic is required and must be a non-empty string'
    });
  }

  // Validate number_of_questions
  const numQuestions = parseInt(number_of_questions, 10);
  if (isNaN(numQuestions) || numQuestions < 1 || numQuestions > 20) {
    return res.status(400).json({
      success: false,
      error: 'Number of questions must be between 1 and 20'
    });
  }

  // Validate difficulty
  const validDifficulties = ['easy', 'medium', 'hard'];
  if (difficulty && !validDifficulties.includes(difficulty.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: 'Difficulty must be one of: easy, medium, hard'
    });
  }

  // Sanitize and normalize the inputs
  req.body.topic = topic.trim();
  req.body.number_of_questions = numQuestions;
  req.body.difficulty = (difficulty || 'easy').toLowerCase();

  next();
}

module.exports = {
  validateQuizRequest
};