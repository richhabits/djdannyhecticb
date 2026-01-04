# AI Models & SEO Implementation Guide

## 🚀 Free AI Models Implemented

### Available Providers

1. **Groq** ⚡ (Ultra Fast - Recommended)
   - Models: `llama-3.1-8b-instant`, `mixtral-8x7b-32768`, `gemma-7b-it`
   - Setup: `export GROQ_API_KEY="your-key"` and `export AI_CHAT_PROVIDER="groq"`
   - Get key: https://console.groq.com/

2. **Google Gemini** 🆓 (Free Tier)
   - Models: `gemini-1.5-flash` (fastest), `gemini-pro`
   - Setup: `export GOOGLE_AI_API_KEY="your-key"` and `export AI_CHAT_PROVIDER="gemini"`
   - Free: 15 req/min, 1,500/day

3. **Hugging Face** 🤗 (Free Tier)
   - Models: `meta-llama/Llama-3.1-8B-Instruct`, `mistralai/Mistral-7B-Instruct-v0.2`
   - Setup: `export HUGGINGFACE_API_KEY="your-key"` and `export AI_CHAT_PROVIDER="huggingface"`
   - Get key: https://huggingface.co/settings/tokens

4. **Cohere** 💬 (Free Tier)
   - Models: `command`, `command-light`, `command-r`
   - Setup: `export COHERE_API_KEY="your-key"` and `export AI_CHAT_PROVIDER="cohere"`
   - Free: 100 API calls/month

5. **Ollama** 🏠 (Completely Free, Local)
   - Models: `llama3`, `mistral`, `gemma2`, `phi3`
   - Setup: Install Ollama, then `export OLLAMA_URL="http://localhost:11434"` and `export AI_CHAT_PROVIDER="ollama"`
   - 100% free, runs locally

### Auto-Selection

If no provider is configured, the system automatically tries:
1. Groq → 2. Gemini → 3. Hugging Face → 4. Cohere → 5. Ollama → 6. Mock

## 📊 SEO Features Implemented

### 1. Meta Tags
- ✅ Title, description, keywords
- ✅ Canonical URLs
- ✅ Open Graph (Facebook, LinkedIn)
- ✅ Twitter Cards
- ✅ Robots meta tags
- ✅ Mobile optimization tags

### 2. Structured Data (JSON-LD)
- ✅ Person schema (bio pages)
- ✅ MusicAlbum schema (mixes)
- ✅ Event schema (events)
- ✅ PodcastEpisode schema (podcasts)
- ✅ WebSite schema (homepage)

### 3. Sitemap
- ✅ Auto-generated at `/sitemap.xml`
- ✅ Includes all pages, mixes, events, podcasts
- ✅ Updates automatically

### 4. Robots.txt
- ✅ Configured at `/robots.txt`
- ✅ Blocks admin routes
- ✅ Points to sitemap

## 🎯 Quick Start

### Enable Free AI

1. **Choose a provider** (recommended: Groq for speed)
2. **Get API key** from provider's website
3. **Set environment variables**:
   ```bash
   export GROQ_API_KEY="your-key-here"
   export AI_CHAT_PROVIDER="groq"
   ```
4. **Restart server** - AI will automatically use the configured provider

### SEO Setup

1. **Submit sitemap** to Google Search Console:
   - URL: `https://djdannyhecticb.co.uk/sitemap.xml`

2. **Verify structured data**:
   - Use: https://search.google.com/test/rich-results

3. **Test meta tags**:
   - Facebook: https://developers.facebook.com/tools/debug/
   - Twitter: https://cards-dev.twitter.com/validator

## 📝 Usage Examples

### Using AI in Code

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
```

### Adding SEO to Pages

```tsx
import { MetaTagsComponent } from "@/components/MetaTags";
import { MusicStructuredData } from "@/components/StructuredData";

<MetaTagsComponent
  title="Page Title | DJ Danny Hectic B"
  description="SEO-friendly description"
  keywords="keyword1, keyword2"
  canonical="https://djdannyhecticb.co.uk/page"
/>

<MusicStructuredData
  name={mix.title}
  description={mix.description}
  url={mixUrl}
  datePublished={mix.createdAt.toISOString()}
  audioUrl={mix.audioUrl}
/>
```

## 🔧 Configuration

### Environment Variables

```bash
# AI Provider Selection
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

# SEO
BASE_URL=https://djdannyhecticb.co.uk
```

### Admin Panel Configuration

You can also configure AI providers via the admin panel:
- Go to `/admin/empire`
- Set `ai_chat_provider` setting

## 📈 Performance

- **AI Response Time**: Groq < 1s, Gemini ~2s, Hugging Face ~3-5s
- **SEO Impact**: Zero performance overhead (client-side meta tags, server-side sitemap)
- **Cost**: All providers have free tiers suitable for development and moderate production use

## 🎨 Best Practices

### AI
- Use Groq for production (fastest)
- Use Ollama for local development (no API keys)
- Implement rate limiting for production
- Cache responses when appropriate

### SEO
- Keep titles under 60 characters
- Keep descriptions under 160 characters
- Use 5-10 relevant keywords
- Always set canonical URLs
- Use high-quality images (1200x630px for OG)

## 📚 Documentation

- Full AI guide: `docs/AI_PROVIDERS.md`
- Full SEO guide: `docs/SEO_GUIDE.md`

