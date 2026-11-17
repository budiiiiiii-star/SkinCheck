/**
 * LLMProviderFactory.js
 * Mengelola multi-provider AI: NVIDIA, Google Gemini, OpenAI, Anthropic Claude, Groq, Ollama.
 * Provider aktif ditentukan dari process.env.AI_PROVIDER.
 */

const SYSTEM_PROMPT = `Kamu adalah SkinCheck AI Assistant — asisten edukasi skincare dan kosmetik OTC (Over-The-Counter) berbahasa Indonesia.

Panduan perilaku:
- Selalu jawab dalam Bahasa Indonesia yang ramah, informatif, dan mudah dipahami.
- Fokus pada edukasi skincare, rutinitas perawatan kulit, kecantikan, dan rekomendasi produk kosmetik/skincare.
- JANGAN pernah mendiagnosis penyakit kulit atau meresepkan obat. Jika ada pertanyaan medis serius, arahkan ke dokter spesialis kulit.
- Gunakan emoji secara bijak untuk membuat respons lebih menarik.
- Jawaban singkat dan padat, maksimal 3-4 paragraf kecuali diminta detail.
- JIKA PENGGUNA MENANYAKAN IDENTITAS DIRINYA SENDIRI (contoh: "siapa saya?", "saiapa saya", "nama saya siapa?", "siapa aku?"):
  Jawablah dengan menyebutkan nama dan profil pengguna sesuai data pengguna yang sedang login saat ini.`;

const ADMIN_SYSTEM_PROMPT = `Kamu adalah SkinCheck AI Admin Assistant — asisten cerdas khusus Administrator platform SkinCheck.
Kamu memiliki akses ke informasi identitas pengguna yang sedang login serta referensi data database sistem SkinCheck.

Aturan Penting & Panduan Perilaku:
1. HANYA jawab pertanyaan yang secara spesifik ditanyakan oleh Admin. Fokus, padat, langsung to-the-point, dan jangan bertele-tele.
2. JANGAN PERNAH membongkar, merangkum, atau memuntahkan data statistik, metrik, pengguna lain, atau isi database jika Admin TIDAK memintanya secara eksplisit.
3. PERBEDAAN MENGENAI PERTANYAAN IDENTITAS (PENTING):
   a. JIKA ADMIN BERTANYA TENTANG DIRINYA SENDIRI (contoh: "siapa saya?", "saiapa saya", "nama saya siapa?", "siapa aku?", "role saya apa?", "akun siapa ini?"):
      - Jawab langsung dengan menjelaskan siapa pengguna yang sedang login saat ini.
      - Sebutkan Nama pengguna, Role/Peran (Administrator), dan Email sesuai data sesi pengguna yang dilampirkan.
      - Contoh jawaban: "Anda adalah **[Nama Admin]**, yang saat ini login sebagai **Administrator** di platform SkinCheck (Email: [Email]). Ada yang bisa saya bantu?"
      - JANGAN menjawab dengan memperkenalkan diri AI jika yang ditanyakan adalah "siapa saya"!
   b. JIKA ADMIN BERTANYA TENTANG IDENTITAS AI (contoh: "siapa anda?", "kamu siapa?", "bisa apa saja?"):
      - Cukup perkenalkan dirimu secara singkat (1-2 kalimat) sebagai SkinCheck AI Admin Assistant tanpa membeberkan statistik database.
4. Jika Admin hanya menyapa (contoh: "halo", "hai", "selamat pagi"):
   - Sapa balik secara ramah dan tanyakan apa yang bisa dibantu tanpa membeberkan statistik database.
5. Gunakan data database HANYA jika pertanyaan Admin secara langsung berkaitan atau memintanya (misal: "ada berapa pengguna aktif?", "rekap scan hari ini", "tampilkan produk").
6. Jika Admin menanyakan data tertentu, jawab spesifik data yang diminta saja, gunakan format Markdown yang rapi tanpa menyertakan bagian lain yang tidak relevan.
7. DAFTAR CUSTOMER: Saat Admin menanyakan daftar atau "siapa saja" pengguna/customer yang terdaftar, HANYA sebutkan pengguna dengan peran CUSTOMER. JANGAN PERNAH menyertakan atau menyebut akun Administrator ke dalam daftar customer!`;

