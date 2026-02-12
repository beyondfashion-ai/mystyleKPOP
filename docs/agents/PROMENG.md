# PROMENG — Prompt Engineer Sub-Agent

> Prompt engineer agent for the mystyleKPOP repository.
> Role: AI prompt design, generation quality optimization, model configuration, prompt file management.

---

## 1. Role Definition

The PROMENG agent owns **all AI prompt-related logic** in the mystyleKPOP project:

- Design and maintain generation prompts for fal.ai (Flux model)
- Optimize prompt templates for consistent, high-quality KPOP outfit images
- Manage negative prompts and quality modifiers
- Configure model parameters (guidance scale, steps, dimensions)
- Define concept-specific prompt variations
- Maintain translation prompt patterns for multilingual input

**Key rules:**
- Prompts and recipes are PRIVATE — never exposed to other users
- All prompt changes must be tested with sample outputs before deployment
- Prompt files live in `src/lib/fal/prompts/` directory

---

## 2. Prompt Architecture

### 2.1 Prompt Structure

```
[System Prefix] + [Group Context] + [Concept Modifier] + [User Keywords (sanitized)] + [Quality Suffix] + [Negative Prompt]
```

### 2.2 Component Breakdown

| Component | Source | Editable by User | Example |
|-----------|--------|-------------------|---------|
| System Prefix | Hardcoded | No | "A full-body fashion photograph of a KPOP idol stage outfit." |
| Group Context | Selected from UI | Indirectly (group selection) | "Inspired by the visual identity of BLACKPINK." |
| Concept Modifier | Selected from UI | Indirectly (concept selection) | "Street fashion concept with urban edge." |
| User Keywords | Free text input | Yes | "neon colors, oversized jacket, chain accessories" |
| Quality Suffix | Hardcoded | No | "Editorial fashion photography, studio lighting, 8K detail." |
| Negative Prompt | Hardcoded | No | "blurry, low quality, deformed, text, watermark" |

---

## 3. Prompt Templates

### 3.1 Master Generation Prompt

```typescript
// src/lib/fal/prompts/generation.ts

export const SYSTEM_PREFIX =
  "A full-body fashion photograph of a KPOP idol stage outfit design.";

export const QUALITY_SUFFIX = [
  "Editorial fashion photography.",
  "Professional studio lighting.",
  "Clean white background.",
  "High resolution, 8K detail.",
  "Fashion magazine quality.",
  "Full body visible from head to toe.",
].join(" ");

export const NEGATIVE_PROMPT = [
  "blurry", "low quality", "low resolution",
  "deformed", "disfigured", "bad anatomy", "bad proportions",
  "extra limbs", "extra fingers", "mutated hands",
  "text", "watermark", "signature", "logo",
  "cropped", "out of frame", "partial body",
  "nsfw", "nude", "revealing", "inappropriate",
  "background clutter", "messy background",
].join(", ");
```

### 3.2 Concept-Specific Modifiers

```typescript
// src/lib/fal/prompts/concepts.ts

export const CONCEPT_MODIFIERS: Record<string, string> = {
  formal:
    "Elegant formal stage outfit. Tailored suit or gown with sophisticated details. " +
    "Award ceremony or gala style. Luxurious fabrics, clean lines.",

  street:
    "Urban streetwear stage outfit. Bold graphic elements, oversized silhouettes. " +
    "Hip-hop inspired with sneakers and accessories. Youthful and edgy.",

  concert:
    "High-energy concert performance outfit. Dynamic and eye-catching. " +
    "Sparkles, sequins, or metallic elements. Designed for stage movement.",

  school:
    "School-inspired concept outfit. Preppy elements with a KPOP twist. " +
    "Plaid patterns, blazers, ties reimagined as stage wear.",

  "high-fashion":
    "Avant-garde high fashion stage outfit. Runway-worthy design. " +
    "Experimental silhouettes, bold textures, couture craftsmanship.",

  casual:
    "Relaxed casual stage outfit. Comfortable yet stylish. " +
    "Denim, cotton, layered pieces. Effortlessly cool aesthetic.",

  retro:
    "Retro-inspired stage outfit. Vintage elements from 70s, 80s, or 90s. " +
    "Bold colors, retro patterns, nostalgic accessories.",

  futuristic:
    "Futuristic cyberpunk stage outfit. Metallic fabrics, LED accents, " +
    "holographic materials. Sci-fi inspired with sharp geometric lines.",
};
```

### 3.3 Group Context Templates

```typescript
// src/lib/fal/prompts/groups.ts

/**
 * Group context provides stylistic direction without using real artist likenesses.
 * These are style descriptors, NOT prompts to generate specific people.
 */
export function buildGroupContext(groupName: string): string {
  // Generic style direction based on group's known aesthetic
  return `Outfit design inspired by the visual style and fashion aesthetic commonly associated with ${groupName}. ` +
    "Focus on the clothing design only, not any specific person.";
}
```

---

## 4. Prompt Assembly

### 4.1 Full Prompt Builder

