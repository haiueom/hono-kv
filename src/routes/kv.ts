import { Hono } from "hono";
import { KvApiResponse } from "../types";

const app = new Hono<{ Bindings: CloudflareBindings }>();

// GET Route: Retrieve a value or list all keys
app.get("/:key?", async (c) => {
    const key = c.req.param("key");

    if (!key) {
        const data = await c.env.kv.list();
        const response: KvApiResponse = {
            status: "200",
            message: `There are ${data.keys.length} kv keys`,
        };
        return c.json(response);
    }

    const data = await c.env.kv.get(key);
    const response: KvApiResponse = data
        ? {
            status: "200",
            message: "ok",
            result: { key, value: data },
        }
        : {
            status: "404",
            error: `Key '${key}' not found`,
        };
    return c.json(response);
});

// POST Route: Create a new KV pair
app.post("/", async (c) => {
    try {
        const { key, value } = await c.req.json();

        if (!key || !value) {
            const response: KvApiResponse = {
                status: "400",
                error: "Missing key or value",
            };
            return c.json(response);
        }

        const exist = await c.env.kv.get(key);
        if (exist) {
            const response: KvApiResponse = {
                status: "409",
                error: `Key '${key}' already exists`,
            };
            return c.json(response);
        }

        await c.env.kv.put(key, value, { expirationTtl: 86400 });
        const response: KvApiResponse = {
            status: "201",
            message: "KV created successfully",
            result: { key, value },
        };
        return c.json(response);
    } catch (e) {
        const response: KvApiResponse = {
            status: "400",
            message: "Invalid JSON body",
            error: "Bad Request",
        };
        return c.json(response);
    }
});

// PUT Route: Update an existing KV pair
app.put("/:key", async (c) => {
    const key = c.req.param("key");
    try {
        const { value } = await c.req.json();

        if (!value) {
            const response: KvApiResponse = {
                status: "400",
                error: "Missing value in the request body",
            };
            return c.json(response);
        }

        const exist = await c.env.kv.get(key);
        if (!exist) {
            const response: KvApiResponse = {
                status: "404",
                error: `Key '${key}' not found`,
            };
            return c.json(response);
        }

        await c.env.kv.put(key, value);
        const response: KvApiResponse = {
            status: "200",
            message: "KV updated successfully",
            result: { key, value },
        };
        return c.json(response);
    } catch (e) {
        const response: KvApiResponse = {
            status: "400",
            message: "Invalid JSON body",
            error: "Bad Request",
        };
        return c.json(response);
    }
});

// DELETE Route: Delete a KV pair
app.delete("/:key", async (c) => {
    const key = c.req.param("key");

    if (!key) {
        const response: KvApiResponse = {
            status: "400",
            message: "Missing key parameter",
            error: "Missing key",
        };
        return c.json(response);
    }

    const exist = await c.env.kv.get(key);
    if (!exist) {
        const response: KvApiResponse = {
            status: "404",
            error: `Key '${key}' not found`,
        };
        return c.json(response);
    }

    await c.env.kv.delete(key);
    const response: KvApiResponse = {
        status: "200",
        message: `KV '${key}' deleted successfully`,
    };
    return c.json(response);
});

export default app;
