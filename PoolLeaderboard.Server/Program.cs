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

builder.Services.AddScoped<IDbConnectionFactory, SqlServerConnectionFactory>();
builder.Services.AddScoped<ILeaderboardRepository, LeaderboardRepository>();
builder.Services.AddScoped<IMatchRepository, MatchRepository>();
builder.Services.AddScoped<IKillerGameRepository, KillerGameRepository>();
builder.Services.AddScoped<IMatchHistoryRepository, MatchHistoryRepository>();
builder.Services.AddScoped<IHeadToHeadRepository, HeadToHeadRepository>();
builder.Services.AddSingleton<KillerGameService>();

var app = builder.Build();

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
