const TempMailAPI = require('./tinyhost');
const { generateNumericString, generateUsername5, generateStrongPassword } = require('../utils');

const API_BASE = 'https://emby.embyiltv.io/api';
const DEFAULT_HEADERS = {
    Accept: 'application/json',
    'Accept-Language': 'he-IL,he;q=0.9,en;q=0.8',
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
};

async function apiJson(method, path, { body, token } = {}) {
    const headers = {
        Accept: DEFAULT_HEADERS.Accept,
        'Accept-Language': DEFAULT_HEADERS['Accept-Language'],
        'User-Agent': DEFAULT_HEADERS['User-Agent']
    };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body)
    });
    const text = await res.text();
    let data = null;
    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }
    }
    if (!res.ok) {
        const errMsg =
            (data && typeof data === 'object' && data.error) ||
            (typeof data === 'string' ? data : null) ||
            res.statusText;
        const err = new Error(errMsg || `HTTP ${res.status}`);
        err.status = res.status;
        err.body = data;
        throw err;
    }
    return data;
}

function extractConfirmationToken(verifyLink) {
    const u = new URL(verifyLink.replace(/&amp;/g, '&'));
    const q = u.searchParams.get('token');
    if (q) return q;
    const m = u.pathname.match(/\/confirmation-token\/([^/]+)/);
    if (m) return decodeURIComponent(m[1]);
    throw new Error('קישור אימות ללא token');
}

/** Try common search body shapes until one succeeds (API is not documented publicly). */
async function searchSubscriptions(accessToken) {
    const attempts = [
        { page: 0, size: 10, sorts: [] },
        { page: 0, sorts: [] },
        { pagination: { page: 0, size: 20 }, sorts: [] }
    ];
    let lastErr;
    for (const body of attempts) {
        try {
            return await apiJson('POST', '/subscriptions/search', { body, token: accessToken });
        } catch (e) {
            lastErr = e;
            if (e.status !== 400 && e.status !== 422) throw e;
        }
    }
    throw lastErr;
}

function responseContainsLogin(searchData, login) {
    const s = typeof searchData === 'string' ? searchData : JSON.stringify(searchData);
    return s.includes(login);
}

async function run(statusCallback = () => {}) {
    const tempMail = new TempMailAPI();

    try {
        statusCallback('[5%] ⚙️ מכין את פרטי החשבון החדש...');

        const domainData = await tempMail.getRandomDomains(1);
        const domain = domainData.domains[0];
        const username = generateUsername5();
        const email = `${username}@${domain}`;
        const password = generateStrongPassword();

        statusCallback(`[12%] 📧 אימייל זמני: <code>${email}</code>`);

        statusCallback('[20%] 📝 שולח הרשמה (API)...');
        await apiJson('POST', '/auth/signup', {
            body: {
                firstName: 'John',
                lastName: 'Doe',
                email,
                password
            }
        });

        statusCallback('[42%] ✅ בקשת הרשמה נשלחה.');
        statusCallback('[50%] ⏳ ממתין לאימייל אימות...');

        const emailDetail = await tempMail.pollForEmail(
            domain,
            username,
            { senderKeyword: 'noreply@embyiltv.io' },
            300000,
            2000
        );

        statusCallback('[65%] ✅ אימייל האימות התקבל!');

        const linkRegex = /https?:\/\/[^\s"'<>]+/g;
        const links = (emailDetail.html_body || '').match(linkRegex) || [];
        const verifyLink = links.find(
            (l) =>
                l.includes('verify') ||
                l.includes('confirm') ||
                l.includes('sign-up') ||
                l.includes('email-confirmation') ||
                l.includes('activation') ||
                l.includes('confirm-email') ||
                l.includes('token') ||
                l.includes('confirmation-token')
        );

        if (!verifyLink) {
            console.error('Links in email:', links);
            throw new Error('קישור אימות לא נמצא באימייל');
        }

        statusCallback('[75%] 🔗 מאמת חשבון (API)...');
        const token = extractConfirmationToken(verifyLink);
        await apiJson('GET', `/confirmation-token?token=${encodeURIComponent(token)}`);

        statusCallback('[82%] 🔓 מתחבר (API)...');
        const auth = await apiJson('POST', '/auth/signin', {
            body: { login: email, password }
        });
        const accessToken = auth.accessToken;
        const userUuid = auth.userUuid;
        if (!accessToken || !userUuid) {
            throw new Error('תגובת התחברות חסרה accessToken או userUuid');
        }

        const embyLogin = generateNumericString(6);
        const embyPassword = '1111';

        statusCallback('[92%] 📋 יוצר מנוי ניסיון (API)...');
        await apiJson('POST', `/subscriptions/users/${userUuid}/trial`, {
            body: {
                login: embyLogin,
                password: embyPassword,
                confirmPassword: embyPassword
            },
            token: accessToken
        });

        statusCallback('[97%] ✨ מאמת יצירת מנוי...');
        const searchData = await searchSubscriptions(accessToken);
        if (!responseContainsLogin(searchData, embyLogin)) {
            throw new Error('המנוי לא נוצר — שם המשתמש לא נמצא בתוצאות החיפוש');
        }

        statusCallback('[100%] 🎊 הכל מוכן!');
        return {
            accountEmail: email,
            accountPassword: password,
            embyUsername: embyLogin,
            embyPassword: embyPassword
        };
    } catch (error) {
        statusCallback(`שגיאה: ${error.message}`);
        throw error;
    }
}

module.exports = { run };

if (require.main === module) {
    run((msg) => console.log(msg))
        .then((acc) => {
            console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Account / חשבון
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Website email:    ${acc.accountEmail}
Website password: ${acc.accountPassword}

Emby username:    ${acc.embyUsername}
Emby password:    ${acc.embyPassword}
Player:           https://play.embyil.tv/
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JSON (copy):
${JSON.stringify(acc, null, 2)}
`);
        })
        .catch((err) => {
            console.error('שגיאה סופית:', err);
            process.exitCode = 1;
        });
}
