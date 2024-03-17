import redisDriver from 'unstorage/drivers/redis'

export default defineNitroPlugin(() => {
  const storage = useStorage();

  // Dynamically pass in credentials from runtime configuration, or other sources
  const driver = redisDriver({
    base: 'redis',
    host: useRuntimeConfig().redis.host,
    port: 6379,
    /* other redis connector options */
  })

  // Mount driver
  storage.mount('redis', driver)
});