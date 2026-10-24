# Admin access setup

1. Register or sign in to the account that should administer reports.
2. In Firestore, open the `users` collection and find the document whose ID is that account's Firebase Auth UID.
3. Change its `role` field from `citizen` to `admin` using the Firebase Console or a trusted server/Admin SDK. Client code cannot promote itself.
4. Deploy the included rules with `firebase deploy --only firestore:rules`.
5. Sign out and back in, then open `/admin-dashboard`.

The rules use the role stored at `users/{uid}`. Only an existing admin can modify or delete user profiles through the app. Firebase Console and Admin SDK writes are trusted administrative operations and bypass Firestore client rules.
