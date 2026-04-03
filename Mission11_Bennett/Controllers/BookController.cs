using Mission11_Bennett.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Mission11_Bennett.Controllers;

// Handles CRUD operations for books in the bookstore database
[Route("api/[controller]")]
[ApiController]
public class BooksController : ControllerBase
{
    private readonly BookstoreContext _context;

    public BooksController(BookstoreContext context)
    {
        _context = context;
    }

    // GET /api/books - returns all books from the database
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Book>>> Get()
    {
        return await _context.Books.AsNoTracking().ToListAsync();
    }

    // POST /api/books - adds a new book to the database
    [HttpPost]
    public async Task<ActionResult<Book>> Post([FromBody] Book book)
    {
        book.BookId = 0; // force auto-increment, ignore any id sent from client
        _context.Books.Add(book);
        await _context.SaveChangesAsync();
        return Created($"/api/books/{book.BookId}", book);
    }

    // PUT /api/books/{id} - updates an existing book by id
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Put(int id, [FromBody] Book book)
    {
        if (id != book.BookId)
            return BadRequest("Route id must match bookId in body.");

        var exists = await _context.Books.AnyAsync(b => b.BookId == id);
        if (!exists)
            return NotFound();

        _context.Books.Update(book);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/books/{id} - removes a book from the database by id
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var book = await _context.Books.FindAsync(id);
        if (book == null)
            return NotFound();

        _context.Books.Remove(book);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
