using Backend.Data;
using Backend.Models;
using CsvHelper;
using System.Globalization;
using Microsoft.EntityFrameworkCore;
using CsvHelper.Configuration;

namespace Backend.Services;

public class SupermarketRecord
{
    public string InvoiceID { get; set; } = "";
    public string Branch { get; set; } = "";
    public string ProductLine { get; set; } = "";      // ✅ Fixed
    public decimal UnitPrice { get; set; }             // ✅ Fixed
    public int Quantity { get; set; }
    public decimal Total { get; set; }
    public string Date { get; set; } = "";
    public string Payment { get; set; } = "";
}

public class SupermarketRecordMap : ClassMap<SupermarketRecord>     // ✅ Outside class
{
    public SupermarketRecordMap()
    {
        Map(m => m.InvoiceID).Name("Invoice ID");
        Map(m => m.Branch).Name("Branch");
        Map(m => m.ProductLine).Name("Product line");         // ✅ Maps space header
        Map(m => m.UnitPrice).Name("Unit price");             // ✅ Maps space header
        Map(m => m.Quantity).Name("Quantity");
        Map(m => m.Total).Name("Total");
        Map(m => m.Date).Name("Date");
        Map(m => m.Payment).Name("Payment");
    }
}

public class SeedData
{
    private readonly AppDbContext _context;

    public SeedData(AppDbContext context)
    {
        _context = context;
    }

    public async Task SeedAsync()
    {
        if (_context.Products.Any()) return;

        var csvPath = Path.Combine("data", "supermarket-sales.csv");
        if (!File.Exists(csvPath)) return;

        using var reader = new StreamReader(csvPath);
        using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);
        csv.Context.RegisterClassMap<SupermarketRecordMap>();
        var records = csv.GetRecords<SupermarketRecord>().Take(500).ToList();

        var products = new Dictionary<string, Product>();
        foreach (var record in records)
        {
            var productCode = record.ProductLine ?? "MISC";     // ✅ Fixed property

            // ✅ DECLARE variables
            decimal price = record.UnitPrice;                    // ✅ Fixed
            int qty = record.Quantity;
            decimal total = record.Total;

            if (!products.TryGetValue(productCode, out Product? product))
            {
                product = new Product
                {
                    Code = productCode,
                    Name = productCode,
                    Category = productCode,
                    Price = price,                            // ✅ Use declared var
                    Stock = 100,
                    Cost = price * 0.7m
                };
                products[productCode] = product;
                _context.Products.Add(product);
            }
            
            _context.Sales.Add(new Sale
            {
                ProductCode = productCode,
                Quantity = qty,                               // ✅ Use declared var
                Total = total,                                // ✅ Use declared var
                Branch = record.Branch ?? "Main"
            });
        }
        if (!_context.Users.Any(u => u.Email == "customer@test.com"))
        {
            _context.Users.Add(new User
            {
                Name = "Demo Customer",
                Email = "customer@test.com"
                // PasswordHash = null for now
            });
            await _context.SaveChangesAsync();
        }
        await _context.SaveChangesAsync();                    // ✅ INSIDE method!
    }
}
