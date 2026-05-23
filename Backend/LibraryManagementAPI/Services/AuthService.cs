using LibraryManagementAPI.DTOs;
using LibraryManagementAPI.Models;
using LibraryManagementAPI.Repositories;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;

namespace LibraryManagementAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly IRepository<Member> _memberRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IRepository<Member> memberRepository, IConfiguration configuration)
        {
            _memberRepository = memberRepository;
            _configuration = configuration;
        }

        public async Task<LoginResponseDto> LoginAsync(LoginDto loginDto)
        {
            var members = await _memberRepository.GetAllAsync();
            var member = members.FirstOrDefault(m => m.Email == loginDto.Email);

            if (member == null)
                throw new Exception("Invalid email or password.");

            if (member.MemberType == "Admin" && member.PasswordHash == loginDto.Password)
            {
                var token = GenerateJwtToken(member);
                return new LoginResponseDto
                {
                    MemberId = member.MemberId,
                    FirstName = member.FirstName,
                    LastName = member.LastName,
                    Email = member.Email,
                    MemberType = member.MemberType,
                    Token = token
                };
            }

            if (!VerifyPassword(loginDto.Password, member.PasswordHash))
                throw new Exception("Invalid email or password.");

            if (!member.IsActive)
                throw new Exception("Member account is inactive.");

            var token2 = GenerateJwtToken(member);

            return new LoginResponseDto
            {
                MemberId = member.MemberId,
                FirstName = member.FirstName,
                LastName = member.LastName,
                Email = member.Email,
                MemberType = member.MemberType,
                Token = token2
            };
        }

        public async Task<MemberDto> RegisterAsync(RegisterDto registerDto)
        {
            var members = await _memberRepository.GetAllAsync();
            if (members.Any(m => m.Email == registerDto.Email))
                throw new Exception("Email already registered.");

            var member = new Member
            {
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                Email = registerDto.Email,
                Phone = registerDto.Phone,
                MembershipNumber = GenerateMembershipNumber(),
                MembershipDate = DateTime.Now,
                MemberType = "Member",
                IsActive = true,
                CreatedDate = DateTime.Now,
                PasswordHash = HashPassword(registerDto.Password)
            };

            await _memberRepository.AddAsync(member);
            await _memberRepository.SaveAsync();

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

        public async Task<MemberDto> ChangePasswordAsync(int memberId, ChangePasswordDto changePasswordDto)
        {
            var member = await _memberRepository.GetByIdAsync(memberId);

            if (member == null)
                throw new Exception("Member not found.");

            if (changePasswordDto.NewPassword != changePasswordDto.ConfirmPassword)
                throw new Exception("Passwords do not match.");

            if (!VerifyPassword(changePasswordDto.OldPassword, member.PasswordHash))
                throw new Exception("Current password is incorrect.");

            member.PasswordHash = HashPassword(changePasswordDto.NewPassword);

            await _memberRepository.UpdateAsync(member);
            await _memberRepository.SaveAsync();

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

        private string HashPassword(string password)
        {
            using (var rng = new RNGCryptoServiceProvider())
            {
                byte[] salt = new byte[16];
                rng.GetBytes(salt);

                var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000, HashAlgorithmName.SHA256);
                byte[] hash = pbkdf2.GetBytes(20);

                byte[] hashWithSalt = new byte[36];
                Array.Copy(salt, 0, hashWithSalt, 0, 16);
                Array.Copy(hash, 0, hashWithSalt, 16, 20);

                return Convert.ToBase64String(hashWithSalt);
            }
        }

        private bool VerifyPassword(string password, string hash)
        {
            byte[] hashWithSalt = Convert.FromBase64String(hash);
            byte[] salt = new byte[16];
            Array.Copy(hashWithSalt, 0, salt, 0, 16);

            var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000, HashAlgorithmName.SHA256);
            byte[] computedHash = pbkdf2.GetBytes(20);

            for (int i = 0; i < 20; i++)
            {
                if (hashWithSalt[i + 16] != computedHash[i])
                    return false;
            }
            return true;
        }

        private string GenerateJwtToken(Member member)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: new[]
                {
                    new System.Security.Claims.Claim("id", member.MemberId.ToString()),
                    new System.Security.Claims.Claim("email", member.Email),
                    new System.Security.Claims.Claim("role", member.MemberType)
                },
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateMembershipNumber()
        {
            return $"MEM-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
        }
    }
}