// Provider definitions: name, label, env keys, default models
const PROVIDERS = {
    nvidia: {
        label: 'NVIDIA NIM',
        icon: 'fa-microchip',
        color: '#76b900',
        keyEnv: 'NVIDIA_API_KEY',
        baseUrlEnv: 'NVIDIA_API_BASE_URL',
        modelEnv: 'NVIDIA_MODEL',
        defaultBaseUrl: 'https://integrate.api.nvidia.com/v1',
        defaultModels: [
            'meta/llama-3.2-11b-vision-instruct',
            'meta/llama-3.2-90b-vision-instruct',
            'nvidia/nemotron-3.5-lightning-30b-a3b',
        ],
        type: 'openai_compatible',
    },
    gemini: {
        label: 'Google Gemini',
        icon: 'fa-google',
        color: '#4285F4',
        keyEnv: 'GEMINI_API_KEY',
        baseUrlEnv: null,
        modelEnv: 'GEMINI_MODEL',
        defaultBaseUrl: null,
        defaultModels: [
            'gemini-1.5-flash',
            'gemini-2.0-flash',
            'gemini-2.5-flash',
            'gemini-3.5-flash-lite',
            'gemini-3.8-flash',
        ],
        type: 'gemini',
    },
    openai: {
        label: 'OpenAI (GPT-4o)',
        icon: 'fa-brain',
        color: '#10a37f',
        keyEnv: 'OPENAI_API_KEY',
        baseUrlEnv: 'OPENAI_API_BASE_URL',
        modelEnv: 'OPENAI_MODEL',
        defaultBaseUrl: 'https://api.openai.com/v1',
        defaultModels: [
            'gpt-4o',
            'gpt-4o-mini',
            'gpt-4-turbo',
            'gpt-3.5-turbo',
        ],
        type: 'openai_compatible',
    },
    anthropic: {
        label: 'Anthropic Claude',
        icon: 'fa-a',
        color: '#d4a27f',
        keyEnv: 'ANTHROPIC_API_KEY',
        baseUrlEnv: null,
        modelEnv: 'ANTHROPIC_MODEL',
        defaultBaseUrl: null,
        defaultModels: [
            'claude-sonnet-4-5',
            'claude-haiku-4-5',
            'claude-opus-4-5',
            'claude-3-5-sonnet-20241022',
        ],
        type: 'anthropic',
    },
    groq: {
        label: 'Groq (Llama / Gemma)',
        icon: 'fa-bolt',
        color: '#f55036',
        keyEnv: 'GROQ_API_KEY',
        baseUrlEnv: null,
        modelEnv: 'GROQ_MODEL',
        defaultBaseUrl: 'https://api.groq.com/openai/v1',
        defaultModels: [
            'llama-3.3-70b-versatile',
            'llama-3.1-8b-instant',
            'gemma2-9b-it',
            'mixtral-8x7b-32768',
        ],
        type: 'openai_compatible',
    },
    ollama: {
        label: 'Ollama (Lokal)',
        icon: 'fa-server',
        color: '#845ef7',
        keyEnv: null,
        baseUrlEnv: 'OLLAMA_BASE_URL',
        modelEnv: 'OLLAMA_MODEL',
        defaultBaseUrl: 'http://localhost:11434/v1',
        defaultModels: [
            'llama3.2',
            'llama3.1',
            'mistral',
            'gemma2',
            'qwen2.5',
        ],
        type: 'openai_compatible',
    },
};

function getActiveProvider() {
    const p = (process.env.AI_PROVIDER || 'nvidia').toLowerCase().trim();
    return PROVIDERS[p] ? p : 'nvidia';
}

function getActiveProviderDef() {
    return PROVIDERS[getActiveProvider()];
}

function getModelsList(providerKey) {
    const pk = providerKey || getActiveProvider();
    const def = PROVIDERS[pk];
    if (!def) return [];
    const list = [];
    const envModel = def.modelEnv ? process.env[def.modelEnv] : null;
    if (envModel && envModel.trim()) list.push(envModel.trim());
    for (const m of def.defaultModels) {
        if (!list.includes(m)) list.push(m);
    }
    return list;
}

function getApiKey(providerKey) {
    const pk = providerKey || getActiveProvider();
    const def = PROVIDERS[pk];
    if (!def || !def.keyEnv) return null;
    return process.env[def.keyEnv] || null;
}

