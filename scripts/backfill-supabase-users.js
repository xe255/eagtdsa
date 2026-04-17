/**
 * Rebuild telegram_users in Supabase from local JSON exports (logs + userLimits + optional groupMembers).
 *
 * Usage (from repo root):
 *   npx dotenv -e .env -- node scripts/backfill-supabase-users.js
 *   node scripts/backfill-supabase-users.js --files=db.json,"db (2).json"
 *
 * Env: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) + SUPABASE_SERVICE_ROLE_KEY (recommended)
 *      or publishable/anon key if your RLS policies allow writes.
 */
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { bulkUpsertRows } = require('../supabaseSync');

function parseArgsFiles() {
    const a = process.argv.find((x) => x.startsWith('--files='));
    if (!a) return [path.join(__dirname, '..', 'db.json'), path.join(__dirname, '..', 'db (2).json')];
    return a
        .slice('--files='.length)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((f) => path.isAbsolute(f) ? f : path.join(__dirname, '..', f));
}

function blacklistSet(data) {
    const s = new Set();
    for (const e of data.blacklist || []) {
        if (e && e.chatId != null) s.add(String(e.chatId));
    }
    return s;
}

function ingestDbSnapshot(data, map, bl, label) {
    for (const log of data.logs || []) {
        const cid = log.chatId ?? log.userInfo?.id;
        if (cid == null || bl.has(String(cid))) continue;
        const id = String(cid);
        const ui = log.userInfo || {};
        const prev = map.get(id) || {};
        map.set(id, {
            telegram_user_id: Number(id),
            username: ui.username ?? log.username ?? prev.username ?? null,
            first_name: ui.first_name ?? prev.first_name ?? null,
            last_name: ui.last_name ?? prev.last_name ?? null,
            is_bot: !!ui.is_bot,
            source: 'logs_backfill'
        });
    }
    for (const k of Object.keys(data.userLimits || {})) {
        if (!/^\d+$/.test(k) || bl.has(k)) continue;
        if (!map.has(k)) {
            map.set(k, {
                telegram_user_id: Number(k),
                username: null,
                first_name: null,
                last_name: null,
                is_bot: false,
                source: 'userLimits'
            });
        }
    }
    const gm = data.groupMembers || {};
    for (const [id, v] of Object.entries(gm)) {
        if (!/^\d+$/.test(id) || bl.has(id)) continue;
        const prev = map.get(id) || {};
        map.set(id, {
            telegram_user_id: Number(id),
            username: v.username ?? prev.username ?? null,
            first_name: v.firstName ?? v.first_name ?? prev.first_name ?? null,
            last_name: v.lastName ?? v.last_name ?? prev.last_name ?? null,
            is_bot: false,
            source: 'groupMembers_snapshot'
        });
    }
    console.error('Ingested', label, '— cumulative unique ids:', map.size);
}

async function main() {
    const files = parseArgsFiles();
    const map = new Map();
    for (const f of files) {
        if (!fs.existsSync(f)) {
            console.warn('Skip missing:', f);
            continue;
        }
        let data;
        try {
            data = JSON.parse(fs.readFileSync(f, 'utf8'));
        } catch (e) {
            console.error('Invalid JSON:', f, e.message);
            continue;
        }
        const bl = blacklistSet(data);
        ingestDbSnapshot(data, map, bl, f);
    }
    const rows = [...map.values()].filter((r) => !r.is_bot && Number.isFinite(r.telegram_user_id));
    console.error('Total rows to upsert (non-bot):', rows.length);
    if (rows.length === 0) {
        console.error('Nothing to upload. Add --files= paths or restore db exports.');
        process.exit(1);
    }
    await bulkUpsertRows(rows);
    console.error('Done. Check Supabase Table Editor → telegram_users.');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
