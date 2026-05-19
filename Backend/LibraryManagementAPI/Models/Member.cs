namespace LibraryManagementAPI.Models
{
    public class Member
    {
        public int MemberId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string MembershipNumber { get; set; }
        public DateTime MembershipDate { get; set; }
        public string MemberType { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }

        public ICollection<Transaction> Transactions { get; set; }
        public ICollection<Reservation> Reservations { get; set; }
    }
}