function isConfigured(providerKey) {
    const pk = providerKey || getActiveProvider();
    const def = PROVIDERS[pk];
    if (!def) return false;
    if (!def.keyEnv) return true; // Ollama: no key needed
    return !!process.env[def.keyEnv];
}

// ===========================================================
// GENERATE RESPONSE (non-streaming)
// ===========================================================
async function generateResponse(prompt, customSystemPrompt, providerOverride) {
    const pk = providerOverride || getActiveProvider();
    const def = PROVIDERS[pk];
    const system = customSystemPrompt || SYSTEM_PROMPT;

    if (def.type === 'openai_compatible') return _openaiGenerate(pk, def, prompt, system);
    if (def.type === 'gemini') return _geminiGenerate(prompt, system);
    if (def.type === 'anthropic') return _anthropicGenerate(prompt, system);
    throw new Error('Unknown provider type: ' + def.type);
}

// ===========================================================
// GENERATE STREAM
// ===========================================================
async function generateStream(userMessage, onChunk, systemContext, customSystemPrompt, providerOverride) {
    const pk = providerOverride || getActiveProvider();
    const def = PROVIDERS[pk];
    const base = customSystemPrompt || SYSTEM_PROMPT;
    const system = base + (systemContext || '');

    if (def.type === 'openai_compatible') return _openaiStream(pk, def, userMessage, system, onChunk);
    if (def.type === 'gemini') return _geminiStream(userMessage, system, onChunk);
    if (def.type === 'anthropic') return _anthropicStream(userMessage, system, onChunk);
    throw new Error('Unknown provider type: ' + def.type);
}

// ===========================================================
// TEST CONNECTION
// ===========================================================
async function testConnection(providerKey) {
    const pk = providerKey || getActiveProvider();
    const def = PROVIDERS[pk];
    if (!def) return { success: false, message: 'Provider "' + pk + '" tidak dikenal.' };

    const start = Date.now();
    try {
        let reply;
        if (def.type === 'openai_compatible') reply = await _openaiGenerate(pk, def, 'Halo, respon dalam 2 kata saja.', SYSTEM_PROMPT, true);
        else if (def.type === 'gemini') reply = await _geminiGenerate('Halo, respon dalam 2 kata saja.', SYSTEM_PROMPT);
        else if (def.type === 'anthropic') reply = await _anthropicGenerate('Halo, respon dalam 2 kata saja.', SYSTEM_PROMPT);
        else throw new Error('Unknown type');

        const latency = Date.now() - start;
        const models = getModelsList(pk);
        return {
            success: true,
            latency,
            provider: pk,
            model: models[0] || '-',
            message: 'Koneksi ' + def.label + ' berhasil (' + latency + 'ms). Respons: "' + String(reply).substring(0, 80) + '"'
        };
    } catch (err) {
        return {
            success: false,
            provider: pk,
            message: 'Koneksi ke ' + def.label + ' gagal: ' + err.message
        };
    }
}

