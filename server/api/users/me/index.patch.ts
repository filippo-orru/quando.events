import { updateUser } from "~/server/utils/db/users";

type UserUpdateResponse = 'unauthorized' | {
  id: string;
  email: string | null;
  name: string | null;
};

export default defineEventHandler(async (event) => {
  let user = await updateUser(event.context.authorizedUser, await readBody(event));
  if (!user) {
    return 'unauthorized' as UserUpdateResponse;
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  } as UserUpdateResponse;
})
