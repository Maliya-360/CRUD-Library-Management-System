using LibraryManagementAPI.DTOs;

namespace LibraryManagementAPI.Services
{
    public interface IBookService
    {

        Task<IEnumerable<BookDto>> GetAllBooksAsync();

        Task<BookDto> GetBookByIdAsync(int id);

        Task<BookDto> CreateBookAsync(CreateBookDto createBookDto);

        Task<BookDto> UpdateBookAsync(int id, UpdateBookDto updateBookDto);

        Task<bool> DeleteBookAsync(int id);

        Task<IEnumerable<BookDto>> SearchBooksByTitleAsync(string title);

        Task<IEnumerable<BookDto>> SearchBooksByAuthorAsync(string author);

        Task<IEnumerable<BookDto>> GetAvailableBooksAsync();
    }
}