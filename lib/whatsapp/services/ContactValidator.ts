/************************************************************
 * lib/whatsapp/services/ContactValidator.ts
 * Validador de elegibilidad de contactos (TypeScript)
 ************************************************************/

import { Contact } from '../models/Contact';
import type { Contact as ContactType } from '../types';

export class ContactValidator {
  // Nombres permitidos para secuencias automáticas (case-insensitive, parcial)
  private allowedNames: string[] = ['fran'];

  /**
   * Verifica si un contacto es elegible para secuencias automaticas
   */
  isEligibleForAutoSequence(contact: ContactType | null): boolean {
    // Si no hay contacto, NO permitir (necesitamos verificar el nombre)
    if (!contact) return false;

    // Verificar que el nombre contenga alguno de los permitidos
    if (!this.hasAllowedName(contact)) {
      return false;
    }

    // Verificar edad del contacto (menos de 24h)
    if (Contact.isOlderThanOneDay(contact)) {
      return false;
    }

    return true;
  }

  /**
   * Verifica si el nombre del contacto contiene alguno de los nombres permitidos
   */
  hasAllowedName(contact: ContactType | null): boolean {
    if (!contact?.name) return false;

    const contactName = contact.name.toLowerCase().trim();
    return this.allowedNames.some((allowed) => contactName.includes(allowed.toLowerCase()));
  }

  /**
   * Configura los nombres permitidos para secuencias
   */
  setAllowedNames(names: string[]): void {
    this.allowedNames = names;
  }

  /**
   * Verifica si un contacto tiene mas de 1 dia de creacion
   */
  isOlderThanOneDay(contact: ContactType | null): boolean {
    return Contact.isOlderThanOneDay(contact);
  }
}

export default ContactValidator;
