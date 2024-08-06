export interface EmailOptions {
    to: string | string[];
    subject: string;
    templateName: string;
    context: EmailContext;
  }
  
  export interface EmailContext {
    [key: string]: any;
  }
  