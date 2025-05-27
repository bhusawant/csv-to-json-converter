const fs = require('fs');
const path = require('path');

// Simple API testing script
const API_BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🚀 Testing CSV to JSON Converter API\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.message);
    console.log('');

    // Test 2: Clear existing users
    console.log('2. Clearing existing users...');
    const clearResponse = await fetch(`${API_BASE_URL}/api/csv/users`, {
      method: 'DELETE'
    });
    const clearData = await clearResponse.json();
    console.log('✅ Clear users:', clearData.message);
    console.log('');

    // Test 3: Process CSV from file path
    console.log('3. Processing CSV from file path...');
    const processResponse = await fetch(`${API_BASE_URL}/api/csv/process-path`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filePath: './sample_data.csv'
      })
    });
    
    if (processResponse.ok) {
      const processData = await processResponse.json();
      console.log('✅ CSV processed successfully');
      console.log(`📊 Records processed: ${processData.data.recordsProcessed}`);
      console.log('📈 Age Distribution:');
      Object.entries(processData.data.ageDistribution).forEach(([group, percentage]) => {
        console.log(`   ${group}: ${percentage}%`);
      });
      console.log('');
    } else {
      console.log('❌ Failed to process CSV:', await processResponse.text());
    }

    // Test 4: Get age distribution
    console.log('4. Getting age distribution...');
    const distResponse = await fetch(`${API_BASE_URL}/api/csv/age-distribution`);
    const distData = await distResponse.json();
    console.log('✅ Age distribution retrieved');
    console.log('📈 Distribution:');
    Object.entries(distData.data.ageDistribution).forEach(([group, percentage]) => {
      console.log(`   ${group}: ${percentage}%`);
    });
    console.log('');

    // Test 5: Get all users (first 3)
    console.log('5. Getting users...');
    const usersResponse = await fetch(`${API_BASE_URL}/api/csv/users`);
    const usersData = await usersResponse.json();
    console.log(`✅ Retrieved ${usersData.data.count} users`);
    console.log('👥 Sample users:');
    usersData.data.users.slice(0, 3).forEach(user => {
      console.log(`   - ${user.name}, Age: ${user.age}`);
      if (user.address) {
        const addr = JSON.parse(user.address);
        console.log(`     Address: ${addr.city}, ${addr.state}`);
      }
    });
    console.log('');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testAPI();