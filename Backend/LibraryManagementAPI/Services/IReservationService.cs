using LibraryManagementAPI.DTOs;

namespace LibraryManagementAPI.Services
{
    public interface IReservationService
    {
        Task<IEnumerable<ReservationDto>> GetAllReservationsAsync();

        Task<ReservationDto> GetReservationByIdAsync(int id);

        Task<ReservationDto> CreateReservationAsync(CreateReservationDto createReservationDto);

        Task<bool> CancelReservationAsync(CancelReservationDto cancelReservationDto);

        Task<IEnumerable<ReservationDto>> GetActiveReservationsAsync();

        Task<IEnumerable<ReservationDto>> GetReservationsByMemberAsync(int memberId);

        Task<IEnumerable<ReservationDto>> GetReservationsByBookAsync(int bookId);
    }
}