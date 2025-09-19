using System.ComponentModel.DataAnnotations;

namespace ChattingApp.Models
{
    public class LoginRequest
    {
        [Key]
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
