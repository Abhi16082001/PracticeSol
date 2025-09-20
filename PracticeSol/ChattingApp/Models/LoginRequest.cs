using System.ComponentModel.DataAnnotations;

namespace ChattingApp.Models
{
    public class LoginRequest
    {
        [Key]
        public int UserId { get; set; }
        public string Password { get; set; }
    }
}
