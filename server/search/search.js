// searchPosts.js
const db = require('./db');

// --- Regex for token parsing ---
const TOKEN_REGEX = /(?<scope>[a-z_]+)(?:\.(?<attr>[a-z_]+))?:(?<value>.+)/i;

// --- Wildcard translator ---
function sqlLike(pattern) {
    return pattern.replace(/\*/g, '%').replace(/\?/g, '_');
}

// --- Split & detect set operators ---
function splitSet(str) {
    if (str.includes('&')) return { op: 'AND', values: str.split('&') };
    if (str.includes('|')) return { op: 'OR', values: str.split('|') };
    return { op: 'SINGLE', values: [str] };
}

// --- Resolve implicit attributes based on scope & value ---
function resolveAttribute(scope, value) {
    const isID = typeof value === 'number' || (typeof value === 'string' && value.startsWith('#'));
    switch (scope) {
        case 'tag': return isID ? 'tag_id' : 'label';
        case 'character': return isID ? 'character_id' : 'label';
        case 'species': return isID ? 'species_id' : 'label';
        case 'genre': return isID ? 'genre_id' : 'label';
        case 'post': return isID ? 'post_id' : 'title';
        case 'user': return isID ? 'user_id' : 'user_name';
        default: return 'label';
    }
}

// --- Parse individual value tokens ---
function parseValue(raw) {
    if (raw.startsWith('#')) {
        return { type: 'id', value: Number(raw.slice(1)) };
    }
    if (/^[<>]=?/.test(raw)) {
        const [, op, num] = raw.match(/^(<=|>=|<|>)(\d+)/);
        return { type: 'compare', comparator: op, value: Number(num) };
    }
    if (raw.startsWith('!(') && raw.endsWith(')')) {
        return { type: 'exact', ...splitSet(raw.slice(2, -1)) };
    }
    if (raw.startsWith('-(') && raw.endsWith(')')) {
        return { type: 'exclude', ...splitSet(raw.slice(2, -1)) };
    }
    // default pattern match
    return { type: 'pattern', value: raw };
}

// --- Apply a scope-specific filter to the SQL context ---
function applyFilter(scope, attr, filter, ctx) {
    switch (scope) {
        case 'genre':
            ctx.joins.add(`JOIN genres g ON g.genre_id = p.genre_id`);
            if (filter.type === 'pattern') {
                ctx.where.push(`g.${attr} LIKE ?`);
                ctx.params.push(sqlLike(filter.value));
            } else if (filter.type === 'id') {
                ctx.where.push(`g.${attr} = ?`);
                ctx.params.push(filter.value);
            }
            break;
        case 'tag':
            ctx.joins.add(`
                JOIN post_tags pt ON pt.post_id = p.post_id
                JOIN tags t ON t.tag_id = pt.tag_id
            `);
            if (filter.type === 'pattern') {
                ctx.where.push(`t.${attr} LIKE ?`);
                ctx.params.push(sqlLike(filter.value));
            } else if (filter.type === 'id') {
                ctx.where.push(`t.${attr} = ?`);
                ctx.params.push(filter.value);
            } else if (filter.type === 'compare') {
                ctx.where.push(`t.${attr} ${filter.comparator} ?`);
                ctx.params.push(filter.value);
            } else if (filter.type === 'exclude') {
                const placeholders = filter.values.map(() => '?').join(',');
                ctx.where.push(`
                    p.post_id NOT IN (
                        SELECT pt2.post_id
                        FROM post_tags pt2
                        JOIN tags t2 ON t2.tag_id = pt2.tag_id
                        WHERE t2.${attr} IN (${placeholders})
                    )
                `);
                ctx.params.push(...filter.values);
            } else if (filter.type === 'exact') {
                const placeholders = filter.values.map(() => '?').join(',');
                ctx.where.push(`
                    p.post_id IN (
                        SELECT pt3.post_id
                        FROM post_tags pt3
                        JOIN tags t3 ON t3.tag_id = pt3.tag_id
                        WHERE t3.${attr} IN (${placeholders})
                        GROUP BY pt3.post_id
                        HAVING COUNT(DISTINCT t3.${attr}) = ${filter.values.length}
                    )
                `);
                ctx.params.push(...filter.values);
            }
            break;

        case 'character':
            ctx.joins.add(`
                JOIN post_characters pc ON pc.post_id = p.post_id
                JOIN characters c ON c.character_id = pc.character_id
            `);
            if (filter.type === 'pattern') {
                ctx.where.push(`c.${attr} LIKE ?`);
                ctx.params.push(sqlLike(filter.value));
            } else if (filter.type === 'id') {
                ctx.where.push(`c.${attr} = ?`);
                ctx.params.push(filter.value);
            } else if (filter.type === 'exclude') {
                const placeholders = filter.values.map(() => '?').join(',');
                ctx.where.push(`
                    p.post_id NOT IN (
                        SELECT pc2.post_id
                        FROM post_characters pc2
                        JOIN characters c2 ON c2.character_id = pc2.character_id
                        WHERE c2.${attr} IN (${placeholders})
                    )
                `);
                ctx.params.push(...filter.values);
            } else if (filter.type === 'exact') {
                const placeholders = filter.values.map(() => '?').join(',');
                ctx.where.push(`
                    p.post_id IN (
                        SELECT pc3.post_id
                        FROM post_characters pc3
                        JOIN characters c3 ON c3.character_id = pc3.character_id
                        WHERE c3.${attr} IN (${placeholders})
                        GROUP BY pc3.post_id
                        HAVING COUNT(DISTINCT c3.${attr}) = ${filter.values.length}
                    )
                `);
                ctx.params.push(...filter.values);
            }
            break;

        case 'post':
            if (filter.type === 'id') {
                ctx.where.push(`p.${attr} = ?`);
                ctx.params.push(filter.value);
            } else if (filter.type === 'pattern') {
                ctx.where.push(`p.${attr} LIKE ?`);
                ctx.params.push(sqlLike(filter.value));
            }
            break;

        case 'user':
            ctx.joins.add(`JOIN users u ON u.user_id = p.user_id`);
            if (filter.type === 'id') {
                ctx.where.push(`u.${attr} = ?`);
                ctx.params.push(filter.value);
            } else if (filter.type === 'pattern') {
                ctx.where.push(`u.${attr} LIKE ?`);
                ctx.params.push(sqlLike(filter.value));
            }
            break;

        default:
            // fallback, ignore unknown scope
            break;
    }
}

// --- Main function ---
function searchPosts(queryString) {
    const tokens = queryString.split(/\s+/);
    const ctx = { joins: new Set(), where: [], params: [] };

    for (const token of tokens) {
        const match = TOKEN_REGEX.exec(token);
        if (!match) continue;

        let { scope, attr, value } = match.groups;
        const parsed = parseValue(value);
        attr = attr || resolveAttribute(scope, parsed.type === 'id' ? parsed.value : parsed.value);
        applyFilter(scope, attr, parsed, ctx);
    }

    const sql = `
        SELECT DISTINCT p.*
        FROM posts p
        ${[...ctx.joins].join('\n')}
        ${ctx.where.length ? 'WHERE ' + ctx.where.join(' AND ') : ''}
        ORDER BY p.created_at DESC
        LIMIT 100
    `;

    const rows = db.prepare(sql).all(...ctx.params);
    return rows;
}

module.exports = { searchPosts };
