// Backend/Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            // Find user by email (demo - add password hash later)
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Email == req.Email);

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            // Demo: always accept (replace with real password check)
            // if (!VerifyPassword(req.Password, user.PasswordHash)) return Unauthorized();

            // Create JWT claims (user info inside token)
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name ?? user.Email),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, "Customer") // All users are Customers
            };

            // JWT signing key from appsettings.json
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "fallback-secret-key"));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Create token (expires in 15 minutes)
            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"] ?? "supermarket-api",
                audience: _config["Jwt:Audience"] ?? "supermarket-web",
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15),
                signingCredentials: creds
            );

            var accessToken = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new
            {
                accessToken,
                user = new { id = user.Id, name = user.Name, email = user.Email }
            });
        }
    }

    // Input model for login request
    public record LoginRequest(string Email, string Password);
}
