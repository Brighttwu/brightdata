const { GoogleGenerativeAI } = require("@google/generative-ai");
const key = "AIzaSyDOnecjxhCI7RezsG-KohJh7wt8ij3HzZw";

async function list() {
    try {
        const genAI = new GoogleGenerativeAI(key);
        // listModels is not in the base SDK easily, but we can try fetching it via axios
        const axios = require('axios');
        const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        console.log("Models:", res.data.models.map(m => m.name));
    } catch (err) {
        console.error("List Error:", err.response?.data || err.message);
    }
}
list();
