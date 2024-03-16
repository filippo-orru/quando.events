import { generateRandomId } from "./db_utils";

type User = {
    id: string;
    name: string | null;
    email: string | null;
    tokens: AccessToken[];
}

export type AccessToken = {
    token: string,
    expiration: number
}

const userStorage = useStorage<User>('redis:users');

export async function createUser() {
    // Create a new user in the database
    let user = {
        id: 'us_' + generateRandomId(),
        name: null,
        email: null,
        tokens: [
            { token: 'tk_' + generateRandomId(), expiration: Date.now() + 1000 * 60 * 60 * 24 * 30 /* 30 days */ }
        ],
    };
    await userStorage.setItem(user.id, user);

    return user;
}

export async function getUserByToken(userId: string, token: string) {
    // Get the user from the database
    let user = await userStorage.getItem(userId);
    if (user?.tokens.some((t) => t.token == token)) {
        return user;
    }
    return null;
}

export async function getUserById(id: string) {
    return await userStorage.getItem(id);
}

type UserUpdate = {
    name?: string;
    email?: string;
}
export async function updateUser(user: User, update: UserUpdate): Promise<User | null> {
    // Update the user in the database
    if (user) {
        user.name = update.name || user.name;
        user.email = update.email || user.email;
        await userStorage.setItem(user.id, user);
        return user;
    }
    return null;
}