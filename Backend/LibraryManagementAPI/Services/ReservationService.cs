using LibraryManagementAPI.DTOs;
using LibraryManagementAPI.Models;
using LibraryManagementAPI.Repositories;

namespace LibraryManagementAPI.Services
{
    public class ReservationService : IReservationService
    {
        private readonly IRepository<Reservation> _reservationRepository;
        private readonly IRepository<Book> _bookRepository;
        private readonly IRepository<Member> _memberRepository;
        private const int RESERVATION_VALIDITY_DAYS = 7;

        public ReservationService(
            IRepository<Reservation> reservationRepository,
            IRepository<Book> bookRepository,
            IRepository<Member> memberRepository)
        {
            _reservationRepository = reservationRepository;
            _bookRepository = bookRepository;
            _memberRepository = memberRepository;
        }

        public async Task<IEnumerable<ReservationDto>> GetAllReservationsAsync()
        {
            var reservations = await _reservationRepository.GetAllAsync();
            return reservations.Select(r => MapToDto(r)).ToList();
        }

        public async Task<ReservationDto> GetReservationByIdAsync(int id)
        {
            var reservation = await _reservationRepository.GetByIdAsync(id);
            if (reservation == null)
                throw new Exception($"Reservation with ID {id} not found.");

            return MapToDto(reservation);
        }

        public async Task<ReservationDto> CreateReservationAsync(CreateReservationDto createReservationDto)
        {
            var book = await _bookRepository.GetByIdAsync(createReservationDto.BookId);
            if (book == null)
                throw new Exception($"Book with ID {createReservationDto.BookId} not found.");

            var member = await _memberRepository.GetByIdAsync(createReservationDto.MemberId);
            if (member == null)
                throw new Exception($"Member with ID {createReservationDto.MemberId} not found.");

            var reservation = new Reservation
            {
                BookId = createReservationDto.BookId,
                MemberId = createReservationDto.MemberId,
                ReservationDate = DateTime.Now,
                ReservationExpiryDate = DateTime.Now.AddDays(RESERVATION_VALIDITY_DAYS),
                Status = "Active",
                CreatedDate = DateTime.Now
            };

            await _reservationRepository.AddAsync(reservation);
            await _reservationRepository.SaveAsync();

            return MapToDto(reservation);
        }

        public async Task<bool> CancelReservationAsync(CancelReservationDto cancelReservationDto)
        {
            var reservation = await _reservationRepository.GetByIdAsync(cancelReservationDto.ReservationId);
            if (reservation == null)
                throw new Exception($"Reservation with ID {cancelReservationDto.ReservationId} not found.");

            reservation.Status = "Cancelled";

            await _reservationRepository.UpdateAsync(reservation);
            await _reservationRepository.SaveAsync();

            return true;
        }

        public async Task<IEnumerable<ReservationDto>> GetActiveReservationsAsync()
        {
            var reservations = await _reservationRepository.GetAllAsync();
            var active = reservations.Where(r => r.Status == "Active" && r.ReservationExpiryDate > DateTime.Now);
            return active.Select(r => MapToDto(r)).ToList();
        }

        public async Task<IEnumerable<ReservationDto>> GetReservationsByMemberAsync(int memberId)
        {
            var reservations = await _reservationRepository.GetAllAsync();
            var memberReservations = reservations.Where(r => r.MemberId == memberId);
            return memberReservations.Select(r => MapToDto(r)).ToList();
        }

        public async Task<IEnumerable<ReservationDto>> GetReservationsByBookAsync(int bookId)
        {
            var reservations = await _reservationRepository.GetAllAsync();
            var bookReservations = reservations.Where(r => r.BookId == bookId);
            return bookReservations.Select(r => MapToDto(r)).ToList();
        }

        private ReservationDto MapToDto(Reservation reservation)
        {
            return new ReservationDto
            {
                ReservationId = reservation.ReservationId,
                BookId = reservation.BookId,
                MemberId = reservation.MemberId,
                BookTitle = reservation.Book?.Title ?? "N/A",
                MemberName = $"{reservation.Member?.FirstName} {reservation.Member?.LastName}" ?? "N/A",
                ReservationDate = reservation.ReservationDate,
                ReservationExpiryDate = reservation.ReservationExpiryDate,
                Status = reservation.Status
            };
        }
    }
}