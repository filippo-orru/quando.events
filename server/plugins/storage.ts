import redisDriver from 'unstorage/drivers/redis'

export default defineNitroPlugin(() => {
  const storage = useStorage();

  let host = useRuntimeConfig().redis.host;
  console.log('Mounting Redis storage driver on host \'' + host + '\' ...');

  // Dynamically pass in credentials from runtime configuration, or other sources
  const users = redisDriver({
    base: 'redis:users',
    host: host,
    port: 6379,
    /* other redis connector options */
  })
  const meetings = redisDriver({
    base: 'redis:meetings',
    host: host,
    port: 6379,
    /* other redis connector options */
  })

  // Mount driver
  storage.mount('redis:users', users);
  storage.mount('redis:meetings', meetings);
});