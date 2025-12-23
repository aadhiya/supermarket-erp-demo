namespace Backend.Models;

public class Product
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public string Category { get; set; } = "";
    public decimal Price { get; set; }
    public decimal Stock { get; set; }
    public decimal Cost { get; set; }
    public DateTime LastUpdated { get; set; } = DateTime.Now;
}

public class Sale
{
    public int Id { get; set; }
    public DateTime Date { get; set; } = DateTime.Now;
    public string ProductCode { get; set; } = "";
    public int Quantity { get; set; }
    public decimal Total { get; set; }
    public string Branch { get; set; } = "Main";
    public string Payment { get; set; } = "Cash";
}
