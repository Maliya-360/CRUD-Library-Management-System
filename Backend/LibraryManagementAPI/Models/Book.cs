namespace LibraryManagementAPI.Models
{
    public class Book
    {
        public int BookId { get; set; }
        public string Title { get; set; }
        public string Author { get; set; }
        public string ISBN { get; set; }
        public DateTime PublicationDate { get; set; }
        public int AvailableQuantity { get; set; }
        public int TotalQuantity { get; set; }
        public string Category { get; set; }
        public bool IsAvailable { get; set; }
        public DateTime CreatedDate { get; set; }
        
        public ICollection<Transaction> Transactions { get; set; }
        public ICollection<Reservation> Reservations { get; set; }
    }
}