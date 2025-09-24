/* api/generate-quiz.js - Vercel serverless function */
const fetch = require('node-fetch');

// OpenRouter client function
async function callOpenRouter(prompt) {
  const OPENROUTER_KEY = process.env.OPENROUTER_KEY;
  
  if (!OPENROUTER_KEY) {
    throw new Error('Missing OPENROUTER_KEY in environment variables');
  }

  try {
    const response = await fetch('https://api.openrouter.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer': 'https://quiz-app.vercel.app',
        'X-Title': 'Interactive Quiz App'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ 
          role: 'user', 
          content: prompt 
        }],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('OpenRouter client error:', error);
    throw error;
  }
}

// Validation function
function validateQuizRequest(body) {
  const { topic, number_of_questions, difficulty } = body;

  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    throw new Error('Topic is required and must be a non-empty string');
  }

  const numQuestions = parseInt(number_of_questions, 10);
  if (isNaN(numQuestions) || numQuestions < 1 || numQuestions > 20) {
    throw new Error('Number of questions must be between 1 and 20');
  }

  const validDifficulties = ['easy', 'medium', 'hard'];
  if (difficulty && !validDifficulties.includes(difficulty.toLowerCase())) {
    throw new Error('Difficulty must be one of: easy, medium, hard');
  }

  return {
    topic: topic.trim(),
    number_of_questions: numQuestions,
    difficulty: (difficulty || 'easy').toLowerCase()
  };
}

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { topic, number_of_questions, difficulty } = validateQuizRequest(req.body);

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

    const assistantText = apiResponse?.choices?.[0]?.message?.content;
    
    if (!assistantText) {
      throw new Error('No response content from OpenRouter API');
    }

    let parsedQuiz;
    try {
      const cleanText = assistantText.replace(/```json\n?|\n?```/g, '').trim();
      parsedQuiz = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Failed to parse OpenRouter response:', assistantText);
      throw new Error('Invalid JSON response from AI service');
    }

    if (!parsedQuiz.quizTitle || !Array.isArray(parsedQuiz.questions)) {
      throw new Error('Invalid quiz format from AI service');
    }

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
    
    res.status(200).json({ 
      success: true, 
      quiz: parsedQuiz 
    });

  } catch (error) {
    console.error('Quiz generation error:', error);
    
    let errorMessage = 'Failed to generate quiz';
    if (error.message.includes('OPENROUTER_KEY')) {
      errorMessage = 'API key not configured. Please check server configuration.';
    } else if (error.message.includes('OpenRouter API error')) {
      errorMessage = 'External API service error. Please try again later.';
    } else if (error.message.includes('Invalid JSON') || error.message.includes('Invalid quiz format')) {
      errorMessage = 'Received invalid response from AI service. Please try again.';
    } else if (error.message.includes('Topic is required') || 
               error.message.includes('Number of questions') || 
               error.message.includes('Difficulty must be')) {
      errorMessage = error.message;
    }

    res.status(500).json({ 
      success: false, 
      error: errorMessage 
    });
  }
}