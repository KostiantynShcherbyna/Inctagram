export const configuration = () => {
  return {
    PORT: Number(process.env.PORT) || 5000,
    MONGOOSE_URI: process.env.MONGOOSE_URI || "mongodb+srv://kostyalys:bagrat10n@cluster0.7mo0iox.mongodb.net/BE-2-0-DEV?retryWrites=true&w=majority",

    ACCESS_JWT_SECRET: process.env.ACCESS_JWT_SECRET || "ACCESSJWTSECRET",
    REFRESH_JWT_SECRET: process.env.REFRESH_JWT_SECRET || "REFRESHJWTSECRET",
    PASSWORD_RECOVERY_CODE_SECRET: process.env.PASSWORD_RECOVERY_CODE_SECRET || "PASSWORDRECOVERYCODESECRET",

    POSTGRESQL: process.env.POSTGRESQL,
    POSTGRESQL_TESTING: process.env.POSTGRESQL_TESTING,
    USERNAME: process.env.USERNAME,
    USER_PASSWORD: process.env.USER_PASSWORD,

    NEON_HOST: process.env.NEON_HOST,
    NEON_USERNAME: process.env.NEON_USERNAME,
    NEON_PASSWORD: process.env.NEON_USERNAME,
    NEON_DB_NAME: process.env.NEON_USERNAME,
  }
}
export type ConfigType = ReturnType<typeof configuration>
