using Mission11_Bennett.Models;
using Microsoft.AspNetCore.Mvc;

namespace Mission11_Bennett.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly BookstoreContext _context;

        public BooksController(BookstoreContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IEnumerable<Book> Get()
        {
            return _context.Books.ToArray(); 
        }
    }
}