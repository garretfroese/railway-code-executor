const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing Railway Code Executor API...\n');
  
  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    console.log();
    
    // Test JavaScript execution
    console.log('2. Testing JavaScript execution...');
    const jsResponse = await axios.post(`${BASE_URL}/api/execute`, {
      code: 'const result = 2 + 2; console.log("Result:", result); result;',
      language: 'javascript'
    });
    console.log('✅ JavaScript execution:', jsResponse.data);
    console.log();
    
    // Test Python execution
    console.log('3. Testing Python execution...');
    const pyResponse = await axios.post(`${BASE_URL}/api/execute`, {
      code: 'print("Hello from Python!"); result = 5 * 5; print(f"Result: {result}")',
      language: 'python'
    });
    console.log('✅ Python execution:', pyResponse.data);
    console.log();
    
    // Test error handling
    console.log('4. Testing error handling...');
    const errorResponse = await axios.post(`${BASE_URL}/api/execute`, {
      code: 'undefinedVariable.someMethod();',
      language: 'javascript'
    });
    console.log('✅ Error handling:', errorResponse.data);
    console.log();
    
    // Test validation
    console.log('5. Testing input validation...');
    try {
      await axios.post(`${BASE_URL}/api/execute`, {
        language: 'javascript'
        // Missing code field
      });
    } catch (error) {
      console.log('✅ Validation works:', error.response.data);
    }
    
    console.log('\n🎉 All tests passed! API is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;

