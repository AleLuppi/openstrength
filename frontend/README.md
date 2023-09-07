# Frontend

Frontend part of the project.


## How to use

Run the following commands *from inside `frontend` folder*.

### Project setup
Install all the dependencies.
```
npm install
```

### Compile and hot-reload for development
Start a local server with hot-reload enabled.
```
npm run serve
```

### Compile and minify for production
Prepare a compiled folder, ready for production release.
```
npm run build
```

### Lint and fix files
Run linter to clean code. Run it before commit (or enable auto-lint on update).
```
npm run lint
```

### Deploy on Firebase
Test web app dedicated channel. Deploy it and get the temporary link (`CHANNEL_ID` can be any valid name).
```
firebase hosting:channel:deploy CHANNEL_ID
```
Deploy the web app Firebase's hosting domains (_login is required via_ `firebase login`).
```
firebase deploy --only hosting
```
Optionally, it is possible to deploy other services too, separated by commas. See here for more details: [https://firebase.google.com/docs/cli#partial_deploys](https://firebase.google.com/docs/cli#partial_deploys).

## Customize configuration
To update Vue CLI configuration, see [Configuration Reference](https://cli.vuejs.org/config/).
