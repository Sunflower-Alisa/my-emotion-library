using HeartNote.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HeartNote.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.OpenId).IsUnique();
            entity.Property(u => u.OpenId).HasMaxLength(64).IsRequired();
        });
    }
}
