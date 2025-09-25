using ChattingApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using ChattingApp.Repositories;

namespace ChattingApp.Hubs
{
    
    public class ChatHub : Hub
    {

        private readonly AccountRepo Repo;

        public ChatHub(AccountRepo accountRepo)
        {
            Repo = accountRepo;
        }

        // username -> connectionId
        private static readonly Dictionary<string, string> Users = new();
        private static  ConcurrentBag<User> Userlist = new();

        // Called when a client registers
        public async Task RegisterUser(string username)
        {
            int realUser =Convert.ToInt32(Context.User?.Identity?.Name ?? "0");
            Users[realUser.ToString()] = Context.ConnectionId;
            var userdtls = Repo.getUser(realUser);
            if (userdtls!=null) {
                Userlist.Add(userdtls);
            }
            var distinct = Userlist.DistinctBy(u => u.Uid).ToList();
            Userlist = new ConcurrentBag<User>(distinct);

            await Clients.Caller.SendAsync("Registered", realUser);
            //await Clients.All.SendAsync("UpdateUserList", Users.Keys.ToList(),Userids.Values.ToList());
            await Clients.All.SendAsync("UpdateUserList", Userlist.ToList());
        }

        // Send a private message
        public async Task SendPrivateMessage(User fromUser, User toUser, string message)
        {
            if (Users.TryGetValue(toUser.Uid.ToString(), out string? connectionId))
            {
                await Clients.Client(connectionId).SendAsync("ReceivePrivateMessage", fromUser, message);
            }
            else
            {
                await Clients.Caller.SendAsync("UserNotFound", toUser.Uid.ToString());
            }
        }

        // Remove user on disconnect
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var ukey = Users.FirstOrDefault(u => u.Value == Context.ConnectionId).Key;
            var userkey = Convert.ToInt32(ukey);
            var user = Repo.getUser(userkey);
            if (user != null)
            {
                Users.Remove(ukey);

                var newBag = new ConcurrentBag<User>(Userlist.Where(u => u.Uid != user.Uid));

                // Replace the old bag with the new one (if allowed)
                Userlist = newBag;
                // Update all clients
                await Clients.All.SendAsync("UpdateUserList", Userlist.ToList());
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
