# ⚡ Transformer Thermal Inspection System

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React.js-blue" />
  <img src="https://img.shields.io/badge/Backend-SpringBoot-green" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-blueviolet" />
  <img src="https://img.shields.io/badge/Status-Active-success" />
</p>

---

## 📖 Introduction  
The **Transformer Thermal Inspection System** is a complete solution for monitoring and maintaining electrical transformers.  
It is composed of two main parts:  

1. **Frontend** – A React.js-based user interface for managing transformers, inspections, and image uploads.  
2. **Backend** – A Spring Boot and PostgreSQL-powered API server for handling business logic, database management, and image storage.  

Together, these components enable **real-time monitoring**, **inspection scheduling**, **thermal/baseline image comparison**, and **data management** for transformers.  

- 🔗 [Frontend Repository](https://github.com/Project-TransformerIQ/FrontEnd)  
- 🔗 [Backend Repository](https://github.com/Project-TransformerIQ/Backend_Transformer)  

---

## ✨ Features  

### 🔌 Transformer Management  
- Add, edit, update, and delete transformer details.  
- Filter and search transformers by region and type.  

### 📝 Inspection Management  
- Create new inspections with inspector, title, inspection date, and maintenance schedule.  
- Update inspection status (default: Not Started).  
- Delete inspections with confirmation.  

### 🖼️ Image Management  
- Upload **Baseline** images with weather condition and inspection details.  
- Upload **Maintenance** images during inspections.  
- Compare baseline vs maintenance images visually.  
- Manage multiple images and track them in the database.  

### 🎨 User Interface  
- Responsive and clean layout.  
- Toast notifications and progress indicators.  
- Confirmation dialogs for risky actions (delete).  
- Organized card- and table-based design for data clarity.  

---

## 🛠️ Tech Stack  

### Frontend  
- **Framework**: React.js (Vite)  
- **UI Components**: Material-UI / shadcn-ui  
- **Icons**: Lucide-React / Material Icons  
- **State Management**: React Hooks (`useState`, `useEffect`)  
- **API Integration**: Axios / Fetch  

### Backend  
- **Framework**: Spring Boot (Java)  
- **Database**: PostgreSQL  
- **ORM**: Hibernate / JPA  
- **Build Tool**: Maven  

### General  
- **Version Control**: Git & GitHub  

---

## 👥 Team Members  
This project was built by **Team WeMake Software**:  

1. **Member 1** – Frontend Development (React, Components, Layouts)  
2. **Member 2** – Backend Integration (API Endpoints, Database Sync)  
3. **Member 3** – Database & Schema Design (PostgreSQL, Queries)  
4. **Member 4** – UI/UX & Testing (User Experience, Bug Fixing, QA)  

---

## ⚙️ Setup & Installation  

### 🔑 Prerequisites  
- [Node.js](https://nodejs.org/) (v16+)  
- npm or Yarn  
- [Java JDK 17+](https://adoptium.net/)  
- [PostgreSQL](https://www.postgresql.org/)  
- Maven  

---

### 🚀 Frontend Setup  

1. **Clone the frontend repository**  
   ```bash
   git clone https://github.com/Project-TransformerIQ/FrontEnd.git
   cd FrontEnd
   ```

2. **Install dependencies**  
   ```bash
   npm install
   ```

3. **Run the development server**  
   ```bash
   npm run dev
   ```
   By default, the app runs at:  
   👉 `http://localhost:5173`

4. **Build for production**  
   ```bash
   npm run build
   ```

---

### 🚀 Backend Setup  

1. **Clone the backend repository**  
   ```bash
   git clone https://github.com/Project-TransformerIQ/Backend_Transformer.git
   cd Backend_Transformer
   ```

2. **Configure PostgreSQL**  
   - Create a database:  
     ```sql
     CREATE DATABASE transformers_db;
     ```
   - Update `application.properties` with your DB credentials:  
     ```properties
     spring.datasource.url=jdbc:postgresql://localhost:5432/transformers_db
     spring.datasource.username=postgres
     spring.datasource.password=yourpassword
     spring.jpa.hibernate.ddl-auto=update
     ```

3. **Run the backend server**  
   ```bash
   ./mvnw spring-boot:run
   ```
   The server will start at:  
   👉 `http://localhost:5509/transformer-thermal-inspection/`

---

## 🔗 API Endpoints  

### Transformer Management  
- `GET /transformer-management/view/{id}`  
- `POST /transformer-management/create`  
- `PUT /transformer-management/update/{id}`  
- `DELETE /transformer-management/delete/{id}`  

### Inspection Management  
- `POST /inspection-management/create`  
- `GET /inspection-management/view/{id}`  
- `DELETE /inspection-management/delete/{id}`  

### Image Management  
- `POST /image-inspection-management/upload`  
- `GET /image-inspection-management/baseline/{transformerNo}`  
- `GET /image-inspection-management/maintenance/{inspectionNo}`  
- `DELETE /image-inspection-management/delete/{imageId}`  

---

## 📸 Screenshots (Optional)  
(Add screenshots here for Transformer List, Inspection Page, Image Comparison, etc.)  

---

## 🤝 Contribution Guide  

1. Fork the repository.  
2. Create a feature branch:  
   ```bash
   git checkout -b feature-newUI
   ```  
3. Commit changes:  
   ```bash
   git commit -m "Added baseline image comparison feature"
   ```  
4. Push and create a Pull Request.  

---

## 📌 Future Improvements  
- User Authentication & Roles.  
- Export transformer/inspection reports as PDF/Excel.  
- AI-based thermal anomaly detection.  
- Mobile-friendly PWA support.  
- Dockerized deployment.  

---

## 📄 License  
This project is developed for **academic and research purposes**.  
All rights reserved by the authors.  

---

<p align="center">
⚡ Built with ❤️ by <b>Team WeMake Software</b>
</p>
