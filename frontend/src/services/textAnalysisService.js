// frontend/src/services/textAnalysisService.js

/**
 * Text Analysis Service
 * Provides grammar checking, summarization, keyword extraction, and readability scoring
 */

// Remove HTML tags from content
const stripHtml = (html) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

// Common grammar rules
const grammarRules = [
  {
    name: "Double spaces",
    regex: /  +/g,
    suggestion: "Remove extra spaces between words",
  },
  {
    name: "Missing space after period",
    regex: /\.\w/g,
    suggestion: "Add space after period",
  },
  {
    name: "Starting sentence with lowercase",
    regex: /[\.\!\?]\s+[a-z]/g,
    suggestion: "Capitalize first letter of sentence",
  },
  {
    name: "Common typos",
    patterns: [
      { word: "teh", suggest: "the" },
      { word: "recieve", suggest: "receive" },
      { word: "occured", suggest: "occurred" },
      { word: "seperate", suggest: "separate" },
      { word: "neccessary", suggest: "necessary" },
      { word: "definately", suggest: "definitely" },
      { word: "untill", suggest: "until" },
      { word: "accross", suggest: "across" },
    ],
  },
];

// Text Summarizer (Rule-based)
export const summarizeText = (text, sentenceCount = 3) => {
  const plainText = stripHtml(text);

  // Split into sentences
  const sentences = plainText.match(/[^.!?]+[.!?]+/g) || [];
  if (sentences.length <= sentenceCount) {
    return plainText;
  }

  // Score sentences based on word frequency
  const words = plainText
    .toLowerCase()
    .match(/\b\w+\b/g) || [];
  const wordFreq = {};

  words.forEach((word) => {
    if (word.length > 3) {
      // Ignore short words
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  // Score each sentence
  const scoredSentences = sentences.map((sentence, index) => ({
    text: sentence.trim(),
    score: calculateSentenceScore(sentence, wordFreq),
    index,
  }));

  // Get top sentences and maintain order
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, sentenceCount)
    .sort((a, b) => a.index - b.index)
    .map((s) => s.text)
    .join(" ");

  return topSentences;
};

// Helper: Calculate sentence score based on word frequency
const calculateSentenceScore = (sentence, wordFreq) => {
  const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
  let score = 0;

  words.forEach((word) => {
    if (word.length > 3) {
      score += wordFreq[word] || 0;
    }
  });

  return score;
};

// Keyword Extractor (TF-IDF based)
export const extractKeywords = (text, limit = 10) => {
  const plainText = stripHtml(text);
  const words = plainText
    .toLowerCase()
    .match(/\b\w+\b/g) || [];

  // Common stop words to exclude
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "can",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "what",
    "which",
    "who",
    "when",
    "where",
    "why",
    "how",
  ]);

  // Calculate word frequency
  const wordFreq = {};
  words.forEach((word) => {
    if (!stopWords.has(word) && word.length > 2) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  // Sort by frequency
  const keywords = Object.entries(wordFreq)
    .map(([word, freq]) => ({
      word,
      frequency: freq,
      relevance: Math.round((freq / words.length) * 100 * 10) / 10, // Percentage
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, limit);

  return keywords;
};

// Readability Score Calculator
export const calculateReadability = (text) => {
  const plainText = stripHtml(text);

  // Basic statistics
  const characters = plainText.replace(/\s/g, "").length;
  const words = plainText.match(/\b\w+\b/g) || [];
  const wordCount = words.length;
  const sentences = plainText.match(/[.!?]+/g) || [];
  const sentenceCount = sentences.length || 1;

  // Avoid division by zero
  if (wordCount === 0 || sentenceCount === 0) {
    return {
      score: 0,
      averageWordsPerSentence: 0,
      averageCharsPerWord: 0,
      averageSyllablesPerWord: 0,
      grade: "N/A",
      readabilityLevel: "Unable to calculate",
    };
  }

  // Calculate averages
  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgCharsPerWord = characters / wordCount;

  // Estimate syllables (simplified: count vowels)
  let totalSyllables = 0;
  words.forEach((word) => {
    totalSyllables += estimateSyllables(word);
  });
  const avgSyllablesPerWord = totalSyllables / wordCount;

  // Flesch Kincaid Grade Level Formula
  // 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
  const fleschKincaidGrade =
    0.39 * avgWordsPerSentence +
    11.8 * avgSyllablesPerWord -
    15.59;

  const grade = Math.max(0, Math.round(fleschKincaidGrade * 10) / 10);

  // Determine readability level
  let readabilityLevel = "N/A";
  if (grade < 6) readabilityLevel = "Very Easy (Children)";
  else if (grade < 9) readabilityLevel = "Easy (Middle School)";
  else if (grade < 13) readabilityLevel = "Standard (High School)";
  else if (grade < 16) readabilityLevel = "Hard (College)";
  else readabilityLevel = "Very Hard (Professional)";

  // Calculate reading time (average 200 words per minute)
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  return {
    score: grade,
    averageWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    averageCharsPerWord: Math.round(avgCharsPerWord * 10) / 10,
    averageSyllablesPerWord: Math.round(avgSyllablesPerWord * 10) / 10,
    grade: grade.toFixed(1),
    readabilityLevel,
    charCount: characters,
    wordCount,
    sentenceCount,
    readingTimeMinutes,
    complexityScore: Math.min(100, Math.round(grade * 6.25)),
  };
};

// Helper: Estimate syllables in a word (simplified)
const estimateSyllables = (word) => {
  word = word.toLowerCase();
  let count = 0;
  let previousWasVowel = false;

  const vowels = "aeiouy";

  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);

    if (isVowel && !previousWasVowel) {
      count++;
    }

    previousWasVowel = isVowel;
  }

  // Adjust for silent e
  if (word.endsWith("e")) {
    count--;
  }

  // Ensure at least 1 syllable
  return Math.max(1, count);
};

// Combined analysis function
export const analyzeText = (text) => {
  return {
    summary: summarizeText(text, 3),
    keywords: extractKeywords(text, 10),
    readability: calculateReadability(text),
  };
};
