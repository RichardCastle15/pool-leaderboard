using PoolLeaderboard.Server.Data;
using PoolLeaderboard.Server.Hubs;
using PoolLeaderboard.Server.Services;
using PoolLeaderboardEngine.Killer;
using PoolLeaderboardEngine.Leaderboard;
using PoolLeaderboardEngine.Match;
using PoolLeaderboardEngine.MatchHistory;
using PoolLeaderboardEngine.Player;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSignalR();

builder.Services.AddScoped<IDbConnectionFactory, PostgresConnectionFactory>();
builder.Services.AddScoped<ILeaderboardRepository, LeaderboardRepository>();
builder.Services.AddScoped<IMatchRepository, MatchRepository>();
builder.Services.AddScoped<IKillerGameRepository, KillerGameRepository>();
builder.Services.AddScoped<IKillerGameInProgressRepository, KillerGameInProgressRepository>();
builder.Services.AddScoped<IMatchHistoryRepository, MatchHistoryRepository>();
builder.Services.AddScoped<IHeadToHeadRepository, HeadToHeadRepository>();
builder.Services.AddSingleton<KillerGameService>();

var app = builder.Build();

// Restoring an in-progress Killer game is best-effort: a DB that isn't up yet, or a row we
// can't make sense of, must not stop the app booting - that would defeat the point of
// persisting the game to survive restarts in the first place.
using (var scope = app.Services.CreateScope())
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    try
    {
        var repo = scope.ServiceProvider.GetRequiredService<IKillerGameInProgressRepository>();
        app.Services.GetRequiredService<KillerGameService>().TryRestore(repo);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Could not restore the in-progress Killer game; starting with no game in progress.");
    }
}

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();
app.MapHub<ExampleHub>("/exampleHub");
app.MapHub<LeaderboardHub>("/leaderboardHub");
app.MapHub<KillerHub>("/killerHub");

app.MapFallbackToFile("/index.html");

app.Run();
