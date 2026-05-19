namespace LibraryManagementAPI.Repositories
{
    public interface IRepository<T> where T : class
    {
        // Read operations
        Task<IEnumerable<T>> GetAllAsync();
        Task<T> GetByIdAsync(int id);

        // Create operation
        Task<T> AddAsync(T entity);

        // Update operation
        Task<T> UpdateAsync(T entity);

        // Delete operation
        Task<bool> DeleteAsync(int id);

        // Save to database
        Task<bool> SaveAsync();
    }
}