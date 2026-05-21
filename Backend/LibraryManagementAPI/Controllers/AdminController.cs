using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LibraryManagementAPI.Data;
using LibraryManagementAPI.DTOs;
using LibraryManagementAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagementAPI.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly LibraryContext _context;

        public AdminController(LibraryContext context)
        {
            _context = context;
        }

        [HttpGet("dashboard")]
        public async Task<ActionResult<AdminDashboardDto>> GetDashboardData()
        {
            var users = await _context.Members
                .Where(member => member.MemberType == "Member")
                .OrderByDescending(member => member.MemberId)
                .Select(member => new MemberDto
                {
                    MemberId = member.MemberId,
                    FirstName = member.FirstName,
                    LastName = member.LastName,
                    Email = member.Email,
                    Phone = member.Phone,
                    MembershipNumber = member.MembershipNumber,
                    MembershipDate = member.MembershipDate,
                    MemberType = member.MemberType,
                    IsActive = member.IsActive
                })
                .ToListAsync();

            var books = await _context.Books
                .OrderByDescending(book => book.BookId)
                .Select(book => new BookDto
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
                })
                .ToListAsync();

            var transactions = await _context.Transactions
                .Include(transaction => transaction.Book)
                .Include(transaction => transaction.Member)
                .OrderByDescending(transaction => transaction.TransactionId)
                .Select(transaction => new TransactionDto
                {
                    TransactionId = transaction.TransactionId,
                    BookId = transaction.BookId,
                    MemberId = transaction.MemberId,
                    BookTitle = transaction.Book.Title,
                    MemberName = transaction.Member.FirstName + " " + transaction.Member.LastName,
                    IssueDate = transaction.IssueDate,
                    DueDate = transaction.DueDate,
                    ReturnDate = transaction.ReturnDate,
                    Fine = transaction.Fine,
                    IsDamaged = transaction.IsDamaged,
                    Status = transaction.Status
                })
                .ToListAsync();

            var reservations = await _context.Reservations
                .Include(reservation => reservation.Book)
                .Include(reservation => reservation.Member)
                .OrderByDescending(reservation => reservation.ReservationId)
                .Select(reservation => new ReservationDto
                {
                    ReservationId = reservation.ReservationId,
                    BookId = reservation.BookId,
                    MemberId = reservation.MemberId,
                    BookTitle = reservation.Book.Title,
                    MemberName = reservation.Member.FirstName + " " + reservation.Member.LastName,
                    ReservationDate = reservation.ReservationDate,
                    ReservationExpiryDate = reservation.ReservationExpiryDate,
                    Status = reservation.Status
                })
                .ToListAsync();

            return Ok(new AdminDashboardDto
            {
                Users = users,
                Books = books,
                Transactions = transactions,
                Reservations = reservations
            });
        }

        [HttpPut("profile/{memberId}")]
        public async Task<IActionResult> UpdateProfile(int memberId, [FromBody] Member request)
        {
            var member = await _context.Members.FindAsync(memberId);
            if (member == null)
                return NotFound("User not found");

            member.FirstName = request.FirstName;
            member.LastName = request.LastName;
            member.Email = request.Email;
            member.Phone = request.Phone;

            _context.Members.Update(member);
            await _context.SaveChangesAsync();

            return Ok(member);
        }

        [HttpPost("change-password/{memberId}")]
        public async Task<IActionResult> ChangePassword(int memberId, [FromBody] dynamic request)
        {
            var member = await _context.Members.FindAsync(memberId);
            if (member == null)
                return NotFound("User not found");

            string currentPassword = request.currentPassword;
            string newPassword = request.newPassword;

            if (member.PasswordHash != currentPassword)
                return BadRequest("Current password is incorrect");

            member.PasswordHash = newPassword;
            _context.Members.Update(member);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password changed successfully" });
        }
    }
}