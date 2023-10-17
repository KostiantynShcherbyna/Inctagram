export type LoginOutputModel = {
    accessJwt: {
        accessToken: string;
    };
    refreshToken: string;
}