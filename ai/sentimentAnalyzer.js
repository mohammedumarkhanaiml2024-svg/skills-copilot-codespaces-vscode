const natural = require('natural');
const sentiment = require('sentiment');

class SentimentAnalyzer {
  constructor() {
    this.analyzer = new sentiment();
    this.tokenizer = new natural.WordTokenizer();
    
    // Mood-related word mappings
    this.moodKeywords = {
      positive: ['happy', 'joy', 'excited', 'good', 'great', 'amazing', 'wonderful', 'fantastic', 'love', 'blessed'],
      negative: ['sad', 'depressed', 'anxious', 'worried', 'stressed', 'tired', 'exhausted', 'angry', 'frustrated', 'upset'],
      neutral: ['okay', 'fine', 'normal', 'average', 'usual', 'regular']
    };
  }

  analyzeSentiment(text) {
    const result = this.analyzer.analyze(text);
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    
    // Calculate mood indicators
    const moodIndicators = this.detectMoodKeywords(tokens);
    
    return {
      score: result.score,
      comparative: result.comparative,
      calculation: result.calculation,
      tokens: result.tokens,
      words: result.words,
      positive: result.positive,
      negative: result.negative,
      moodCategory: this.categorizeMood(result.comparative),
      moodKeywords: moodIndicators,
      confidence: this.calculateConfidence(result, moodIndicators)
    };
  }

  detectMoodKeywords(tokens) {
    const detected = {
      positive: [],
      negative: [],
      neutral: []
    };

    tokens.forEach(token => {
      Object.keys(this.moodKeywords).forEach(category => {
        if (this.moodKeywords[category].includes(token)) {
          detected[category].push(token);
        }
      });
    });

    return detected;
  }

  categorizeMood(comparative) {
    if (comparative > 0.1) return 'positive';
    if (comparative < -0.1) return 'negative';
    return 'neutral';
  }

  calculateConfidence(sentimentResult, moodIndicators) {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on strong sentiment words
    if (sentimentResult.words.length > 0) {
      confidence += Math.min(sentimentResult.words.length * 0.1, 0.3);
    }
    
    // Increase confidence based on mood keywords
    const totalMoodKeywords = Object.values(moodIndicators).flat().length;
    confidence += Math.min(totalMoodKeywords * 0.15, 0.2);
    
    return Math.min(confidence, 1.0);
  }

  getMoodSuggestions(sentimentResult) {
    const { moodCategory, moodKeywords } = sentimentResult;
    
    if (moodCategory === 'negative') {
      return {
        immediate: ['Take 5 deep breaths', 'Go for a short walk', 'Listen to calming music'],
        shortTerm: ['Practice gratitude journaling', 'Connect with a friend', 'Try meditation'],
        longTerm: ['Consider regular exercise', 'Establish a sleep routine', 'Practice mindfulness']
      };
    } else if (moodCategory === 'positive') {
      return {
        immediate: ['Share your joy with someone', 'Celebrate this moment', 'Write about what went well'],
        shortTerm: ['Plan something fun', 'Help someone else', 'Learn something new'],
        longTerm: ['Build on this positive momentum', 'Set new goals', 'Create positive habits']
      };
    } else {
      return {
        immediate: ['Check in with yourself', 'Take a moment to reflect', 'Notice your surroundings'],
        shortTerm: ['Try a new activity', 'Connect with nature', 'Practice self-care'],
        longTerm: ['Explore new interests', 'Build meaningful relationships', 'Focus on personal growth']
      };
    }
  }
}

module.exports = SentimentAnalyzer;