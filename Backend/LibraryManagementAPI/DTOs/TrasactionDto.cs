using System.ComponentModel.DataAnnotations;

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
        [Required]
        public int BookId { get; set; }
        [Required]
        public int MemberId { get; set; }
        [Required]
        [Range(1, 365)]
        public int DaysToReturn { get; set; }
    }

    public class ReturnBookDto
    {
        public int TransactionId { get; set; }
    }
}