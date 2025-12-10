# Munya Digital Library App

A **personal digital library app** built with **React 18** and **Firebase**. This app allows you to manage your book collection: add, search, filter, sort, track status history, and update books in real-time. Perfect for book lovers or anyone learning modern full-stack web development.

---

## Features

- Add, edit, and delete books  
- Filter by genre and status  
- Search books by title or author  
- Sort by title, author, or publication year  
- Pagination support  
- Real-time status updates with history  
- User authentication (Email/Password)  
- Responsive design using Tailwind CSS  
- Toast notifications for user feedback  

---

## Tech Stack

- **React 18** – Frontend UI  
- **Firebase v10** – Firestore database and Authentication  
- **Firebase Admin SDK** – For seeding the database  
- **Tailwind CSS** – Styling and responsiveness  
- **Jest & React Testing Library** – Unit testing  

---

## Project Structure

munya-digital-library-app/
│
├─ src/
│  ├─ components/       # React components (BookList, AddBookForm, AuthForm)
│  ├─ services/         # Firebase service files (auth.js, firebase.js)
│  ├─ index.css
│  └─ App.js
│
├─ seed/                # Database seeding scripts
├─ package.json
└─ README.md

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/username/munya-digital-library-app.git
cd munya-digital-library-app
````

1. Install dependencies:

```bash
npm install
```

---

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Firestore Database** (in test mode for development).
3. Enable **Authentication → Email/Password**:

   - Go to **Authentication → Sign-in method**
   - Click **Email/Password** → toggle **Enable** → click **Save**
4. Create a **Web App** in Firebase to get your config keys.
5. Download **Service Account JSON** for Admin SDK (used in `seed/` scripts).

---

### Firestore Security Rules (Development)

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own document
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    // Books collection: all authenticated users can read/write
    match /books/{bookId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

> Adjust rules for production to enforce stricter access control.

---

## Seeding Database

Populate Firestore with sample books:

```bash
# Clean old data
npm run seed:clean

# Seed 25 books
npm run seed
```

---

## Running the App

Start the development server:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Authentication Flow

- Users can **Sign Up** with email, password, and username.
- Users can **Log In** using their username and password.
- Authentication state is handled in `App.js` with `onAuthChange()` from `auth.js`.
- Toast notifications display success/error messages.

---

## Testing

Run unit tests:

```bash
npm test
```

- Tests use **Jest** and **React Testing Library**, with Firebase mocked for isolation.

---

## Deployment

You can deploy using:

- **Firebase Hosting:**

```bash
npm run build
firebase deploy
```

- **Vercel / Netlify:** Upload the `build` folder and configure environment variables.

---

## License

MIT License – see `LICENSE` for details.

---

## Author

**Munyaradzi Chiondegwa**
[GitHub Profile](https://github.com/munyaradzichiondegwa)
[Portfolio / Website](https://munyaradzichiondegwa.netlify.app/)

---

**Enjoy managing your books and learning React + Firebase!**
