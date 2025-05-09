
import { requestJira } from '@forge/bridge';

export type User = {
  accountId: string;
  accountType: string;
  active: boolean;
  avatarUrls: {
    '16x16': string;
    '24x24': string;
    '32x32': string;
    '48x48': string;
  };
  displayName: string;
  emailAddress: string;
};

const userCache : Record<string, User> = {}
export async function getUser(userId: string) : Promise<User | undefined> {
    const cachedUser = userCache[userId];
    if (cachedUser) {
        return Promise.resolve(cachedUser);
    }
    return fetchUser(userId).then((user) => {
        if (user) {
            userCache[userId] = user;
        }
        return user;
    });
}

async function fetchUser(userId: string) : Promise<User | undefined> {
    try {
        const response = await requestJira(`/rest/api/3/user?accountId=${userId}`)
        if (!response.status && response.status === 404) {
            return undefined;
        }
        return await response.json() as Promise<User>
    }
    catch (e) {
        console.error('Error fetching user:', e);
        return undefined;
    }
}