export const randomIdChars = 'abcdefghijklmnpqrstuvwxyz123456789';

export function generateRandomId(length: number = 16) {
    let id = '';
    for (let i = 0; i < length; i++) {
        id += randomIdChars[Math.floor(Math.random() * randomIdChars.length)];
    }
    return id;
}