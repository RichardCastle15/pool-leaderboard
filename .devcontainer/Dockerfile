FROM mcr.microsoft.com/dotnet/nightly/sdk:10.0.100-preview.5 AS with-node
RUN apt-get update
RUN apt-get install curl
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash
RUN apt-get -y install nodejs
RUN npm install -g @angular/cli
WORKDIR /workspace