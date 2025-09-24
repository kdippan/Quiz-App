/* server/routes/generateQuiz.js */
const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('../openrouterClient');
const { validateQuizRequest } = require('../middleware/validateRequest');

/**
 * POST /api/generate-quiz
 * Generates a quiz using the OpenRouter API
 */
router.post('/', validateQuizRequest, async (req, res) => {
  try {
    const { topic, number_of_questions, difficulty } = req.body;

    // Create the prompt for OpenRouter
    const userPrompt = `You are an assistant that returns a JSON array of multiple-choice questions. 

Generate ${number_of_questions} multiple-choice questions about "${topic}". 
Difficulty level: ${difficulty}

Return JSON only with this exact structure:
{
  "quizTitle": "A descriptive title for the quiz",
  "questions": [
    {
      "id": "q1",
      "questionText": "The question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 1
    }
  ]
}

Requirements:
- Each question must have 4 options
- correctIndex is the 0-based index of the correct answer
- Questions should be clear and unambiguous
- Options should be plausible but only one correct
- Do not include explanations
- Return valid JSON only`;

    console.log('Calling OpenRouter API for topic:', topic);
    const apiResponse = await callOpenRouter(userPrompt);

    // Extract the assistant's response
    const assistantText = apiResponse?.choices?.[0]?.message?.content;
    
    if (!assistantText) {
      throw new Error('No response content from OpenRouter API');
    }

    // Parse the JSON response
    let parsedQuiz;
    try {
      // Clean the response text in case there's extra formatting
      const cleanText = assistantText.replace(/```json\n?|\n?```/g, '').trim();
      parsedQuiz = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Failed to parse OpenRouter response:', assistantText);
      throw new Error('Invalid JSON response from AI service');
    }

    // Validate the parsed quiz structure
    if (!parsedQuiz.quizTitle || !Array.isArray(parsedQuiz.questions)) {
      throw new Error('Invalid quiz format from AI service');
    }

    // Validate each question
    parsedQuiz.questions.forEach((question, index) => {
      if (!question.id || !question.questionText || !Array.isArray(question.options) || 
          typeof question.correctIndex !== 'number' || 
          question.options.length < 2 || 
          question.correctIndex < 0 || 
          question.correctIndex >= question.options.length) {
        throw new Error(`Invalid question format at index ${index}`);
      }
    });

    console.log('Successfully generated quiz:', parsedQuiz.quizTitle);
    res.json({ 
      success: true, 
      quiz: parsedQuiz 
    });

  } catch (error) {
    console.error('Quiz generation error:', error);
    
    // Return user-friendly error messages
    let errorMessage = 'Failed to generate quiz';
    if (error.message.includes('OPENROUTER_KEY')) {
      errorMessage = 'API key not configured. Please check server configuration.';
    } else if (error.message.includes('OpenRouter API error')) {
      errorMessage = 'External API service error. Please try again later.';
    } else if (error.message.includes('Invalid JSON') || error.message.includes('Invalid quiz format')) {
      errorMessage = 'Received invalid response from AI service. Please try again.';
    }

    res.status(500).json({ 
      success: false, 
      error: errorMessage 
    });
  }
});

module.exports = router;