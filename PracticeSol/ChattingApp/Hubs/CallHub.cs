using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using ChattingApp.Models;

namespace ChattingApp.Hubs
{
    [Authorize]
    public class CallHub : Hub
    {
        // Map username -> connectionId
        private static readonly ConcurrentDictionary<string, string> Users = new();
        private static readonly ConcurrentDictionary<string, string> Userids = new();

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var user = Users.FirstOrDefault(x => x.Value == Context.ConnectionId).Key;
            if (user != null)
            {
                Users.TryRemove(user, out _);
                await Clients.All.SendAsync("UpdateUserList", Users.Keys.ToList());
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task RegisterUser(string username)
        {
            // ✅ Override client-provided username with JWT name claim
            var realUser = Context.User?.Identity?.Name ?? "" ;
            Users[realUser] = Context.ConnectionId;
            Userids[realUser] = username;

            var onlineUsers = Users.Keys.Select(k => new OnlineUsers
            {
                userid = k,
                username = Userids[k]
            }).ToList();


            await Clients.Caller.SendAsync("Registered", realUser);
            //await Clients.All.SendAsync("UpdateUserList", Users.Keys.ToList(),Userids.Values.ToList());
            await Clients.All.SendAsync("UpdateUserList", onlineUsers);
        }

        // ✅ WebRTC signaling messages
        public async Task SendCallOffer(string toUser, object offer)
        {
            if (Users.TryGetValue(toUser, out var connectionId))
            {
                // Send the caller username explicitly
                var callerid = Users.FirstOrDefault(u => u.Value == Context.ConnectionId).Key ?? "Unknown";

                await Clients.Client(connectionId).SendAsync("CallOffer", callerid, offer);
            }
        }

        public async Task SendCallAnswer(string toUser, object answer)
        {
            if (Users.TryGetValue(toUser, out var connectionId))
            {
                await Clients.Client(connectionId).SendAsync("CallAnswer", answer);
            }
        }

        public async Task SendIceCandidate(string toUser, object candidate)
        {
            if (Users.TryGetValue(toUser, out var connectionId))
            {
                await Clients.Client(connectionId).SendAsync("IceCandidate", candidate);
            }
        }

        public async Task EndCall(string toUser)
        {
            if (Users.TryGetValue(toUser, out var connectionId))
            {
                await Clients.Client(connectionId).SendAsync("CallEnded", Context.UserIdentifier ?? Context.ConnectionId);
            }
        }
    }
}
