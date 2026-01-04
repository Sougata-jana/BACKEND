// Quick test for Sightengine AI
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const API_USER = process.env.SIGHTENGINE_API_USER;
const API_SECRET = process.env.SIGHTENGINE_API_SECRET;

console.log('🧪 Testing Sightengine AI...\n');
console.log('API User:', API_USER ? '✅ Found' : '❌ Missing');
console.log('API Secret:', API_SECRET ? '✅ Found' : '❌ Missing');
console.log('');

if (!API_USER || !API_SECRET) {
  console.log('❌ API keys missing in .env file!');
  process.exit(1);
}

// Test with a safe public image
const testImageUrl = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400';

console.log('🔍 Testing with safe image...');
console.log('URL:', testImageUrl);
console.log('');

axios.get('https://api.sightengine.com/1.0/check.json', {
  params: {
    url: testImageUrl,
    models: 'nudity-2.0,wad,offensive',
    api_user: API_USER,
    api_secret: API_SECRET
  }
})
.then(response => {
  console.log('✅ API Connection Successful!\n');
  console.log('📊 AI Analysis Results:');
  console.log(JSON.stringify(response.data, null, 2));
  console.log('\n✅ Sightengine AI is working correctly!');
  process.exit(0);
})
.catch(error => {
  console.log('❌ API Error:', error.response?.data || error.message);
  console.log('\nCheck:');
  console.log('1. API keys are correct');
  console.log('2. Internet connection is working');
  console.log('3. Sightengine account is active');
  process.exit(1);
});
