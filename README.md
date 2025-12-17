# Prediction Picks

AI-powered prediction market analysis tool that identifies mispriced opportunities on Kalshi using OpenAI, Anthropic Claude, and Google Gemini.

## Features

- **Live Market Data**: Fetches current prediction market odds from Kalshi's public API
- **Triple AI Analysis**: Uses GPT-4o, Claude, and Gemini to estimate true probabilities
- **Mispricing Detection**: Compares AI consensus against market prices to find edge
- **Confidence Scoring**: Weights analysis by AI confidence levels
- **Top Picks Dashboard**: Ranks opportunities by mispricing score

## How It Works

1. **Fetch Markets**: Pulls live market data from Kalshi
2. **AI Analysis**: Each market can be analyzed by all 3 AI models simultaneously
3. **Consensus Building**: Combines estimates weighted by confidence
4. **Edge Calculation**: Compares AI probability vs market implied probability
5. **Recommendations**: Generates buy/hold signals based on edge and confidence

## Getting Started

### Prerequisites

You'll need API keys for the AI providers:

- OpenAI API Key: https://platform.openai.com/api-keys
- Anthropic API Key: https://console.anthropic.com/settings/keys
- Google AI API Key: https://makersuite.google.com/app/apikey

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create your environment file:

```bash
cp .env.example .env.local
```

4. Add your API keys to `.env.local`:

```env
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
GOOGLE_AI_API_KEY=your-google-ai-key
```

5. Run the development server:

```bash
npm run dev
```

6. Open http://localhost:3000

## Usage

1. **Browse Markets**: View open Kalshi markets with current odds
2. **Filter & Search**: Find specific markets by category or keyword
3. **Analyze**: Click "Analyze with AI" on any market
4. **Review Results**: See probability estimates from each AI provider
5. **Track Picks**: Markets with significant edge are added to Top Picks

## Understanding the Analysis

- **AI Estimate**: Weighted consensus probability from all 3 AI models
- **Market Price**: Current implied probability from Kalshi bid/ask
- **Edge**: Difference between AI estimate and market price
- **Confidence**: Average confidence across AI providers
- **Mispricing Score**: Edge x Confidence (higher = stronger signal)

### Recommendations

| Recommendation | Meaning |
|---------------|---------|
| Strong Buy YES | AI estimates >15% higher than market |
| Buy YES | AI estimates 5-15% higher than market |
| Hold | AI estimate within 5% of market |
| Buy NO | AI estimates 5-15% lower than market |
| Strong Buy NO | AI estimates >15% lower than market |

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI APIs**: OpenAI, Anthropic, Google Generative AI
- **Market Data**: Kalshi Public API

## Disclaimer

This tool is for educational and informational purposes only. Prediction markets involve financial risk. Always do your own research and never invest more than you can afford to lose. Past AI performance does not guarantee future accuracy.

## License

MIT
