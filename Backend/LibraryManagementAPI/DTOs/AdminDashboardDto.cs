namespace LibraryManagementAPI.DTOs
{
    public class AdminDashboardDto
    {
        public IEnumerable<MemberDto> Users { get; set; }
        public IEnumerable<BookDto> Books { get; set; }
        public IEnumerable<TransactionDto> Transactions { get; set; }
        public IEnumerable<ReservationDto> Reservations { get; set; }
    }
}