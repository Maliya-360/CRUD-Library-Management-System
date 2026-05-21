using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LibraryManagementAPI.Data;
using LibraryManagementAPI.Models;

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