require("dotenv").config();
const express  = require("express");
const path     = require("path");
const nodemailer = require("nodemailer");
const { projects, order } = require("./data/projects");

const app  = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* ───────────── Static ───────────── */
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/fonts",  express.static(path.join(__dirname, "fonts")));
app.use("/images", express.static(path.join(__dirname, "assets", "images")));

/* ───────────── Body Parser ───────────── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ───────────── Pages ───────────── */
app.get("/",        (_req, res) => res.render("index",     { page: "home" }));
app.get("/home",    (_req, res) => res.redirect("/"));
app.get("/about",   (_req, res) => res.render("about",     { page: "about" }));
app.get("/contact", (_req, res) => res.render("contactus", { page: "contact" }));

app.get("/gallery", (_req, res) =>
  res.render("gallery", { page: "gallery", projects, order })
);

/* ───────────── Contact Form ───────────── */
app.post("/contact", async (req, res) => {
  const { firstName, lastName, email, phone, message } = req.body;

  const text = `📩 Новая заявка с сайта DIN!\n\n👤 Имя: ${firstName} ${lastName}\n📧 Email: ${email}\n📞 Телефон: ${phone || "не указан"}\n💬 Сообщение:\n${message}`;

  // ── Telegram ──────────────────────────────────────────────
  try {
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: text
      })
    });
    console.log("✓ Telegram отправлен");
  } catch (e) {
    console.error("✗ Telegram ошибка:", e.message);
  }

  // ── Email ─────────────────────────────────────────────────
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"DIN Studio" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `✉️ Новое сообщение от ${firstName} ${lastName}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#111;color:#fff;border-radius:12px">
          <h2 style="color:#c9a96e;margin-bottom:24px">📩 Новая заявка с сайта</h2>
          <p><strong>Имя:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}" style="color:#c9a96e">${email}</a></p>
          <p><strong>Телефон:</strong> ${phone || "не указан"}</p>
          <hr style="border-color:#333;margin:20px 0">
          <p><strong>Сообщение:</strong></p>
          <p style="background:#1a1a1a;padding:16px;border-radius:8px;border-left:3px solid #c9a96e">${message}</p>
        </div>
      `
    });
    console.log("✓ Email отправлен");
  } catch (e) {
    console.error("✗ Email ошибка:", e.message);
  }

  res.json({ success: true });
});

/* ───────────── Helpers ───────────── */
function getPrevNext(slug) {
  const idx = order.indexOf(slug);
  if (idx === -1) return { prev: null, next: null };
  const prevSlug = order[(idx - 1 + order.length) % order.length];
  const nextSlug = order[(idx + 1) % order.length];
  return {
    prev: { slug: prevSlug, title: projects[prevSlug]?.title || prevSlug },
    next: { slug: nextSlug, title: projects[nextSlug]?.title || nextSlug }
  };
}

/* ───────────── Portfolio ───────────── */
app.get("/portfolio/:slug", (req, res) => {
  const slug = req.params.slug;
  const project = projects[slug];
  if (!project) {
    return res.status(404).send(
      "<h1 style='font-family:serif;text-align:center;padding:80px'>404 — Project not found. <a href='/gallery'>← Gallery</a></h1>"
    );
  }
  const nav = getPrevNext(slug);
  if (project.template) {
    return res.render(project.template, { project, nav, page: "gallery" });
  }
  res.render("portfolio/project", { project, nav, page: "gallery" });
});

/* ───────────── 404 ───────────── */
app.use((_req, res) =>
  res.status(404).send(
    "<h1 style='font-family:serif;text-align:center;padding:80px'>404 — Not found. <a href='/'>← Home</a></h1>"
  )
);

app.listen(PORT, () => console.log(`✓  http://localhost:${PORT}`));