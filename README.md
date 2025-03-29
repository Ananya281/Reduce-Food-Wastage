# 🍽️ Reduce Food Wastage - Empower Communities, Feed the Needy

## 🌐 Live Demo
Visit: [reduce-food-wastage.vercel.app](https://reduce-food-wastage.vercel.app)

---

## 📌 About the Project

**Reduce Food Wastage** is a full-stack web application that connects **donors**, **NGOs**, and **volunteers** to manage and optimize the donation and distribution of surplus food. 

This platform enables:
- 📦 Donors to post surplus food donations
- 🏥 NGOs to request food for the needy
- 🚗 Volunteers to handle pickups and deliveries

By streamlining the process, this initiative aims to **minimize food wastage** and **support underserved communities**.

---

## ✨ Features

- ✅ Role-based login and authentication (Donor, NGO, Volunteer)
- ✅ Google Sign-In integration for quick access
- ✅ Real-time donation and request management
- ✅ Personalized dashboards for every user type
- ✅ Clean, mobile-friendly UI with **Tailwind CSS**
- ✅ Dynamic routing and data fetching

---

## 🛠️ Tech Stack

### Frontend:
- React.js + React Router
- Tailwind CSS
- Google OAuth (`@react-oauth/google`)

### Backend:
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT for secure authentication

### Deployment:
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/reduce-food-wastage.git
cd reduce-food-wastage
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file:
```env
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_secret_key
```
Start the backend server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env` file:
```env
REACT_APP_BACKEND_URL=https://reduce-food-wastage.onrender.com
```
Start the frontend app:
```bash
npm start
```

---

## 📸 Screenshots (Optional)

<!--> Add screenshots to the `screenshots/` folder and uncomment below:-->

<!--
### 🔐 Login Page
![Login](./screenshots/login.png)

### 👤 Donor Dashboard
![Donor](./screenshots/donor-dashboard.png)

### 🏥 NGO Dashboard
![NGO](./screenshots/ngo-dashboard.png)

### 🚗 Volunteer Dashboard
![Volunteer](./screenshots/volunteer-dashboard.png)
-->

---

## 🙌 Contributing

We welcome contributions! Follow the steps below:

1. Fork the repository
2. Create your branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'feature added'`
4. Push to the branch: `git push origin feature-name`
5. Create a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to use and adapt!

---

> ✨ "Turning Food Waste into Hope - One Click at a Time"
