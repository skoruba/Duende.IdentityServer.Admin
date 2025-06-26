export class WebApiClientBase {
    protected async transformOptions(options: RequestInit): Promise<RequestInit> {
        const headers = new Headers(options.headers);
        headers.set("X-ANTI-CSRF", "1");

        return {
            ...options,
            headers,
        };
    }
}