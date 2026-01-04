import axios from 'axios';

/**
 * Sightengine AI Content Moderation
 * Checks images and video thumbnails for:
 * - Nudity & Sexual Content
 * - Violence & Gore
 * - Offensive content
 * 
 * Free tier: 2,000 checks/month
 * Docs: https://sightengine.com/docs/
 */

const SIGHTENGINE_API_URL = 'https://api.sightengine.com/1.0/check.json';
const API_USER = process.env.SIGHTENGINE_API_USER;
const API_SECRET = process.env.SIGHTENGINE_API_SECRET;

/**
 * Check if image/video contains inappropriate content
 * @param {string} fileUrl - Public URL of the image/video to check
 * @returns {Promise<{inappropriate: boolean, reason: string, details: object}>}
 */
export const checkContent = async (fileUrl) => {
  try {
    if (!API_USER || !API_SECRET) {
      console.log('⚠️  Sightengine API keys not configured - skipping AI moderation');
      return { inappropriate: false, reason: 'AI moderation disabled', details: {} };
    }

    console.log('🤖 Sightengine AI analyzing content...');
    console.log('🔗 Checking:', fileUrl.substring(0, 60) + '...');

    // Check for nudity and violence (fastest models)
    const response = await axios.get(SIGHTENGINE_API_URL, {
      params: {
        url: fileUrl,
        models: 'nudity-2.0,wad', // Only essential checks for speed
        api_user: API_USER,
        api_secret: API_SECRET
      },
      timeout: 15000 // 15 second timeout
    });

    const data = response.data;
    console.log('📊 AI Analysis Complete!');
    console.log('   Sexual Activity:', (data.nudity?.sexual_activity * 100).toFixed(1) + '%');
    console.log('   Sexual Display:', (data.nudity?.sexual_display * 100).toFixed(1) + '%');
    console.log('   Suggestive:', (data.nudity?.suggestive * 100).toFixed(1) + '%');

    // Check for nudity/sexual content with optimized thresholds
    const nudity = data.nudity || {};
    
    // Explicit content - very strict (block at 40%)
    const hasExplicitNudity = nudity.sexual_activity > 0.4 || nudity.sexual_display > 0.4;
    
    // Suggestive content - moderate (block at 70%)
    const hasSuggestiveNudity = nudity.suggestive > 0.7;
    
    // Partial nudity - lenient (block at 85%)
    const hasPartialNudity = nudity.partial_nudity > 0.85;

    if (hasExplicitNudity) {
      console.log('❌ BLOCKED: Explicit sexual content detected!');
      return {
        inappropriate: true,
        reason: '🚫 Explicit sexual content detected in your video thumbnail',
        details: {
          sexual_activity: (nudity.sexual_activity * 100).toFixed(1) + '%',
          sexual_display: (nudity.sexual_display * 100).toFixed(1) + '%'
        }
      };
    }

    if (hasSuggestiveNudity) {
      console.log('❌ BLOCKED: Suggestive content detected!');
      return {
        inappropriate: true,
        reason: '🚫 Suggestive/inappropriate content detected',
        details: {
          suggestive: (nudity.suggestive * 100).toFixed(1) + '%'
        }
      };
    }

    if (hasPartialNudity) {
      console.log('❌ BLOCKED: Inappropriate nudity detected!');
      return {
        inappropriate: true,
        reason: '🚫 Inappropriate nudity detected',
        details: {
          partial_nudity: (nudity.partial_nudity * 100).toFixed(1) + '%'
        }
      };
    }

    // Check for violence/weapons (lenient threshold)
    const weapon = data.weapon || 0;
    if (weapon > 0.75) {
      console.log('❌ BLOCKED: Violence/weapons detected!');
      return {
        inappropriate: true,
        reason: '🚫 Violence or weapons detected',
        details: { weapon_score: (weapon * 100).toFixed(1) + '%' }
      };
    }

    console.log('✅ Content passed AI moderation - safe to upload');
    return {
      inappropriate: false,
      reason: 'Content is appropriate',
      details: data
    };

  } catch (error) {
    console.error('❌ Sightengine API error:', error.message);
    
    // If API fails, allow upload but flag for manual review
    return {
      inappropriate: false,
      reason: 'AI check failed - requires manual review',
      requiresReview: true,
      error: error.message
    };
  }
};

/**
 * Check multiple files (video thumbnail + custom thumbnail)
 * @param {string[]} fileUrls - Array of URLs to check
 * @returns {Promise<{inappropriate: boolean, reason: string}>}
 */
export const checkMultipleFiles = async (fileUrls) => {
  try {
    const results = await Promise.all(
      fileUrls.map(url => checkContent(url))
    );

    // If any file is inappropriate, reject all
    const inappropriate = results.find(r => r.inappropriate);
    if (inappropriate) {
      return inappropriate;
    }

    // If any check failed, require manual review
    const failed = results.find(r => r.requiresReview);
    if (failed) {
      return {
        inappropriate: false,
        requiresReview: true,
        reason: 'Some files require manual review'
      };
    }

    return {
      inappropriate: false,
      reason: 'All files passed moderation'
    };
  } catch (error) {
    console.error('❌ Error checking multiple files:', error);
    return {
      inappropriate: false,
      requiresReview: true,
      reason: 'Moderation check failed'
    };
  }
};

export default { checkContent, checkMultipleFiles };
