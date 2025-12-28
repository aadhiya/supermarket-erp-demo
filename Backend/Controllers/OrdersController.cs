using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "CustomerOnly")]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrdersController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/orders/last - Demo: most recent sales grouped by invoice
        [HttpGet("last")]
        public async Task<IActionResult> GetLastOrder()
        {
            var latestSales = await _context.Sales
                .OrderByDescending(s => s.Date)
                .Take(20)  // Recent sales
                .GroupBy(s => s.InvoiceId)
                .OrderByDescending(g => g.Max(s => s.Date))
                .FirstOrDefaultAsync();

            if (latestSales == null)
                return Ok(new List<object>());

            var lastOrderItems = latestSales
                .GroupBy(s => s.ProductCode)
                .Select(g => new
                {
                    productCode = g.Key,
                    quantity = g.Sum(s => s.Quantity),
                    product = _context.Products
                        .Where(p => p.Code == g.Key)
                        .Select(p => new { p.Name, p.Price, p.Category })
                        .FirstOrDefault()
                })
                .Where(x => x.product != null)
                .ToList();

            return Ok(lastOrderItems);
        }

        // GET /api/reorder-suggestions - Analyze purchase frequency
        [HttpGet("reorder-suggestions")]
        public async Task<IActionResult> GetReorderSuggestions()
        {
            var recentSales = await _context.Sales
                .Where(s => s.Date > DateTime.UtcNow.AddMonths(-6))  // Last 6 months
                .GroupBy(s => s.ProductCode)
                .Select(g => new
                {
                    ProductCode = g.Key,
                    PurchaseDates = g.OrderBy(s => s.Date).Select(s => s.Date).ToList()
                })
                .Where(g => g.PurchaseDates.Count() > 1)
                .ToListAsync();

            var suggestions = new List<object>();
            foreach (var group in recentSales.Take(5))  // Top 5 products
            {
                var dates = group.PurchaseDates.OrderBy(d => d).ToList();
                var intervals = new List<double>();

                for (int i = 0; i < dates.Count - 1; i++)
                {
                    intervals.Add((dates[i + 1] - dates[i]).TotalDays);
                }

                var avgIntervalDays = intervals.Average();
                var weeks = Math.Round(avgIntervalDays / 7, 1);

                var product = await _context.Products
                    .Where(p => p.Code == group.ProductCode)
                    .Select(p => new { p.Name, p.Price })
                    .FirstOrDefaultAsync();

                if (product != null && avgIntervalDays < 60)  // Frequent enough
                {
                    suggestions.Add(new
                    {
                        product = product,
                        averageIntervalDays = (int)Math.Round(avgIntervalDays),
                        weeks,
                        message = $"You usually buy this every {weeks} weeks"
                    });
                }
            }

            return Ok(suggestions);
        }
        // recent sales
        [HttpGet("recent-sales")]
        public async Task<IActionResult> GetRecentSales()
        {
            var recent = await _context.Sales
                .OrderByDescending(s => s.Date)
                .Take(10)
                .Select(s => new
                {
                    s.InvoiceId,
                    s.ProductCode,
                    s.Quantity,
                    s.Total,
                    s.Date,
                    ProductName = _context.Products.Where(p => p.Code == s.ProductCode).Select(p => p.Name).FirstOrDefault()
                })
                .ToListAsync();

            return Ok(recent);
        }

    }
}
