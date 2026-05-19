using LibraryManagementAPI.DTOs;
using LibraryManagementAPI.Models;
using LibraryManagementAPI.Repositories;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagementAPI.Services
{
    public class BookService : IBookService
    {
        private readonly IRepository<Book> _bookRepository;

        public BookService(IRepository<Book> bookRepository)
        {
            _bookRepository = bookRepository;
        }

        public async Task<IEnumerable<BookDto>> GetAllBooksAsync()
        {
            var books = await _bookRepository.GetAllAsync();
            return books.Select(b => MapToDto(b)).ToList();
        }

        public async Task<BookDto> GetBookByIdAsync(int id)
        {
            var book = await _bookRepository.GetByIdAsync(id);
            if (book == null)
                throw new Exception($"Book with ID {id} not found.");

            return MapToDto(book);
        }

        public async Task<BookDto> CreateBookAsync(CreateBookDto createBookDto)
        {
            var book = new Book
            {
                Title = createBookDto.Title,
                Author = createBookDto.Author,
                ISBN = createBookDto.ISBN,
                PublicationDate = createBookDto.PublicationDate,
                TotalQuantity = createBookDto.TotalQuantity,
                AvailableQuantity = createBookDto.TotalQuantity,
                Category = createBookDto.Category,
                IsAvailable = createBookDto.TotalQuantity > 0,
                CreatedDate = DateTime.Now
            };

            await _bookRepository.AddAsync(book);
            await _bookRepository.SaveAsync();

            return MapToDto(book);
        }

        public async Task<BookDto> UpdateBookAsync(int id, UpdateBookDto updateBookDto)
        {
            var book = await _bookRepository.GetByIdAsync(id);
            if (book == null)
                throw new Exception($"Book with ID {id} not found.");

            book.Title = updateBookDto.Title;
            book.Author = updateBookDto.Author;
            book.ISBN = updateBookDto.ISBN;
            book.PublicationDate = updateBookDto.PublicationDate;
            book.AvailableQuantity = updateBookDto.AvailableQuantity;
            book.TotalQuantity = updateBookDto.TotalQuantity;
            book.Category = updateBookDto.Category;
            book.IsAvailable = updateBookDto.AvailableQuantity > 0;

            await _bookRepository.UpdateAsync(book);
            await _bookRepository.SaveAsync();

            return MapToDto(book);
        }

        public async Task<bool> DeleteBookAsync(int id)
        {
            var deleted = await _bookRepository.DeleteAsync(id);
            if (!deleted)
                throw new Exception($"Book with ID {id} not found.");

            await _bookRepository.SaveAsync();
            return true;
        }

        public async Task<IEnumerable<BookDto>> SearchBooksByTitleAsync(string title)
        {
            var books = await _bookRepository.GetAllAsync();
            var filtered = books.Where(b => b.Title.Contains(title, StringComparison.OrdinalIgnoreCase));
            return filtered.Select(b => MapToDto(b)).ToList();
        }

        public async Task<IEnumerable<BookDto>> SearchBooksByAuthorAsync(string author)
        {
            var books = await _bookRepository.GetAllAsync();
            var filtered = books.Where(b => b.Author.Contains(author, StringComparison.OrdinalIgnoreCase));
            return filtered.Select(b => MapToDto(b)).ToList();
        }

        public async Task<IEnumerable<BookDto>> GetAvailableBooksAsync()
        {
            var books = await _bookRepository.GetAllAsync();
            var available = books.Where(b => b.IsAvailable);
            return available.Select(b => MapToDto(b)).ToList();
        }

        private BookDto MapToDto(Book book)
        {
            return new BookDto
            {
                BookId = book.BookId,
                Title = book.Title,
                Author = book.Author,
                ISBN = book.ISBN,
                PublicationDate = book.PublicationDate,
                AvailableQuantity = book.AvailableQuantity,
                TotalQuantity = book.TotalQuantity,
                Category = book.Category,
                IsAvailable = book.IsAvailable
            };
        }
    }
}