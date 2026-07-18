import { getDocsClient } from './google';
import { MOCK_DOCS } from './mockData';

export interface ParsedDoc {
  title: string;
  html: string;
}

export async function getGoogleDoc(documentId: string, sectionId?: string): Promise<ParsedDoc> {
  const normId = documentId.trim();
  let html = '';
  let title = 'Untitled Document';

  if (MOCK_DOCS[normId]) {
    html = MOCK_DOCS[normId];
    title = 'Mock Document';
  } else {
    try {
      const docs = await getDocsClient();
      const response = await docs.documents.get({ documentId });
      const doc = response.data;
      
      title = doc.title || 'Untitled Document';
      const inlineObjects = doc.inlineObjects || {};
      
      const bodyContent = doc.body?.content || [];

      for (const element of bodyContent) {
        if (element.paragraph) {
          html += parseParagraph(element.paragraph, inlineObjects);
        } else if (element.table) {
          html += parseTable(element.table, inlineObjects);
        }
      }
    } catch (err: any) {
      console.error('Error fetching Google Doc:', err);
      throw err;
    }
  }

  // Section extractor: if sectionId is passed, parse the document text
  if (sectionId) {
    const cleanSectionId = sectionId.toLowerCase().trim();
    const markerRegex = new RegExp(`\\[${cleanSectionId}\\]`, 'i');
    
    if (markerRegex.test(html)) {
      const parts = html.split(markerRegex);
      if (parts.length > 1) {
        const sectionContent = parts[1];
        // Section ends at the next bracket marker [other_id] or horizontal line rule <hr> or ---
        const endMatch = sectionContent.match(/\[[a-zA-Z0-9_-]+\]|<hr>|---/);
        if (endMatch && endMatch.index !== undefined) {
          html = sectionContent.substring(0, endMatch.index);
        } else {
          html = sectionContent;
        }
      }
    }
  }

  return { title, html };
}

function parseParagraph(paragraph: any, inlineObjects: any): string {
  const style = paragraph.paragraphStyle?.namedStyleType || 'NORMAL_TEXT';
  const elements = paragraph.elements || [];
  
  let contentHtml = '';
  for (const el of elements) {
    if (el.textRun) {
      let text = el.textRun.content || '';
      const textStyle = el.textRun.textStyle || {};
      
      // Escape HTML characters
      text = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      if (textStyle.bold) text = `<strong>${text}</strong>`;
      if (textStyle.italic) text = `<em>${text}</em>`;
      if (textStyle.underline) text = `<u>${text}</u>`;
      if (textStyle.strikethrough) text = `<del>${text}</del>`;
      
      if (textStyle.link?.url) {
        text = `<a href="${textStyle.link.url}" target="_blank" rel="noopener noreferrer" class="text-amber-600 hover:underline">${text}</a>`;
      }
      
      contentHtml += text;
    } else if (el.inlineObjectElement) {
      const objId = el.inlineObjectElement.inlineObjectId;
      const obj = inlineObjects[objId];
      if (obj) {
        const embeddedObj = obj.inlineObjectProperties?.embeddedObject;
        const imgUri = embeddedObj?.imageProperties?.contentUri;
        const title = embeddedObj?.title || 'Embedded Image';
        const description = embeddedObj?.description || '';
        
        if (imgUri) {
          contentHtml += `<div class="my-4 flex flex-col items-center"><img src="${imgUri}" alt="${title}" class="max-w-full rounded-md shadow-sm" /><span class="text-xs text-neutral-500 mt-1">${description || title}</span></div>`;
        }
      }
    }
  }

  // Handle bullet list and numbered lists
  const bullet = paragraph.bullet;
  if (bullet) {
    // We treat list items as simple <li> components wrapped in a paragraph style for now.
    // For simplicity, we can output <li> content.
    return `<li class="ml-6 list-disc my-1 text-neutral-700 dark:text-neutral-300">${contentHtml}</li>`;
  }

  // Map paragraphs to appropriate HTML tags
  switch (style) {
    case 'TITLE':
      return `<h1 class="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 my-6 font-serif">${contentHtml}</h1>`;
    case 'SUBTITLE':
      return `<p class="text-xl text-neutral-500 dark:text-neutral-400 mb-6 font-serif italic">${contentHtml}</p>`;
    case 'HEADING_1':
      return `<h2 class="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mt-8 mb-4 border-b pb-2 font-serif">${contentHtml}</h2>`;
    case 'HEADING_2':
      return `<h3 class="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mt-6 mb-3 font-serif">${contentHtml}</h3>`;
    case 'HEADING_3':
      return `<h4 class="text-lg font-medium text-neutral-700 dark:text-neutral-300 mt-4 mb-2 font-serif">${contentHtml}</h4>`;
    default:
      if (!contentHtml.trim()) return ''; // Skip empty lines
      return `<p class="text-base leading-7 text-neutral-700 dark:text-neutral-300 mb-4 font-serif">${contentHtml}</p>`;
  }
}

function parseTable(table: any, inlineObjects: any): string {
  const rows = table.tableRows || [];
  let tableHtml = '<div class="overflow-x-auto my-6"><table class="min-w-full border-collapse border border-neutral-300 dark:border-neutral-700">';
  
  rows.forEach((row: any) => {
    tableHtml += '<tr>';
    const cells = row.tableCells || [];
    cells.forEach((cell: any) => {
      tableHtml += '<td class="border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300">';
      const cellContent = cell.content || [];
      cellContent.forEach((element: any) => {
        if (element.paragraph) {
          tableHtml += parseParagraph(element.paragraph, inlineObjects);
        }
      });
      tableHtml += '</td>';
    });
    tableHtml += '</tr>';
  });

  tableHtml += '</table></div>';
  return tableHtml;
}