```typescript
// src/lib/fal/prompts/builder.ts
import { SYSTEM_PREFIX, QUALITY_SUFFIX, NEGATIVE_PROMPT } from "./generation";
import { CONCEPT_MODIFIERS } from "./concepts";
import { buildGroupContext } from "./groups";
import { sanitizePrompt } from "@/lib/security/sanitize-prompt";

interface PromptInput {
  groupName: string;
  concept: string;
  keywords: string;           // Original user input
  translatedKeywords: string; // English translation
}

export interface BuiltPrompt {
  prompt: string;
  negativePrompt: string;
}

export function buildPrompt(input: PromptInput): BuiltPrompt {
  const safeKeywords = sanitizePrompt(input.translatedKeywords);
  const conceptModifier = CONCEPT_MODIFIERS[input.concept] ?? "";
  const groupContext = buildGroupContext(input.groupName);

  const prompt = [
    SYSTEM_PREFIX,
    groupContext,
    conceptModifier,
    safeKeywords ? `Additional details: ${safeKeywords}.` : "",
    QUALITY_SUFFIX,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    prompt,
    negativePrompt: NEGATIVE_PROMPT,
  };
}
```

---

## 5. Model Configuration

### 5.1 fal.ai Flux Parameters

```typescript
// src/lib/fal/config.ts

export const FAL_MODEL_CONFIG = {
  model: "fal-ai/flux/dev",

  // Image dimensions (portrait orientation for fashion)
  width: 768,
  height: 1024,

  // Generation parameters
  num_images: 4,                 // Always generate 4 images per request
  guidance_scale: 7.5,           // Balance between prompt adherence and creativity
  num_inference_steps: 28,       // Quality vs. speed tradeoff
  seed: undefined,               // Random seed for variety (set for reproducibility)

  // Safety
  enable_safety_checker: true,
};
```

### 5.2 Parameter Tuning Guide

| Parameter | Range | Current | Effect |
|-----------|-------|---------|--------|
| `guidance_scale` | 1.0 – 20.0 | 7.5 | Higher = stricter prompt adherence, lower = more creative freedom |
| `num_inference_steps` | 10 – 50 | 28 | Higher = better quality but slower generation |
| `width` x `height` | 512–1024 | 768x1024 | Portrait ratio optimized for full-body fashion shots |
| `num_images` | 1–4 | 4 | Fixed at 4 for user selection |

---

## 6. Translation Prompt

### 6.1 Translation API Call

```typescript
// src/lib/translation/translate.ts
import { v2 } from "@google-cloud/translate";

const translate = new v2.Translate({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  key: process.env.GOOGLE_CLOUD_TRANSLATION_KEY,
});

export async function translateToEnglish(text: string): Promise<{
  translated: string;
  detectedLanguage: string;
}> {
  if (!text.trim()) return { translated: "", detectedLanguage: "en" };

  const [translation] = await translate.translate(text, "en");
  const [detection] = await translate.detect(text);

  return {
    translated: translation,
    detectedLanguage: detection.language,
  };
}
```

### 6.2 Supported Languages

| Language | Auto-Detected | Notes |
|----------|---------------|-------|
| Korean (ko) | Yes | Primary user language |
| Japanese (ja) | Yes | Secondary market |
| Chinese Simplified (zh-CN) | Yes | Secondary market |
| Chinese Traditional (zh-TW) | Yes | Secondary market |
| English (en) | Yes | No translation needed — passthrough |

---

## 7. Prompt Privacy Rules

| Rule | Implementation |
|------|---------------|
| Never return prompts in gallery API | `GET /api/gallery` excludes `prompt` field |
| Never return prompts in design detail (other users) | `GET /api/designs/[id]` strips `prompt` if `uid !== viewer.uid` |
| Store prompts server-side only | `prompt` stored in Firestore `designs` collection, never sent to client |
| No remix / copy feature | No API endpoint to retrieve another user's prompt |
| Audit log for prompt access | Log any admin access to prompt data |

---

## 8. Prompt Testing Protocol

Before deploying any prompt change:

1. **Generate 20 sample images** across all concepts
2. **Check consistency:** Do all 4 images per request share a coherent style?
3. **Check quality:** Are images sharp, well-lit, full-body visible?
4. **Check safety:** Do any outputs contain inappropriate content?
5. **Check diversity:** Do different keywords produce meaningfully different results?
6. **Check edge cases:** Empty keywords, very long keywords, non-Latin characters
7. **Compare before/after:** Side-by-side with previous prompt version

### Test Matrix

| Concept | Group | Keywords | Expected Output |
|---------|-------|----------|-----------------|
| formal | BTS | "gold embroidery, velvet" | Elegant suit with gold details |
| street | BLACKPINK | "neon, oversized" | Bold streetwear |
| concert | aespa | "holographic, LED" | Futuristic performance wear |
| school | NewJeans | "plaid, preppy" | School-themed stage outfit |
| (all) | (any) | "" (empty) | Should still produce quality output |
| (all) | (any) | (500 char max) | Should not break or produce garbage |

---

## 9. File Structure

```
src/lib/fal/
├── client.ts              # fal.ai API client (HTTP calls)
├── config.ts              # Model parameters
└── prompts/
    ├── builder.ts         # Main prompt assembly function
    ├── generation.ts      # System prefix, quality suffix, negative prompt
    ├── concepts.ts        # Concept-specific modifiers
    └── groups.ts          # Group context builder
```

---

*This document is the primary reference for the PROMENG agent in all AI prompt design and optimization tasks.*
