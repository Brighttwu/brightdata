const axios = require('axios');
(async () => {
    try {
        console.log('Testing connection to Bossu Hub...');
        const start = Date.now();
        const res = await axios.get('https://bossudatahub.com/api.php', { timeout: 10000 });
        console.log('Connected successfuly in', Date.now() - start, 'ms');
        console.log('Status:', res.status);
    } catch (err) {
        console.error('Connection Failed!');
        console.error('Message:', err.message);
        console.error('Code:', err.code);
    }
})();
