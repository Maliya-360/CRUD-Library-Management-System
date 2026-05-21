using LibraryManagementAPI.DTOs;
using LibraryManagementAPI.Models;
using LibraryManagementAPI.Repositories;

namespace LibraryManagementAPI.Services
{
    public class MemberService : IMemberService
    {
        private readonly IRepository<Member> _memberRepository;

        public MemberService(IRepository<Member> memberRepository)
        {
            _memberRepository = memberRepository;
        }

        public async Task<IEnumerable<MemberDto>> GetAllMembersAsync()
        {
            var members = await _memberRepository.GetAllAsync();
            return members.Select(m => MapToDto(m)).ToList();
        }

        public async Task<MemberDto> GetMemberByIdAsync(int id)
        {
            var member = await _memberRepository.GetByIdAsync(id);
            if (member == null)
                throw new Exception($"Member with ID {id} not found.");

            return MapToDto(member);
        }

        public async Task<MemberDto> CreateMemberAsync(CreateMemberDto createMemberDto)
        {
            var member = new Member
            {
                FirstName = createMemberDto.FirstName,
                LastName = createMemberDto.LastName,
                Email = createMemberDto.Email,
                Phone = createMemberDto.Phone,
                MembershipNumber = GenerateMembershipNumber(),
                MembershipDate = DateTime.Now,
                MemberType = createMemberDto.MemberType,
                IsActive = true,
                CreatedDate = DateTime.Now
            };

            await _memberRepository.AddAsync(member);
            await _memberRepository.SaveAsync();

            return MapToDto(member);
        }

        public async Task<MemberDto> UpdateMemberAsync(int id, UpdateMemberDto updateMemberDto)
        {
            var member = await _memberRepository.GetByIdAsync(id);
            if (member == null)
                throw new Exception($"Member with ID {id} not found.");

            member.FirstName = updateMemberDto.FirstName;
            member.LastName = updateMemberDto.LastName;
            member.Email = updateMemberDto.Email;
            member.Phone = updateMemberDto.Phone;
            member.IsActive = updateMemberDto.IsActive;

            await _memberRepository.UpdateAsync(member);
            await _memberRepository.SaveAsync();

            return MapToDto(member);
        }

        public async Task<bool> DeleteMemberAsync(int id)
        {
            var deleted = await _memberRepository.DeleteAsync(id);
            if (!deleted)
                throw new Exception($"Member with ID {id} not found.");

            await _memberRepository.SaveAsync();
            return true;
        }

        public async Task<MemberDto> RegisterMemberAsync(RegisterMemberDto registerMemberDto)
        {
            var member = new Member
            {
                FirstName = registerMemberDto.FirstName,
                LastName = registerMemberDto.LastName,
                Email = registerMemberDto.Email,
                Phone = registerMemberDto.Phone,
                MembershipNumber = GenerateMembershipNumber(),
                MembershipDate = DateTime.Now,
                MemberType = "Member",
                IsActive = true,
                CreatedDate = DateTime.Now
            };

            await _memberRepository.AddAsync(member);
            await _memberRepository.SaveAsync();

            return MapToDto(member);
        }

        public async Task<IEnumerable<MemberDto>> GetActiveMembersAsync()
        {
            var members = await _memberRepository.GetAllAsync();
            var active = members.Where(m => m.IsActive);
            return active.Select(m => MapToDto(m)).ToList();
        }

        public async Task<MemberDto> GetMemberByEmailAsync(string email)
        {
            var members = await _memberRepository.GetAllAsync();
            var member = members.FirstOrDefault(m => m.Email == email);
            if (member == null)
                throw new Exception($"Member with email {email} not found.");

            return MapToDto(member);
        }

        private string GenerateMembershipNumber()
        {
            return $"MEM-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
        }

        private MemberDto MapToDto(Member member)
        {
            return new MemberDto
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
            };
        }
    }
}