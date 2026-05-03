# Eventful Planner

A modern, full-stack Event Management System and Venue Booking platform built with Python, Flask, and Tailwind CSS. The platform features a premium SaaS aesthetic, complete with a glassmorphism animated background and interactive dashboards for both Users and Administrators.

## Features
- **User Authentication**: Secure signup and login flow using Flask-Login and Flask-Bcrypt.
- **Role-Based Dashboards**: Unique portals for Standard Users and Administrators.
- **Premium UI**: Custom animated background, "Bento-Box" style grid layouts, and horizontal carousels.
- **Venue Management**: Admins can easily add, view, and delete venues.
- **Booking System**: Users can browse venues, save favorites to a Wishlist, and create/cancel bookings.
- **Event Management**: Users can create events, manage budgets, and track RSVPs.

## Prerequisites
- **Python 3.8+** installed on your machine.
- **pip** (Python package installer).

## Step-by-Step Setup Guide

Follow these instructions to get the project running on your local machine:

### 1. Open your Terminal
Navigate to the project directory in your terminal or command prompt:
```bash
cd path/to/eventful-planner-main
```

### 2. Create a Virtual Environment (Recommended)
Creating a virtual environment ensures that the project's dependencies don't conflict with other Python projects on your computer.
**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```
**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
Install all required Python packages (Flask, SQLAlchemy, etc.) from the `requirements.txt` file:
```bash
pip install -r requirements.txt
```

### 4. Initialize the Database
The project uses SQLite for development. To create the database tables and populate the system with some initial data (sample venues, default admin account), run the initialization script:
```bash
python init_db.py
```
*Note: This creates an `instance/eventful.db` file.*

### 5. Start the Server
Run the Flask development server:
```bash
python app.py
```

### 6. Open the Application
Open your web browser and navigate to:
**http://127.0.0.1:5000**

## Default Accounts
If the database was seeded via `init_db.py`, you can test the different portals using the following credentials:

**Admin Account:**
- Email: `admin@eventful.com`
- Password: `password`

**Test User Account:**
- Email: `user@eventful.com`
- Password: `password`
