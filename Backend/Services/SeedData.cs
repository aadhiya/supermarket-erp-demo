using Backend.Data;
using Backend.Models;
using CsvHelper;
using System.Globalization;

namespace Backend.Services;

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
        using var reader = new StreamReader(csvPath);
        using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);
        var records = csv.GetRecords<dynamic>().Take(1000).ToList(); // First 1000 for demo

        var products = new Dictionary<string, Product>();
        foreach (var record in records)
        {
            var productCode = record.Product_line.ToString() ?? "MISC";
            if (!products.TryGetValue(productCode, out var product))
            {
                product = new Product
                {
                    Code = productCode,
                    Name = productCode,
                    Category = productCode,
                    Price = decimal.Parse(record.Unitprice.ToString() ?? "0"),
                    Stock = 100, // Random initial stock
                    Cost = decimal.Parse(record.Unitprice.ToString() ?? "0") * 0.7m
                };
                products[productCode] = product;
                _context.Products.Add(product);
            }

            _context.Sales.Add(new Sale
            {
                ProductCode = productCode,
                Quantity = int.Parse(record.Quantity.ToString() ?? "1"),
                Total = decimal.Parse(record.Total.ToString() ?? "0"),
                Branch = record.Branch.ToString() ?? "Main"
            });
        }

        await _context.SaveChangesAsync();
    }
}
