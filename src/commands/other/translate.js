const { GoogleGenAI, Type } = require("@google/genai");
const Config = require("@cocreate/config");

/**
 * Default Gemini model identifier used for language translation tasks.
 * @type {string}
 */
const DEFAULT_MODEL = "gemini-2.5-flash-lite";

/**
 * Translation mapping for a single element's attributes and inner content.
 * @typedef {Object} ElementTranslations
 * @property {string|null} [text] - Inner text content or script payload.
 * @property {string|null} [placeholder] - Input placeholder text.
 * @property {string|null} [title] - Element title attribute.
 * @property {string|null} [alt] - Image alternate text.
 * @property {string|null} ["aria-label"] - ARIA accessibility label.
 * @property {Record<string, string>} [additionalProperties] - Dynamic attributes (e.g., `aria-description`).
 */

/**
 * Key-value mapping of `i18n` keys to element translations for a specific language.
 * @typedef {Record<string, ElementTranslations>} LanguageTranslations
 */

/**
 * Language-First dictionary structure mapping language codes (e.g., "en", "es") to their translations.
 * @typedef {Record<string, LanguageTranslations>} LanguageFirstTranslationMap
 */

/**
 * Configuration options for the HTML translation process.
 * @typedef {Object} TranslateOptions
 * @property {string} [apiKey] - Google GenAI API key. If omitted, attempts lookup via configuration service.
 * @property {string} [model] - Gemini model name override (defaults to "gemini-2.5-flash-lite").
 * @property {number} [temperature] - Model sampling temperature (defaults to 0.2).
 */

/**
 * Resolves the Google GenAI API key from explicit options or global configuration.
 *
 * @async
 * @param {TranslateOptions} options - Configuration options passed to the translator.
 * @returns {Promise<string|undefined>} Resolved API key string or undefined if not found.
 */
async function getApiKey(options) {
  if (options?.apiKey) return options.apiKey;
  if (typeof Config?.get === "function") {
    return await Config.get("GEMINI_API_KEY") || process.env.GEMINI_API_KEY;
  }
  return process.env.GEMINI_API_KEY;
}

/**
 * Analyzes HTML source code, extracts `i18n` elements and `<script type="application/ld+json">` data,
 * and uses Google GenAI to synthesize a Language-First JSON translation dictionary.
 * 
 * @async
 * @param {string} html - Raw HTML source code string containing elements with `i18n` attributes.
 * @param {string[]} languages - Array of target language codes (e.g., `["en", "es", "fr"]`).
 * @param {TranslateOptions} [options={}] - Optional configuration parameters for model and authentication.
 * @returns {Promise<LanguageFirstTranslationMap|null>} Language-First translation map, or `null` if generation fails.
 * @throws {Error} Throws an error if no API key is provided or resolved.
 *
 * @example
 * const translations = await translateHtml(
 *   '<h1 i18n="heading">Hello</h1><input i18n="search" placeholder="Search...">',
 *   ["es", "fr"]
 * );
 */
module.exports = async function translateHtml(html, languages, options = {}) {
  const apiKey = await getApiKey(options);
  if (!apiKey) {
    throw new Error("Google GenAI API key is required for translateHtml.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = options.model || DEFAULT_MODEL;
  const langList = Array.isArray(languages) ? languages.join(", ") : String(languages);

  const prompt = `
You are an expert web localization AI. 
Analyze the provided HTML and find all elements containing an "i18n" attribute, as well as any <script type="application/ld+json"> tags.

Target Languages: ${langList}

Instructions:
1. Extract translatable content for each "i18n" key (inner text, alt, title, placeholder, label, aria-label, and aria-* attributes).
2. For script[type='application/ld+json'], use the key "ld+json" or the element's "i18n" attribute, and translate string fields (like name, description) while keeping schema keywords (@context, @type, url) intact.
3. Organize the translations into a LANGUAGE-FIRST structure where top-level keys are the target language codes (${langList}).
4. Inside each language code object, map each "i18n" key to its translated properties (e.g., "text", "placeholder", "alt", "title", "aria-label").
5. Provide a full translation for EVERY target language requested. Never leave a requested language empty.

HTML Source:
${html}
`;

  /**
   * JSON Schema enforcing structured Language-First output from Gemini.
   * @type {import("@google/genai").Schema}
   */
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      translations: {
        type: Type.OBJECT,
        description: "Map of language codes (e.g., 'en', 'es') to key-value translation objects",
        additionalProperties: {
          type: Type.OBJECT,
          description: "Map of i18n keys to element translation properties",
          additionalProperties: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, nullable: true },
              placeholder: { type: Type.STRING, nullable: true },
              title: { type: Type.STRING, nullable: true },
              alt: { type: Type.STRING, nullable: true },
              "aria-label": { type: Type.STRING, nullable: true }
            },
            additionalProperties: true
          }
        }
      }
    },
    required: ["translations"]
  };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: options.temperature ?? 0.2
      }
    });

    const parsed = JSON.parse(response.text);
    return parsed.translations;
  } catch (err) {
    console.error("Gemini Translation Error:", err);
    return null;
  }
};