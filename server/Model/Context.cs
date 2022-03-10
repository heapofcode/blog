using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;

namespace app.Model
{
    public class Context : IdentityDbContext<ApplicationUser>
    {
        public Context(DbContextOptions<Context> options) : base(options)
        {

        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
        }

        public DbSet<Jwt> Jwts { get; set; }
        public DbSet<Article> Articles { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Tag> Tags { get; set; }
    }

    public class ApplicationUser : IdentityUser
    {

    }

    public class Jwt 
    {
        public Guid Id { get; set; } = new Guid();
        public string UserId { get; set; }
        public ApplicationUser User { get; set; }
        public string RefreshToken { get; set; }
        public DateTime ExpAtRef { get; set; }
        public string AccessToken { get; set; }
    }

    public class Article
    {
        public Guid Id { get; set; } = new Guid();
        public string Name { get; set; }
        public string ShortDescription { get; set; }
        public string Description { get; set; }
        public string HeroImage { get; set; }
        public DateTime Date { get; set; }
        public Guid CategoryId { get; set; }
        public Category Category { get; set; }
        public List<Tag> Tags { get; set; } = new List<Tag>();
    }

    public class Category 
    {
        public Guid Id { get; set; } = new Guid();
        public string Name { get; set; }
        public List<Article> Articles { get; set; } = new List<Article>();
    }

    public class Tag 
    {
        public Guid Id { get; set; } = new Guid();
        public string Name { get; set; }
        public List<Article> Articles { get; set; } = new List<Article>();
    }
}
