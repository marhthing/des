// Matric number parsing utilities
// parseMatricNumber, etc.

export function parseMatricNumber(filename: string): string {
  // Remove .pdf extension
  let base = filename.replace(/\.pdf$/i, '');
  // Replace dots with slashes
  return base.replace(/\./g, '/');
}
