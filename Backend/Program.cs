using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.ML;
using Microsoft.ML.Data;
using Microsoft.ML.Transforms.TimeSeries;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

builder.Services.AddDbContext<AppDbContext>();
builder.Services.AddScoped<SeedData>();
// ← ADD CORS HERE (after AddDbContext, before AddScoped)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

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
