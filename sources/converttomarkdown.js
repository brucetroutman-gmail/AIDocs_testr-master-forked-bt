//  setup for this: npm install pdf-parse turndown js-yaml epub

const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const TurndownService = require('turndown');
const yaml = require('js-yaml');
const EPUB = require('epub');

const turndownService = new TurndownService();

async function convertEpubToMd(filePath) {
  return new Promise((resolve, reject) => {
    const epub = new EPUB(filePath);

    epub.on('error', reject);

    epub.on('end', function() {
      const chapterPromises = epub.flow.map(({id, title}) => {
        return new Promise((resolveChapter, rejectChapter) => {
          epub.getChapter(id, (err, text) => {
            if (err) return rejectChapter(err);
            // Convert HTML/XHTML to Markdown
            let md = `# ${title}\n\n${turndownService.turndown(text)}`;
            resolveChapter(md);
          });
        });
      });

      Promise.all(chapterPromises)
        .then(chaptersMd => resolve(chaptersMd.join('\n\n')))
        .catch(reject);
    });

    epub.parse();
  });
}

async function convertToMarkdown(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.md') {
    return fs.promises.readFile(filePath, 'utf8');
  }
  if (ext === '.txt') {
    return fs.promises.readFile(filePath, 'utf8');
  }
  if (ext === '.pdf') {
    const buffer = await fs.promises.readFile(filePath);
    const data = await pdf(buffer);
    return data.text;
  }
  if (ext === '.html' || ext === '.htm') {
    const html = await fs.promises.readFile(filePath, 'utf8');
    return turndownService.turndown(html);
  }
  if (ext === '.json' || ext === '.yaml' || ext === '.yml') {
    const content = await fs.promises.readFile(filePath, 'utf8');
    let data;
    if (ext === '.json') {
      data = JSON.parse(content);
    } else {
      data = yaml.load(content);
    }
    return '```' + ext.replace('.', '') + '\n' + content + '\n```';
  }
  if (ext === '.epub') {
    return await convertEpubToMd(filePath);
  }
  throw new Error('Unsupported file type: ' + ext);
}

// Usage example with file output:
(async () => {
  if (process.argv.length < 4) {
    console.log('Usage: node convertToMarkdown.js <input_file> <output_file>');
    process.exit(1);
  }

  const inputFile = process.argv[2];
  const outputFile = process.argv[3];

  try {
    const md = await convertToMarkdown(inputFile);
    await fs.promises.writeFile(outputFile, md);
    console.log(`Converted ${inputFile} to ${outputFile}`);
  } catch (err) {
    console.error('Error:', err);
  }
})();
