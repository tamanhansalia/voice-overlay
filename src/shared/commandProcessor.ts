export type CommandAction = 
  | { type: 'delete-last-word' }
  | { type: 'delete-last-sentence' }
  | { type: 'send' }
  | { type: 'fix-grammar'; text: string }
  | { type: 'describe-screen' }
  | { type: 'none' };

export function processCommand(text: string, mode: 'prefix' | 'always' = 'prefix'): CommandAction {
  const lower = text.toLowerCase().trim();
  
  if (mode === 'prefix') {
    // Only return a command if the text starts with "hey orb" or "hey orp"
    if (!lower.startsWith('hey orb') && !lower.startsWith('hey orp')) {
      return { type: 'none' };
    }
  }

  if (lower.includes('delete last word')) {
    return { type: 'delete-last-word' };
  }
  
  if (lower.includes('delete last sentence') || lower.includes('delete that')) {
    return { type: 'delete-last-sentence' };
  }

  if (lower.includes('send') || lower.includes('submit')) {
    return { type: 'send' };
  }

  if (lower.includes('describe this') || lower.includes('dictate about this') || lower.includes('what is this')) {
    return { type: 'describe-screen' };
  }

  if (lower.includes('fix grammar') || lower.includes('correct this')) {
    // Extract the text to fix if it's part of the command, 
    // or we might need to fix the *previous* injection.
    // For now, let's assume it's a command to fix the preceding context.
    return { type: 'fix-grammar', text: '' };
  }

  return { type: 'none' };
}
