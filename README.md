# Sanku GR Command Centre

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/Jwasilwa-Thor/Sanku-GR-Dashboard)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/Jwasilwa-Thor/Sanku-GR-Dashboard)
[![License](https://img.shields.io/badge/license-MIT-orange)](LICENSE)

## 1. Project Overview
The **Sanku GR Command Centre** is a specialized Government Relations (GR) Management platform designed for Sanku Kenya. It serves as a centralized hub to track, manage, and optimize institutional relationships, policy advocacy, and financial oversight.

### Key Value Proposition
- **Stakeholder Intelligence**: Visualize influence and support levels via dynamic Power Mapping.
- **Advocacy Tracking**: Manage the policy lifecycle from monitoring to decision-making.
- **Financial Integration**: Seamlessly wire projects and travel activities to fiscal budget line items.
- **Strategic Visualization**: Real-time analytics, Kanban pipelines, and Gantt timelines for project management.

---

## 2. Prerequisites
Before setting up the project, ensure you have the following installed:
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Git**: For version control
- **Azure CLI**: (Optional) For deployment and cloud resource management

---

## 3. Installation & Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/Jwasilwa-Thor/Sanku-GR-Dashboard.git
cd Sanku-GR-Dashboard
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy the example environment file and fill in your actual credentials:
```bash
cp .env.example .env
```
*Note: Ensure your `.env` contains the necessary API keys and database strings.*

### Step 4: Database Setup (Optional/Initial)
If you need to seed the database with mock data:
```bash
npm run setup-db
npm run seed
```

### Step 5: Start Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 4. Usage Guide

### Analytics Dashboard
Navigate to the **Dashboard** to view the consolidated Command Centre. Switch between tabs to see:
- **Overview**: Engagement distribution and matter outcomes.
- **Power Map**: Stakeholder influence vs. support scatter chart.
- **Pipeline**: Kanban board for policy advocacy stages.
- **Timelines**: Project Gantt charts with budget utilization.

### Linking Budget to Projects
1. Go to **Budget Oversight**.
2. Click the **Link** icon on a budget line item.
3. Select the target **Project** and specific **Activity** (if applicable).
4. Enter the allocation amount and save.

---

## 5. Contribution Guidelines

We welcome contributions! Please follow these steps:

### Git Workflow
1. **Fork** the repository.
2. Create a **Feature Branch** (`git checkout -b feature/AmazingFeature`).
3. **Commit** your changes (`git commit -m 'feat: Add some AmazingFeature'`).
4. **Push** to the branch (`git push origin feature/AmazingFeature`).
5. Open a **Pull Request**.

### Standards
- Follow the existing **TypeScript** and **Tailwind CSS** patterns.
- Ensure all new features are documented in the code.
- Run `npm run lint` before committing to ensure code quality.

---

## 6. License Information
This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.

---

## 7. Troubleshooting

### Common Issues
- **403 Forbidden on Push**: Ensure your Personal Access Token (PAT) has `repo` and `workflow` scopes enabled.
- **Build Errors**: Clear the Vite cache by deleting the `node_modules/.vite` folder and running `npm install` again.
- **Missing Icons**: Ensure `lucide-react` is correctly installed and imported.

### Support
For further assistance, please open an issue in the [GitHub Issue Tracker](https://github.com/Jwasilwa-Thor/Sanku-GR-Dashboard/issues) or contact the development team at [admin@sanku.com].
