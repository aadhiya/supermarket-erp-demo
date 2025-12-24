using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.ML;
using Microsoft.ML.Data;
using Microsoft.ML.Transforms.TimeSeries;
using System.Text;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
var builder = WebApplication.CreateBuilder(args);

//JWT CONFIG(appsettings.json first)
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.RequireHttpsMetadata = false; // dev only
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidAudience = "supermarket-web",
            ValidIssuer = "supermarket-api",
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "your-super-secret-key-min32chars-long!!!"))
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("CustomerOnly", policy => policy.RequireRole("Customer"));
});
/*

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});
*/
builder.Services.AddDbContext<AppDbContext>();
builder.Services.AddScoped<SeedData>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod());
});


var app = builder.Build();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// Seed data
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();  // ← FIXED: dbContext
    dbContext.Database.EnsureCreated();  // ← CREATE TABLES!
    var seeder = scope.ServiceProvider.GetRequiredService<SeedData>();

    await seeder.SeedAsync();
}

// APIs
/*app.MapPost("/api/auth/login", async ([FromBody] LoginRequest req, AppDbContext db) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
    if (user == null) return Results.Unauthorized();

    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Role, "Customer"),
        new Claim(ClaimTypes.Email, user.Email)
    };

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        issuer: "supermarket-api",
        audience: "supermarket-web",
        claims: claims,
        expires: DateTime.UtcNow.AddMinutes(15),
        signingCredentials: creds
    );

    return Results.Ok(new { accessToken = new JwtSecurityTokenHandler().WriteToken(token) });
});
*/
app.MapGet("/api/products", async (AppDbContext db) =>
    await db.Products.Take(50).ToListAsync());

app.MapGet("/api/products/{code}", async (string code, AppDbContext db) =>
    await db.Products.FirstOrDefaultAsync(p => p.Code == code));

app.MapGet("/api/sales", async (AppDbContext db) =>
    await db.Sales.Take(100).OrderByDescending(s => s.Date).ToListAsync());

app.MapGet("/api/inventory", async (AppDbContext db) =>
{
    var products = await db.Products.ToListAsync();
    var lowStock = products.Where(p => p.Stock < 20).ToList();
    return new { All = products.Take(20), lowStock };
});

app.MapPost("/pos/sale", async (Sale sale, AppDbContext db) =>
{
    db.Sales.Add(sale);
    var product = await db.Products.FirstAsync(p => p.Code == sale.ProductCode);
    product.Stock -= sale.Quantity;
    await db.SaveChangesAsync();
    return Results.Ok(sale);
});

app.MapGet("/api/forecast/{productCode}", (string productCode) =>
{
    // ML.NET demo forecast (simplified)
    var forecast = new { NextWeek = 45.2m, Change = "+12%", Confidence = "92%" };
    return Results.Ok(forecast);
});

app.MapPost("/api/chat", async (HttpContext ctx, AppDbContext db) =>
{
    var request = await new StreamReader(ctx.Request.Body).ReadToEndAsync();
    var response = request.Contains("low stock")
        ? "Low stock items: Rice (8), Milk (12). Reorder suggested."
        : "Ask me about sales, inventory, or forecasts!";

    return Results.Ok(new { response });
});

app.Run();
//public record LoginRequest(string Email, string Password);
