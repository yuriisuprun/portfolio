# 🌐 Yurii Suprun — My personal website

[![React](https://img.shields.io/badge/React-18-blue?logo=react)]()
[![Tailwind](https://img.shields.io/badge/TailwindCSS-3-blue?logo=tailwindcss)]()
[![Java](https://img.shields.io/badge/Java-Backend-orange?logo=java)]()
[![Spring Boot](https://img.shields.io/badge/SpringBoot-API-green?logo=springboot)]()
[![License](https://img.shields.io/badge/license-MIT-lightgrey)]()

A modern **full-stack developer portfolio** built with **React, Tailwind CSS, and Spring Boot**.
The project showcases professional experience, projects, and contact information while demonstrating modern frontend architecture and clean UI design.

---

<a href="https://yuriisuprun.vercel.app/" target="_blank">
  <img src="https://img.shields.io/badge/https://yuriisuprun.vercel.app/-0A66C2?style=for-the-badge&logo=vercel&logoColor=white">
</a>

---

# 📸 Preview

## Home

<img width="900" alt="Portfolio Home Screenshot" src="docs/home.png">

## Projects

<img width="900" alt="Portfolio Projects Screenshot" src="docs/projects.png">

## Contacts

<img width="900" alt="Portfolio Contacts Screenshot" src="docs/contacts.png">

*(Screenshots can be added later inside a `/docs` folder)*

---

# ✨ Features

### 🎨 Modern UI

* Responsive design
* Clean minimal layout
* Tailwind CSS styling
* Dark / Light mode toggle

### 🌍 Multilingual Support

* English 🇬🇧
* Italian 🇮🇹
* Instant language switching

### ⚡ SPA Navigation

* Client-side routing
* No page reloads
* Clean URL structure

```
/home
/about
/projects
/contacts
```

### 📦 Dynamic Projects

Projects are loaded from a backend API.

### 📱 Fully Responsive

Works across:

* Desktop
* Tablet
* Mobile

---

# 🧰 Tech Stack

## Frontend

| Technology   | Purpose        |
| ------------ | -------------- |
| React        | UI Framework   |
| React Router | SPA Navigation |
| Tailwind CSS | Styling        |
| Axios        | API requests   |

---

## Backend (Optional)

| Technology  | Purpose          |
| ----------- | ---------------- |
| Java        | Backend language |
| Spring Boot | REST API         |
| GitHub API  | Repository data  |

---

# 📂 Project Structure

```
src
│
├── components
│   ├── Navbar.jsx
│   ├── Hero.jsx
│   ├── About.jsx
│   ├── Projects.jsx
│   ├── Contacts.jsx
│   ├── Footer.jsx
│   └── ThemeToggle.jsx
│
├── App.jsx
├── index.js
└── index.css
```

---

# ⚙️ Installation

## 1️⃣ Clone the repository

```
git clone https://github.com/yuriisuprun/portfolio.git
cd portfolio
```

---

## 2️⃣ Install dependencies

```
npm install
```

---

## 3️⃣ Start the development server

```
npm start
```

Open in browser:

```
http://localhost:3000
```

---

# 🔗 Backend API

The **Projects** section retrieves data from a backend service.

Example endpoint:

```
GET http://localhost:8080/api/repos
```

Example response:

```json
[
  {
    "id": 1,
    "name": "portfolio",
    "description": "Personal developer portfolio",
    "html_url": "https://github.com/username/portfolio"
  }
]
```

---

# 🎯 Roadmap

Future improvements planned:

* Project filtering
* Blog section
* Deployment pipeline
* Contact form with email service
* Animations and transitions
* SEO improvements

---

# 📬 Contact

**Yurii Suprun**

Email

```
iursuprun@gmail.com
```

GitHub

```
https://github.com/yuriisuprun
```

LinkedIn

```
https://www.linkedin.com/in/yurii-suprun
```

---

# 📜 License

This project is licensed under the **MIT License**.

---

# ⭐ Support

If you like this project:

⭐ Star the repository
🍴 Fork it
🛠 Use it as inspiration for your own portfolio

---

**Made by Yurii Suprun**
