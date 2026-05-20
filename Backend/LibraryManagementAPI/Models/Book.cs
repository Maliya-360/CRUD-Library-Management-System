using System.ComponentModel.DataAnnotations;

namespace LibraryManagementAPI.Models
{
    public class Book
    {
        [Key]
        public int BookId { get; set; }

        [Required(ErrorMessage = "Title is required")]
        [StringLength(200)]
        public string Title { get; set; }

        [Required(ErrorMessage = "Author is required")]
        [StringLength(100)]
        public string Author { get; set; }

        [Required(ErrorMessage = "ISBN is required")]
        [StringLength(20)]
        public string ISBN { get; set; }

        public DateTime PublicationDate { get; set; }

        [Required]
        public int TotalQuantity { get; set; }

        public int AvailableQuantity { get; set; }

        [Required(ErrorMessage = "Category is required")]
        public string Category { get; set; }

        public bool IsAvailable { get; set; }

        public DateTime CreatedDate { get; set; }

        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}