import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import kv from "./routes/kv";
import { KvApiResponse } from "./types";

const app = new Hono<{ Bindings: CloudflareBindings }>();
app.use("*", prettyJSON());

app.get("/", (c) => {
    return c.text("Hello from Hono!");
});

// GET Route: /api
app.get("/api", (c) => {
    const response: KvApiResponse = {
        status: "200",
        message: "API is working",
    };
    return c.json(response);
});

app.route("/api/kv", kv);

export default app;
