import type { Lead, LeadStage } from '../types/lead'

export type Lang = 'de' | 'en' | 'he'

export const LANG_LABELS: Record<Lang, string> = {
  de: 'Deutsch',
  en: 'English',
  he: 'עברית',
}

/** שפת ברירת המחדל: גרמנית ללקוחות פרטיים בגרמניה, אנגלית למלונות בחו"ל */
export function defaultLang(lead: Lead): Lang {
  if (lead.type === 'private') return /גרמניה|germany|deutschland/i.test(lead.country) ? 'de' : 'en'
  return /ישראל|israel/i.test(lead.country) ? 'he' : 'en'
}

function firstName(name: string): string {
  return name.replace(/\(.*?\)/g, '').trim().split(/\s+/)[0] ?? ''
}

type Stage = Exclude<LeadStage, 'lost'>
type Templates = Record<Lang, Record<Stage, (n: string, lead: Lead) => string>>

const PRIVATE: Templates = {
  de: {
    to_contact: (n) => `Hey ${n}! 👋
Danke, dass du dich für JOOLE interessierst.
JOOLE ist ein stylisches, diskretes Kit in einer Dose – die perfekte Geschenkidee, wenn du mal etwas wirklich Besonderes verschenken willst (oder dir selbst 😉).
Soll ich dir mehr dazu schicken?`,
    contacted: (n) => `Hey ${n}, ich wollte nur kurz fragen, ob du meine Nachricht zu JOOLE gesehen hast 🙂 Ganz ohne Druck!`,
    talking: (n) => `Hey ${n}, schön, dass wir geschrieben haben!
Soll ich dir eine JOOLE reservieren? Lieber Rot oder Schwarz? ❤️🖤`,
    won: (n) => `Hey ${n}, danke nochmal für deine Bestellung! Wie gefällt dir JOOLE? 🙂`,
  },
  en: {
    to_contact: (n) => `Hey ${n}! 👋
Thanks for your interest in JOOLE.
JOOLE is a stylish, discreet kit in a can – the perfect gift when you want to give something really special (or treat yourself 😉).
Want me to send you more details?`,
    contacted: (n) => `Hey ${n}, just checking if you saw my message about JOOLE 🙂 No pressure at all!`,
    talking: (n) => `Hey ${n}, great chatting with you!
Shall I save a JOOLE for you? Red or black? ❤️🖤`,
    won: (n) => `Hey ${n}, thanks again for your order! How do you like your JOOLE? 🙂`,
  },
  he: {
    to_contact: (n) => `היי ${n}! 👋
תודה שהתעניינת ב-JOOLE.
JOOLE היא ערכה מעוצבת ודיסקרטית בתוך פחית – מתנה מושלמת כשרוצים לתת משהו באמת מיוחד (או לפנק את עצמך 😉).
רוצה שאשלח לך עוד פרטים?`,
    contacted: (n) => `היי ${n}, רק בודקת אם ראית את ההודעה שלי על JOOLE 🙂 בלי לחץ בכלל!`,
    talking: (n) => `היי ${n}, כיף שדיברנו!
לשמור לך JOOLE? אדומה או שחורה? ❤️🖤`,
    won: (n) => `היי ${n}, תודה שוב על ההזמנה! איך JOOLE? 🙂`,
  },
}

const HOTEL: Templates = {
  en: {
    to_contact: (n, l) => `Hi ${n},
I'm Galit from JOOLE. JOOLE is a discreet, hermetically sealed in-room intimacy kit that turns the minibar into a high-margin revenue stream – typically 2–4% of guests buy it.
Would you be open to a short call, or shall I send our catalogue for ${l.company || 'your hotel'}?
Best regards,
Galit`,
    contacted: (n, l) => `Hi ${n},
Just following up on my previous message. If JOOLE could be a fit for ${l.company || 'your hotel'}, I'd be happy to send a sample or set up a quick call.
Best,
Galit`,
    talking: (n, l) => `Hi ${n},
Thank you for the conversation! As discussed, I'll prepare a proposal for ${l.company || 'your hotel'}${l.units ? ` (${l.units} rooms)` : ''}.
Is there anything else you'd like me to include?
Best,
Galit`,
    won: (n, l) => `Hi ${n},
How is JOOLE doing at ${l.company || 'your hotel'} so far? Happy to help with anything you need.
Best,
Galit`,
  },
  he: {
    to_contact: (n, l) => `היי ${n}, מה שלומך?
אני גלית מ-JOOLE. JOOLE היא ערכת אינטימיות דיסקרטית ואטומה לחדר, שהופכת את המיני-בר למקור הכנסה ברווחיות גבוהה – בדרך כלל 2%–4% מהאורחים קונים.
אשמח לשיחה קצרה או לשלוח קטלוג ל${l.company || 'מלון'}. מתי נוח לך?`,
    contacted: (n, l) => `היי ${n}, רק מקפיצה את ההודעה הקודמת 🙂
אם זה רלוונטי ל${l.company || 'מלון'}, אשמח לשלוח דוגמה או לתאם שיחה קצרה.`,
    talking: (n, l) => `היי ${n}, תודה על השיחה!
כמו שדיברנו, אכין הצעה ל${l.company || 'מלון'}${l.units ? ` (${l.units} חדרים)` : ''}.
יש עוד משהו שחשוב שאכלול בה?`,
    won: (n, l) => `היי ${n}, מה נשמע? רציתי לשמוע איך JOOLE עובד אצלכם ב${l.company || 'מלון'} 🙂`,
  },
  de: {
    to_contact: (n, l) => `Hallo ${n},
ich bin Galit von JOOLE. JOOLE ist ein diskretes, hermetisch versiegeltes Intimacy-Kit für das Zimmer, das die Minibar zu einer margenstarken Einnahmequelle macht – typischerweise kaufen 2–4 % der Gäste.
Hätten Sie Zeit für ein kurzes Gespräch, oder darf ich Ihnen unseren Katalog für ${l.company || 'Ihr Hotel'} schicken?
Viele Grüße
Galit`,
    contacted: (n, l) => `Hallo ${n},
ich wollte kurz an meine letzte Nachricht erinnern. Falls JOOLE für ${l.company || 'Ihr Hotel'} interessant ist, schicke ich gerne ein Muster oder wir telefonieren kurz.
Viele Grüße
Galit`,
    talking: (n, l) => `Hallo ${n},
vielen Dank für das Gespräch! Wie besprochen bereite ich ein Angebot für ${l.company || 'Ihr Hotel'}${l.units ? ` (${l.units} Zimmer)` : ''} vor.
Soll ich noch etwas berücksichtigen?
Viele Grüße
Galit`,
    won: (n, l) => `Hallo ${n},
wie läuft JOOLE bisher bei ${l.company || 'Ihnen'}? Ich helfe gerne weiter.
Viele Grüße
Galit`,
  },
}

/**
 * טיוטת הודעה מותאמת לליד, לפי סוג הלקוח, השלב והשפה.
 * זו נקודת פתיחה – כדאי לעבור עליה ולהוסיף משהו אישי לפני ששולחים.
 */
export function draftMessage(lead: Lead, lang: Lang = defaultLang(lead)): string {
  const stage: Stage = lead.stage === 'lost' ? 'contacted' : lead.stage
  const templates = lead.type === 'hotel' ? HOTEL : PRIVATE
  return templates[lang][stage](firstName(lead.name), lead)
}
