#!/bin/bash

# Set working directory to the script's location
cd "$(dirname "$0")"

echo 'Building...'
dotnet build

echo 'Deploying...'
sqlpackage /Action:Publish /SourceFile:"bin/Debug/PoolLeaderboard.Database.dacpac" \
    /TargetConnectionString:"$CONNECTION_STRING"