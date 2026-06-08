import { GoogleGenerativeAI } from '@google/generative-ai';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

/**
 * Auto-detects and selects an installed Ollama model.
 * If the configured model is not available locally, it dynamically falls back to an installed option.
 * @param {string} configuredModel - The model name from settings
 * @param {string} ollamaHost - The Ollama host API URL
 * @returns {Promise<string>} The selected model name
 */
const selectOllamaModel = async (configuredModel, ollamaHost) => {
  try {
    const response = await fetch(`${ollamaHost}/api/tags`);
    if (!response.ok) return configuredModel;

    const data = await response.json();
    if (!data || !data.models || data.models.length === 0) return configuredModel;

    const availableModels = data.models.map((m) => m.name);

    // 1. Exact match check
    if (availableModels.includes(configuredModel)) {
      return configuredModel;
    }

    // 2. Base name check (e.g. configured 'llama3' -> matches 'llama3:latest')
    const configuredBase = configuredModel.split(':')[0];
    const baseMatch = availableModels.find((m) => m.split(':')[0] === configuredBase);
    if (baseMatch) {
      return baseMatch;
    }

    // 3. Fallback prioritization list
    const priorities = [
      'granite3.3:2b',
      'llama3.2',
      'llama3',
      'llama3:latest',
      'llama3:instruct',
      'mistral',
      'gemma',
      'phi3'
    ];

    for (const model of priorities) {
      if (availableModels.includes(model)) {
        console.log(`Configured Ollama model "${configuredModel}" not found. Auto-selecting installed model: "${model}"`);
        return model;
      }
      const base = model.split(':')[0];
      const match = availableModels.find((m) => m.split(':')[0] === base);
      if (match) {
        console.log(`Configured Ollama model "${configuredModel}" not found. Auto-selecting installed model: "${match}"`);
        return match;
      }
    }

    // 4. Default to first available model if no matches
    console.log(`Configured Ollama model "${configuredModel}" not found. Falling back to first available model: "${availableModels[0]}"`);
    return availableModels[0];
  } catch (error) {
    console.error('Error auto-detecting Ollama model:', error.message);
    return configuredModel;
  }
};

/**
 * Fallback Function: Runs rule-based financial calculations when LLMs (Ollama/Gemini) are unavailable.
 * Calculates spending ratios, top categories, risk levels, and forecasts future outlook.
 * @param {string} userId - ID of the target user
 * @returns {Promise<Object>} Calculated financial insights matching the JSON schema
 */
