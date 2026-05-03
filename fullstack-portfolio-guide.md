# Fullstack Web Developer Portfolio — Step-by-Step Guide

## Step 1: Plan Your Portfolio

Before writing any code, decide what you want to showcase:

- **Who are you?** — Your name, title, and a short bio
- **What can you do?** — Skills (React, Node.js, PostgreSQL, etc.)
- **What have you built?** — 3–6 projects with descriptions, tech stacks, and links
- **How can people reach you?** — Contact form or links to email, GitHub, LinkedIn

---

## Step 2: Choose Your Tech Stack

As a fullstack developer, use technologies you actually know. A solid choice:

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Node.js + Express |
| Database | PostgreSQL (via Drizzle ORM) |
| Hosting | Replit / Vercel / Render |

---

## Step 3: Design the Layout

Plan the pages and sections of your portfolio:

1. **Hero Section** — Name, title, and a call-to-action button (e.g., "View My Work")
2. **About Section** — A short paragraph about you and your background
3. **Skills Section** — Icons or badges showing your tech stack
4. **Projects Section** — Cards for each project
5. **Contact Section** — A form or links to reach you

---

## Step 4: Set Up the Project

### Create the project structure:

```
/client          ← Frontend (React)
  /src
    /components  ← Reusable UI components
    /pages       ← Page components
    App.tsx
    main.tsx
/server          ← Backend (Express)
  routes.ts
  storage.ts
/shared
  schema.ts      ← Shared data types
```

### Install dependencies:

```bash
npm install react react-dom typescript tailwindcss
npm install express drizzle-orm drizzle-zod zod
npm install @tanstack/react-query wouter
```

---

## Step 5: Build the Frontend

### 5.1 — Create the Hero Section

```tsx
// client/src/components/Hero.tsx
export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-5xl font-bold">Hi, I'm [Your Name]</h1>
      <p className="text-xl mt-4 text-gray-500">Fullstack Web Developer</p>
      <a href="#projects" className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg">
        View My Work
      </a>
    </section>
  );
}
```

### 5.2 — Create a Project Card Component

```tsx
// client/src/components/ProjectCard.tsx
type Project = {
  title: string;
  description: string;
  tech: string[];
  liveUrl?: string;
  githubUrl?: string;
};

export default function ProjectCard({ title, description, tech, liveUrl, githubUrl }: Project) {
  return (
    <div className="border rounded-xl p-6 shadow hover:shadow-lg transition">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-gray-500 mt-2">{description}</p>
      <div className="flex gap-2 mt-3 flex-wrap">
        {tech.map(t => (
          <span key={t} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">{t}</span>
        ))}
      </div>
      <div className="flex gap-4 mt-4">
        {liveUrl && <a href={liveUrl} target="_blank" className="text-blue-600 underline">Live Demo</a>}
        {githubUrl && <a href={githubUrl} target="_blank" className="text-gray-600 underline">GitHub</a>}
      </div>
    </div>
  );
}
```

### 5.3 — Create the Projects Section

```tsx
// client/src/components/Projects.tsx
import ProjectCard from "./ProjectCard";

const projects = [
  {
    title: "E-Commerce App",
    description: "A fullstack shopping platform with cart and payments.",
    tech: ["React", "Node.js", "PostgreSQL", "Stripe"],
    liveUrl: "https://yourapp.com",
    githubUrl: "https://github.com/you/ecommerce",
  },
  // Add more projects...
];

export default function Projects() {
  return (
    <section id="projects" className="py-20 px-6">
      <h2 className="text-3xl font-bold text-center mb-10">My Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(p => <ProjectCard key={p.title} {...p} />)}
      </div>
    </section>
  );
}
```

---

## Step 6: Build the Backend (Contact Form)

### 6.1 — Define the schema

```ts
// shared/schema.ts
import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
```

### 6.2 — Add the API route

```ts
// server/routes.ts
import { insertMessageSchema } from "@shared/schema";

app.post("/api/contact", async (req, res) => {
  const result = insertMessageSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  await storage.createMessage(result.data);
  res.json({ success: true });
});
```

### 6.3 — Create the Contact Form

```tsx
// client/src/components/ContactForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMessageSchema } from "@shared/schema";

export default function ContactForm() {
  const form = useForm({ resolver: zodResolver(insertMessageSchema) });

  const onSubmit = async (data: any) => {
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    alert("Message sent!");
  };

  return (
    <section id="contact" className="py-20 px-6 max-w-xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-10">Contact Me</h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input {...form.register("name")} placeholder="Your Name" className="border p-3 rounded" />
        <input {...form.register("email")} placeholder="Your Email" className="border p-3 rounded" />
        <textarea {...form.register("message")} placeholder="Your Message" rows={5} className="border p-3 rounded" />
        <button type="submit" className="bg-blue-600 text-white py-3 rounded">Send Message</button>
      </form>
    </section>
  );
}
```

---

## Step 7: Assemble the App

```tsx
// client/src/App.tsx
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import ContactForm from "./components/ContactForm";

export default function App() {
  return (
    <main>
      <Hero />
      <Projects />
      <ContactForm />
    </main>
  );
}
```

---

## Step 8: Add Your Content

Replace placeholder content with your real information:

- [ ] Your name and title in the Hero section
- [ ] Your real projects with actual links
- [ ] Your skills list
- [ ] Your GitHub, LinkedIn, and email links

---

## Step 9: Polish the Design

- Add smooth scroll behavior in CSS: `html { scroll-behavior: smooth; }`
- Use consistent colors and fonts throughout
- Make sure it looks good on mobile (responsive design)
- Add hover effects to cards and buttons
- Use a professional headshot if you have one

---

## Step 10: Deploy Your Portfolio

1. **Test everything** — Check all links, the contact form, and mobile view
2. **Deploy on Replit** — Click "Deploy" to get a live `.replit.app` URL
3. **Share it** — Add the link to your GitHub profile, LinkedIn, and resume

---

## Tips for a Great Portfolio

- **Keep it simple** — Clean and fast beats flashy and slow
- **Show real projects** — Even small projects count if they solve a real problem
- **Write clear descriptions** — Explain what the project does and what you learned
- **Keep it updated** — Add new projects as you build them
- **Make contact easy** — Recruiters should find your email in under 5 seconds

---

*Good luck building your portfolio! A well-crafted portfolio is one of the most powerful tools in a developer's job search.*
