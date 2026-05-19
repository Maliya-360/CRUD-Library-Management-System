namespace LibraryManagementAPI.Models
{
    public class Reservation
    {
        public int ReservationId { get; set; }
        public int BookId { get; set; }
        public int MemberId { get; set; }
        public DateTime ReservationDate { get; set; }
        public DateTime? ReservationExpiryDate { get; set; }
        public string Status { get; set; } // Active , Fulfilled, Cancelled
        public DateTime CreatedDate { get; set; }

        public Book Book { get; set; }
        public Member Member { get; set; }
    }
}