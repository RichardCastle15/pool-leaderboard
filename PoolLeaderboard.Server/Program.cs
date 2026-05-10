using PoolLeaderboard.Server.Data;
using PoolLeaderboard.Server.Hubs;
using PoolLeaderboard.Server.Services;
using PoolLeaderboardEngine.Leaderboard;
using PoolLeaderboardEngine.Match;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSignalR();

builder.Services.AddScoped<IDbConnectionFactory, SqlServerConnectionFactory>();
builder.Services.AddScoped<ILeaderboardRepository, LeaderboardRepository>();
builder.Services.AddScoped<IMatchRepository, MatchRepository>();
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
