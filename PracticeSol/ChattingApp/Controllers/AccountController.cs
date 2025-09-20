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
            bool status;
            User? user;
            (status, user) = repo.checkUser(request);
            if (status)
            {
                var token = JWTManager.GenerateToken(request.UserId.ToString());
                return Ok(new { Token = token,User=user });
            }

            return Unauthorized("Invalid credentials");
        }



        [HttpPost("register")]
        public IActionResult Register([FromBody] User user)
        {
            // For demo: accept any user/pass (replace with DB check)
            bool status = repo.Register(user);
            
                return Ok(new { status = status});
            
        }

    }
}
