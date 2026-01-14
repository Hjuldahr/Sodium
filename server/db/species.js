// species.js
import { prepare } from './db';

function createSpecies(species_label) {
    const stmt = prepare(`
        INSERT INTO species (species_label, species_first_used, species_last_used)
        VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(species_label) DO NOTHING
    `);
    return stmt.run(species_label).lastInsertRowid;
}

function getSpeciesById(species_id) {
    return prepare('SELECT * FROM species WHERE species_id = ?').get(species_id);
}

function getSpeciesByLabel(species_label) {
    return prepare('SELECT * FROM species WHERE species_label = ?').get(species_label);
}

function updateSpeciesUsage(species_id) {
    const stmt = prepare(`
        UPDATE species
        SET species_popularity = species_popularity + 1,
            species_last_used = CURRENT_TIMESTAMP
        WHERE species_id = ?
    `);
    return stmt.run(species_id).changes > 0;
}

export default {
    createSpecies,
    getSpeciesById,
    getSpeciesByLabel,
    updateSpeciesUsage
};