// ===========================================================
// INTERNAL: OpenAI-compatible (NVIDIA, OpenAI, Groq, Ollama)
// ===========================================================
async function _openaiGenerate(pk, def, prompt, system, singleModel) {
    const OpenAI = require('openai');
    const apiKey = def.keyEnv ? (process.env[def.keyEnv] || 'nokey') : 'nokey';
    const baseURL = def.baseUrlEnv
        ? (process.env[def.baseUrlEnv] || def.defaultBaseUrl)
        : def.defaultBaseUrl;
    const client = new OpenAI({ apiKey, baseURL, timeout: 20000 });
    const models = getModelsList(pk);
    const list = singleModel ? [models[0]] : models;

    for (const model of list) {
        try {
            console.log('[AI:' + pk + '] Trying model: ' + model);
            const completion = await client.chat.completions.create({
                model,
                messages: [
                    { role: 'system', content: system },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                top_p: 0.9,
                max_tokens: 1024,
            });
            const reply = completion.choices[0] && completion.choices[0].message && completion.choices[0].message.content;
            if (!reply) throw new Error('Empty response');
            return reply;
        } catch (err) {
            console.error('[AI:' + pk + '] Model ' + model + ' failed: ' + err.message);
        }
    }
    throw new Error('Semua model ' + pk + ' gagal merespons.');
}

async function _openaiStream(pk, def, userMessage, system, onChunk) {
    const OpenAI = require('openai');
    const apiKey = def.keyEnv ? (process.env[def.keyEnv] || 'nokey') : 'nokey';
    const baseURL = def.baseUrlEnv
        ? (process.env[def.baseUrlEnv] || def.defaultBaseUrl)
        : def.defaultBaseUrl;
    const client = new OpenAI({ apiKey, baseURL, timeout: 20000 });
    const models = getModelsList(pk);

    for (const model of models) {
        try {
            console.log('[AI:' + pk + '] Streaming model: ' + model);
            const stream = await client.chat.completions.create({
                model,
                messages: [
                    { role: 'system', content: system },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7,
                top_p: 0.9,
                max_tokens: 1024,
                stream: true,
            });
            let fullText = '';
            for await (const chunk of stream) {
                const token = (chunk.choices[0] && chunk.choices[0].delta && chunk.choices[0].delta.content) || '';
                if (token) { fullText += token; onChunk(token); }
            }
            return fullText;
        } catch (err) {
            console.error('[AI:' + pk + '] Stream model ' + model + ' failed: ' + err.message);
        }
    }
    throw new Error('Semua model ' + pk + ' gagal merespons.');
}

// ===========================================================
// INTERNAL: Google Gemini
// ===========================================================
async function _geminiGenerate(prompt, system) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY tidak dikonfigurasi.');
    const genAI = new GoogleGenerativeAI(apiKey);
    const models = getModelsList('gemini');

    let lastError = null;
    for (const modelName of models) {
        try {
            console.log('[AI:gemini] Generating with model: ' + modelName);
            const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: system });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            if (!text) throw new Error('Empty response from Gemini');
            return text;
        } catch (err) {
            console.error('[AI:gemini] Model ' + modelName + ' failed: ' + err.message);
            lastError = err;
        }
    }
    throw lastError || new Error('Semua model gemini gagal merespons.');
}

async function _geminiStream(userMessage, system, onChunk) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY tidak dikonfigurasi.');
    const genAI = new GoogleGenerativeAI(apiKey);
    const models = getModelsList('gemini');

    let lastError = null;
    for (const modelName of models) {
        try {
            console.log('[AI:gemini] Streaming with model: ' + modelName);
            const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: system });
            const result = await model.generateContentStream(userMessage);
            let fullText = '';
            for await (const chunk of result.stream) {
                const token = chunk.text();
                if (token) { fullText += token; onChunk(token); }
            }
            if (fullText) return fullText;
        } catch (err) {
            console.error('[AI:gemini] Stream model ' + modelName + ' failed: ' + err.message);
            lastError = err;
        }
    }
    throw lastError || new Error('Semua model gemini gagal merespons.');
}

// ===========================================================
// INTERNAL: Anthropic Claude
// ===========================================================
async function _anthropicGenerate(prompt, system) {
    const Anthropic = require('@anthropic-ai/sdk');
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY tidak dikonfigurasi.');
    const client = new Anthropic({ apiKey });
    const modelName = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5';
    console.log('[AI:anthropic] Generating with model: ' + modelName);
    const msg = await client.messages.create({
        model: modelName,
        max_tokens: 1024,
        system,
        messages: [{ role: 'user', content: prompt }],
    });
    const text = msg.content[0] && msg.content[0].text;
    if (!text) throw new Error('Empty response from Anthropic');
    return text;
}

async function _anthropicStream(userMessage, system, onChunk) {
    const Anthropic = require('@anthropic-ai/sdk');
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY tidak dikonfigurasi.');
    const client = new Anthropic({ apiKey });
    const modelName = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5';
    console.log('[AI:anthropic] Streaming with model: ' + modelName);
    let fullText = '';
    const stream = await client.messages.stream({
        model: modelName,
        max_tokens: 1024,
        system,
        messages: [{ role: 'user', content: userMessage }],
    });
    for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta && event.delta.type === 'text_delta') {
            const token = event.delta.text;
            if (token) { fullText += token; onChunk(token); }
        }
    }
    return fullText;
}

module.exports = {
    PROVIDERS,
    SYSTEM_PROMPT,
    ADMIN_SYSTEM_PROMPT,
    getActiveProvider,
    getActiveProviderDef,
    getModelsList,
    getApiKey,
    isConfigured,
    generateResponse,
    generateStream,
    testConnection,
};
