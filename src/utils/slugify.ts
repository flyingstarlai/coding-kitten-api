export const slugify = (text: string): string => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        // Replace spaces and consecutive dashes with a single dash
        .replace(/\s+/g, '-')
        // Remove all non-word chars except dash
        .replace(/[^\w\-]+/g, '')
        // Collapse multiple dashes into one
        .replace(/--+/g, '-')
}
