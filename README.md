# Poolleaderboard project

This project was originally generated with the default asp.net core and Angular template, with containerised set to true. Visual Studio is recommended for fullstack developement.

## Developement setup

The frontend connects to the backend via a proxy while developing. This allows the use of the Angular developer server, while the proxy tricks the browser into allowing CORS requests to the backend by giving the appearance the frontend and backend are on the same port. A production deployment will not need this proxy, as the server will serve both the front and back end.

### Visual Studio Code dev container (recommended)

Using Visual Studio Code with the `Dev Containers` extension will set up the development environment for you in a docker container. You will need docker desktop for this and to have it open and started. Alternatively, you can launch a codespace from Github into VS Code. From the `Code` tab in Github, open the `Code` button dropdown, then either click `+` to make a new codespace on main or click the elipses and click `New with options` to configure things like the branch. You do not need docker locally for Github codespaces.

To start a debugging session, open the `Run and Debug` tab in VS Code and run either the `Fullstack Debug` profile for both layers of the stack, or `Debug Angular Frontend` for just Angular debugging (no backend will be served). Your app will start at: `http://localhost:60125/`.

The frontend is debuggable through the browser dev tools. If you make a code change, the browser will auto reload.

To run jasmine tests, you will most likely have to refresh the test explorer, as it usually errors due to the jasmine adapter starting before the node modules are installed.

The backend is debuggable. If you make a change, you need to restart the debugging process to see it operating.

#### Limitations

When using the full stack debug launch, the frontend does not correctly restart when restarting in VS Code. This breaks the debugging to VS Code. To re-enable it, you'll need to fully stop the VS Code debug and wait for port 60125 to show no bound process (ports tab in VS Code). Refreshing the browser when VS Code debugging has been killed can help this happen.

### Visual Studio

While developing, the backend runs in a docker container. To use this, you will need Docker Desktop (installable from the internet). When you open Visual Studio, Docker Desktop will automatically open and start the container. However, the container will not have a usable backend until you click the "Start" button in Visual Studio. This starts the front and back end. The frontend starts before the backend, so you will need to refresh the frontend on first startup (it will say this).

#### .net version

This project uses .net 10, which is currently in preview. You must download the .net 10 preview sdk. You must also enable this setting in Visual Studio: Tools > Options > Preview Features > Use previews of the .NET SDK

#### Database

I recommend using SQL Server Management Studio and SQL Server Express. Both downloadable from the internet.

The database files are stored in a SQL project. This builds to a .dacpac file. You must create your database from this file.

To create your database from this file: 

- Build the SQL project. That creates a .dacpac file in `PoolLeaderboard.Database\bin\Debug`
- Open SSMS and connect to your SQL Server instance
- Right-click on "Databases" in Object Explorer
- Select "Deploy Data-tier Application..."
- Follow the wizard, importing the .dacpac file from above. I recommend naming the database PoolLeaderboard rather than the default PoolLeaderboard.Database.

To update your database from this file (you must have created it from a previous version of this file):

- Right-click on the database in SSMS
- Click "Tasks" > "Upgrade Data-Tier Application"
- Follow the wizard. Point it to the .dacpac file that has been built from the SQL project.

##### Connecting to the database when using a containerised backend.

Normally when developing against a database, you'd use windows authentication to connect. However, that's not possible with the backend running in a container. So you need to use a connection string with a username and password by following these instructions:

Enable Mixed Mode in SQL Server:
- SSMS > right-click server > Properties > Security
- Select "SQL Server and Windows Authentication mode"
- Restart SQL Server service

Create a SQL login:

```SQL
CREATE LOGIN myappuser WITH PASSWORD = 'YourStrongPassword123!';
USE PoolLeaderboard;
CREATE USER myappuser FOR LOGIN myappuser;
ALTER ROLE db_owner ADD MEMBER myappuser;  -- Or more restrictive permissions
```

Configure SQL Server Network Access:

- Open SQL Server Configuration Manager
> [!TIP]
> To open SQL Server Configuration Manager, type SQLServerManager16.msc (for SQL Server 2022) in the Start Page. For other versions, replace 16 with the appropriate number.
- Navigate to SQL Server Network Configuration > Protocols for SQLEXPRESS
- Ensure TCP/IP is Enabled (this is often disabled by default)
- Right-click TCP/IP > Properties > IP Addresses tab
- Scroll to IPAll section and ensure TCP Port is set to 1433 (or note the port number)
- Restart the SQL Server Express service after making changes

You can then use a connection string like: `Server=host.docker.internal,1433;Database=PoolLeaderboard;User Id=myappuser;Password=YourStrongPassword123!;TrustServerCertificate=True;`

### Component showcase

In the front end, the aim is to follow the presenter-container pattern. This splits components into 2 types: presenters, which have no business logic and communicate exclusively through inputs/outputs; and containers, which coordinate presenters with business logic. The presenters will be displayed in a component showcase so you can see how they look in various states. This component showcase is added to the navigation bar when building the front end with a development build.

### Seeing changes

Clicking "Start" in Visual Studio should launch both front and back end. There are 2 main project: `poolleaderboard.client` (frontend) and `PoolLeaderboard.Server` (backend). Changes in the frontend while debugging should be applied automatically (it will also refresh the browser). Changes in the backend while debugging require you to press the "hot reload" button in Visual Studio to take effect.

### Adding a new backend endpoint.

A new backend endpoint needs to be added to `prox.conf.js` to be useable by the frontend while developing. By default, we forward all /api/ requests via the proxy. Changes to the proxy file may require you to stop and start the debugging process.

### Component library

This project uses the Nebular component library for the frontend: https://akveo.github.io/nebular/docs/components/components-overview.

### Icons

The icon pack used is: https://akveo.github.io/eva-icons

### Troubleshooting

Within Docker Desktop, it will say which ports are mapped from the container to your local machine, in a format like: 32769:8081. The means your machines 32769 port is mapped to the containers 8081 port, which servers the HTTPS backend. Your local machine port needs to be referenced in the proxy.conf.js file, which it should be by default, but worth checking if there are issues. Making changes to the proxy file will require you to stop debugging and start again. Usually, restarting your machine gets docker back to binding to port 32769 for HTTPS.

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
