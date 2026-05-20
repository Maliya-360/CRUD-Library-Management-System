using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LibraryManagementAPI.Models
{
    public class Transaction
    {
        [Key]
        public int TransactionId { get; set; }

        [Required]
        [ForeignKey("Book")]
        public int BookId { get; set; }

        [Required]
        [ForeignKey("Member")]
        public int MemberId { get; set; }

        [Required(ErrorMessage = "Days to return is required")]
        [Range(1, 365, ErrorMessage = "Days to return must be between 1 and 365")]
        public int DaysToReturn { get; set; }

        [Required(ErrorMessage = "Status is required")]
        [StringLength(20)]
        public string Status { get; set; } // "Issued", "Returned", "Overdue"

        public DateTime IssueDate { get; set; }

        public DateTime DueDate { get; set; }

        public DateTime? ReturnDate { get; set; }

        public decimal Fine { get; set; }

        public DateTime CreatedDate { get; set; }

        public Book Book { get; set; }
        public Member Member { get; set; }
    }
}