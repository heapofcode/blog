using Microsoft.AspNetCore.Identity;
using System.Linq;
using System.Collections.Generic;

namespace app.Model
{
    public class Initial
    {
        public async static void InitialDB(Context _context, UserManager<ApplicationUser> _userManager, RoleManager<IdentityRole> _roleManager)
        {
            await _context.Database.EnsureCreatedAsync();

            if (!_context.UserRoles.Any())
            {
                await _roleManager.CreateAsync(new IdentityRole("admin"));
            }

            if (!_context.Users.Any())
            {
                var Admin = new ApplicationUser() { Email = "admin@mail.com", UserName = "admin",  EmailConfirmed = true };
                var isAdmin = await _userManager.CreateAsync(Admin, "123456789");
                if (isAdmin.Succeeded)
                {
                    await _userManager.AddToRolesAsync(Admin, new List<string>{ "admin" });
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}