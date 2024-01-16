import express, { Express, Request, Response } from "npm:express@^4";
import "npm:pug@^3";
import { rateLimiter } from "https://deno.land/x/express_rate_limit/mod.ts";



import { MongoClient } from "https://deno.land/x/mongo/mod.ts";

const app = express();
const port = 8000;
const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 100, // ograniczenie do 100 żądań na okno czasowe
});

interface GuestbookEntry {
  name: string;
  message: string;
}

const client = new MongoClient();
await client.connect("mongodb://127.0.0.1:27017");
const db = client.database("AGH");
const entriesCollection = db.collection<GuestbookEntry>("guestbook");

app.use(express.urlencoded()); // Parse URL-encoded bodies

app.set("view engine", "pug");
app.set("views", "./views");

app.use(async (req: Request, res: Response, next: Function) => {
  // Check if the response body is JSON
  if (res.locals.data && typeof res.locals.data === "object") {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
  }
  next();
});

app.get("/", limiter, async (req: Request, res: Response) => {
  const entries = await entriesCollection.find();
  const entriesList = await entries.toArray();
  
  res.render("index2", { entries: entriesList });
});

app.post("/", async (req: Request, res: Response) => {
  const formData = req.body;

  if (formData) {
    const newEntry: GuestbookEntry = {
      name: formData.name || "",
      message: formData.message || "",
    };

    await entriesCollection.insertOne(newEntry);

    res.redirect("/");
  } else {
    res.json({ error: "Invalid request body" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
