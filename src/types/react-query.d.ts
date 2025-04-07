
import '@tanstack/react-query';

// Extend TanStack Query types to accept string arrays as query invalidation filters
declare module '@tanstack/react-query' {
  export interface InvalidateQueryFilters {
    [key: string]: any;
  }
}
