declare module 'global' {
    interface String {
        capitalize(): string;
    }
}

function capitalize(s: string): string {
    if (s.length === 0) return s;
    
    return s.charAt(0).toUpperCase() + s.slice(1);
}