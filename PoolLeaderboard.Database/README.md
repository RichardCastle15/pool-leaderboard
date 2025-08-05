# New SDK-style SQL project with Microsoft.Build.Sql

## Build

To build the project, run the following command:

```bash
dotnet build
```

🎉 Congrats! You have successfully built the project and now have a `dacpac` to deploy anywhere.

## Publish

To publish the project, the SqlPackage CLI or the SQL Database Projects extension for Azure Data Studio/VS Code is required. The following command will publish the project to a local SQL Server instance:

```bash
sqlpackage /Action:Publish /SourceFile:"bin/Debug/PoolLeaderboard.Database.dacpac" \
    /TargetConnectionString:'Server=db,1433;Database=leaderboard;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=True;'
```

Learn more about authentication and other options for SqlPackage here: https://aka.ms/sqlpackage-ref

There is a `deploy.sh` file which can be run to deploy the database with the latest schema.

## Query the dev db

`sqlcmd` is preinstalled in the container. You can start running queries with:

```bash
sqlcmd -S db -d leaderboard -U sa -P 'YourStrong!Passw0rd' -C 
```