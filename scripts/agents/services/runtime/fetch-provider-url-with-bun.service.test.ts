import { describe, expect, test } from "bun:test";
import { fetchProviderUrlWithBun } from "./fetch-provider-url-with-bun.service.ts";

const FICTIONAL_TOKEN = "example-token";
const REJECTED_PATH = "/rejected";

function answerRequest(request: Request): Response {
  if (new URL(request.url).pathname === REJECTED_PATH) {
    return Response.json({}, { status: 401 });
  }
  return Response.json({ method: request.method, authorization: request.headers.get("authorization") });
}

async function withFakeServer(run: (baseUrl: string) => Promise<void>): Promise<void> {
  const server = Bun.serve({ port: 0, hostname: "127.0.0.1", fetch: answerRequest });
  try {
    await run(`http://127.0.0.1:${server.port}`);
  } finally {
    server.stop(true);
  }
}

describe("fetchProviderUrlWithBun", () => {
  test("sends a GET request with the given headers and reads the JSON body", async () => {
    await withFakeServer(async (baseUrl) => {
      const response = await fetchProviderUrlWithBun(`${baseUrl}/usage`, {
        headers: { Authorization: `Bearer ${FICTIONAL_TOKEN}` },
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ method: "GET", authorization: `Bearer ${FICTIONAL_TOKEN}` });
    });
  });

  test("returns error statuses instead of rejecting", async () => {
    await withFakeServer(async (baseUrl) => {
      const response = await fetchProviderUrlWithBun(`${baseUrl}${REJECTED_PATH}`, { headers: {} });

      expect(response.status).toBe(401);
    });
  });

  test("rejects when nothing listens at the address", async () => {
    const server = Bun.serve({ port: 0, hostname: "127.0.0.1", fetch: answerRequest });
    const closedUrl = `http://127.0.0.1:${server.port}/usage`;
    server.stop(true);

    await expect(fetchProviderUrlWithBun(closedUrl, { headers: {} })).rejects.toThrow();
  });
});
