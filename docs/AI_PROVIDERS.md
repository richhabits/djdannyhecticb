# Free AI Providers Guide

This project supports multiple free AI providers for chat completions, text-to-speech, and video generation.

## Available Free AI Providers

### 1. **Groq** (Recommended - Ultra Fast) ⚡
- **Speed**: Fastest inference (up to 500 tokens/sec)
- **Free Tier**: Generous free tier
- **Models**: 
  - `llama-3.1-8b-instant` (default)
  - `mixtral-8x7b-32768`
  - `gemma-7b-it`
- **Setup**:
  ```bash
  export GROQ_API_KEY="your-api-key"
  export GROQ_MODEL="llama-3.1-8b-instant"
  export AI_CHAT_PROVIDER="groq"
  ```
- **Get API Key**: https://console.groq.com/

### 2. **Google Gemini** (Free Tier) 🆓
- **Speed**: Fast
- **Free Tier**: 15 requests per minute, 1,500 requests per day
- **Models**: 
  - `gemini-1.5-flash` (default, fastest)
  - `gemini-pro`
- **Setup**:
  ```bash
  export GOOGLE_AI_API_KEY="your-api-key"
  export GEMINI_MODEL="gemini-1.5-flash"
  export AI_CHAT_PROVIDER="gemini"
  ```
- **Get API Key**: https://makersuite.google.com/app/apikey

### 3. **Hugging Face Inference API** (Free Tier) 🤗
- **Speed**: Moderate
- **Free Tier**: Free for public models
- **Models**: 
  - `meta-llama/Llama-3.1-8B-Instruct` (default)
  - `mistralai/Mistral-7B-Instruct-v0.2`
  - `google/gemma-7b-it`
- **Setup**:
  ```bash
  export HUGGINGFACE_API_KEY="your-api-key"
  export HUGGINGFACE_MODEL="meta-llama/Llama-3.1-8B-Instruct"
  export AI_CHAT_PROVIDER="huggingface"
  ```
- **Get API Key**: https://huggingface.co/settings/tokens

### 4. **Cohere** (Free Tier) 💬
- **Speed**: Fast
- **Free Tier**: 100 API calls per month
- **Models**: 
  - `command` (default)
  - `command-light`
  - `command-r`
- **Setup**:
  ```bash
  export COHERE_API_KEY="your-api-key"
  export COHERE_MODEL="command"
  export AI_CHAT_PROVIDER="cohere"
  ```
- **Get API Key**: https://dashboard.cohere.com/api-keys

### 5. **Ollama** (Completely Free, Local) 🏠
- **Speed**: Depends on hardware
- **Free Tier**: 100% free, runs locally
- **Models**: 
  - `llama3` (default)
  - `mistral`
  - `gemma2`
  - `phi3`
- **Setup**:
  1. Install Ollama: https://ollama.ai/
  2. Pull a model: `ollama pull llama3`
  3. Configure:
     ```bash
     export OLLAMA_URL="http://localhost:11434"
     export OLLAMA_MODEL="llama3"
     export AI_CHAT_PROVIDER="ollama"
     ```

## Auto-Selection

If no provider is specified, the system will automatically try providers in this order:
1. Groq (fastest)
2. Gemini (good balance)
3. Hugging Face (reliable)
4. Cohere (backup)
5. Ollama (if running locally)
6. Mock (fallback)

## Usage in Code

```typescript
import { chatCompletion } from "./_core/aiProviders";

const response = await chatCompletion({
  messages: [
    { role: "system", content: "You are DJ Danny Hectic B..." },
    { role: "user", content: "What's your favorite track?" }
  ],
  persona: "Danny Hectic B",
  temperature: 0.7,
  maxTokens: 512,
});

console.log(response.text); // AI response
console.log(response.provider); // Which provider was used
console.log(response.model); // Which model was used
```

## Environment Variables

Set these in your `.env` file:

```bash
# Provider Selection
AI_CHAT_PROVIDER=groq  # or gemini, huggingface, cohere, ollama

# Groq
GROQ_API_KEY=your-key
GROQ_MODEL=llama-3.1-8b-instant

# Gemini
GOOGLE_AI_API_KEY=your-key
GEMINI_MODEL=gemini-1.5-flash

# Hugging Face
HUGGINGFACE_API_KEY=your-key
HUGGINGFACE_MODEL=meta-llama/Llama-3.1-8B-Instruct

# Cohere
COHERE_API_KEY=your-key
COHERE_MODEL=command

# Ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

## Admin Configuration

You can also configure providers via the admin panel:
- Go to `/admin/empire`
- Set `ai_chat_provider` setting to your preferred provider

## Cost Comparison

| Provider | Free Tier | Speed | Best For |
|----------|-----------|-------|----------|
| Groq | Generous | ⚡⚡⚡ Ultra Fast | Production, real-time |
| Gemini | 1,500/day | ⚡⚡ Fast | General use |
| Hugging Face | Unlimited* | ⚡ Moderate | Development, testing |
| Cohere | 100/month | ⚡⚡ Fast | Backup option |
| Ollama | Unlimited | ⚡ Variable | Local development, privacy |

*Hugging Face free tier has rate limits for popular models

## Recommendations

- **Production**: Use Groq for speed, Gemini as backup
- **Development**: Use Ollama locally (no API keys needed)
- **Testing**: Use Hugging Face (most flexible)
- **Budget-conscious**: Use Ollama (completely free)

