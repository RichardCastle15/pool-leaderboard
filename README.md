# Poolleaderboard project

This project was originally generated with the default asp.net core and Angular template, with containerised set to true. Visual Studio is recommended for fullstack developement.

## Developement setup

The frontend connects to the backend via a proxy while developing. This allows the use of the Angular developer server, while the proxy tricks the browser into allowing CORS requests to the backend by giving the appearance the frontend and backend are on the same port. A production deployment will not need this proxy, as the server will serve both the front and back end.

### Visual Studio Code dev container (recommended)

There are 2 ways to make a dev environment for this project.

#### Github codespaces (easiest)

In the GitHub web UI, from the `Code` tab in Github, open the `Code` button dropdown, then either click `+` to make a new codespace on main or click the elipses and click `New with options` to configure things like the branch. This will run the docker dev containers on a linux VM on the GitHub servers. You can connect to the codespace via the GitHub UI. I recommend using the VS Code option.

#### Local cloning of repp

You will need:

- WSL2 with a plain linux distribution, like Ubuntu
- Docker desktop
- "Dev containers" VS Code extension
- "WSL" VS Code extension

Make sure WSL is installed on your Windows machine and accessible from powershell. Then, run `wsl --install -d Ubuntu` to install Ubuntu. This should launch a bash cli. To reconnect into the linux install use `wsl -d Ubuntu`.

While running a cli in Ubuntu, run these commands to set up the needed installs:

``` Bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y git build-essential curl
```

Then, make docker available in the Linux dist you're running in by following these steps in docker desktop: `Settings`, `Resources`, `WSL integration`, `Enable integration with additional distros` and make sure your distro is enabled.

Then, in the linux distro, make a code folder and clone the repo into it. You will need to login with your GitHub user name and a PAT (generated in the GitHub web UI) for your password.

``` Bash
mkdir -p ~/code && cd ~/code
git clone https://github.com/RichardCastle15/pool-leaderboard.git
```

In the `pool-leaderboard` folder the cloning makes, run `code .` from the bash shell. This should open VS Code. You should then be prompted to reopen in a dev container.

#### Working with the code

To start a debugging session, open the `Run and Debug` tab in VS Code and run either the `Debug Angular Frontend`, `Debug Backend` or `Debug Fullstack` profile. Your app will start at: `http://localhost:60125/` when local (the browser should open), or you can see the url for the port in the `ports` tab in VS Code.

The frontend is debuggable through VS Code. If you make a code change, the browser will auto reload.

The backend is debuggable through VS Code. If you make a change, you need to restart the debugging process to see it operating.

To run jasmine tests, you will most likely have to refresh the test explorer, as it usually errors due to the jasmine adapter starting before the node modules are installed.

This will set up a database container. There is a readme in the database project file.

#### Current limitations

Jasmine test explorer may error as it can start before the container has installed the needed testing dependencies. Refreshing the test explorer in VS Code usually works.

A `\package.g.props` file may show in source control. This can cause issues for git working with it. All you can do is delete it from the file system (not through git, won't work).

Git can become behind when running a local dev container. You may need to refresh git manually to see all changes (can be done through VS Code UI).

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
