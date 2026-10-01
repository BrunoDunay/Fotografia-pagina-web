import { customAlphabet } from 'nanoid';

// Sin caracteres ambiguos (0/O, 1/I/L) para que el código pueda dictarse.
const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export const generatePublicCode = customAlphabet(alphabet, 10);
