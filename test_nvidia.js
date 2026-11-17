require('dotenv').config();
const OpenAI = require('openai');

const client = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: process.env.NVIDIA_API_BASE_URL,
});

const candidates = [
    'meta/llama-3.2-11b-vision-instruct',
    'meta/llama-3.2-90b-vision-instruct',
    'deepseek-ai/deepseek-v4-pro-0813',
    'nvidia/nemotron-3.5-lightning-30b-a3b',
    'moonshotai/kimi-k3',
];

async function testModel(model) {
    try {
        const res = await client.chat.completions.create({
            model,
            messages: [{ role: 'user', content: 'halo' }],
            max_tokens: 20,
        });
        console.log(`✅ WORKS: ${model} → "${res.choices[0].message.content.substring(0, 50)}"`);
        return true;
    } catch (e) {
        console.log(`❌ ${e.status}: ${model}`);
        return false;
    }
}

async function main() {
    for (const m of candidates) {
        await testModel(m);
        await new Promise(r => setTimeout(r, 500));
    }
}
main();
