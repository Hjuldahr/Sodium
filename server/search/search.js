// search.js
const searchSchema = {
    user: { table: 'users', column: 'user_name', type: 'string', join: 'posts.user_id = users.user_id' },
    time: { table: 'posts', column: 'created_at', type: 'numeric' },
    genre: { table: 'genres', column: 'genre_label', type: 'string', join: 'posts.genre_id = genres.genre_id' },
    tag: { table: 'tags', column: 'tag_label', type: 'string', join: 'posts.post_id = post_tags.post_id', joinTable: 'post_tags', joinColumn: 'tag_id', refColumn: 'tag_id' },
    character: { table: 'characters', column: 'character_label', type: 'string', join: 'posts.post_id = post_characters.post_id', joinTable: 'post_characters', joinColumn: 'character_id', refColumn: 'character_id' },
    post: { table: 'posts', column: 'post_id', type: 'numeric' },
    tag_popularity: { table: 'tags', column: 'tag_popularity', type: 'numeric' },
    tag_shunning: { table: 'tags', column: 'tag_shunning', type: 'numeric' }
};

// Convert DSL wildcard to SQL LIKE pattern
function wildcardToLike(pattern) {
    pattern = pattern.replace(/\*/g, '%').replace(/\?/g, '_');
    return pattern;
}

// Parse a single filter: key=value
function parseFilter(filterStr) {
    let negated = false;
    if (filterStr.startsWith('-')) {
        negated = true;
        filterStr = filterStr.slice(1);
    }

    const [rawKey, rawValue] = filterStr.split('=');
    if (!rawKey || rawValue === undefined) return null;

    const key = rawKey.trim();
    const schema = searchSchema[key];
    if (!schema) return null;

    // Handle numeric operators
    const numericMatch = rawValue.match(/^([<>]=?|=)?(.+)$/);
    let operator = '=', value = rawValue;
    if (numericMatch) {
        if (schema.type === 'numeric') {
            operator = numericMatch[1] || '=';
            value = numericMatch[2];
        }
    }

    // Handle exact string match
    let patterns = [];
    if (schema.type === 'string') {
        let val = rawValue;

        // exact match (!value)
        if (val.startsWith('!')) {
            patterns.push({ like: val.slice(1), exact: true });
        }
        // intersect/union brackets
        else if (val.startsWith('[') && val.endsWith(']')) {
            val = val.slice(1, -1);
            const parts = val.split(/[&|]/);
            const op = val.includes('&') ? '&' : '|';
            parts.forEach(p => patterns.push({ like: wildcardToLike(p), op }));
        } else {
            patterns.push({ like: wildcardToLike(val) });
        }
    }

    return { key, schema, operator, value, patterns, negated };
}

// Build SQL and parameters
function buildSQL(queryStr) {
    const filters = queryStr.split(/\s+/).map(f => parseFilter(f)).filter(Boolean);

    let joins = new Set(['posts p']); // always start from posts
    let where = [];
    let params = [];

    for (const f of filters) {
        const s = f.schema;

        // Add join if needed
        if (s.join) joins.add(`${s.table} ${s.table} ON ${s.join}`);

        // Handle numeric
        if (s.type === 'numeric') {
            const cond = `${s.table}.${s.column} ${f.operator} ?`;
            where.push(f.negated ? `NOT (${cond})` : cond);
            params.push(f.value);
        }

        // Handle string / pattern
        else if (s.type === 'string') {
            const patternConds = f.patterns.map(p => {
                if (p.exact) return `${s.table}.${s.column} = ?`;
                return `${s.table}.${s.column} LIKE ?`;
            });
            const combined = patternConds.join(' AND '); // default intersection for multiple
            where.push(f.negated ? `NOT (${combined})` : `(${combined})`);
            f.patterns.forEach(p => params.push(p.exact ? p.like : `%${p.like}%`));
        }
    }

    const joinStr = Array.from(joins).join(' JOIN ');
    const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const sql = `SELECT DISTINCT p.* FROM ${joinStr} ${whereStr} LIMIT 100`;
    return { sql, params };
}

// Example usage
if (require.main === module) {
    const query = "user=hjuldahr time=>20260114 genre=fantasy -species=[fox|wolf]";
    const { sql, params } = buildSQL(query);
    console.log(sql);
    console.log(params);
}

module.exports = {
    buildSQL
};
