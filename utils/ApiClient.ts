import { deserializeMeeting } from "~/data/Meeting";
import type { LocalAccessToken } from "~/server/api/auth/register.post";
import type { UpdateMeeting } from "~/server/api/meetings/[...meetingId]/index.patch";
import type { Meeting } from "~/server/utils/db/meetings";

/** Stores and persists access token. */
class TokenStore {
  private key = 'accessToken';
  private accessToken: LocalAccessToken | null = null;

  getAccessToken() {
    if (!this.accessToken) {
      let token = localStorage.getItem(this.key);
      if (token) {
        this.accessToken = JSON.parse(token);
      }
    }
    return this.accessToken;
  }

  setAccessToken(token: LocalAccessToken | null) {
    if (token) {
      localStorage.setItem(this.key, JSON.stringify(token));
    } else {
      localStorage.removeItem(this.key);
    }
    this.accessToken = token;
  }
}

export class ApiClient {
  static i: ApiClient = new ApiClient();
  private constructor() { }

  tokenStore: TokenStore = new TokenStore();

  private async getHeaders() {
    let accessToken = this.tokenStore.getAccessToken();

    if (!accessToken) {
      accessToken = await this.init();
    }
    // TODO check if token is expired

    if (!accessToken) {
      throw new Error('No token');
    }
    return {
      'Authorization': `${accessToken.id}##${accessToken.token}`,
    }
  }

  private async init() {
    try {
      let token = await $fetch('/api/auth/register', {
        method: 'POST',
      });
      this.tokenStore.setAccessToken(token);
      return token;
    } catch (e) {
      throw e; // TODO improve
    }
  }

  async updateMeeting(meetingId: string, body: UpdateMeeting) {
    await $fetch(`/api/meetings/${meetingId}`,
      {
        method: 'PATCH',
        headers: await this.getHeaders(),
        body: body,
      }
    );
    // TODO if unauthorized, clear token
  }

  async getMeeting(id: string): Promise<Meeting> {
    let meeting = await $fetch(`/api/meetings/${id}`, {
      headers: await this.getHeaders(),
    });

    return deserializeMeeting(meeting);
  }

  async updateUser(body: { name: string | null, email: string | null }) {
    let response = await $fetch('/api/users/me', {
      method: 'PATCH',
      headers: await this.getHeaders(),
      body: JSON.stringify({
        name: body.name,
        email: body.email,
      }),
    });

    if (response == 'unauthorized') {
      console.error('Unauthorized');
      this.tokenStore.setAccessToken(null);
    }
    return response as { id: string, name: string, email: string };
  }
}
