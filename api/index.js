import express from "express";
import { MongoClient } from "mongodb";
import { createClient } from "redis";

const app = express();
app.use(express.json());

const client = new MongoClient("mongodb://mongodb:27017");
await client.connect();
const db = client.db("appdb");

const redisClient = createClient({
  url: "redis://redis:6379",
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

await redisClient.connect();
console.log("Connected to Redis");

const PORT = 3000 || import.meta.env.PORT;

app.get("/", (req, res) => {
  res.send("Hello from express\n");
});

app.post("/submit", async (req, res) => {
  try {
    await db.collection("submissions").insertOne(req.body);

    // Invalidate cache because data changed
    await redisClient.del("submissions_cache");

    res.send("Saved!");
  } catch (err) {
    console.error("Mongo insert failed:", err);
    res.status(500).send("Failed to save.");
  }
});

app.get("/submissions", async (req, res) => {
  try {
    // 1. Try Redis
    const cached = await redisClient.get("submissions_cache");
    if (cached) {
      console.log("Returning submissions from Redis cache");
      return res.json(JSON.parse(cached));
    }

    // 2. Fallback to Mongo
    const docs = await db.collection("submissions").find().toArray();

    // 3. Store in Redis (as JSON string), with TTL (e.g. 30 seconds)
    await redisClient.setEx(
      "submissions_cache",
      30, // seconds
      JSON.stringify(docs)
    );

    console.log("Returning submissions from Mongo and caching in Redis");
    res.json(docs);
  } catch (err) {
    console.error("Error in /submissions:", err);
    res.status(500).send("Failed to read.");
  }
});


app.listen(PORT, () => {
  console.log(`Express listening on port ${PORT}`);
});
