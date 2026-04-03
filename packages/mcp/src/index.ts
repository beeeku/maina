export { createMcpServer, startServer } from "./server";

// Auto-start when run directly
const isMainModule =
	typeof Bun !== "undefined" && Bun.main === import.meta.path;

if (isMainModule) {
	const { startServer } = await import("./server");
	await startServer();
}
