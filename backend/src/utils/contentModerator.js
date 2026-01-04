// FREE Content Moderation - Enhanced with better detection
// Text-based filtering + filename analysis + pattern matching

import fs from 'fs';

// Enhanced keyword detection with variations and patterns
export const checkText = (text) => {
  const inappropriateKeywords = [
    // Sexual/Adult content - only exact words
    'porn', 'pornography', 'sex video', 'xxx', 'nsfw', 'nude video', 'naked video', 'nudes',
    'explicit content', 'erotic', 'sexual content', 'hentai', 'pussy', 'dick', 'cock',
    'boobs video', 'sexy video', 'hot video', 'adult video', 'bf video', 'gf video',
    'leaked video', 'onlyfans', 'strip video', 'stripper', 'escort', 'hookup',
    'sex scene', 'porn video', '18+ video', 'adult content',
    
    // L33t speak / number substitutions - only exact
    's3x', 'p0rn', 'n00d', 'fck', 'fuk',
    
    // Violence/Disturbing - only extreme cases
    'gore video', 'brutal video', 'dead body', 'beheading'
  ];

  const lowerText = text.toLowerCase();
  
  // Use word boundaries to match whole words/phrases only
  const foundKeywords = inappropriateKeywords.filter(keyword => {
    // Create regex with word boundaries for single words
    const pattern = keyword.includes(' ') 
      ? new RegExp(keyword.replace(/\s+/g, '\\s+'), 'i') 
      : new RegExp(`\\b${keyword}\\b`, 'i');
    return pattern.test(lowerText);
  });

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\b(hot|sexy|nude|naked)\s+(girl|boy|woman|man)\s+video\b/i,
    /\b(18|21)\+?\s*(video|content)\b/i,
    /\badult\s+content\b/i,
    /\b(watch|download|free)\s*(porn|sex)\b/i,
  ];

  const patternMatch = suspiciousPatterns.some(pattern => pattern.test(text));

  return {
    hasInappropriateText: foundKeywords.length > 0 || patternMatch,
    foundKeywords,
    patternDetected: patternMatch,
    message: (foundKeywords.length > 0 || patternMatch)
      ? `🚫 Inappropriate content detected${foundKeywords.length > 0 ? ': ' + foundKeywords.join(', ') : ''}`
      : '✅ Text passed moderation'
  };
};

// Enhanced filename and file analysis
const analyzeFile = (filePath) => {
  if (!filePath) return { suspicious: false };
  
  const filename = filePath.toLowerCase();
  const basename = filename.split(/[/\\]/).pop() || '';
  
  // Suspicious filename terms
  const suspiciousTerms = [
    'porn', 'xxx', 'nude', 'nudes', 'sex', 'nsfw', 'adult', '18+',
    'naked', 'sexy', 'hot', 'leaked', 'onlyfans', 'private'
  ];
  
  const foundTerms = suspiciousTerms.filter(term => basename.includes(term));
  
  // Check file size (very small videos might be suspicious)
  let fileSize = 0;
  try {
    const stats = fs.statSync(filePath);
    fileSize = stats.size;
  } catch (e) {
    // File doesn't exist or can't read
  }
  
  return {
    suspicious: foundTerms.length > 0,
    foundTerms,
    fileSize,
    message: foundTerms.length > 0 
      ? `⚠️ Suspicious filename: ${foundTerms.join(', ')}` 
      : '✅ Filename OK'
  };
};

// Analyze content for red flags
const analyzeContent = ({ title, description, videoPath, thumbnailPath }) => {
  const redFlags = [];
  
  // Very short or missing descriptions are suspicious (but only if combined with other issues)
  const hasShortDescription = !description || description.trim().length < 5;
  
  // Check if title is too generic/vague - but only block very generic ones
  const veryGenericTitles = ['video', 'new video', 'watch this', 'new', 'test'];
  const titleLower = title.toLowerCase().trim();
  const isVeryGeneric = veryGenericTitles.includes(titleLower);
  
  // Only flag if BOTH generic title AND short description
  if (isVeryGeneric && hasShortDescription) {
    redFlags.push('Video requires more descriptive title and description');
  }
  
  // Check video filename for explicit terms
  if (videoPath) {
    const videoAnalysis = analyzeFile(videoPath);
    if (videoAnalysis.suspicious) {
      redFlags.push(`Video filename contains inappropriate terms: ${videoAnalysis.foundTerms.join(', ')}`);
    }
  }
  
  // Check thumbnail filename for explicit terms
  if (thumbnailPath) {
    const thumbAnalysis = analyzeFile(thumbnailPath);
    if (thumbAnalysis.suspicious) {
      redFlags.push(`Thumbnail filename contains inappropriate terms: ${thumbAnalysis.foundTerms.join(', ')}`);
    }
  }
  
  return {
    hasRedFlags: redFlags.length > 0,
    redFlags,
    riskScore: redFlags.length
  };
};

// Main moderation function (enhanced)
export const moderateContent = async ({ title, description, videoPath, thumbnailPath }) => {
  const results = {
    passed: true,
    reasons: [],
    details: {},
    requiresReview: false  // Flag for manual review
  };

  console.log('🔍 Starting content moderation check...');

  // Check title
  const titleCheck = checkText(title);
  results.details.title = titleCheck;
  if (titleCheck.hasInappropriateText) {
    results.passed = false;
    results.reasons.push(`Title: ${titleCheck.message}`);
  }

  // Check description
  const descCheck = checkText(description);
  results.details.description = descCheck;
  if (descCheck.hasInappropriateText) {
    results.passed = false;
    results.reasons.push(`Description: ${descCheck.message}`);
  }

  // Analyze content patterns and files
  const contentAnalysis = analyzeContent({ title, description, videoPath, thumbnailPath });
  results.details.contentAnalysis = contentAnalysis;
  
  if (contentAnalysis.hasRedFlags) {
    results.passed = false;
    results.reasons.push(...contentAnalysis.redFlags);
  }

  // 🔒 STRICT MODE: If passed basic checks but still suspicious, require manual review
  // This catches videos with clean titles but inappropriate content
  const suspiciousIndicators = [
    description.trim().length < 15, // Very short descriptions
    title.trim().length < 10, // Very short titles
    /\b(best|watch|new|enjoy|video)\b/i.test(title) && description.trim().length < 20
  ];
  
  const suspicionCount = suspiciousIndicators.filter(Boolean).length;
  
  if (results.passed && suspicionCount >= 2) {
    results.requiresReview = true;
    console.log('⚠️  Content flagged for manual review (suspicious indicators)');
  }

  // Log results
  console.log('🔍 Moderation Results:', {
    passed: results.passed ? '✅ PASSED' : '❌ BLOCKED',
    requiresReview: results.requiresReview ? '⚠️  NEEDS REVIEW' : '✅ AUTO-APPROVED',
    title: titleCheck.hasInappropriateText ? '❌' : '✅',
    description: descCheck.hasInappropriateText ? '❌' : '✅',
    contentFlags: contentAnalysis.hasRedFlags ? `❌ (${contentAnalysis.riskScore} issues)` : '✅',
    reasons: results.reasons
  });

  return results;
};

// Dummy function for compatibility
export const loadModel = async () => {
  console.log('✅ Enhanced text-based content moderation ready');
  console.log('🛡️  Protection includes: keyword detection, pattern matching, filename analysis, content heuristics');
  return Promise.resolve();
};
