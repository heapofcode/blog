﻿using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using app.Model;
using System.Linq;

namespace app.Services.User
{
    public class User : IUser
    {
        private readonly ILogger<User> _logger;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly UserManager<ApplicationUser> _userManager;

        public User(ILogger<User> logger, SignInManager<ApplicationUser> signInManager, UserManager<ApplicationUser> userManager)
        {
            _logger = logger;
            _signInManager = signInManager;
            _userManager = userManager;
        }

        public async Task<List<string>> GetUserRole(string userName)
        {
            _logger.LogInformation($"Take user [{userName}] role");
            var user = await _userManager.FindByNameAsync(userName);
            if (user != null) 
            {
               var result = await _userManager.GetRolesAsync(user);
                if (result.Count > 0)
                    return result.ToList();
                else
                    return null;
            }

            return null;
        }

        public async Task<bool> IsValidUserCredentials(string userName, string password)
        {
            _logger.LogInformation($"Validating user [{userName}]");
            if (string.IsNullOrWhiteSpace(userName))
            {
                return false;
            }

            if (string.IsNullOrWhiteSpace(password))
            {
                return false;
            }

            var user = await _userManager.FindByNameAsync(userName);
            if (user != null) 
            {
                var result = await _signInManager.PasswordSignInAsync(user, password, true, false);
                if (result.Succeeded)
                {
                    return true;
                }
            }

            return false;
        }
    }
}
