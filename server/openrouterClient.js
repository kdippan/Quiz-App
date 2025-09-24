/* server/openrouterClient.js */
const fetch = require('node-fetch');

const OPENROUTER_KEY = process.env.OPENROUTER_KEY;

/**
 * Calls the OpenRouter API with the given prompt
 * @param {string} prompt - The prompt to send to the API
 * @returns {Promise<Object>} - The API response
 */
async function callOpenRouter(prompt) {
  if (!OPENROUTER_KEY) {
    throw new Error('Missing OPENROUTER_KEY in environment variables');
  }

  try {
    const response = await fetch('https://api.openrouter.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer': 'http://localhost:4000', // Optional: helps with tracking
        'X-Title': 'Interactive Quiz App' // Optional: helps with tracking
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

module.exports = { 
  callOpenRouter 
};