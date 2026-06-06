export function getRouteParam(
  request: Request,
  context: { params?: Record<string, any> },
  name: string
): string | undefined {
  const contextParam = context?.params?.[name];
  if (contextParam) {
    return contextParam;
  }

  const pathname = new URL(request.url).pathname;
  const segments = pathname.split('/').filter(Boolean);

  if (name === 'id') {
    const notesIndex = segments.indexOf('notes');
    if (notesIndex >= 0 && notesIndex + 1 < segments.length) {
      return segments[notesIndex + 1];
    }

    if (segments.length) {
      return segments[segments.length - 1];
    }
  }

  if (name === 'itemId') {
    const checklistIndex = segments.indexOf('checklist-items');
    if (checklistIndex >= 0 && checklistIndex + 1 < segments.length) {
      return segments[checklistIndex + 1];
    }

    if (segments.length) {
      return segments[segments.length - 1];
    }
  }

  return undefined;
}
