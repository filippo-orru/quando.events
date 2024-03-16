import { getUserByToken } from "../utils/db/users";

export default defineEventHandler(async (event) => {
  let token = event.headers.get("Authorization");
  let user = await getUserByToken(token);
  // console.log("User authorized", user);
  event.context.authorizedUser = user;
})
