import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, drivers } from "@workspace/db";
import { LoginDriverBody, RegisterDriverBody } from "@workspace/api-zod";
import { createAccessToken } from "../lib/auth";

const router: IRouter = Router();

function serializeDriver(driver: typeof drivers.$inferSelect) {
  return {
    id: driver.id,
    email: driver.email,
    subscriptionTier: driver.subscriptionTier === "pro" ? "pro" : "free",
    createdAt: driver.createdAt.toISOString(),
  };
}

router.post("/auth/register", async (req, res) => {
  const parsed = RegisterDriverBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Enter a valid email and a password of at least 8 characters." });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  const existing = await db.select({ id: drivers.id }).from(drivers).where(eq(drivers.email, email)).limit(1);
  if (existing.length) {
    res.status(409).json({ message: "A driver account with that email already exists." });
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const [driver] = await db
    .insert(drivers)
    .values({ email, passwordHash })
    .returning();
  if (!driver) {
    res.status(500).json({ message: "Unable to create driver account." });
    return;
  }

  res.status(201).json({
    token: createAccessToken({ id: driver.id, email: driver.email }),
    driver: serializeDriver(driver),
  });
});

router.post("/auth/login", async (req, res) => {
  const parsed = LoginDriverBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Enter a valid email and password." });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  const [driver] = await db.select().from(drivers).where(eq(drivers.email, email)).limit(1);
  if (!driver || !(await bcrypt.compare(parsed.data.password, driver.passwordHash))) {
    res.status(401).json({ message: "Email or password is incorrect." });
    return;
  }

  res.json({
    token: createAccessToken({ id: driver.id, email: driver.email }),
    driver: serializeDriver(driver),
  });
});

export default router;