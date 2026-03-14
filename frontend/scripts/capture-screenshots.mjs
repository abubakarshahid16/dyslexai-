#!/usr/bin/env node
/**
 * Captures screenshots of the DyslexAI web app for README and docs.
 * Run with: node scripts/capture-screenshots.mjs
 * Prerequisite: App must be running (.\scripts\run-simple.ps1)
 */

import { chromium } from "playwright";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.SCREENSHOT_BASE_URL || "http://localhost:5173";
const OUTPUT_DIR = path.join(__dirname, "..", "..", "docs", "screenshots");

const DEMO_EMAIL = `demo-screenshots-${Date.now()}@example.com`;
const DEMO_PASSWORD = "demo123456";
const DEMO_NAME = "Demo User";

const SCREENSHOTS = [
  { path: "/", file: "01-landing.png", name: "Landing" },
  { path: "/login", file: "02-login.png", name: "Login" },
  { path: "/signup", file: "03-signup.png", name: "Signup" },
  { path: "/dashboard", file: "04-dashboard.png", name: "Dashboard", auth: true },
  { path: "/workspace", file: "05-workspace-upload.png", name: "Workspace", auth: true },
  { path: "/history", file: "07-history.png", name: "History", auth: true },
  { path: "/exercises", file: "08-exercises.png", name: "Exercises", auth: true },
  { path: "/game", file: "09-game-mode.png", name: "Game Mode", auth: true },
  { path: "/students", file: "10-students.png", name: "Students", auth: true },
  { path: "/settings", file: "11-settings.png", name: "Settings", auth: true },
];

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function main() {
  ensureDir(OUTPUT_DIR);
  console.log(`Screenshots will be saved to: ${OUTPUT_DIR}`);
  console.log(`Base URL: ${BASE_URL}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  try {
    // Public pages (no auth)
    for (const { path: route, file, name } of SCREENSHOTS.filter((s) => !s.auth)) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
      const out = path.join(OUTPUT_DIR, file);
      await page.screenshot({ path: out, fullPage: true });
      console.log(`  ✓ ${name} → ${file}`);
    }

    // Sign up for protected pages
    await page.goto(`${BASE_URL}/signup`, { waitUntil: "networkidle" });
    await page.fill('input[type="text"]', DEMO_NAME);
    await page.fill('input[type="email"]', DEMO_EMAIL);
    await page.fill('input[type="password"]', DEMO_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|workspace|history|exercises|game|students|settings)/, {
      timeout: 10000,
    }).catch(() => {
      // Maybe user already exists - try login
    });

    // If we're not logged in, try login with same creds (in case signup failed due to existing user)
    const url = page.url();
    if (url.includes("/login") || url.includes("/signup")) {
      await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
      await page.fill('input[type="email"]', DEMO_EMAIL);
      await page.fill('input[type="password"]', DEMO_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/(dashboard|workspace|history)/, { timeout: 8000 });
    }

    // Protected pages
    for (const { path: route, file, name } of SCREENSHOTS.filter((s) => s.auth)) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);
      const out = path.join(OUTPUT_DIR, file);
      await page.screenshot({ path: out, fullPage: true });
      console.log(`  ✓ ${name} → ${file}`);
    }

    // 06-ocr-result: workspace shows OCR upload/processing UI (actual result requires file upload)
    await page.goto(`${BASE_URL}/workspace`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "06-ocr-result.png"),
      fullPage: true,
    });
    console.log(`  ✓ Workspace (OCR UI) → 06-ocr-result.png`);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }

  console.log(`\nDone. ${OUTPUT_DIR}`);
}

main();
