let development: boolean | undefined = undefined;

export function isDevelopment(): boolean {
    if (development == undefined) {
        development = process.env.DEVELOPMENT === "true";
    }
    return development;
}
