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
        private const int MAX_ACTIVE_BORROWED_BOOKS = 5;
        private const decimal DAILY_FINE = 10;
        private const decimal DAMAGE_FINE = 50;

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
            var transactions = (await _transactionRepository.GetAllAsync()).ToList();
            var lookup = await BuildLookupAsync();
            return transactions.Select(t => MapToDto(t, lookup.books, lookup.members)).ToList();
        }

        public async Task<TransactionDto> GetTransactionByIdAsync(int id)
        {
            var transaction = await _transactionRepository.GetByIdAsync(id);
            if (transaction == null)
                throw new Exception($"Transaction with ID {id} not found.");

            var lookup = await BuildLookupAsync();
            return MapToDto(transaction, lookup.books, lookup.members);
        }

        public async Task<TransactionDto> IssueBookAsync(IssueBookDto issueBookDto)
        {
            var book = await _bookRepository.GetByIdAsync(issueBookDto.BookId);
            if (book == null)
                throw new Exception($"Book with ID {issueBookDto.BookId} not found.");

            var member = await _memberRepository.GetByIdAsync(issueBookDto.MemberId);
            if (member == null)
                throw new Exception($"Member with ID {issueBookDto.MemberId} not found.");

            if (!member.IsActive)
                throw new Exception($"Member '{member.FirstName} {member.LastName}' is inactive.");

            var transactions = (await _transactionRepository.GetAllAsync()).ToList();
            var activeBorrowCount = transactions.Count(t => t.MemberId == issueBookDto.MemberId && !IsReturned(t.Status));
            if (activeBorrowCount >= MAX_ACTIVE_BORROWED_BOOKS)
                throw new Exception("A single member can borrow at most 5 books at a time.");

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
                IsDamaged = false,
                CreatedDate = DateTime.Now
            };

            book.AvailableQuantity--;
            book.IsAvailable = book.AvailableQuantity > 0;

            await _bookRepository.UpdateAsync(book);
            await _transactionRepository.AddAsync(transaction);
            await _transactionRepository.SaveAsync();

            var lookup = await BuildLookupAsync();
            return MapToDto(transaction, lookup.books, lookup.members);
        }

        public async Task<TransactionDto> ReturnBookAsync(ReturnBookDto returnBookDto)
        {
            var transaction = await _transactionRepository.GetByIdAsync(returnBookDto.TransactionId);
            if (transaction == null)
                throw new Exception($"Transaction with ID {returnBookDto.TransactionId} not found.");

            if (IsReturned(transaction.Status))
                throw new Exception("Book already returned.");

            var book = await _bookRepository.GetByIdAsync(transaction.BookId);
            if (book == null)
                throw new Exception($"Book with ID {transaction.BookId} not found.");

            transaction.ReturnDate = DateTime.Now;
            transaction.IsDamaged = returnBookDto.IsDamaged;

            var lateFine = 0m;
            if (transaction.ReturnDate.Value > transaction.DueDate)
            {
                var days = (transaction.ReturnDate.Value - transaction.DueDate).Days;
                lateFine = days * DAILY_FINE;
            }

            var damageFine = returnBookDto.IsDamaged ? DAMAGE_FINE : 0m;
            transaction.Fine = lateFine + damageFine;
            transaction.Status = "Returned";

            book.AvailableQuantity++;
            book.IsAvailable = true;

            await _bookRepository.UpdateAsync(book);
            await _transactionRepository.UpdateAsync(transaction);
            await _transactionRepository.SaveAsync();

            var lookup = await BuildLookupAsync();
            return MapToDto(transaction, lookup.books, lookup.members);
        }

        public async Task<IEnumerable<TransactionDto>> GetPendingTransactionsAsync()
        {
            var transactions = (await _transactionRepository.GetAllAsync()).ToList();
            var lookup = await BuildLookupAsync();
            var pending = transactions.Where(t => !IsReturned(t.Status));
            return pending.Select(t => MapToDto(t, lookup.books, lookup.members)).ToList();
        }

        public async Task<IEnumerable<TransactionDto>> GetTransactionsByMemberAsync(int memberId)
        {
            var transactions = (await _transactionRepository.GetAllAsync()).ToList();
            var lookup = await BuildLookupAsync();
            var memberTransactions = transactions.Where(t => t.MemberId == memberId);
            return memberTransactions.Select(t => MapToDto(t, lookup.books, lookup.members)).ToList();
        }

        public async Task<decimal> CalculateFineAsync(int transactionId)
        {
            var transaction = await _transactionRepository.GetByIdAsync(transactionId);
            if (transaction == null)
                throw new Exception($"Transaction with ID {transactionId} not found.");

            if (IsReturned(transaction.Status))
                return transaction.Fine;

            if (DateTime.Now < transaction.DueDate)
                return 0;

            var days = (DateTime.Now - transaction.DueDate).Days;
            return days * DAILY_FINE;
        }

        private async Task<(Dictionary<int, Book> books, Dictionary<int, Member> members)> BuildLookupAsync()
        {
            var books = (await _bookRepository.GetAllAsync()).ToDictionary(book => book.BookId);
            var members = (await _memberRepository.GetAllAsync()).ToDictionary(member => member.MemberId);
            return (books, members);
        }

        private TransactionDto MapToDto(Transaction transaction, IReadOnlyDictionary<int, Book> books, IReadOnlyDictionary<int, Member> members)
        {
            books.TryGetValue(transaction.BookId, out var book);
            members.TryGetValue(transaction.MemberId, out var member);

            return new TransactionDto
            {
                TransactionId = transaction.TransactionId,
                BookId = transaction.BookId,
                MemberId = transaction.MemberId,
                BookTitle = book?.Title ?? "N/A",
                MemberName = member == null ? "N/A" : $"{member.FirstName} {member.LastName}",
                IssueDate = transaction.IssueDate,
                DueDate = transaction.DueDate,
                ReturnDate = transaction.ReturnDate,
                Fine = transaction.Fine,
                IsDamaged = transaction.IsDamaged,
                Status = transaction.Status
            };
        }

        private static bool IsReturned(string status)
        {
            return string.Equals(status, "Returned", StringComparison.OrdinalIgnoreCase);
        }
    }
}