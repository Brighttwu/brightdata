const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.BOSSU_API_URL;
const API_KEY = process.env.BOSSU_API_KEY;

// Check the full create_order response structure (dry run with a test reference)
const body = new URLSearchParams({
    action: 'create_order',
    network: 'mtn',
    package_key: '1GB',
    recipient_phone: '0241234567',
    external_reference: 'TEST-DRY-RUN-' + Date.now()
});

axios.post(API_URL, body, {
    headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' }
}).then(r => {
    console.log('CREATE ORDER FULL RESPONSE:');
    console.log(JSON.stringify(r.data, null, 2));
    console.log('\nKey fields:');
    console.log('  order_id:', r.data.order_id);
    console.log('  data.order_id:', r.data.data?.order_id);
    console.log('  id:', r.data.id);
    console.log('  data.id:', r.data.data?.id);
    console.log('  status:', r.data.status);
    console.log('  data.status:', r.data.data?.status);
}).catch(e => {
    console.log('ERROR:', JSON.stringify(e.response?.data || e.message, null, 2));
});
