# Firebase Setup Instructions

## 1. Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"**
3. Name it `pupquest` (or similar)
4. Disable Google Analytics (optional — not needed for v1)
5. Click **"Create project"**

---

## 2. Enable Google Authentication

1. In your project, go to **Build → Authentication**
2. Click **"Get started"**
3. Under **Sign-in method**, click **Google**
4. Toggle **Enable** on
5. Set a **Project support email** (your email is fine)
6. Click **Save**

---

## 3. Create a Firestore Database

1. Go to **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"** (you'll add security rules next)
4. Pick a region close to your users (e.g. `europe-west2` for UK)
5. Click **"Enable"**

---

## 4. Set Firestore Security Rules

In **Firestore → Rules**, paste the following and click **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Dog profiles — owners only
    match /dogs/{dogId} {
      allow read: if request.auth != null && request.auth.uid in resource.data.owners;
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid in resource.data.owners;
      allow delete: if request.auth != null && request.auth.uid in resource.data.owners;

      // Walks, training, behaviours, milestones — dog owners only
      match /{subcollection}/{docId} {
        allow read, write: if request.auth != null
          && request.auth.uid in get(/databases/$(database)/documents/dogs/$(dogId)).data.owners;
      }
    }
  }
}
```

---

## 5. Enable Firebase Storage (for dog photos — optional for v1)

1. Go to **Build → Storage**
2. Click **"Get started"**
3. Start in **production mode**
4. Choose the same region as Firestore

Add these storage rules:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /dogs/{dogId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.size < 5 * 1024 * 1024;
    }
  }
}
```

---

## 6. Register a Web App & Get Config

1. In your Firebase project, click the gear icon (⚙️) → **Project settings**
2. Scroll to **"Your apps"** → click the **web icon** (`</>`)
3. Give it a nickname: `PupQuest Web`
4. **Don't** enable Firebase Hosting (we're using Next.js directly)
5. Click **"Register app"**
6. Copy the config object shown:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

## 7. Create Your `.env.local` File

Copy `.env.local.example` to `.env.local`:

```
cp .env.local.example .env.local
```

Then fill in the values from the config above:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## 8. Add Authorised Domain for Auth

1. In **Authentication → Settings → Authorised domains**
2. Add `localhost` if not already there (should be by default)
3. When you deploy, add your production domain here too

---

## 9. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Firestore Indexes

Firestore will prompt you to create composite indexes the first time you query subcollections. You'll see a link in the browser console — just click it to auto-create the required indexes. The main ones needed are:

- `dogs/{dogId}/walks` — orderBy `timestamp` desc
- `dogs/{dogId}/training` — orderBy `timestamp` desc  
- `dogs/{dogId}/behaviours` — orderBy `timestamp` desc
- `dogs/{dogId}/milestones` — orderBy `chain` asc

---

## Deployment — GitHub Pages via GitHub Actions

The repo includes `.github/workflows/deploy.yml` which builds and deploys automatically on every push to `main`.

### One-time setup

**1. Enable GitHub Pages**

1. Push the repo to GitHub
2. Go to **Settings → Pages**
3. Under **Source**, select **"GitHub Actions"**
4. Save

**2. Add Firebase secrets**

Go to **Settings → Secrets and variables → Actions → New repository secret** and add each of these:

| Secret name | Value |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | your `apiKey` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | your `authDomain` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | your `projectId` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | your `storageBucket` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | your `messagingSenderId` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | your `appId` |

**3. Add your Pages URL to Firebase Auth**

Your site will be live at:
```
https://<your-github-username>.github.io/<repo-name>/
```

Go to **Firebase → Authentication → Settings → Authorised domains** and add `<your-github-username>.github.io`.

**4. Push to main**

The Actions workflow runs automatically. Watch it under **Actions** tab — first deploy takes ~2 minutes.

---

### Custom domain (optional)

If you use a custom domain (e.g. `pupquest.app`):

1. Add the domain in **Settings → Pages → Custom domain**
2. Set `NEXT_PUBLIC_BASE_PATH` to `""` as a repository variable (**Settings → Secrets and variables → Actions → Variables**) — this overrides the default repo-name basePath
3. Add the custom domain to Firebase Auth's authorised domains

