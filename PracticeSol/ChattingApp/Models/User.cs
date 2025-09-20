using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChattingApp.Models
{
    public class User
    {
        [Key]
        public int Uid { get; set; } = 0;
        public string Uname { get; set; } = "";
        public string Email { get; set; }="";
        public long Phone { get; set; }
        public string Fname { get; set; }="";
        public string Lname { get; set; }="";

        [NotMapped]
        public string Password { get; set; }="";
        public DateOnly DOB { get; set; }
    }
}
