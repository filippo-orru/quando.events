export type LocalAccessToken = {
  id: string;
  token: string;
  expiration: number;
}

export default defineEventHandler(async (event) => {
  let user = await createUser();
  return {
    id: user.id,
    token: user.tokens[0]!.token,
    expiration: user.tokens[0]!.expiration,
  } as LocalAccessToken;
})
