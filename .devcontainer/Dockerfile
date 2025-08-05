FROM mcr.microsoft.com/dotnet/nightly/sdk:10.0.100-preview.5 AS with-node
RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash
RUN apt-get -y install nodejs
RUN npm install -g @angular/cli
RUN dotnet tool install -g microsoft.sqlpackage
ENV PATH="$PATH:/root/.dotnet/tools"

# Install Microsoft SQL Server tools (sqlcmd and bcp)
RUN apt-get update && \
    ACCEPT_EULA=Y apt-get install -y curl gnupg unixodbc-dev && \
    curl https://packages.microsoft.com/keys/microsoft.asc -o microsoft.asc && \
    gpg --dearmor < microsoft.asc > /etc/apt/trusted.gpg.d/microsoft.gpg && \
    curl https://packages.microsoft.com/config/debian/11/prod.list -o /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update && \
    ACCEPT_EULA=Y apt-get install -y msodbcsql18 mssql-tools18 && \
    echo 'export PATH=$PATH:/opt/mssql-tools18/bin' >> /etc/bash.bashrc && \
    rm -f microsoft.asc && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 🧩 Required dependencies for Puppeteer's Chromium
RUN apt-get update && apt-get install -y \
    libnss3 \
    libxss1 \
    libasound2t64 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set env to CI as docker container has no UI so needs same set up.
ENV CI=true
WORKDIR /workspaces/pool-leaderboard
