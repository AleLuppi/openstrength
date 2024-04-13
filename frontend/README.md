# Frontend

Frontend part of the project.

## How to use

Run the following commands _from inside `frontend` folder_.

### Project setup

Install all the dependencies.

```
npm install
```

### Compile and hot-reload for development

Start a local server with hot-reload enabled.

```
npm run serve
# or
npm run dev
```

### Compile and minify for production

Prepare a compiled folder, ready for production release.

```
npm run build
```

### Lint and fix files

Run linter to clean code. Run it before commit (or enable auto-lint on save).

```
npm run lint
```

### Deploy on Firebase

> **Note:** login to Firebase is required via `firebase login`

Test web app in a dedicated channel. Deploy it and get the temporary link (`CHANNEL_ID` can be any valid name).

```
npm run release CHANNEL_ID
```

Deploy the web app on Firebase's hosting domains.

```
npm run deploy
```

Optionally, it is possible to deploy other services too (database, storage, firestore, functions), separated by commas. See documentation for more details: [https://firebase.google.com/docs/cli#partial_deploys](https://firebase.google.com/docs/cli#partial_deploys).

## Customize configuration

To update Vue CLI configuration, see [Configuration Reference](https://cli.vuejs.org/config/).
