const fetch = require('node-fetch');

async function testUsersLoading() {
    console.log('Testing users API...');
    
    try {
        // Test backend API directly
        const response = await fetch('http://localhost:3001/api/users', {
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:3000'
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`✅ Backend API success: ${data.count} users found`);
        console.log('Users:', data.users.map(u => u.name).join(', '));
        
        // Test frontend API service
        const apiService = require('./src/services/api.js').default;
        
        try {
            const usersData = await apiService.getUsers();
            console.log(`✅ Frontend API service success: ${usersData.users.length} users found`);
        } catch (error) {
            console.log('❌ Frontend API service error:', error.message);
        }
        
    } catch (error) {
        console.log('❌ Backend API error:', error.message);
    }
}

testUsersLoading();
