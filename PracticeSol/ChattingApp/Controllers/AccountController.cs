using ChattingApp.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ChattingApp.Models;
namespace ChattingApp.Controllers
{
  
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            // For demo: accept any user/pass (replace with DB check)
            if ((request.Username == "Red" && request.Password == "123") || (request.Username=="Blue" && request.Password == "123"))
            {
                var token = JWTManager.GenerateToken(request.Username);
                return Ok(new { Token = token });
            }

            return Unauthorized("Invalid credentials");
        }

    }
}
