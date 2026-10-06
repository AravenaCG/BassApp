// App Service has no Cloudflare Workers bindings. Keep the module resolvable
// for the Node build; database-backed progress remains unavailable until the
// D1 layer is migrated to Azure.
export const env: Record<string, never> = {};
