using Microsoft.EntityFrameworkCore;
using System;
namespace ChattingApp.Models
{
    public class ChatDbContext:DbContext
    {
        public ChatDbContext(DbContextOptions<ChatDbContext> options) : base(options) { }
        public DbSet<LoginRequest> LoginRequests { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.Entity<LoginRequest>(entity=>{
                entity.ToTable("Login");
                entity.Property(e => e.Username).HasColumnName("uid");
                entity.Property(e => e.Password).HasColumnName("password");
            });
        
        }
        
    }
}
