const fs = require('fs');
const path = require('path');
const { PROVIDERS, maskKey: _maskKey } = require('./ai/LLMProviderFactory');

const envPath = path.resolve(__dirname, '../../.env');

/**
 * Mask an API key for safe display in UI
 * e.g., "nvapi-1234567890abcdef" -> "nvapi-...cdef"
 */
function maskKey(key) {
    if (!key || typeof key !== 'string') return '';
    const trimmed = key.trim();
    if (trimmed.length <= 8) return '****';
    const prefix = trimmed.substring(0, 6);
    const suffix = trimmed.substring(trimmed.length - 4);
    return `${prefix}...${suffix}`;
}

/**
 * Read current AI and Fonnte configuration
 */
function getConfig() {
    const activeProvider = (process.env.AI_PROVIDER || 'nvidia').toLowerCase().trim();
    const fonnteKey = process.env.FONNTE_API_KEY || '';

    // Build per-provider status map
    const providerStatus = {};
    for (const [pk, def] of Object.entries(PROVIDERS)) {
        const key = def.keyEnv ? (process.env[def.keyEnv] || '') : '';
        const modelEnvVal = def.modelEnv ? (process.env[def.modelEnv] || '') : '';
        const baseUrlEnvVal = def.baseUrlEnv ? (process.env[def.baseUrlEnv] || '') : '';
        providerStatus[pk] = {
            hasKey: def.keyEnv ? !!key : true,
            maskedKey: maskKey(key),
            model: modelEnvVal || (def.defaultModels && def.defaultModels[0]) || '',
            baseUrl: baseUrlEnvVal || def.defaultBaseUrl || '',
            label: def.label,
            icon: def.icon,
            color: def.color,
            keyEnv: def.keyEnv,
            modelEnv: def.modelEnv,
            baseUrlEnv: def.baseUrlEnv,
            defaultModels: def.defaultModels || [],
        };
    }

    return {
        activeProvider,
        providerStatus,
        fonnte: {
            hasKey: !!fonnteKey,
            maskedKey: maskKey(fonnteKey),
            apiUrl: process.env.FONNTE_API_URL || 'https://api.fonnte.com',
            adminPhone: process.env.ADMIN_WHATSAPP_PHONE || process.env.ADMIN_PHONE || '',
        }
    };
}

/**
 * Update environment variables in memory and in the .env file.
 * Accepts a flat updates object — only non-empty strings get written.
 */
function updateConfig(updates = {}) {
    let envContent = '';
    try {
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        }
    } catch (err) {
        console.error('[ConfigService] Gagal membaca .env:', err.message);
    }

    const keysToUpdate = {};

    // Active provider
    if (updates.AI_PROVIDER && updates.AI_PROVIDER.trim()) {
        keysToUpdate['AI_PROVIDER'] = updates.AI_PROVIDER.trim().toLowerCase();
    }

    // Fonnte
    if (updates.fonnteApiKey && updates.fonnteApiKey.trim()) keysToUpdate['FONNTE_API_KEY'] = updates.fonnteApiKey.trim();
    if (updates.fonnteApiUrl && updates.fonnteApiUrl.trim()) keysToUpdate['FONNTE_API_URL'] = updates.fonnteApiUrl.trim();
    if (typeof updates.adminPhone === 'string') keysToUpdate['ADMIN_WHATSAPP_PHONE'] = updates.adminPhone.trim();

    // Per-provider: pass arbitrary env key -> value pairs
    for (const [envKey, val] of Object.entries(updates)) {
        // Allow direct env key = value pattern (uppercase, underscore)
        if (/^[A-Z][A-Z0-9_]+$/.test(envKey) && typeof val === 'string' && val.trim()) {
            if (envKey !== 'AI_PROVIDER') { // already handled above
                keysToUpdate[envKey] = val.trim();
            }
        }
    }

    // NVIDIA legacy fields
    if (updates.nvidiaApiKey && updates.nvidiaApiKey.trim()) keysToUpdate['NVIDIA_API_KEY'] = updates.nvidiaApiKey.trim();
    if (updates.nvidiaApiBaseUrl && updates.nvidiaApiBaseUrl.trim()) keysToUpdate['NVIDIA_API_BASE_URL'] = updates.nvidiaApiBaseUrl.trim();
    if (updates.nvidiaModel && updates.nvidiaModel.trim()) keysToUpdate['NVIDIA_MODEL'] = updates.nvidiaModel.trim();

    // Write
    let lines = envContent.split(/\r?\n/);
    for (const [key, val] of Object.entries(keysToUpdate)) {
        process.env[key] = val;
        let found = false;
        lines = lines.map(line => {
            if (line.trim().startsWith(`${key}=`)) {
                found = true;
                return `${key}=${val}`;
            }
            return line;
        });
        if (!found) {
            lines.push(`${key}=${val}`);
        }
    }

    try {
        fs.writeFileSync(envPath, lines.join('\n'), 'utf8');
        console.log('[ConfigService] File .env berhasil diperbarui.');
        return { success: true, message: 'Konfigurasi berhasil disimpan dan aktif!' };
    } catch (err) {
        console.error('[ConfigService] Gagal menulis ke .env:', err.message);
        return { success: false, message: 'Gagal menulis file .env: ' + err.message };
    }
}

module.exports = {
    getConfig,
    updateConfig,
    maskKey
};
