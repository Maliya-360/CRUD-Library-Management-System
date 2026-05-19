using LibraryManagementAPI.DTOs;

namespace LibraryManagementAPI.Services
{
    public interface IMemberService
    {
        Task<IEnumerable<MemberDto>> GetAllMembersAsync();

        Task<MemberDto> GetMemberByIdAsync(int id);

        Task<MemberDto> CreateMemberAsync(CreateMemberDto createMemberDto);

        Task<MemberDto> UpdateMemberAsync(int id, UpdateMemberDto updateMemberDto);

        Task<bool> DeleteMemberAsync(int id);

        Task<MemberDto> RegisterMemberAsync(RegisterMemberDto registerMemberDto);

        Task<IEnumerable<MemberDto>> GetActiveMembersAsync();

        Task<MemberDto> GetMemberByEmailAsync(string email);
    }
}