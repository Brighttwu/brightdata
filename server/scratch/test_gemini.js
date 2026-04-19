require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    const key = "AIzaSyDOnecjxhCI7RezsG-KohJh7wt8ij3HzZw";
    console.log("Testing Gemini with Key:", key.substring(0, 10) + "...");

    try {
        const genAI = new GoogleGenerativeAI(key);
        const models = await genAI.getGenerativeModel({ model: "gemini-pro" }); // this is just a dummy to get access to listModels if supported, but actually listModels is on the genAI instance in some versions or needs a different approach.
        // Actually, listModels is not on genAI. It's often via a separate client or just not in the basic SDK.
        // But let's try "gemini-1.5-flash" again with a different check.
        console.log("Attempting with gemini-2.0-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("Hi");
        console.log("Result:", (await result.response).text());
    } catch (err) {
        console.error("Error:", err.message);
    }
}

test();
