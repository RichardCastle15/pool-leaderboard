using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using PoolLeaderboard.Server.Hubs;
using PoolLeaderboardEngine.Leaderboard;

namespace PoolLeaderboard.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeaderboardController : ControllerBase
    {
        private static readonly Regex FullNameRegex = new(@"^[^\s]+\s+\S.*$", RegexOptions.Compiled);
        private static readonly Regex WhitespaceRunRegex = new(@"\s+", RegexOptions.Compiled);

        private readonly ILeaderboardRepository leaderboardRepository;
        private readonly IHubContext<LeaderboardHub> hubContext;

        public LeaderboardController(ILeaderboardRepository leaderboardRepository, IHubContext<LeaderboardHub> hubContext)
        {
            this.leaderboardRepository = leaderboardRepository;
            this.hubContext = hubContext;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] AddParticipantBody request)
        {
            var name = NormaliseName(request.Name);

            if (!FullNameRegex.IsMatch(name))
                return BadRequest("Name must include at least a first name and an initial (e.g. \"Richard C\").");

            if (leaderboardRepository.ExistsByName(name))
                return Conflict($"A participant named '{name}' already exists.");

            leaderboardRepository.Add(name);

            var entries = leaderboardRepository.GetAll();
            await hubContext.Clients.All.SendAsync("ReceiveLeaderboard", entries);

            return Ok();
        }

        /// <summary>
        /// Trims the name and collapses any run of internal whitespace to a single space, so that
        /// "Alice  B" and "Alice\tB" are treated as the same participant as "Alice B".
        /// </summary>
        private static string NormaliseName(string name) =>
            WhitespaceRunRegex.Replace(name.Trim(), " ");
    }

    public class AddParticipantBody
    {
        public required string Name { get; set; }
    }
}
