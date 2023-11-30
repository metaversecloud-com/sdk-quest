# Getting Started

This boilerplate is meant to give you a simple starting point to build new features in Topia using our Javascript SDK.

- Clone this repository
- Run `yarn` in server
- `cd client`
- Run `yarn` in client
- `cd ..` back to server

## Add your .env environmental variables

```json
API_KEY=xxxxxxxx
API_URL=http://localhost:3001
INSTANCE_DOMAIN=api.topia.io
INTERACTIVE_KEY=xxxxxxxx
INTERACTIVE_SECRET=xxxxxxxx
```

### Where to find API_KEY, INTERACTIVE_KEY and INTERACTIVE_SECRET

[Topia Dev Account Dashboard](https://dev.topia.io/t/dashboard/integrations)
[Topia Production Account Dashboard](https://topia.io/t/dashboard/integrations)

# Deploying to Heroku

- Go to https://heroku.com and create an account if you don't already have one.
- Create a new Heroku project.
- Add your .env parameters to a heroku project.
- Add both the `https://github.com/mars/create-react-app-buildpack.git` and `heroku/nodejs` buildpacks to your project.
- From your terminal, type `git remote add heroku <your heroku git URL>`.
- From your terminal, type `git push heroku master`.
