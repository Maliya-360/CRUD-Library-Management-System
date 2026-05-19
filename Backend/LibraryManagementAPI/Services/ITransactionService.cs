using LibraryManagementAPI.DTOs;

namespace LibraryManagementAPI.Services
{
    public interface ITransactionService
    {
        Task<IEnumerable<TransactionDto>> GetAllTransactionsAsync();

        Task<TransactionDto> GetTransactionByIdAsync(int id);

        Task<TransactionDto> IssueBookAsync(IssueBookDto issueBookDto);

        Task<TransactionDto> ReturnBookAsync(ReturnBookDto returnBookDto);

        Task<IEnumerable<TransactionDto>> GetPendingTransactionsAsync();

        Task<IEnumerable<TransactionDto>> GetTransactionsByMemberAsync(int memberId);

        Task<decimal> CalculateFineAsync(int transactionId);
    }
}