/************************************************************
 * lib/whatsapp/utils/MessageProcessor.ts
 * Procesador de mensajes de WhatsApp (TypeScript)
 ************************************************************/

import { Utils } from './Utils';
import type { ProcessedMessage } from '../types';

export class MessageProcessor {
  /**
   * Procesa un mensaje de WhatsApp para extraer informacion util
   */
  static process(msg: any): ProcessedMessage | null {
    if (!msg || !msg.key) return null;
    if (msg.key.fromMe) return null;

    const jid = msg.key.remoteJid || '';
    if (!jid.endsWith('@s.whatsapp.net')) return null;
    if (!msg.message) return null;

    const text = this._extractPureTextFromMessage(msg.message);
    const cleanText = String(text || '').trim();
    if (!cleanText) return null;

    const phoneDigits = Utils.digitsOnly(jid.split('@')[0]);
    const tsMs = (Number(msg.messageTimestamp || 0) * 1000) || Date.now();

    return { phoneDigits, text: cleanText, tsMs };
  }

  /**
   * Extrae texto puro de un mensaje
   */
  private static _extractPureTextFromMessage(m: any): string {
    if (!m) return '';

    // Textos basicos
    if (m.conversation) return m.conversation;
    if (m.extendedTextMessage?.text) return m.extendedTextMessage.text;

    // Captions de medios
    if (m.imageMessage?.caption) return m.imageMessage.caption;
    if (m.videoMessage?.caption) return m.videoMessage.caption;
    if (m.documentMessage?.caption) return m.documentMessage.caption;
    if (m.audioMessage?.caption) return m.audioMessage.caption;
    if (m.stickerMessage?.caption) return m.stickerMessage.caption;

    // Botones y respuestas interactivas
    if (m.buttonsResponseMessage?.selectedDisplayText) return m.buttonsResponseMessage.selectedDisplayText;
    if (m.buttonsResponseMessage?.selectedButtonId) return m.buttonsResponseMessage.selectedButtonId;
    if (m.listResponseMessage?.title) return m.listResponseMessage.title;
    if (m.listResponseMessage?.singleSelectReply?.selectedRowId) return m.listResponseMessage.singleSelectReply.selectedRowId;
    if (m.templateButtonReplyMessage?.selectedDisplayText) return m.templateButtonReplyMessage.selectedDisplayText;
    if (m.templateButtonReplyMessage?.selectedId) return m.templateButtonReplyMessage.selectedId;

    // Mensajes de productos/catalogo
    if (m.productMessage?.product?.title) return m.productMessage.product.title;
    if (m.productMessage?.product?.description) return m.productMessage.product.description;
    if (m.productMessage?.businessOwnerJid) return m.productMessage.caption || m.productMessage.product?.retailerId || '';
    if (m.catalogMessage?.title) return m.catalogMessage.title;
    if (m.catalogMessage?.description) return m.catalogMessage.description;

    // Mensajes de orden/compra
    if (m.orderMessage?.message) return m.orderMessage.message;
    if (m.orderMessage?.itemCount) return `Order: ${m.orderMessage.itemCount} items`;

    // Mensajes con texto alternativo
    if (m.extendedTextMessage?.matchedText) return m.extendedTextMessage.matchedText;
    if (m.extendedTextMessage?.canonicalUrl) return m.extendedTextMessage.canonicalUrl;
    if (m.extendedTextMessage?.description) return m.extendedTextMessage.description;
    if (m.extendedTextMessage?.title) return m.extendedTextMessage.title;
    if (m.extendedTextMessage?.previewType) return m.extendedTextMessage.text || '';

    // Mensajes de encuestas/polls
    if (m.pollCreationMessage?.name) return m.pollCreationMessage.name;
    if (m.pollUpdateMessage?.pollCreationMessageKey) return 'Poll vote';

    // Mensajes de reacciones
    if (m.reactionMessage?.text) return `Reaction: ${m.reactionMessage.text}`;

    // Mensajes de contacto
    if (m.contactMessage?.displayName) return `Contact: ${m.contactMessage.displayName}`;
    if (m.contactsArrayMessage?.contacts?.[0]?.displayName) return `Contacts: ${m.contactsArrayMessage.contacts[0].displayName}`;

    // Mensajes de ubicacion
    if (m.locationMessage?.name) return m.locationMessage.name;
    if (m.locationMessage?.address) return m.locationMessage.address;
    if (m.liveLocationMessage?.caption) return m.liveLocationMessage.caption;

    // Mensajes de invoices/pagos
    if (m.invoiceMessage?.note) return m.invoiceMessage.note;
    if (m.invoiceMessage?.caption) return m.invoiceMessage.caption;

    // Protocolos de mensajes interactivos
    if (m.interactiveMessage?.header?.title) return m.interactiveMessage.header.title;
    if (m.interactiveMessage?.body?.text) return m.interactiveMessage.body.text;
    if (m.interactiveMessage?.footer?.text) return m.interactiveMessage.footer.text;
    if (m.interactiveMessage?.nativeFlowMessage?.messageParamsJson) {
      try {
        const params = JSON.parse(m.interactiveMessage.nativeFlowMessage.messageParamsJson);
        if (params?.text) return params.text;
      } catch {}
    }

    // Wrappers (recursivo)
    if (m.ephemeralMessage?.message) return this._extractPureTextFromMessage(m.ephemeralMessage.message);
    if (m.viewOnceMessage?.message) return this._extractPureTextFromMessage(m.viewOnceMessage.message);
    if (m.viewOnceMessageV2?.message) return this._extractPureTextFromMessage(m.viewOnceMessageV2.message);
    if (m.viewOnceMessageV2Extension?.message) return this._extractPureTextFromMessage(m.viewOnceMessageV2Extension.message);
    if (m.editedMessage?.message) return this._extractPureTextFromMessage(m.editedMessage.message);
    if (m.documentWithCaptionMessage?.message) return this._extractPureTextFromMessage(m.documentWithCaptionMessage.message);
    if (m.deviceSentMessage?.message) return this._extractPureTextFromMessage(m.deviceSentMessage.message);
    if (m.messageContextInfo?.deviceListMetadataVersion && m.conversation) return m.conversation;

    // Intentar extraer de propiedades genericas
    if (m.text) return m.text;
    if (m.caption) return m.caption;
    if (m.message) return this._extractPureTextFromMessage(m.message);

    return '';
  }
}

export default MessageProcessor;
