FROM mcr.microsoft.com/dotnet/nightly/sdk:10.0.100-preview.5 AS with-node
RUN apt-get update
RUN apt-get install curl
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash
RUN apt-get -y install nodejs
RUN npm install -g @angular/cli

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
