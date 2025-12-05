import fs from 'fs';
import path from 'path';

/**
 * Verifica si existe una sesión válida de WhatsApp (credenciales guardadas)
 */
export function hasValidSession(sessionId: string): boolean {
  try {
    const authFolder = path.join(process.cwd(), 'auth-ts', sessionId);

    if (!fs.existsSync(authFolder)) {
      return false;
    }

    // Verificar que existan archivos de credenciales (creds.json es el principal)
    const credsFile = path.join(authFolder, 'creds.json');
    if (!fs.existsSync(credsFile)) {
      return false;
    }

    // Verificar que el archivo tenga contenido válido
    const content = fs.readFileSync(credsFile, 'utf-8');
    const creds = JSON.parse(content);
    // Si tiene me.id significa que la sesión fue autenticada alguna vez
    return !!(creds && creds.me && creds.me.id);
  } catch {
    return false;
  }
}