const calculateLocalAnalytics = async (userId) => {
  // Fetch user transactions sorted by date
  const transactions = await Transaction.find({ userId }).sort({ date: -1 });
  const user = await User.findById(userId);
  const budget = user ? user.monthlyBudget : 0;

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryTotals = {};

  // Aggregate totals for income, expenses, and categorize expenses
  transactions.forEach((t) => {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    }
  });

  // Determine the category with the highest spending
  let topCategory = 'None';
  let topCategoryAmount = 0;
  Object.keys(categoryTotals).forEach((cat) => {
    if (categoryTotals[cat] > topCategoryAmount) {
      topCategory = cat;
      topCategoryAmount = categoryTotals[cat];
    }
  });

  // Determine risk level based on configured budget limit or income ratios
  let riskLevel = 'Low';
  let riskExplanation = 'Your spending is well within standard limits and you have a healthy financial buffer.';
  
  if (budget > 0) {
    const budgetRatio = totalExpense / budget;
    if (budgetRatio >= 1.0) {
      riskLevel = 'High';
      riskExplanation = `You have exceeded your monthly budget of ₹${budget} by ${(budgetRatio * 100 - 100).toFixed(0)}%. Immediate spending cuts are advised.`;
    } else if (budgetRatio >= 0.8) {
      riskLevel = 'Medium';
      riskExplanation = `You have consumed ${(budgetRatio * 100).toFixed(0)}% of your monthly budget of ₹${budget}. Monitor your upcoming bills closely.`;
    }
  } else if (totalExpense > totalIncome * 0.9 && totalIncome > 0) {
    riskLevel = 'High';
    riskExplanation = 'Your expenses consume over 90% of your total income. You are saving very little to no money.';
  } else if (totalExpense > totalIncome * 0.7 && totalIncome > 0) {
    riskLevel = 'Medium';
    riskExplanation = 'Your expenses represent over 70% of your income. You may want to review optional subscriptions or leisure items.';
  }

  // Calculate future forecast forecast
  let futureOutlook = 'Your budget is stable. Continue maintaining your current category distribution.';
  if (totalExpense > totalIncome && totalIncome > 0) {
    futureOutlook = 'At your current rate of spending, your balance will continue to decrease. We recommend aiming to reduce expenses by 15% next month.';
  } else if (totalIncome > 0 && totalExpense < totalIncome * 0.5) {
    futureOutlook = 'Excellent financial discipline! If you continue at this rate, you are on track to save over 50% of your income.';
  }

  // Generate actionable financial tips list
  const tips = [
    'Always try to save at least 20% of your total monthly income.',
    'Review recurring direct debits or subscription services you no longer use.',
  ];

  if (topCategory !== 'None') {
    tips.unshift(`Your top expense category is "${topCategory}" (₹${topCategoryAmount.toFixed(2)}). Consider researching cheaper alternatives or cooking more meals at home.`);
  }
  if (budget > 0 && totalExpense > budget * 0.5) {
    tips.push('Set up alerts for mid-month budget checks to avoid surprises at month-end.');
  }

  // Predict upcoming expenses using a basic moving average approximation
  const predictedExpense = totalExpense > 0 ? totalExpense * 1.05 : 150;

  return {
    summary: `You have earned a total of ₹${totalIncome.toFixed(2)} and spent ₹${totalExpense.toFixed(2)} across ${Object.keys(categoryTotals).length} categories.`,
    riskLevel,
    riskExplanation,
    futureOutlook,
    tips,
    predictedExpense: Math.round(predictedExpense),
  };
};

/**
 * @desc    Get AI financial analytics and insights
 * @route   GET /api/ai/analytics
 * @access  Private
 */
const getAIAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const provider = process.env.AI_PROVIDER || 'ollama';

    // Fetch transactions & user details (limit to last 100 transactions for model context windows)
    const transactions = await Transaction.find({ userId }).sort({ date: -1 }).limit(100);
    const user = await User.findById(userId);

    // Map transactions to a lightweight payload structure
    const txSummary = transactions.map((t) => ({
      title: t.title,
      amount: t.amount,
      type: t.type,
      category: t.category,
      date: t.date.toISOString().split('T')[0],
    }));

    // Construct prompt template with Indian Rupee formatting
    const prompt = `
      You are a professional financial advisor.
      Here is the user's financial profile and transaction history for analysis:
      - Monthly budget limit: ₹${user.monthlyBudget || 0} (0 means no limit is set)
      - Transactions: ${JSON.stringify(txSummary)}

      Based on this data, provide a JSON response containing financial insights. 
      You MUST respond ONLY with a raw, valid JSON object matching the format below. Do not wrap in markdown quotes. Do not include any text before or after the JSON.
      Ensure all monetary figures, budgets, and descriptions in the response are expressed in Indian Rupees (₹).
      
      JSON Schema format:
      {
        "summary": "Short paragraph summarizing the user's spending habits and current standing in Rupees (₹).",
        "riskLevel": "Low" | "Medium" | "High",
        "riskExplanation": "A detailed explanation of why the risk is Low, Medium, or High, incorporating budget settings and income ratios in Rupees (₹).",
        "futureOutlook": "Short forecast of where they are heading based on current patterns.",
        "tips": ["Tip 1 in Rupees (₹)", "Tip 2 in Rupees (₹)", "Tip 3"],
        "predictedExpense": 500
      }
    `;

    // Process using Ollama LLM provider
    if (provider === 'ollama') {
      try {
        const ollamaHost = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
        const configuredModel = process.env.OLLAMA_MODEL || 'llama3.2';
        const ollamaModel = await selectOllamaModel(configuredModel, ollamaHost);

        console.log(`Executing Ollama financial analytics engine (${ollamaModel})...`);

        const response = await fetch(`${ollamaHost}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: ollamaModel,
            prompt: prompt,
            stream: false,
            format: 'json',
            options: {
              temperature: 0.1 // Low temperature for consistent JSON schema responses
            }
          }),
        });

        if (!response.ok) {
          throw new Error(`Ollama responded with status: ${response.status}`);
        }

        const resData = await response.json();
        let text = resData.response.trim();

        // Extract JSON string from response text bounds
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          text = text.substring(firstBrace, lastBrace + 1);
        }

        const parsedJSON = JSON.parse(text);
        return res.json({ success: true, isMock: false, data: parsedJSON });
      } catch (apiError) {
        console.error('Ollama API call failed, falling back to local engine:', apiError.message);
        // Fall back to rule-based engine on error
        const localAnalytics = await calculateLocalAnalytics(userId);
        return res.json({ success: true, isMock: true, data: localAnalytics });
      }
    } else {
      // Process using Google Gemini API provider
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
        console.log('No Gemini API key found, executing local fallback rule-based analytics engine.');
        const localAnalytics = await calculateLocalAnalytics(userId);
        return res.json({ success: true, isMock: true, data: localAnalytics });
      }

      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        // Extract JSON string from response bounds
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          text = text.substring(firstBrace, lastBrace + 1);
        }

        const parsedJSON = JSON.parse(text);
        return res.json({ success: true, isMock: false, data: parsedJSON });
      } catch (apiError) {
        console.error('Gemini API call failed, falling back to local engine:', apiError.message);
        // Fall back to rule-based engine on error
        const localAnalytics = await calculateLocalAnalytics(userId);
        return res.json({ success: true, isMock: true, data: localAnalytics });
      }
    }
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Chatbot assistant for transaction queries
 * @route   POST /api/ai/chat
 * @access  Private
 */
const chatAssistant = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;
    const provider = process.env.AI_PROVIDER || 'ollama';

    if (!message) {
      return res.status(400).json({ success: false, message: 'Please provide a message' });
    }

    // Fetch user transaction records
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });
    const user = await User.findById(userId);

    // Compute basic sum statistics
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = {};

    transactions.forEach((t) => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      }
    });

    const balance = totalIncome - totalExpense;

    // Compile up to 80 recent transactions to build prompt context
    const txSummary = transactions.slice(0, 80).map((t) => ({
      title: t.title,
      amount: t.amount,
      type: t.type,
      category: t.category,
      date: t.date.toISOString().split('T')[0],
      description: t.description,
    }));

    // Prompt structure providing the LLM with full context
    const prompt = `
      You are a friendly, knowledgeable personal financial AI chatbot.
      The user is asking you a question about their transactions. Answer them accurately using their provided data.
      
      User Profile & Context:
      - Username: ${user.username}
      - Monthly budget limit: ₹${user.monthlyBudget}
      - Total calculated Income: ₹${totalIncome}
      - Total calculated Expenses: ₹${totalExpense}
      - Category breakdown: ${JSON.stringify(categoryTotals)}
      - Transaction logs (up to 80 items): ${JSON.stringify(txSummary)}
      
      User Question: "${message}"
      
      Write a concise, friendly response. Provide specific numbers (e.g. category spending amounts, balance) if they ask about budgets, expenses, or stats. If they ask about something unrelated to their expenses, politely steer them back to their finances. Do not make up transactions. Ensure all monetary figures are expressed in Indian Rupees (₹) instead of dollars ($).
    `;

    // Process using Ollama LLM provider
    if (provider === 'ollama') {
      try {
        const ollamaHost = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
        const configuredModel = process.env.OLLAMA_MODEL || 'llama3.2';
        const ollamaModel = await selectOllamaModel(configuredModel, ollamaHost);

        console.log(`Executing Ollama chatbot agent (${ollamaModel})...`);

        const response = await fetch(`${ollamaHost}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: ollamaModel,
            prompt: prompt,
            stream: false,
            options: {
              temperature: 0.5
            }
          }),
        });

        if (!response.ok) {
          throw new Error(`Ollama responded with status: ${response.status}`);
        }

        const resData = await response.json();
        const text = resData.response.trim();

        return res.json({ success: true, isMock: false, reply: text });
      } catch (apiError) {
        console.error('Ollama chatbot call failed, executing local fallback answer engine:', apiError.message);
        // Local regex / basic response engine on connection loss
        return res.json({
          success: true,
          isMock: true,
          reply: `My Ollama brains are momentarily disconnected, but looking directly at your local records: You have total expenses of ₹${totalExpense.toFixed(2)} and total income of ₹${totalIncome.toFixed(2)}, giving you a remaining balance of ₹${balance.toFixed(2)}. Let me know if you want to know about your budgets or categories!`,
        });
      }
    } else {
      // Process using Google Gemini API provider
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
        console.log('No Gemini API Key found. executing local fallback rule-based chatbot query parser.');
        
        const query = message.toLowerCase();
        let reply = "";

        // Standard regex parsing rules for quick response fallback
        if (query.includes('hello') || query.includes('hi ') || query.includes('hey')) {
          reply = `Hello ${user.username}! I am your local AI Financial Assistant. How can I help you analyze your transactions today?`;
        } else if (query.includes('balance') || query.includes('how much money do i have')) {
          reply = `Your current balance is ₹${balance.toFixed(2)} (Total Income: ₹${totalIncome.toFixed(2)} | Total Expenses: ₹${totalExpense.toFixed(2)}).`;
        } else if (query.includes('income') || query.includes('earned')) {
          reply = `You have earned a total of ₹${totalIncome.toFixed(2)} across all recorded transactions.`;
        } else if (query.includes('spend') || query.includes('spent') || query.includes('expense')) {
          let matchedCategory = null;
          Object.keys(categoryTotals).forEach(cat => {
            if (query.includes(cat.toLowerCase())) {
              matchedCategory = cat;
            }
          });

          if (matchedCategory) {
            reply = `You have spent ₹${categoryTotals[matchedCategory].toFixed(2)} on "${matchedCategory}". This accounts for ${((categoryTotals[matchedCategory] / (totalExpense || 1)) * 100).toFixed(0)}% of your expenses.`;
          } else {
            reply = `Your total expenses are ₹${totalExpense.toFixed(2)}. ${user.monthlyBudget > 0 ? `This represents ${((totalExpense / user.monthlyBudget) * 100).toFixed(0)}% of your monthly budget (₹${user.monthlyBudget}).` : ""}`;
          }
        } else if (query.includes('budget')) {
          if (user.monthlyBudget > 0) {
            const percent = ((totalExpense / user.monthlyBudget) * 100).toFixed(0);
            reply = `Your monthly budget is set to ₹${user.monthlyBudget}. You have spent ₹${totalExpense.toFixed(2)} (${percent}% of budget). You have ₹${Math.max(0, user.monthlyBudget - totalExpense).toFixed(2)} remaining.`;
          } else {
            reply = "You haven't set a monthly budget yet! You can define a budget limit on your Profile settings page.";
          }
        } else if (query.includes('tip') || query.includes('advice') || query.includes('save')) {
          const localAnalytics = await calculateLocalAnalytics(userId);
          reply = `Here is a custom savings tip for you: ${localAnalytics.tips[0]}`;
        } else {
          reply = `I've analyzed your financial history to answer your request. You have recorded ${transactions.length} total transactions. Your net balance is ₹${balance.toFixed(2)} and your highest expense category is "${Object.keys(categoryTotals)[0] || 'none'}". Ask me about your balance, budget limits, or specific category spending!`;
        }

        return res.json({ success: true, isMock: true, reply });
      }

      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        return res.json({ success: true, isMock: false, reply: text });
      } catch (apiError) {
        console.error('Gemini chatbot call failed, executing local fallback answer engine:', apiError.message);
        // Fallback to local data summary
        return res.json({
          success: true,
          isMock: true,
          reply: `My Gemini AI brains are momentarily disconnected, but looking directly at your local records: You have total expenses of ₹${totalExpense.toFixed(2)} and total income of ₹${totalIncome.toFixed(2)}, giving you a remaining balance of ₹${balance.toFixed(2)}. Let me know if you want to know about your budgets or categories!`,
        });
      }
    }
  } catch (error) {
    console.error('Error handling chat message:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export {
  getAIAnalytics,
  chatAssistant,
}
