namespace Backend.Models
{
    public class Sale
    {
        public int Id { get; set; }
        public string ProductCode { get; set; } = "";
        public int Quantity { get; set; }
        public decimal Total { get; set; }
        public string Branch { get; set; } = "";
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public string InvoiceId { get; set; } = "";  // Groups multiple items into one order
        public string Payment { get; set; } = "";
    }
}
