/************************************************************
 * lib/whatsapp/utils/Utils.ts
 * Utilidades compartidas del sistema (TypeScript)
 ************************************************************/

import crypto from 'crypto';

export class Utils {
  /**
   * Verifica si un JID es de conversacion 1:1
   */
  static isOneToOneJid(jid: string = ''): boolean {
    return typeof jid === 'string' && jid.endsWith('@s.whatsapp.net');
  }

  /**
   * Extrae solo digitos de un string
   */
  static digitsOnly(str: string = ''): string {
    return String(str).replace(/\D+/g, '');
  }

  /**
   * Convierte un ID a formato con guiones
   */
  static toDashedId(id: string = ''): string {
    const raw = String(id).replace(/-/g, '');
    if (raw.length !== 32) return id;
    return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
  }

  /**
   * Pausa la ejecucion por un tiempo
   */
  static sleep(ms: number): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
  }

  /**
   * Genera hash SHA1 de un string
   */
  static sha1(s: string = ''): string {
    return crypto.createHash('sha1').update(String(s)).digest('hex');
  }

  /**
   * Agrega jitter a un valor de tiempo
   */
  static jitter(ms: number, factor: number = 0.3): number {
    const delta = Math.floor(ms * factor);
    return ms + (Math.floor(Math.random() * (2 * delta + 1)) - delta);
  }

  /**
   * Sanitiza un nombre de sesion para uso en paths
   */
  static sanitize(s: string): string {
    return String(s).replace(/[^a-z0-9._-]+/gi, '_');
  }

  /**
   * Extrae texto puro de un mensaje de WhatsApp
   */
  static extractPureTextFromMessage(msg: any): string {
    return Utils._extractTextFromContent(msg?.message) || '';
  }

  /**
   * Extrae texto del contenido de un mensaje (recursivo)
   */
  private static _extractTextFromContent(m: any): string {
    if (!m) return '';

    // Basicos
    if (m.conversation) return m.conversation;
    if (m.extendedTextMessage?.text) return m.extendedTextMessage.text;

    // Captions multimedia
    if (m.imageMessage?.caption) return m.imageMessage.caption;
    if (m.videoMessage?.caption) return m.videoMessage.caption;
    if (m.documentMessage?.caption) return m.documentMessage.caption;
    if (m.audioMessage?.caption) return m.audioMessage.caption;
    if (m.stickerMessage?.caption) return m.stickerMessage.caption;

    // Botones / listas / templates
    if (m.buttonsResponseMessage?.selectedDisplayText) return m.buttonsResponseMessage.selectedDisplayText;
    if (m.buttonsResponseMessage?.selectedButtonId) return m.buttonsResponseMessage.selectedButtonId;
    if (m.listResponseMessage?.title) return m.listResponseMessage.title;
    if (m.listResponseMessage?.singleSelectReply?.selectedRowId) return m.listResponseMessage.singleSelectReply.selectedRowId;
    if (m.templateButtonReplyMessage?.selectedDisplayText) return m.templateButtonReplyMessage.selectedDisplayText;
    if (m.templateButtonReplyMessage?.selectedId) return m.templateButtonReplyMessage.selectedId;

    // Productos/catalogo/publicidad Meta
    if (m.productMessage?.product?.title) return m.productMessage.product.title;
    if (m.productMessage?.product?.description) return m.productMessage.product.description;
    if (m.productMessage?.businessOwnerJid) return m.productMessage.caption || m.productMessage.product?.retailerId || '';
    if (m.catalogMessage?.title) return m.catalogMessage.title;
    if (m.catalogMessage?.description) return m.catalogMessage.description;

    // Ordenes/compras
    if (m.orderMessage?.message) return m.orderMessage.message;
    if (m.orderMessage?.itemCount) return `Order: ${m.orderMessage.itemCount} items`;

    // Texto alternativo para enlaces/publicidad
    if (m.extendedTextMessage?.matchedText) return m.extendedTextMessage.matchedText;
    if (m.extendedTextMessage?.canonicalUrl) return m.extendedTextMessage.canonicalUrl;
    if (m.extendedTextMessage?.description) return m.extendedTextMessage.description;
    if (m.extendedTextMessage?.title) return m.extendedTextMessage.title;
    if (m.extendedTextMessage?.previewType) return m.extendedTextMessage.text || '';

    // Encuestas/polls
    if (m.pollCreationMessage?.name) return m.pollCreationMessage.name;
    if (m.pollUpdateMessage?.pollCreationMessageKey) return 'Poll vote';

    // Reacciones
    if (m.reactionMessage?.text) return `Reaction: ${m.reactionMessage.text}`;

    // Contactos
    if (m.contactMessage?.displayName) return `Contact: ${m.contactMessage.displayName}`;
    if (m.contactsArrayMessage?.contacts?.[0]?.displayName) return `Contacts: ${m.contactsArrayMessage.contacts[0].displayName}`;

    // Ubicacion
    if (m.locationMessage?.name) return m.locationMessage.name;
    if (m.locationMessage?.address) return m.locationMessage.address;
    if (m.liveLocationMessage?.caption) return m.liveLocationMessage.caption;

    // Invoices/pagos
    if (m.invoiceMessage?.note) return m.invoiceMessage.note;
    if (m.invoiceMessage?.caption) return m.invoiceMessage.caption;

    // Mensajes interactivos WhatsApp Business
    if (m.interactiveMessage?.header?.title) return m.interactiveMessage.header.title;
    if (m.interactiveMessage?.body?.text) return m.interactiveMessage.body.text;
    if (m.interactiveMessage?.footer?.text) return m.interactiveMessage.footer.text;
    if (m.interactiveMessage?.nativeFlowMessage?.messageParamsJson) {
      try {
        const params = JSON.parse(m.interactiveMessage.nativeFlowMessage.messageParamsJson);
        if (params?.text) return params.text;
      } catch {}
    }

    // Wrappers recursivos
    if (m.ephemeralMessage?.message) return Utils._extractTextFromContent(m.ephemeralMessage.message);
    if (m.viewOnceMessage?.message) return Utils._extractTextFromContent(m.viewOnceMessage.message);
    if (m.viewOnceMessageV2?.message) return Utils._extractTextFromContent(m.viewOnceMessageV2.message);
    if (m.viewOnceMessageV2Extension?.message) return Utils._extractTextFromContent(m.viewOnceMessageV2Extension.message);
    if (m.editedMessage?.message) return Utils._extractTextFromContent(m.editedMessage.message);
    if (m.documentWithCaptionMessage?.message) return Utils._extractTextFromContent(m.documentWithCaptionMessage.message);
    if (m.deviceSentMessage?.message) return Utils._extractTextFromContent(m.deviceSentMessage.message);
    if (m.messageContextInfo?.deviceListMetadataVersion && m.conversation) return m.conversation;

    // Fallbacks genericos
    if (m.text) return m.text;
    if (m.caption) return m.caption;
    if (m.message) return Utils._extractTextFromContent(m.message);

    return '';
  }
}

export default Utils;
