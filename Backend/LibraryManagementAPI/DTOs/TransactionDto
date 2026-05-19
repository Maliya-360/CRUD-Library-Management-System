namespace LibraryManagementAPI.DTOs
{
    public class TransactionDto
    {
        public int TransactionId { get; set; }
        public int BookId { get; set; }
        public int MemberId { get; set; }
        public string BookTitle { get; set; }
        public string MemberName { get; set; }
        public DateTime IssueDate { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public decimal Fine { get; set; }
        public string Status { get; set; }
    }

    public class IssueBookDto
    {
        public int BookId { get; set; }
        public int MemberId { get; set; }
        public int DaysToReturn { get; set; }
    }

    public class ReturnBookDto
    {
        public int TransactionId { get; set; }
    }
}