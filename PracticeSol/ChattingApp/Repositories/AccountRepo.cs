using ChattingApp.Models;
namespace ChattingApp.Repositories
{
    public class AccountRepo
    {

        private readonly ChatDbContext db;
        public AccountRepo(ChatDbContext db) => this.db = db;  

        public bool checkUser(LoginRequest request)
        {
            int res = db.LoginRequests.Where(x => x.Username == request.Username && x.Password==request.Password).Count();
            if (res < 1) return false;
            else return true;

        }
                
    }
}
