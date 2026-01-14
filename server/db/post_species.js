// post_species.js
import { prepare } from './db';

function addSpeciesToPost(post_id, species_id) {
    const stmt = prepare(`
        INSERT INTO post_species (post_id, species_id)
        VALUES (?, ?)
        ON CONFLICT(post_id, species_id) DO NOTHING
    `);
    return stmt.run(post_id, species_id).changes > 0;
}

function removeSpeciesFromPost(post_id, species_id) {
    const stmt = prepare(`DELETE FROM post_species WHERE post_id = ? AND species_id = ?`);
    return stmt.run(post_id, species_id).changes > 0;
}

function getSpeciesForPost(post_id) {
    return prepare(`
        SELECT s.* FROM species s
        JOIN post_species ps ON s.species_id = ps.species_id
        WHERE ps.post_id = ?
    `).all(post_id);
}

export default {
    addSpeciesToPost,
    removeSpeciesFromPost,
    getSpeciesForPost
};
