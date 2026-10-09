const fs = require('fs');
const path = require('path');

// Target files with Bengali content
const targetFiles = [
  'src/app/api/admin/clear-demo/route.ts',
  'src/app/api/admin/delete/route.ts',
  'src/app/dashboard/admin/page.tsx',
  'src/app/dashboard/organizer/page.tsx',
  'src/app/not-found.tsx',
  'src/app/organizer/auth/page.tsx',
  'src/app/organizer/callback/page.tsx',
  'src/app/organizer/setup/page.tsx',
  'src/app/page.tsx',
  'src/app/vote/[committeeId]/page.tsx',
  'src/components/layout/Footer.tsx',
  'src/components/layout/Navbar.tsx',
  'src/components/organizer/OrganizerDashboard.tsx',
  'src/components/voter/LiveLeaderboard.tsx',
  'src/components/voter/MyVotesView.tsx',
  'src/data/mockPandals.ts'
];

// Regex for Bengali Unicode block: U+0980 to U+09FF
const bengaliCharRegex = /[\u0980-\u09FF]/;

// Regex matching complete coherent Bengali phrases (including Bengali chars, ZWJ \u200D, ZWNJ \u200C, and internal punctuation/spaces)
const bengaliPhraseRegex = /[\u0980-\u09FF\u200C\u200D]+(?:[\u0020\t,।!?—\-\–\:\'\"•\/]+[\u0980-\u09FF\u200C\u200D]+)*/g;

const reportData = [];
const uniqueBengaliPhrases = new Set();
let totalOccurrences = 0;

targetFiles.forEach(fileRelPath => {
  const fullPath = path.resolve(__dirname, '..', fileRelPath);
  if (!fs.existsSync(fullPath)) return;

  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');

  const fileEntries = [];

  lines.forEach((line, index) => {
    if (bengaliCharRegex.test(line)) {
      const lineNum = index + 1;
      const trimmedLine = line.trim();

      // Extract all Bengali text segments from this line
      const rawMatches = trimmedLine.match(bengaliPhraseRegex) || [];
      const cleanMatches = rawMatches
        .map(m => m.trim().replace(/^[,।!?—\-\–\:\'\"•\/]+|[,।!?—\-\–\:\'\"•\/]+$/g, '').trim())
        .filter(m => bengaliCharRegex.test(m) && m.length > 0);

      cleanMatches.forEach(phrase => {
        uniqueBengaliPhrases.add(phrase);
      });

      fileEntries.push({
        lineNum,
        phrases: cleanMatches,
        context: trimmedLine
      });

      totalOccurrences += cleanMatches.length;
    }
  });

  if (fileEntries.length > 0) {
    reportData.push({
      filePath: fileRelPath.replace(/\\/g, '/'),
      entries: fileEntries
    });
  }
});

console.log(`Scanned ${reportData.length} files.`);
console.log(`Extracted ${totalOccurrences} total phrase occurrences.`);
console.log(`Found ${uniqueBengaliPhrases.size} unique Bengali phrases.`);

// Generate bengali-text-review.md
let md = `# Bengali Text Extraction & Review Document\n\n`;
md += `> **Generated**: ${new Date().toISOString()}\n`;
md += `> **Scope**: Entire codebase (\`src/app\`, \`src/components\`, \`src/data\`, \`src/api\`)\n`;
md += `> **Regex Pattern**: Bengali Unicode Block (\`/[\\u0980-\\u09FF]+/\`)\n`;
md += `> **Total Files Scanned**: ${reportData.length}\n`;
md += `> **Total Bengali Occurrences**: ${totalOccurrences}\n`;
md += `> **Unique Bengali Phrases**: ${uniqueBengaliPhrases.size}\n\n`;

md += `This document contains the complete extraction of all hardcoded Bengali text, UI labels, toasts, form field instructions, modal alerts, and header texts across the application. You can review the strings directly by file, or copy from the aggregated list at the end.\n\n`;

md += `## Table of Contents\n\n`;
reportData.forEach((file, idx) => {
  const anchor = file.filePath.toLowerCase().replace(/[^a-z0-9]/g, '-');
  md += `${idx + 1}. [${file.filePath}](#${anchor}) (${file.entries.length} lines with Bengali text)\n`;
});
md += `${reportData.length + 1}. [Master List of All Unique Bengali Phrases (${uniqueBengaliPhrases.size} items)](#master-list-of-all-unique-bengali-phrases)\n\n`;

md += `---\n\n`;

md += `## File-by-File Detailed Extraction\n\n`;

reportData.forEach((file, fileIdx) => {
  const anchor = file.filePath.toLowerCase().replace(/[^a-z0-9]/g, '-');
  md += `### <a id="${anchor}"></a>${fileIdx + 1}. \`${file.filePath}\`\n\n`;
  md += `- **Lines Containing Bengali:** ${file.entries.length}\n\n`;
  md += `| Line | Extracted Bengali Text | Code Context |\n`;
  md += `| :--- | :--- | :--- |\n`;

  file.entries.forEach(entry => {
    const extractedFormatted = entry.phrases.map(p => `**${p}**`).join(' <br> ');
    // Escape pipes in code context to preserve markdown table formatting
    const escapedContext = entry.context
      .replace(/\|/g, '\\|')
      .replace(/`/g, "'");

    md += `| Line ${entry.lineNum} | ${extractedFormatted} | \`${escapedContext}\` |\n`;
  });

  md += `\n---\n\n`;
});

md += `## Master List of All Unique Bengali Phrases\n\n`;
md += `Below is a clean, numbered list of all unique Bengali phrases and text snippets extracted from across the codebase, ready for copy-pasting and linguistic verification:\n\n`;

const sortedPhrases = Array.from(uniqueBengaliPhrases).sort((a, b) => a.localeCompare(b, 'bn'));

sortedPhrases.forEach((phrase, i) => {
  md += `${i + 1}. ${phrase}\n`;
});

md += `\n`;

const outputPath = path.resolve(__dirname, '..', 'bengali-text-review.md');
fs.writeFileSync(outputPath, md, 'utf8');
console.log(`Successfully generated ${outputPath}`);
