using Mission11_Bennett.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// CORS: list exact frontend origins in appsettings — no trailing slashes (required for Azure Static Web Apps).
var corsOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>()
    ?.Where(static o => !string.IsNullOrWhiteSpace(o))
    .Select(static o => o.TrimEnd('/'))
    .Distinct()
    .ToArray() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        if (corsOrigins.Length == 0)
        {
            policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
        }
        else
        {
            policy.WithOrigins(corsOrigins).AllowAnyMethod().AllowAnyHeader();
        }
    });
});

builder.Services.AddDbContext<BookstoreContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("BookstoreConnection") ?? "Data Source=Bookstore.sqlite"));

var app = builder.Build();

app.UseCors("CorsPolicy");
app.UseAuthorization();
app.MapControllers();
app.Run();
