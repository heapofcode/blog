using app.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace app.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class ArticlesController : ControllerBase
    {
        private readonly Context _context;

        public ArticlesController(Context context)
        {
            _context = context;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Article>>> GetArticles()
        {
            return await _context.Articles.Include(a=>a.Category).Include(b=>b.Tags).ToListAsync();
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<Article>> GetArticle(Guid id)
        {
            var article = await _context.Articles.FindAsync(id);
            if (article == null)
            {
                return NotFound();
            }

            return article;
        }

        [Authorize]
        [HttpPut]
        public async Task<IActionResult> PutArticle([FromBody] Article article)
        {
            if (await _context.Articles.FindAsync(article.Id) == null)
            {
                return BadRequest();
            }

            var _article = await _context.Articles
                .Include(a=>a.Tags)
                .FirstOrDefaultAsync(c => c.Id == article.Id);

            _article.Name = article.Name;
            _article.Description = article.Description;
            _article.ShortDescription = article.ShortDescription;
            _article.HeroImage = article.HeroImage;
            _article.Date = DateTime.Now.ToLocalTime();
            _article.CategoryId = article.Category.Id;

            if (article.Tags.Count() > 0) {
                _article.Tags.Clear();
                _article.Tags = Tags(article.Tags);
            }
            
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ArticleExists(article.Id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> PostPetition(Article article)
        {
            var _article = new Article
            {
                Name = article.Name,
                ShortDescription = article.ShortDescription,
                Description = article.Description,
                HeroImage = article.HeroImage,
                Date = DateTime.Now.ToLocalTime(),
                CategoryId = article.Category.Id
            };

            if (article.Tags !=null) {
                _article.Tags = Tags(article.Tags);
            }

            var add = await _context.Articles.AddAsync(_article);

            if (add.State == EntityState.Added)
            {
                await _context.SaveChangesAsync();
                return CreatedAtAction("GetArticle", new { id = article.Id }, article);
            }

            return NoContent();
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePetition(Guid id)
        {
            var article = await _context.Articles.FindAsync(id);
            
            if (article == null)
            {
                return NotFound();
            }

            _context.Articles.Remove(article);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ArticleExists(Guid? id)
        {
            return _context.Articles.Any(e => e.Id == id);
        }

        private List<Tag> Tags(List<Tag> tags)
        {
            List<Tag> _tags = new List<Tag>();
            tags.ForEach(async x => _tags.Add(await _context.Tags.FindAsync(x.Id)));
            return _tags;
        }
    }
}
