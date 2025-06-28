# Poolleaderboard project

This project was originally generated with the default asp.net core and Angular template, with containerised set to true. Visual Studio is recommended for fullstack developement.

## Developement setup

While developing, the backend runs in a docker container. To use this, you will need Docker Desktop (installable from the internet). When you open Visual Studio, Docker Desktop will automatically open and start the container. However, the container will not have a usable backend until you click the "Start" button in Visual Studio. This starts the front and back end. The frontend starts before the backend, so you will need to refresh the frontend on first startup (it will say this).

The frontend connects to the backend via a proxy while developing. This allows the use of the Angular developer server, while the proxy tricks the browser into allowing CORS requests to the backend by giving the appearance the frontend and backend are on the same port. A production deployment will not need this proxy, as it will server both the front and back end.

### Adding a new backend endpoint.

A new backend endpoint needs to be added to prox.conf.js to be useable by the frontend while developing. This may require you to stop and start the debugging process.

### Troubleshooting

Within Docker Desktop, it will say which ports are mapped from the container to your local machine, in a format like: 32769:8081. The means your machines 32769 port is mapped to the containers 8081 port, which servers the HTTPS backend. Your local machine port needs to be referenced in the proxy.conf.js file, which it should be by default, but worth checking if there are issues. Making changes to the proxy file will require you to stop debugging and start again.