'use strict';

/**
 * ZenRows Universal Scraper API — routes each Emby HTTPS call through ZenRows egress
 * (residential when premium_proxy=true) to avoid datacenter IP blocks (e.g. Cloudflare).
 * Docs: https://docs.zenrows.com/universal-scraper-api/universal-scraper-api-setup
 */

const ZENROWS_ENDPOINT = 'https://api.zenrows.com/v1/';

function envBool(name, defaultVal) {
    const v = process.env[name];
    if (v === undefined || String(v).trim() === '') return defaultVal;
    return /^1|true|yes|on$/i.test(String(v).trim());
}

function shortErr(e) {
    const msg = (e && e.message) || String(e);
    return msg.length > 200 ? msg.slice(0, 200) + '…' : msg;
}

function buildQuery(targetUrl) {
    const apiKey = (process.env.ZENROWS_API_KEY || '').trim();
    const premium = envBool('ZENROWS_PREMIUM_PROXY', true);
    const country = (process.env.ZENROWS_PROXY_COUNTRY || '').trim();
    let sid = '4242';
    if (process.env.ZENROWS_SESSION_ID !== undefined) {
        sid = String(process.env.ZENROWS_SESSION_ID).trim();
    }
    const originalStatus = envBool('ZENROWS_ORIGINAL_STATUS', true);

    const p = new URLSearchParams();
    p.set('apikey', apiKey);
    p.set('url', targetUrl);
    p.set('custom_headers', 'true');
    if (originalStatus) p.set('original_status', 'true');
    if (premium) p.set('premium_proxy', 'true');
    if (country) p.set('proxy_country', country);
    if (sid && sid !== '0') p.set('session_id', sid);

    return p;
}

const TIMEOUT_MS = Math.max(15_000, parseInt(process.env.ZENROWS_TIMEOUT_MS || '120000', 10) || 120_000);

/**
 * @param {string} targetUrl absolute URL (Emby API)
 * @param {RequestInit} init
 */
async function fetchThrough(targetUrl, init) {
    const apiKey = (process.env.ZENROWS_API_KEY || '').trim();
    if (!apiKey) {
        throw new Error('zenrows-fetch: ZENROWS_API_KEY not set');
    }
    const qs = buildQuery(targetUrl);
    const zenUrl = `${ZENROWS_ENDPOINT}?${qs.toString()}`;
    const method = String(init.method || 'GET').toUpperCase();
    const headers = init.headers && typeof init.headers === 'object' ? { ...init.headers } : {};
    const body = method === 'GET' || method === 'HEAD' ? undefined : init.body;

    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), TIMEOUT_MS);
    try {
        const res = await fetch(zenUrl, {
            method,
            headers,
            body,
            signal: ac.signal,
            redirect: 'follow'
        });
        clearTimeout(to);
        if (res.status === 401 || res.status === 403) {
            const snippet = await res.clone().text();
            const head = snippet.slice(0, 400).toLowerCase();
            if (head.includes('zenrows') || head.includes('api key') || head.includes('credit')) {
                console.warn('[zenrows-fetch] ZenRows rejected or quota issue — check dashboard / API key');
            }
        }
        return res;
    } catch (e) {
        clearTimeout(to);
        console.warn(`[zenrows-fetch] ${shortErr(e)}`);
        throw e;
    }
}

module.exports = {
    fetchThrough
};
