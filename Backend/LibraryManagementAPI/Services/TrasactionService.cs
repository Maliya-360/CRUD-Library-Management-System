using LibraryManagementAPI.DTOs;
using LibraryManagementAPI.Models;
using LibraryManagementAPI.Repositories;

namespace LibraryManagementAPI.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly IRepository<Transaction> _transactionRepository;
        private readonly IRepository<Book> _bookRepository;
        private readonly IRepository<Member> _memberRepository;
        private const decimal DAILY_FINE = 10;

        public TransactionService(
            IRepository<Transaction> transactionRepository,
            IRepository<Book> bookRepository,
            IRepository<Member> memberRepository)
        {
            _transactionRepository = transactionRepository;
            _bookRepository = bookRepository;
            _memberRepository = memberRepository;
        }

        public async Task<IEnumerable<TransactionDto>> GetAllTransactionsAsync()
        {
            var transactions = await _transactionRepository.GetAllAsync();
            return transactions.Select(t => MapToDto(t)).ToList();
        }

        public async Task<TransactionDto> GetTransactionByIdAsync(int id)
        {
            var transaction = await _transactionRepository.GetByIdAsync(id);
            if (transaction == null)
                throw new Exception($"Transaction with ID {id} not found.");

            return MapToDto(transaction);
        }

        public async Task<TransactionDto> IssueBookAsync(IssueBookDto issueBookDto)
        {
            var book = await _bookRepository.GetByIdAsync(issueBookDto.BookId);
            if (book == null)
                throw new Exception($"Book with ID {issueBookDto.BookId} not found.");

            var member = await _memberRepository.GetByIdAsync(issueBookDto.MemberId);
            if (member == null)
                throw new Exception($"Member with ID {issueBookDto.MemberId} not found.");

            if (book.AvailableQuantity <= 0)
                throw new Exception($"Book '{book.Title}' is not available.");

            var transaction = new Transaction
            {
                BookId = issueBookDto.BookId,
                MemberId = issueBookDto.MemberId,
                IssueDate = DateTime.Now,
                DueDate = DateTime.Now.AddDays(issueBookDto.DaysToReturn),
                Status = "Issued",
                Fine = 0,
                CreatedDate = DateTime.Now
            };

            book.AvailableQuantity--;
            if (book.AvailableQuantity == 0)
                book.IsAvailable = false;

            await _bookRepository.UpdateAsync(book);
            await _transactionRepository.AddAsync(transaction);
            await _transactionRepository.SaveAsync();

            return MapToDto(transaction);
        }

        public async Task<TransactionDto> ReturnBookAsync(ReturnBookDto returnBookDto)
        {
            var transaction = await _transactionRepository.GetByIdAsync(returnBookDto.TransactionId);
            if (transaction == null)
                throw new Exception($"Transaction with ID {returnBookDto.TransactionId} not found.");

            if (transaction.Status == "Returned")
                throw new Exception("Book already returned.");

            var book = await _bookRepository.GetByIdAsync(transaction.BookId);
            if (book == null)
                throw new Exception($"Book with ID {transaction.BookId} not found.");

            transaction.ReturnDate = DateTime.Now;
            if (transaction.ReturnDate > transaction.DueDate)
            {
                var days = (transaction.ReturnDate.Value - transaction.DueDate).Days;
                transaction.Fine = days * DAILY_FINE;
            }

            transaction.Status = "Returned";

            book.AvailableQuantity++;
            book.IsAvailable = true;

            await _bookRepository.UpdateAsync(book);
            await _transactionRepository.UpdateAsync(transaction);
            await _transactionRepository.SaveAsync();

            return MapToDto(transaction);
        }

        public async Task<IEnumerable<TransactionDto>> GetPendingTransactionsAsync()
        {
            var transactions = await _transactionRepository.GetAllAsync();
            var pending = transactions.Where(t => t.Status == "Issued");
            return pending.Select(t => MapToDto(t)).ToList();
        }

        public async Task<IEnumerable<TransactionDto>> GetTransactionsByMemberAsync(int memberId)
        {
            var transactions = await _transactionRepository.GetAllAsync();
            var memberTransactions = transactions.Where(t => t.MemberId == memberId);
            return memberTransactions.Select(t => MapToDto(t)).ToList();
        }

        public async Task<decimal> CalculateFineAsync(int transactionId)
        {
            var transaction = await _transactionRepository.GetByIdAsync(transactionId);
            if (transaction == null)
                throw new Exception($"Transaction with ID {transactionId} not found.");

            if (DateTime.Now < transaction.DueDate)
                return 0;

            var days = (DateTime.Now - transaction.DueDate).Days;
            return days * DAILY_FINE;
        }

        private TransactionDto MapToDto(Transaction transaction)
        {
            return new TransactionDto
            {
                TransactionId = transaction.TransactionId,
                BookId = transaction.BookId,
                MemberId = transaction.MemberId,
                BookTitle = transaction.Book?.Title ?? "N/A",
                MemberName = $"{transaction.Member?.FirstName} {transaction.Member?.LastName}" ?? "N/A",
                IssueDate = transaction.IssueDate,
                DueDate = transaction.DueDate,
                ReturnDate = transaction.ReturnDate,
                Fine = transaction.Fine,
                Status = transaction.Status
            };
        }
    }
}