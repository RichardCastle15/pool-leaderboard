# Poolleaderboard project

This project was originally generated with the default asp.net core and Angular template, with containerised set to true. Visual Studio is recommended for fullstack developement.

## Developement setup

While developing, the backend runs in a docker container. To use this, you will need Docker Desktop (installable from the internet). When you open Visual Studio, Docker Desktop will automatically open and start the container. However, the container will not have a usable backend until you click the "Start" button in Visual Studio. This starts the front and back end. The frontend starts before the backend, so you will need to refresh the frontend on first startup (it will say this).

The frontend connects to the backend via a proxy while developing. This allows the use of the Angular developer server, while the proxy tricks the browser into allowing CORS requests to the backend by giving the appearance the frontend and backend are on the same port. A production deployment will not need this proxy, as it will server both the front and back end.

### .net version

This project uses .net 10, which is currently in preview. You must download the .net 10 preview sdk. You must also enable this setting in Visual Studio: Tools > Options > Preview Features > Use previews of the .NET SDK

### Database

I recommend using SQL Server Management Studio and SQL Server Express. Both downloadable from the internet.

The database files are stored in a SQL project. This builds to a .dacpac file. You must create your database from this file (not manually through the SSMS UI).

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

#### Connecting to the database when using a containerised backend.

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

- SQL Server Configuration Manager:
  - Enable TCP/IP for SQLEXPRESS
  - Set TCP port to 1433 (In configuration manager, right-click on TCP/IP, "properties", "IP Address", set "IPAll" to 1433)

You can then use a connection string like: `Server=host.docker.internal,1433;Database=PoolLeaderboard;User Id=myappuser;Password=YourStrongPassword123!;TrustServerCertificate=True;`

### Seeing changes

There are 2 main project: `poolleaderboard.client` (frontend) and `PoolLeaderboard.Server` (backend). Changes in the frontend should be applied automatically (it will also refresh the browser). Changes in the backend (while debugging) require you to press the "hot reload" button in Visual Studio to take effect.

### Adding a new backend endpoint.

A new backend endpoint needs to be added to `prox.conf.js` to be useable by the frontend while developing. By default, we forward all /api/ requests via the proxy. Changes to the proxy file may require you to stop and start the debugging process.

### Component library

This project uses the Nebular component library for the frontend: https://akveo.github.io/nebular/docs/components/components-overview.

### Icons

The icon pack used is: https://akveo.github.io/eva-icons

### Troubleshooting

Within Docker Desktop, it will say which ports are mapped from the container to your local machine, in a format like: 32769:8081. The means your machines 32769 port is mapped to the containers 8081 port, which servers the HTTPS backend. Your local machine port needs to be referenced in the proxy.conf.js file, which it should be by default, but worth checking if there are issues. Making changes to the proxy file will require you to stop debugging and start again. Usually, restarting your machine gets docker back to binding to port 32769 for HTTPS.
