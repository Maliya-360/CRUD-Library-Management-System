using LibraryManagementAPI.DTOs;
using LibraryManagementAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionService _transactionService;

        public TransactionsController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TransactionDto>>> GetAllTransactions()
        {
            try
            {
                var transactions = await _transactionService.GetAllTransactionsAsync();
                return Ok(transactions);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TransactionDto>> GetTransactionById(int id)
        {
            try
            {
                var transaction = await _transactionService.GetTransactionByIdAsync(id);
                return Ok(transaction);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
 
        [HttpPost("issue")]
        public async Task<ActionResult<TransactionDto>> IssueBook([FromBody] IssueBookDto issueBookDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var transaction = await _transactionService.IssueBookAsync(issueBookDto);
                return CreatedAtAction(nameof(GetTransactionById), new { id = transaction.TransactionId }, transaction);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("return")]
        public async Task<ActionResult<TransactionDto>> ReturnBook([FromBody] ReturnBookDto returnBookDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var transaction = await _transactionService.ReturnBookAsync(returnBookDto);
                return Ok(transaction);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<TransactionDto>>> GetPendingTransactions()
        {
            try
            {
                var transactions = await _transactionService.GetPendingTransactionsAsync();
                return Ok(transactions);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("member/{memberId}")]
        public async Task<ActionResult<IEnumerable<TransactionDto>>> GetTransactionsByMember(int memberId)
        {
            try
            {
                var transactions = await _transactionService.GetTransactionsByMemberAsync(memberId);
                return Ok(transactions);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("fine/{transactionId}")]
        public async Task<ActionResult<decimal>> CalculateFine(int transactionId)
        {
            try
            {
                var fine = await _transactionService.CalculateFineAsync(transactionId);
                return Ok(new { fine = fine });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}