import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import { dejsEngine, oakAdapter, viewEngine } from "https://deno.land/x/view_engine/mod.ts";
import { MongoClient } from "https://deno.land/x/mongo/mod.ts";

interface GuestbookEntry {
  name: string;
  message: string;
}

const app = new Application();
const router = new Router();

const client = new MongoClient();
await client.connect("mongodb://127.0.0.1:27017");
const db = client.database("AGH");
const entriesCollection = db.collection<GuestbookEntry>("guestbook");

// Configure view engine
app.use(viewEngine(oakAdapter, dejsEngine, {
  viewRoot: "./views",
  viewExt: ".ejs",
}));

app.use(async (ctx, next) => {
  await next();

  if (ctx.response.body && typeof ctx.response.body === "object") {
    ctx.response.headers.set("Content-Type", "application/json;charset=utf-8");
  }
});

router.get("/", async (ctx) => {
  const entries = await entriesCollection.find();
  const entriesList: GuestbookEntry[] = await entries.toArray();

  await ctx.render("index4.ejs", { entriesList });
});

router.post("/", async (ctx) => {
  const body = ctx.request.body();

  if (body.type === "form" && body.value) {
    const formData = await body.value;

    const newEntry: GuestbookEntry = {
      name: formData.get("name") || "",
      message: formData.get("message") || "",
    };

    await entriesCollection.insertOne(newEntry);

    ctx.response.redirect("/");
  } else {
    ctx.response.body = {
      error: "Invalid request body",
    };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
