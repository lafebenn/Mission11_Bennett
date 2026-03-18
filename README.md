# Mission 11 - Online Bookstore

An ASP.NET Core API + React web app for an online bookstore, displaying books with pagination and sorting.

## Requirements Met

- **Database**: SQLite database (`Bookstore.sqlite`) with books (Title, Author, Publisher, ISBN, Classification, Category, Pages, Price)
- **Models**: Match database schema
- **Book List**: Displays all books from the database
- **Dynamic Pagination**: Page links (1, 2, 3...) built dynamically based on dataset size; 5 books per page default; user can change results per page
- **Sort by Title**: Toggle A-Z / Z-A sorting
- **Bootstrap**: Full Bootstrap styling

## How to Run

### 1. Backend (API)

```bash
cd Mission11_Bennett
dotnet restore
dotnet run
```

The API runs at **http://localhost:5039**. Ensure `Bookstore.sqlite` is in the `Mission11_Bennett` folder (it is included).

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

The React app runs at **http://localhost:5173** (or the port Vite assigns).

### 3. Database

The database is at `Mission11_Bennett/Bookstore.sqlite`. If you need to re-download it:
https://byu.box.com/s/psbqlvg2yodpuby833w2t5dwinm567b8
