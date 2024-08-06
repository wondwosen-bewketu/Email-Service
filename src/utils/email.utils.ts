import { compile } from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';

const templatesPath = join(__dirname, '../templates');

export const loadTemplate = (templateName: string): string => {
  try {
    const filePath = join(templatesPath, `${templateName}.hbs`);
    return readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Template ${templateName} not found.`);
  }
};

export const compileTemplate = (templateName: string, context: any): string => {
  const templateString = loadTemplate(templateName);
  const template = compile(templateString);
  return template(context);
};
