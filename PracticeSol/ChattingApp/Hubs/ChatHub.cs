using Microsoft.AspNetCore.SignalR;

namespace ChattingApp.Hubs
{
    public class ChatHub : Hub
    {
        // username -> connectionId
        private static readonly Dictionary<string, string> Users = new();

        // Called when a client registers
        public async Task RegisterUser(string username)
        {
            Users[username] = Context.ConnectionId;

            // Notify the caller that registration succeeded
            await Clients.Caller.SendAsync("Registered", username);

            // Broadcast updated online users list to everyone
            await Clients.All.SendAsync("UpdateUserList", Users.Keys);
        }

        // Send a private message
        public async Task SendPrivateMessage(string fromUser, string toUser, string message)
        {
            if (Users.TryGetValue(toUser, out string? connectionId))
            {
                await Clients.Client(connectionId).SendAsync("ReceivePrivateMessage", fromUser, message);
            }
            else
            {
                await Clients.Caller.SendAsync("UserNotFound", toUser);
            }
        }

        // Remove user on disconnect
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var user = Users.FirstOrDefault(u => u.Value == Context.ConnectionId).Key;
            if (user != null)
            {
                Users.Remove(user);
                // Update all clients
                await Clients.All.SendAsync("UpdateUserList", Users.Keys);
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
