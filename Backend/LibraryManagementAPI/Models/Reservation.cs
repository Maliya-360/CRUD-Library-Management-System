using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LibraryManagementAPI.Models
{
    public class Reservation
    {
        [Key]
        public int ReservationId { get; set; }

        [Required]
        [ForeignKey("Book")]
        public int BookId { get; set; }

        [Required]
        [ForeignKey("Member")]
        public int MemberId { get; set; }

        [Required(ErrorMessage = "Status is required")]
        [StringLength(20)]
        public string Status { get; set; } // "Active", "Cancelled", "Completed"

        public DateTime ReservationDate { get; set; }

        public DateTime ReservationExpiryDate { get; set; }

        public DateTime CreatedDate { get; set; }

        public Book Book { get; set; }
        public Member Member { get; set; }
    }
}