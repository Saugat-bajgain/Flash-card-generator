/**
 * OpenRouter Usage and Token Cost Calculator
 *
 * A simple library to calculate the cost of OpenRouter API calls
 * based on token usage from chat completion responses.
 *
 * USAGE:
 *
 *   const { calculateCost } = require('./cost');
 *
 *   // After making an API call, pass the completion response
 *   const completion = await fetch(
 *     'https://openrouter.ai/api/v1/chat/completions',
 *     {
 *       method: 'POST',
 *       headers: {
 *         'Authorization': `Bearer ${API_KEY}`,
 *         'Content-Type': 'application/json'
 *       },
 *       body: JSON.stringify({
 *         model: 'anthropic/claude-3.5-sonnet',
 *         messages: [{ role: 'user', content: 'Hello!' }]
 *       })
 *     }
 *   ).then(r => r.json());
 *
 *   // Calculate the cost
 *   const cost = await calculateCost(completion);
 *   console.log(`Total cost: $${cost.total.toFixed(6)}`);
 *   console.log(`Tokens used: ${cost.tokens.total}`);
 *
 * RETURN VALUE:
 *
 *   {
 *     input: 0.000060,      // Cost for input tokens
 *     output: 0.000225,     // Cost for output tokens
 *     total: 0.000285,      // Total cost
 *     tokens: {
 *       prompt: 20,         // Number of input tokens
 *       completion: 75,     // Number of output tokens
 *       total: 95          // Total tokens
 *     },
 *     model: 'anthropic/claude-3.5-sonnet'
 *   }
 */

/**
 * Fetches pricing information for a specific model from OpenRouter
 * @private
 * @param {string} modelId - The model ID
 * @returns {Promise<{prompt: number, completion: number}>}
 */
async function getModelPricing(modelId) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models');
    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }

    const data = await response.json();
    const model = data.data.find((m) => m.id === modelId);

    if (!model || !model.pricing) {
      console.warn(`No pricing found for ${modelId}`);
      return { prompt: 0, completion: 0 };
    }

    return {
      prompt: parseFloat(model.pricing.prompt) || 0,
      completion: parseFloat(model.pricing.completion) || 0,
    };
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return { prompt: 0, completion: 0 };
  }
}

/**
 * Calculates the cost in USD from a chat completion response
 * @param {Object} completion - The chat completion response
 * @returns {Promise<Object>} Cost breakdown with input, output,
 * total costs and token counts
 */
async function calculateCost(completion) {
  const modelId = completion.model;
  const usage = completion.usage;

  if (!modelId) {
    throw new Error('Completion response missing model field');
  }

  if (!usage) {
    throw new Error('Completion response missing usage field');
  }

  // Fetch pricing for the model used
  const pricing = await getModelPricing(modelId);

  const promptTokens = usage.prompt_tokens || 0;
  const completionTokens = usage.completion_tokens || 0;
  const totalTokens = usage.total_tokens || 0;

  const inputCost = promptTokens * pricing.prompt;
  const outputCost = completionTokens * pricing.completion;
  const totalCost = inputCost + outputCost;

  return {
    input: inputCost,
    output: outputCost,
    total: totalCost,
    tokens: {
      prompt: promptTokens,
      completion: completionTokens,
      total: totalTokens,
    },
    model: modelId,
  };
}

module.exports = { calculateCost };