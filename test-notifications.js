// Test script to manually set authentication data in localStorage
// Run this in browser console to simulate login

const testUser = {
  id: "cmcv9bg850000wo6gnsxke9py",
  username: "admin",
  email: "admin@goodman.com",
  avatar: "http://localhost:3001/uploads/avatars/avatar-1752032683896-543872037.png",
  bio: "",
  balance: 1000,
  level: 10,
  createdAt: "2025-07-09T01:05:00.389Z",
  updatedAt: "2025-07-09T03:44:47.394Z"
};

const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtY3Y5Ymc4NTAwMDB3bzZnbnN4a2U5cHkiLCJpYXQiOjE3NTMxNzYzNDksImV4cCI6MTc1Mzc4MTE0OX0.kpagQCqAK-QV-_rqa1gYqth_EEopwpPPmXAqF834T7I";

// Set data in localStorage
localStorage.setItem('user', JSON.stringify(testUser));
localStorage.setItem('token', testToken);

console.log('✅ Test user and token set in localStorage');
console.log('Please refresh the page to see the notification bell');

// Test API call directly
fetch('/api/notifications/unread-count', {
  headers: {
    'Authorization': `Bearer ${testToken}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log('📊 Unread count API response:', data);
})
.catch(error => {
  console.error('❌ API call failed:', error);
});

fetch('/api/notifications', {
  headers: {
    'Authorization': `Bearer ${testToken}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log('📝 Notifications API response:', data);
})
.catch(error => {
  console.error('❌ Notifications API call failed:', error);
});