# CeyBlogger

CeyBlogger is a modern, feature-rich blogging platform built with **Next.js**, **TypeScript**, and **TailwindCSS**. It allows users to create, read, update, and delete blog posts, with advanced features such as rich text editing, tags, filters, search, likes, comments, and password management.  

---

## 🚀 Features

- **User Authentication & Authorization**  
  - Secure login, registration, and JWT-based authentication.  
  - Password reset flow with email token verification.  

- **Posts Management**  
  - Create, edit, delete posts.  
  - Rich text editor for content formatting.  
  - Featured images with live preview and size validation (< 2MB).  
  - Publish/unpublish toggle for post visibility.  

- **Tags & Authors Filters**  
  - Filter posts by authors or tags.  
  - Search posts by title or content.  
  - Dynamic filter options fetched from API.  

- **Interactions & Engagement**  
  - Like posts (instant UI feedback).  
  - Comment on posts with threaded discussions.  
  - Optimistic UI updates for likes and comments.  

- **UI & UX**  
  - Responsive design with **TailwindCSS** and **shadcn/ui** components.  
  - Toast notifications for actions and errors.  
  - Disabled/reset buttons for sensitive actions to prevent spamming.  

- **Data Management**  
  - PostgreSQL database (via Prisma) or any relational DB backend.  
  - REST API endpoints for posts, tags, users, and comments.  
  - Cursor-based pagination for efficient data fetching.  

---

## 🛠 Tech Stack

- **Frontend:** Next.js, React, TypeScript, TailwindCSS, shadcn/ui, Lucide icons  
- **State & Forms:** react-hook-form, zod for validation  
- **Rich Text Editor:** TipTap  
- **API & Backend:** Next.js API routes (RESTful endpoints)  
- **Authentication:** JWT-based auth, password reset via email  

---

## ⚙️ Setup Instructions

1. **Clone the repository**  
```bash
git clone https://github.com/yourusername/ceyblogger.git
cd ceyblogger
```

2. **Install dependencies**  
```bash
npm install
```

3. **Configure environment variables**  

Create a `.env` file in the root:  
```env
NEXT_PUBLIC_API_URL=http://localhost:4000   # dev
# NEXT_PUBLIC_API_URL=https://ceyblogger-api-production.up.railway.app  # prod

```

4. **Run the development server**  
```bash
npm run dev
```  
The app will be available at: `http://localhost:9002`

5. **Build for production**  
```bash
npm run build
npm start
```

