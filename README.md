# 💊 PharmaConnect

**PharmaConnect** is a web platform designed to connect **pharmacies and patients**, making it easier to find medicines, manage pharmacy inventory, and place medication orders.

The goal of this project is to modernize pharmacy management while helping patients quickly locate medicines and nearby pharmacies.

---

## 🚀 Features

### 👥 Visitor

* 🔍 Search pharmacies by location
* 🕒 View pharmacies on duty
* 💊 Check medicine availability
* 📩 Submit rare medicine requests

### 🧑‍⚕️ Client

* 📝 Create and manage account
* 🛒 Add medicines to cart
* 📦 Place orders (pickup or delivery)
* 📊 Track order status
* 🧾 Upload prescriptions
* 📜 View order history

### 🏥 Pharmacist

* 🏪 Manage pharmacy profile
* 📦 Manage medicine inventory (CRUD)
* 📑 Process and update orders
* 🌙 Activate / deactivate **pharmacy on duty**
* 📊 View dashboard statistics
* ⚠️ Receive low stock alerts

---

## 🛠 Tech Stack

**Backend**

* 🐘 Laravel
* 🗄 MySQL
* 🔐 Custom Authentication
* REST API

**Frontend**

* ⚛️ React (Vite)
* 🎨 TailwindCSS
* 🔗 Axios
* 🌐 React Router

---

## 📂 Project Structure

```
PharmaConnect
│
├── backend
│   └── Laravel API
│
├── frontend
│   └── React Application
│
└── README.md
```

---

## ⚙️ Installation

### 1️⃣ Clone the repository

```
git clone https://github.com/your-username/pharmaconnect.git
cd pharmaconnect
```

---

### 2️⃣ Backend Setup (Laravel)

```
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

Backend runs on:

```
http://localhost:8000
```

---

### 3️⃣ Frontend Setup (React)

```
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 🗺 Project Goal

PharmaConnect aims to:

* Modernize pharmacy inventory management
* Help patients quickly locate medicines
* Improve communication between pharmacies and patients
* Provide visibility for pharmacies on duty

---

## 📚 Educational Purpose

This project is developed as part of a **full-stack learning project**, focusing on:

* Software architecture
* REST API development
* React frontend applications
* Database design
* Agile development practices

---

## 👨‍💻 Author

**Mohamed Kadiri**

---

⭐ If you like this project, feel free to give it a star!
