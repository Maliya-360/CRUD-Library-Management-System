namespace LibraryManagementAPI.DTOs
{
    public class ReservationDto
    {
        public int ReservationId { get; set; }
        public int BookId { get; set; }
        public int MemberId { get; set; }
        public string BookTitle { get; set; }
        public string MemberName { get; set; }
        public DateTime ReservationDate { get; set; }
        public DateTime? ReservationExpiryDate { get; set; }
        public string Status { get; set; }
    }

    public class CreateReservationDto
    {
        public int BookId { get; set; }
        public int MemberId { get; set; }
    }

    public class CancelReservationDto
    {
        public int ReservationId { get; set; }
    }
}