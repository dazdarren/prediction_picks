import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { KalshiMarket, AIAnalysis, ConsensusAnalysis } from '@/types';

// Lazy initialization to avoid build-time errors
function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function getAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function getGemini() {
  if (!process.env.GOOGLE_AI_API_KEY) {
    throw new Error('GOOGLE_AI_API_KEY is not configured');
  }
  return new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
}

function buildAnalysisPrompt(market: KalshiMarket): string {
  const impliedProb = ((market.yes_bid + market.yes_ask) / 2 * 100).toFixed(1);

  return `Analyze this prediction market and estimate the TRUE probability of the outcome.

Market: ${market.title}
${market.subtitle ? `Details: ${market.subtitle}` : ''}
Category: ${market.category}
Current Market Implied Probability: ${impliedProb}%
Market Closes: ${new Date(market.close_time).toLocaleDateString()}
${market.rules_primary ? `Rules: ${market.rules_primary}` : ''}

Based on your knowledge of current events, historical patterns, and relevant data:

1. What is your estimated TRUE probability (0-100%) that this outcome will occur?
2. How confident are you in this estimate (0-100%)?
3. What are the key factors influencing this probability?
4. Based on the difference between your estimate and market price, what is your recommendation?

IMPORTANT: Respond in this exact JSON format:
{
  "estimatedProbability": <number 0-100>,
  "confidence": <number 0-100>,
  "reasoning": "<brief explanation>",
  "keyFactors": ["<factor1>", "<factor2>", "<factor3>"],
  "recommendation": "<buy_yes|buy_no|hold>"
}

Be analytical and consider:
- Base rates and historical precedent
- Current news and developments
- Potential for surprise outcomes
- Time remaining until resolution`;
}

function parseAIResponse(response: string, provider: AIAnalysis['provider']): AIAnalysis {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      provider,
      estimatedProbability: Math.min(100, Math.max(0, parsed.estimatedProbability)) / 100,
      confidence: Math.min(100, Math.max(0, parsed.confidence)) / 100,
      reasoning: parsed.reasoning || 'No reasoning provided',
      keyFactors: parsed.keyFactors || [],
      recommendation: parsed.recommendation || 'hold',
    };
  } catch (error) {
    console.error(`Error parsing ${provider} response:`, error);
    return {
      provider,
      estimatedProbability: 0.5,
      confidence: 0.2,
      reasoning: 'Failed to parse AI response',
      keyFactors: [],
      recommendation: 'hold',
    };
  }
}

export async function analyzeWithOpenAI(market: KalshiMarket): Promise<AIAnalysis> {
  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert prediction market analyst. Provide precise probability estimates based on available evidence.',
        },
        {
          role: 'user',
          content: buildAnalysisPrompt(market),
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || '';
    return parseAIResponse(response, 'openai');
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    return {
      provider: 'openai',
      estimatedProbability: 0.5,
      confidence: 0,
      reasoning: 'API error occurred',
      keyFactors: [],
      recommendation: 'hold',
    };
  }
}

export async function analyzeWithAnthropic(market: KalshiMarket): Promise<AIAnalysis> {
  try {
    const anthropic = getAnthropic();
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: buildAnalysisPrompt(market),
        },
      ],
    });

    const response = message.content[0].type === 'text' ? message.content[0].text : '';
    return parseAIResponse(response, 'anthropic');
  } catch (error) {
    console.error('Anthropic analysis error:', error);
    return {
      provider: 'anthropic',
      estimatedProbability: 0.5,
      confidence: 0,
      reasoning: 'API error occurred',
      keyFactors: [],
      recommendation: 'hold',
    };
  }
}

export async function analyzeWithGemini(market: KalshiMarket): Promise<AIAnalysis> {
  try {
    const genAI = getGemini();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent(buildAnalysisPrompt(market));
    const response = result.response.text();
    return parseAIResponse(response, 'gemini');
  } catch (error) {
    console.error('Gemini analysis error:', error);
    return {
      provider: 'gemini',
      estimatedProbability: 0.5,
      confidence: 0,
      reasoning: 'API error occurred',
      keyFactors: [],
      recommendation: 'hold',
    };
  }
}

export async function getConsensusAnalysis(market: KalshiMarket): Promise<ConsensusAnalysis> {
  // Run all AI analyses in parallel
  const [openaiAnalysis, anthropicAnalysis, geminiAnalysis] = await Promise.all([
    analyzeWithOpenAI(market),
    analyzeWithAnthropic(market),
    analyzeWithGemini(market),
  ]);

  const analyses = [openaiAnalysis, anthropicAnalysis, geminiAnalysis];

  // Calculate weighted consensus (weight by confidence)
  const totalConfidence = analyses.reduce((sum, a) => sum + a.confidence, 0);

  let consensusProbability: number;
  let consensusConfidence: number;

  if (totalConfidence === 0) {
    // If no confidence, use simple average
    consensusProbability = analyses.reduce((sum, a) => sum + a.estimatedProbability, 0) / 3;
    consensusConfidence = 0;
  } else {
    // Weighted average by confidence
    consensusProbability = analyses.reduce(
      (sum, a) => sum + a.estimatedProbability * a.confidence,
      0
    ) / totalConfidence;
    consensusConfidence = totalConfidence / 3;
  }

  // Calculate implied probability from market
  const impliedProbability = (market.yes_bid + market.yes_ask) / 2;

  // Calculate edge (difference between AI estimate and market)
  const edgePercentage = (consensusProbability - impliedProbability) * 100;

  // Calculate mispricing score (edge * confidence)
  const mispricingScore = Math.abs(edgePercentage) * consensusConfidence;

  // Determine recommendation based on edge and confidence
  let recommendation: ConsensusAnalysis['recommendation'];

  if (consensusConfidence < 0.3) {
    recommendation = 'hold';
  } else if (edgePercentage > 15) {
    recommendation = 'strong_buy_yes';
  } else if (edgePercentage > 5) {
    recommendation = 'buy_yes';
  } else if (edgePercentage < -15) {
    recommendation = 'strong_buy_no';
  } else if (edgePercentage < -5) {
    recommendation = 'buy_no';
  } else {
    recommendation = 'hold';
  }

  return {
    market,
    analyses,
    consensusProbability,
    consensusConfidence,
    impliedProbability,
    edgePercentage,
    recommendation,
    mispricingScore,
  };
}

// Quick analysis for scanning multiple markets
export async function quickScan(markets: KalshiMarket[]): Promise<ConsensusAnalysis[]> {
  const results: ConsensusAnalysis[] = [];

  // Process in batches to avoid rate limits
  const batchSize = 3;
  for (let i = 0; i < markets.length; i += batchSize) {
    const batch = markets.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(getConsensusAnalysis));
    results.push(...batchResults);

    // Small delay between batches
    if (i + batchSize < markets.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Sort by mispricing score
  return results.sort((a, b) => b.mispricingScore - a.mispricingScore);
}
