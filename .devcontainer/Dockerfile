FROM mcr.microsoft.com/dotnet/sdk:10.0 AS with-node
RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash
RUN apt-get -y install nodejs
RUN npm install -g @angular/cli

# Install PostgreSQL client tools
RUN apt-get update && apt-get install -y postgresql-client && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Flyway
RUN curl -fsSL "https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/9.22.3/flyway-commandline-9.22.3-linux-x64.tar.gz" \
    -o /tmp/flyway.tar.gz && \
    tar -xzf /tmp/flyway.tar.gz -C /opt && \
    ln -sf /opt/flyway-9.22.3/flyway /usr/local/bin/flyway && \
    rm /tmp/flyway.tar.gz

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

# Install Docker CLI for Docker-outside-of-Docker (DooD)
RUN apt-get update && apt-get install -y docker.io && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set env to CI as docker container has no UI so needs same set up.
ENV CI=true
ENV ConnectionStrings__DefaultConnection='Host=db;Port=5432;Database=leaderboard;Username=postgres;Password=YourStrong!Passw0rd;'
WORKDIR /workspaces/pool-leaderboard
