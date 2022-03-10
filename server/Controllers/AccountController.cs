using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Security.Claims;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using app.Model;
using app.Services.JWT;
using app.Services.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Primitives;
using Microsoft.IdentityModel.Tokens;

namespace app.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly ILogger<AccountController> _logger;
        private readonly IUser _userService;
        private readonly IJwtAuthManager _jwtAuthManager;
        private readonly Context _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private StringValues token;

        public AccountController(
            ILogger<AccountController> logger,
            IUser userService,
            IJwtAuthManager jwtAuthManager,
            Context context,
            UserManager<ApplicationUser> userManager)
        {
            _logger = logger;
            _userService = userService;
            _jwtAuthManager = jwtAuthManager;
            _context = context;
            _userManager = userManager;
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            if (!await _userService.IsValidUserCredentials(request.UserName, request.Password))
            {
                return Unauthorized("Пользователь не авторизован");
            }

            var user = await _userManager.FindByNameAsync(request.UserName);
            if (user == null)
            {
                return Unauthorized("Пользователь");
            }

            var roles = await _userService.GetUserRole(request.UserName);
            var claims = new List<Claim>()
            {
                new Claim(ClaimTypes.Name, request.UserName)
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var jwtResult = _jwtAuthManager.GenerateTokens(user.UserName, claims, DateTime.Now);
            if (jwtResult != null)
            {
                var existingUserTokens = await _context.Jwts.Where(a => a.UserId == user.Id).ToListAsync();
                if (existingUserTokens != null)
                {
                    _context.RemoveRange(existingUserTokens);
                }
                
                await _context.Jwts.AddAsync(
                new Jwt { 
                    UserId = user.Id, RefreshToken = jwtResult.RefreshToken.TokenString, ExpAtRef = jwtResult.RefreshToken.ExpireAt, AccessToken = jwtResult.AccessToken 
                });
                await _context.SaveChangesAsync();

                return Ok(new LoginResult {
                    AccessToken = jwtResult.AccessToken,
                    RefreshToken = jwtResult.RefreshToken.TokenString,
                    Roles = roles
                });
            }
            else
            {
                return Unauthorized();
            }
        }

        [Authorize]
        [HttpPost]
        [Route("logout")]
        public async Task<IActionResult> Logout() 
        {
            var user = await _userManager.FindByNameAsync(User.Identity?.Name);
            if (user != null) 
            {
                _context.Jwts.RemoveRange(await _context.Jwts.Where(a=>a.UserId == user.Id).ToListAsync());
                await _context.SaveChangesAsync();
                return Ok();
            }

            return Unauthorized();
        }

        [AllowAnonymous]
        [HttpGet]
        [Route("refresh")]
        public async Task<IActionResult> RefreshToken()
        {
            try
            {
                HttpContext.Request.Headers.TryGetValue("Authorization", out token);
                if (token != StringValues.Empty)
                {
                    var refToken = token.ToString();
                    var jwtToken = await _context.Jwts.SingleOrDefaultAsync(a=>a.RefreshToken == refToken);
                    if (jwtToken != null) 
                    {
                        var jwtResult = _jwtAuthManager.Refresh(refToken, jwtToken.AccessToken, DateTime.Now);

                        var user = await _userManager.FindByNameAsync(jwtResult.RefreshToken.UserName);
                        var roles = await _userManager.GetRolesAsync(user);

                        jwtToken.RefreshToken = jwtResult.RefreshToken.TokenString;
                        jwtToken.ExpAtRef = jwtResult.RefreshToken.ExpireAt;
                        jwtToken.AccessToken = jwtResult.AccessToken;
                        await _context.SaveChangesAsync();

                        return Ok(new LoginResult
                        {
                            AccessToken = jwtResult.AccessToken,
                            RefreshToken = jwtResult.RefreshToken.TokenString,
                            Roles = roles.ToList()
                        });
                    }

                    return Ok("Токен для пользователя не найден");
                }

                return Unauthorized();
            }
            catch (SecurityTokenException e)
            {
                return Unauthorized(e.Message);
            }
        }

        [Authorize]
        [HttpGet]
        [Route("user")]
        public async Task<IActionResult> GetUsers()
        {
            var user = await _userManager.FindByNameAsync(User.Identity?.Name);
            var roles = await _userManager.GetRolesAsync(user);
            return Ok(new LoginResult
            {
                Roles = roles.ToList()
            });
        }

    }

    public class LoginRequest
    {
        [Required]
        [JsonPropertyName("username")]
        public string UserName { get; set; }

        [Required]
        [JsonPropertyName("password")]
        public string Password { get; set; }
    }

    public class LoginResult
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("roles")]
        public List<string> Roles { get; set; }

        [JsonPropertyName("accessToken")]
        public string AccessToken { get; set; }

        [JsonPropertyName("refreshToken")]
        public string RefreshToken { get; set; }

    }

}
