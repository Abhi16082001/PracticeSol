using ChattingApp.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ChattingApp.Models;
using ChattingApp.Repositories;
namespace ChattingApp.Controllers
{
  
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly AccountRepo repo;
       public AccountController(AccountRepo repo) {
            this.repo = repo;
        }
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            // For demo: accept any user/pass (replace with DB check)
            if (repo.checkUser(request))
            {
                var token = JWTManager.GenerateToken(request.Username);
                return Ok(new { Token = token });
            }

            return Unauthorized("Invalid credentials");
        }

    }
}
