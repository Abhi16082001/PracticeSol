using ChattingApp.Models;
namespace ChattingApp.Repositories
{
    public class AccountRepo
    {

        private readonly ChatDbContext db;
        public AccountRepo(ChatDbContext db) => this.db = db;  

        public (bool,User?) checkUser(LoginRequest request)
        {
            int res = db.LoginRequests.Where(x => x.UserId == request.UserId && x.Password==request.Password).Count();
            if (res < 1) return (false,null);
            else {

                User? user = db.Users.FirstOrDefault(x=>x.Uid==request.UserId);
                return (true,user); }

        }

        public User? getUser(int userid)
        {
            var res = db.Users.Where(x => x.Uid == userid).Count();
            if (res < 1) return  null;
            else
            {
                User? user = db.Users.FirstOrDefault(x => x.Uid == userid);
                return user;
            }

        }

        public bool Register(User user)
        {
            try
            {
                LoginRequest lgn = new LoginRequest()
                {                   
                    Password = user.Password
                };
                db.LoginRequests.Add(lgn);
                db.SaveChanges();
                int uid = Convert.ToInt32(db.LoginRequests.OrderByDescending(x => x.UserId).Select(x => x.UserId).First());
                user.Uid = uid;
                db.Users.Add(user);
                db.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }
    }
}
