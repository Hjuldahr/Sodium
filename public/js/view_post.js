document.addEventListener('DOMContentLoaded', () => {
    const original_search_terms = "test"
    
    author_section_div = document.getElementById('author_section');

    for (let i = 0; i < 5; i++) {
        //temp
        let author_id = i;
        let author_name = 'author_' + i

        author_subsection_div = document.createElement('div');
        
        new_search_for_author_a = document.createElement('a');
        new_search_for_author_a.href = 'https://sodium.net/view_post&terms=author_id:' + author_id
        new_search_for_author_a.textContent = '?'
        author_subsection_div.appendChild(new_search_for_author_a);

        new_search_plus_author_a = document.createElement('a');
        new_search_plus_author_a.href = 'https://sodium.net/view_post&terms=' + original_search_terms + ' author_id:' + author_id
        new_search_plus_author_a.textContent = '+'
        author_subsection_div.appendChild(new_search_plus_author_a);

        new_search_minus_author_a = document.createElement('a');
        new_search_minus_author_a.href = 'https://sodium.net/view_post&terms=' + original_search_terms + ' -author_id:' + author_id
        new_search_minus_author_a.textContent = '-'
        author_subsection_div.appendChild(new_search_minus_author_a);

        new_search_minus_author_a = document.createElement('a');
        new_search_minus_author_a.href = 'https://sodium.net/view_user&id=' + author_id
        new_search_minus_author_a.textContent = author_name
        author_subsection_div.appendChild(new_search_minus_author_a);

        author_subsection_div.classList.add(i === 0 ? 'primary_author_link' : 'secondary_author_link');
        author_section_div.appendChild(author_subsection_div);
    }

    theme_section_div = document.getElementById('theme_section');

    for (let i = 0; i < 5; i++) {
        //temp
        let theme_id = i;
        let theme_name = 'theme_' + i

        theme_subsection_div = document.createElement('div');
        
        new_search_for_theme_a = document.createElement('a');
        new_search_for_theme_a.href = 'https://sodium.net/view_post&terms=theme_id:' + theme_id
        new_search_for_theme_a.textContent = '?'
        theme_subsection_div.appendChild(new_search_for_theme_a);

        new_search_plus_theme_a = document.createElement('a');
        new_search_plus_theme_a.href = 'https://sodium.net/view_post&terms=' + original_search_terms + ' theme_id:' + theme_id
        new_search_plus_theme_a.textContent = '+'
        theme_subsection_div.appendChild(new_search_plus_theme_a);

        new_search_minus_theme_a = document.createElement('a');
        new_search_minus_theme_a.href = 'https://sodium.net/view_post&terms=' + original_search_terms + ' -theme_id:' + theme_id
        new_search_minus_theme_a.textContent = '-'
        theme_subsection_div.appendChild(new_search_minus_theme_a);

        new_search_minus_theme_a = document.createElement('a');
        new_search_minus_theme_a.href = 'https://sodium.net/view_user&id=' + theme_id
        new_search_minus_theme_a.textContent = theme_name
        theme_subsection_div.appendChild(new_search_minus_theme_a);

        theme_section_div.appendChild(theme_subsection_div);
    }

    tag_section_div = document.getElementById('tag_section');

    for (let i = 0; i < 5; i++) {
        //temp
        let tag_id = i;
        let tag_name = 'tag_' + i

        tag_subsection_div = document.createElement('div');
        
        new_search_for_tag_a = document.createElement('a');
        new_search_for_tag_a.href = 'https://sodium.net/view_post&terms=tag_id:' + tag_id
        new_search_for_tag_a.textContent = '?'
        tag_subsection_div.appendChild(new_search_for_tag_a);

        new_search_plus_tag_a = document.createElement('a');
        new_search_plus_tag_a.href = 'https://sodium.net/view_post&terms=' + original_search_terms + ' tag_id:' + tag_id
        new_search_plus_tag_a.textContent = '+'
        tag_subsection_div.appendChild(new_search_plus_tag_a);

        new_search_minus_tag_a = document.createElement('a');
        new_search_minus_tag_a.href = 'https://sodium.net/view_post&terms=' + original_search_terms + ' -tag_id:' + tag_id
        new_search_minus_tag_a.textContent = '-'
        tag_subsection_div.appendChild(new_search_minus_tag_a);

        new_search_minus_tag_a = document.createElement('a');
        new_search_minus_tag_a.href = 'https://sodium.net/view_user&id=' + tag_id
        new_search_minus_tag_a.textContent = tag_name
        tag_subsection_div.appendChild(new_search_minus_tag_a);

        tag_section_div.appendChild(tag_subsection_div);
    }
});