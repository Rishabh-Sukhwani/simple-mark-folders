
/**
 * Markdown utility functions
 */

/**
 * Extract a title from markdown content
 * Looks for the first heading or returns a default title
 */
export function extractTitleFromMarkdown(markdown: string): string {
  const titleMatch = markdown.match(/^#\s+(.*)/);
  if (titleMatch && titleMatch[1]) {
    return titleMatch[1].trim();
  }
  
  // If no heading found, use first line or default
  const firstLine = markdown.split('\n')[0]?.trim();
  if (firstLine && firstLine.length > 0) {
    return firstLine.length > 30 ? `${firstLine.substring(0, 30)}...` : firstLine;
  }
  
  return 'Untitled Note';
}

/**
 * Extract a preview from markdown content
 */
export function extractPreviewFromMarkdown(markdown: string): string {
  // Remove headings, code blocks, etc.
  const cleanText = markdown
    .replace(/^#.+/gm, '') // Remove headings
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\[.*?\]\(.*?\)/g, '') // Remove links
    .replace(/\*\*|\*|~~|_|`/g, '') // Remove formatting
    .trim();
  
  const firstParagraph = cleanText.split('\n\n')[0]?.trim();
  if (firstParagraph && firstParagraph.length > 0) {
    return firstParagraph.length > 150 
      ? `${firstParagraph.substring(0, 150)}...` 
      : firstParagraph;
  }
  
  return 'No preview available';
}
