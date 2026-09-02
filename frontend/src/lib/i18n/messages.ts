import type { LocaleCode } from "@/lib/i18n/locales";

export type MessageKey =
  | "language.label"
  | "contact.fullName"
  | "contact.email"
  | "contact.phone"
  | "contact.subject"
  | "contact.message"
  | "contact.send"
  | "contact.sending"
  | "contact.error"
  | "common.days"
  | "common.back"
  | "common.loading"
  | "book.now"
  | "book.checkout";

const en: Record<MessageKey, string> = {
  "language.label": "Language",
  "contact.fullName": "Full Name *",
  "contact.email": "Email *",
  "contact.phone": "Phone",
  "contact.subject": "Subject",
  "contact.message": "Message *",
  "contact.send": "Send Message",
  "contact.sending": "Sending...",
  "contact.error": "Something went wrong. Please try again or call us directly.",
  "common.days": "Days",
  "common.back": "Back",
  "common.loading": "Loading...",
  "book.now": "Book Now",
  "book.checkout": "Proceed to Checkout",
};

const zh: Record<MessageKey, string> = {
  "language.label": "语言",
  "contact.fullName": "全名 *",
  "contact.email": "电子邮件 *",
  "contact.phone": "电话",
  "contact.subject": "主题",
  "contact.message": "留言 *",
  "contact.send": "发送消息",
  "contact.sending": "发送中...",
  "contact.error": "出错了。请重试或直接致电我们。",
  "common.days": "天",
  "common.back": "返回",
  "common.loading": "加载中...",
  "book.now": "立即预订",
  "book.checkout": "前往结账",
};

const vi: Record<MessageKey, string> = {
  "language.label": "Ngôn ngữ",
  "contact.fullName": "Họ và tên *",
  "contact.email": "Email *",
  "contact.phone": "Điện thoại",
  "contact.subject": "Chủ đề",
  "contact.message": "Tin nhắn *",
  "contact.send": "Gửi tin nhắn",
  "contact.sending": "Đang gửi...",
  "contact.error": "Đã xảy ra lỗi. Vui lòng thử lại hoặc gọi trực tiếp cho chúng tôi.",
  "common.days": "Ngày",
  "common.back": "Quay lại",
  "common.loading": "Đang tải...",
  "book.now": "Đặt ngay",
  "book.checkout": "Tiến hành thanh toán",
};

const fr: Record<MessageKey, string> = {
  "language.label": "Langue",
  "contact.fullName": "Nom complet *",
  "contact.email": "E-mail *",
  "contact.phone": "Téléphone",
  "contact.subject": "Sujet",
  "contact.message": "Message *",
  "contact.send": "Envoyer le message",
  "contact.sending": "Envoi...",
  "contact.error": "Une erreur s'est produite. Veuillez réessayer ou nous appeler directement.",
  "common.days": "Jours",
  "common.back": "Retour",
  "common.loading": "Chargement...",
  "book.now": "Réserver",
  "book.checkout": "Passer au paiement",
};

export const messages: Record<LocaleCode, Record<MessageKey, string>> = {
  en,
  zh,
  vi,
  fr,
  es: { ...en, "language.label": "Idioma", "contact.send": "Enviar mensaje", "book.now": "Reservar ahora" },
  de: { ...en, "language.label": "Sprache", "contact.send": "Nachricht senden", "book.now": "Jetzt buchen" },
  ja: { ...en, "language.label": "言語", "contact.send": "メッセージを送信", "book.now": "今すぐ予約" },
  ko: { ...en, "language.label": "언어", "contact.send": "메시지 보내기", "book.now": "지금 예약" },
  hi: { ...en, "language.label": "भाषा", "contact.send": "संदेश भेजें", "book.now": "अभी बुक करें" },
  th: { ...en, "language.label": "ภาษา", "contact.send": "ส่งข้อความ", "book.now": "จองเลย" },
  ru: { ...en, "language.label": "Язык", "contact.send": "Отправить сообщение", "book.now": "Забронировать" },
  ar: { ...en, "language.label": "اللغة", "contact.send": "إرسال الرسالة", "book.now": "احجز الآن" },
};

export function translate(locale: LocaleCode, key: MessageKey): string {
  return messages[locale]?.[key] ?? messages.en[key] ?? key;
}
