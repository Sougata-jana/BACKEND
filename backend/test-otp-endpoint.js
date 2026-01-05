import axios from 'axios';

console.log('Testing OTP endpoint...');

const testEmail = 'amisougata25@gmail.com';

axios.post('http://localhost:3000/api/v1/users/send-signup-otp', {
  email: testEmail
})
.then(response => {
  console.log('✅ SUCCESS!');
  console.log('Response:', response.data);
})
.catch(error => {
  console.log('❌ ERROR!');
  console.log('Status:', error.response?.status);
  console.log('Message:', error.response?.data);
  console.log('Full error:', error.message);
});
