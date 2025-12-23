using Backend.Data;
using Backend.Models;
using CsvHelper;
using System.Globalization;
using System.Dynamic;
using Microsoft.EntityFrameworkCore;

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
        if (!File.Exists(csvPath)) return;

        using var reader = new StreamReader(csvPath);
        using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);
        var records = csv.GetRecords<dynamic>().Take(1000).ToList();

        var products = new Dictionary<string, Product>();
        foreach (var record in records)
        {
            var productCode = record.Product_line?.ToString() ?? "MISC";
            if (!products.TryGetValue(productCode, out Product? product))
            {
                product = new Product
                {
                    Code = productCode,
                    Name = productCode,
                    Category = productCode,
                    Price = decimal.TryParse(record.Unitprice?.ToString(), out var price) ? price : 0,
                    Stock = 100,
                    Cost = 0
                };
                products[productCode] = product;
                _context.Products.Add(product);
            }

            _context.Sales.Add(new Sale
            {
                ProductCode = productCode,
                Quantity = int.TryParse(record.Quantity?.ToString(), out var qty) ? qty : 1,
                Total = decimal.TryParse(record.Total?.ToString(), out var total) ? total : 0,
                Branch = record.Branch?.ToString() ?? "Main"
            });
        }

        await _context.SaveChangesAsync();
    }
}