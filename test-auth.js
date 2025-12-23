const axios = require('axios');
const querystring = require('querystring');

async function testAuth() {
    const baseURL = 'http://localhost:3000';
    const timestamp = Date.now();
    const testUser = {
        username: `testuser_${timestamp}`,
        email: `test${timestamp}@example.com`,
        password: 'password123'
    };

    try {
        console.log('1. Testing Registration...');
        const registerData = querystring.stringify(testUser);

        // Note: Axios checks status codes automatically. 302 redirect is normal for success here.
        // However, axios follows redirects by default. We want to see where it went.
        const regRes = await axios.post(`${baseURL}/auth/register`, registerData, {
            maxRedirects: 0,
            validateStatus: function (status) {
                return status >= 200 && status < 400; // Accept 3xx as success
            }
        });

        if (regRes.status === 302 && regRes.headers.location === '/login') {
            console.log('SUCCESS: Registration redirected to /login');
        } else {
            console.log('FAILED: Registration return status ' + regRes.status);
        }

        console.log('2. Testing Login...');
        const loginData = querystring.stringify({
            email: testUser.email,
            password: testUser.password
        });

        const loginRes = await axios.post(`${baseURL}/auth/login`, loginData, {
            maxRedirects: 0,
            validateStatus: function (status) {
                return status >= 200 && status < 400;
            }
        });

        if (loginRes.status === 302 && loginRes.headers.location === '/dashboard') {
            console.log('SUCCESS: Login redirected to /dashboard');
        } else {
            console.log('FAILED: Login return status ' + loginRes.status);
            console.log('Location:', loginRes.headers.location);
        }

    } catch (error) {
        console.error('Test Failed:', error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
        }
    }
}

testAuth();
