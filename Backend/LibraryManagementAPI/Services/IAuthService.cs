using LibraryManagementAPI.DTOs;

namespace LibraryManagementAPI.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDto> LoginAsync(LoginDto loginDto);
        Task<MemberDto> RegisterAsync(RegisterDto registerDto);
        Task<MemberDto> ChangePasswordAsync(int memberId, ChangePasswordDto changePasswordDto);
    }
}