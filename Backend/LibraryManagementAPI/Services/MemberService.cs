using LibraryManagementAPI.DTOs;
using LibraryManagementAPI.Models;
using LibraryManagementAPI.Repositories;
using System.Security.Cryptography;
using System.Text;

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
            if (updateMemberDto.IsActive.HasValue)
            {
                member.IsActive = updateMemberDto.IsActive.Value;
            }

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
                CreatedDate = DateTime.Now,
                PasswordHash = HashPassword(registerMemberDto.Password)
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

        private string HashPassword(string password)
        {
            using var rng = RandomNumberGenerator.Create();
            var salt = new byte[16];
            rng.GetBytes(salt);

            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000, HashAlgorithmName.SHA256);
            var hash = pbkdf2.GetBytes(20);

            var hashWithSalt = new byte[36];
            Array.Copy(salt, 0, hashWithSalt, 0, 16);
            Array.Copy(hash, 0, hashWithSalt, 16, 20);

            return Convert.ToBase64String(hashWithSalt);
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