export function getTranslation(field: any, lang: 'en' | 'ru' | 'am' | string): string {
    if (!field) return '';

    // If it's a simple string, return it
    if (typeof field === 'string') return field;

    // If it's an object, try to find the best match
    if (typeof field === 'object') {
        return field[lang] || field['am'] || field['ru'] || field['en'] || Object.values(field)[0] || '';
    }

    return String(field);
}

export function searchMatch(field: any, query: string): boolean {
    if (!query) return true;
    const q = query.toLowerCase();

    if (!field) return false;

    if (typeof field === 'string') {
        return field.toLowerCase().includes(q);
    }

    if (typeof field === 'object') {
        // Search in all values
        return Object.values(field).some(val =>
            String(val).toLowerCase().includes(q)
        );
    }

    return false;
}
