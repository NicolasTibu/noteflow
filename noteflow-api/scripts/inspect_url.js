const requestUrl = 'http://localhost:3000/api/notes/53311279-6de2-480c-b541-5b18f6ae3a5c/checklist-items';
const pathname = new URL(requestUrl).pathname;
const segments = pathname.split('/').filter(Boolean);
console.log(pathname);
console.log(segments);
const notesIndex = segments.indexOf('notes');
console.log('notesIndex', notesIndex, 'id', notesIndex >= 0 && notesIndex + 1 < segments.length ? segments[notesIndex + 1] : undefined);
const checklistIndex = segments.indexOf('checklist-items');
console.log('checklistIndex', checklistIndex, 'itemId', checklistIndex >= 0 && checklistIndex + 1 < segments.length ? segments[checklistIndex + 1] : undefined);
