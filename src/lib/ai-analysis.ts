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

  return `You are a prediction market analyst. Give a quick, actionable take on this market.

Market: ${market.title}
${market.yes_sub_title ? `Outcome: ${market.yes_sub_title}` : ''}
Current Market Price: ${impliedProb}% implied probability
${market.rules_primary ? `Rules: ${market.rules_primary}` : ''}

Compare the market price to what you believe the TRUE probability is. Then give ONE of these recommendations:
- "buy_yes" if market is underpriced (your estimate is >10% higher than market)
- "buy_no" if market is overpriced (your estimate is >10% lower than market)
- "skip" if market is fairly priced (within 10% of your estimate)

Respond in this exact JSON format:
{
  "estimatedProbability": <number 0-100>,
  "confidence": <number 0-100>,
  "reasoning": "<exactly 2 sentences: what you think the true probability is and why>",
  "recommendation": "<buy_yes|buy_no|skip>"
}

Be direct. No hedging.`;
}

function parseAIResponse(response: string, provider: AIAnalysis['provider']): AIAnalysis {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Normalize recommendation
    let recommendation: AIAnalysis['recommendation'] = 'skip';
    const rec = (parsed.recommendation || '').toLowerCase();
    if (rec.includes('buy_yes') || rec === 'yes') {
      recommendation = 'buy_yes';
    } else if (rec.includes('buy_no') || rec === 'no') {
      recommendation = 'buy_no';
    }

    return {
      provider,
      estimatedProbability: Math.min(100, Math.max(0, parsed.estimatedProbability)) / 100,
      confidence: Math.min(100, Math.max(0, parsed.confidence)) / 100,
      reasoning: parsed.reasoning || 'No reasoning provided',
      recommendation,
    };
  } catch (error) {
    console.error(`Error parsing ${provider} response:`, error);
    return {
      provider,
      estimatedProbability: 0.5,
      confidence: 0.2,
      reasoning: 'Failed to parse AI response',
      recommendation: 'skip',
    };
  }
}

export async function analyzeWithOpenAI(market: KalshiMarket): Promise<AIAnalysis> {
  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
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
      recommendation: 'skip',
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
      recommendation: 'skip',
    };
  }
}

export async function analyzeWithGemini(market: KalshiMarket): Promise<AIAnalysis> {
  try {
    const genAI = getGemini();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
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
      recommendation: 'skip',
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

  // Determine recommendation based on edge
  let recommendation: ConsensusAnalysis['recommendation'];

  if (edgePercentage > 10) {
    recommendation = 'buy_yes';
  } else if (edgePercentage < -10) {
    recommendation = 'buy_no';
  } else {
    recommendation = 'skip';
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
