# Poolleaderboard project

This project was originally generated with the default asp.net core and Angular template, with containerised set to true. Visual Studio is recommended for fullstack developement.

## Developement setup

The frontend connects to the backend via a proxy while developing. This allows the use of the Angular developer server, while the proxy tricks the browser into allowing CORS requests to the backend by giving the appearance the frontend and backend are on the same port. A production deployment will not need this proxy, as the server will serve both the front and back end.

### Visual Studio Code dev container (recommended)

Using Visual Studio Code with the `Dev Containers` extension will set up the development environment for you in a docker container. You will need docker desktop for this and to have it open and started. Alternatively, you can launch a codespace from Github into VS Code. From the `Code` tab in Github, open the `Code` button dropdown, then either click `+` to make a new codespace on main or click the elipses and click `New with options` to configure things like the branch. You do not need docker locally for Github codespaces.

To start a debugging session, open the `Run and Debug` tab in VS Code and run either the `Debug Angular Frontend`, `Debug Backend` or `Debug Fullstack` profile. Your app will start at: `http://localhost:60125/` (the browser should open).

The frontend is debuggable through VS Code. If you make a code change, the browser will auto reload.

The backend is debuggable through VS Code. If you make a change, you need to restart the debugging process to see it operating.

To run jasmine tests, you will most likely have to refresh the test explorer, as it usually errors due to the jasmine adapter starting before the node modules are installed.

This will set up a database container. There is a readme in the database project file.

#### Current limitations

Jasmine test explorer may error as it can start before the container has installed the needed testing dependencies.

A `\package.g.props` file may show in source control. This can cause issues for git working with it. All you can do is delete it from the file system (not through git, won't work).

### Component showcase

In the front end, the aim is to follow the presenter-container pattern. This splits components into 2 types: presenters, which have no business logic and communicate exclusively through inputs/outputs; and containers, which coordinate presenters with business logic. The presenters will be displayed in a component showcase so you can see how they look in various states. This component showcase is added to the navigation bar when building the front end with a development build.

### Adding a new backend endpoint.

A new backend endpoint needs to be added to `prox.conf.js` to be useable by the frontend while developing. By default, we forward all /api/ requests via the proxy. Changes to the proxy file may require you to stop and start the debugging process.

### Component library

This project uses the Nebular component library for the frontend: https://akveo.github.io/nebular/docs/components/components-overview.

### Icons

The icon pack used is: https://akveo.github.io/eva-icons

## Production setup

Run this command from the root to build a docker image of the prod build: `docker build -f PoolLeaderboard.Server/Dockerfile -t poolleaderboard .`.

### Push docker image

To push a new version of the latest docker image, first you need a PAT (classic) with the right permissions from github.

Then, you can run these commands in powershell to push a new image as the latest:

```powershell
# Authenticate, if required.
$env:CR_PAT = "YOUR_PAT"
$env:CR_PAT | docker login ghcr.io -u YOUR_USER_NAME --password-stdin

# Tag the image with the latest tag
docker tag poolleaderboard ghcr.io/richardcastle15/poolleaderboard:latest

# Push the image to github
docker push ghcr.io/richardcastle15/poolleaderboard:latest
```

Or, any commit to main will create a new docker container to be deployed. 
