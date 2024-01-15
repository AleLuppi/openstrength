# Backend

Backend part of the project.

## How to use

Run the following commands _from inside `backend` folder_.

### Project setup

Install all the dependencies.

```
npm install
```

### Deploy Firebase-related files

> **Note:** login to Firebase is required via `firebase login`

Deploy one or more firebase services.

```
npm run firebase:deploy -- SERVICE1[,SERVICE2[...]]
```

Firebase services include: firestore, functions, storage. To correctly deploy them, they should be configured in `firebase.json` file. See documentation for more details: [https://firebase.google.com/docs/cli#partial_deploys](https://firebase.google.com/docs/cli#partial_deploys).
