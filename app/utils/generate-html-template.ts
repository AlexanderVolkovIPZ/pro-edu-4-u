import fs from 'fs';
import path from 'path';

type Replacements = {
  key: string;
  value: string;
}[];

export function generateHtmlTemplate(templatePath: string, replacements: Replacements = []) {
  const rootPath = process.cwd();

  const filePath = path.resolve(rootPath, templatePath);

  let template = fs.readFileSync(filePath, 'utf8');

  for (const replacement of replacements) {
    template = template.replace(new RegExp(`\\{\\{\\$${replacement.key}\\}\\}`, 'g'), replacement.value);
  }

  return template;
}
