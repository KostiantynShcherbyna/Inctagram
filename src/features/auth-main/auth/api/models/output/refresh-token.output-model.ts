export type RefreshTokenOutputModel = {
    accessJwt: {
        accessToken: string;
    };
    refreshToken: string;
}