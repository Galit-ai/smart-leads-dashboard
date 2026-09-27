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

/** איך הגענו לליד – קובע את נוסח ההודעה הראשונה */
export type Opener = 'form' | 'referral' | 'personal' | 'cold'

export const OPENER_LABELS: Record<Opener, string> = {
  form: 'מילא/ה טופס',
  referral: 'הגיע/ה מהמלצה',
  personal: 'מכירים אישית',
  cold: 'פנייה ראשונה',
}

/** אילו נוסחי פתיחה מתאימים לסוג הלקוח */
export function openersFor(lead: Lead): Opener[] {
  return lead.type === 'hotel' ? ['cold', 'referral'] : ['form', 'referral', 'personal']
}

/** נוסח הפתיחה שנבחר אוטומטית לפי המקור וההסכמה */
export function defaultOpener(lead: Lead): Opener {
  if (lead.source === 'referral') return 'referral'
  if (lead.type === 'hotel') return 'cold'
  return lead.consent && lead.source !== 'other' ? 'form' : 'personal'
}

type OpenerTemplates = Record<Lang, (n: string, lead: Lead) => string>

/** מי המליץ – שם פרטי, או ניסוח כללי אם לא ידוע */
function referrer(lead: Lead, lang: Lang): string {
  const who = firstName(lead.referredBy)
  if (who) return who
  return { de: 'Eine Freundin', en: 'A friend', he: 'חבר/ה משותף/ת' }[lang]
}

const PRIVATE_OPENERS: Record<Exclude<Opener, 'form' | 'cold'>, OpenerTemplates> = {
  referral: {
    de: (n, l) => `Hey ${n}! 👋
${referrer(l, 'de')} hat mir erzählt, dass du vielleicht Interesse an JOOLE hast 🙂
JOOLE ist ein stylisches, diskretes Kit in einer Dose – eine richtig besondere Geschenkidee.
Soll ich dir mehr dazu schicken?`,
    en: (n, l) => `Hey ${n}! 👋
${referrer(l, 'en')} told me you might be interested in JOOLE 🙂
JOOLE is a stylish, discreet kit in a can – a really special gift idea.
Want me to send you more details?`,
    he: (n, l) => `היי ${n}! 👋
קיבלתי את הפרטים שלך מ-${referrer(l, 'he')}, ונראה לי ש-JOOLE יכול לעניין אותך 🙂
JOOLE היא ערכה מעוצבת ודיסקרטית בתוך פחית – רעיון למתנה ממש מיוחדת.
רוצה שאשלח לך עוד פרטים?`,
  },
  personal: {
    de: (n) => `Hey ${n}! Lange nicht gesprochen – wie geht's dir? 🙂
Ich arbeite gerade mit JOOLE, einem stylischen, diskreten Kit in einer Dose. Perfekt als besonderes Geschenk.
Wenn du magst, erzähle ich dir mehr – sonst einfach ignorieren, ist total okay!`,
    en: (n) => `Hey ${n}! Long time no talk – how are you? 🙂
I'm working with JOOLE now, a stylish, discreet kit in a can. It makes a really special gift.
Happy to tell you more if you're curious – and totally fine to ignore this!`,
    he: (n) => `היי ${n}! מלא זמן, מה שלומך? 🙂
התחלתי לעבוד עם JOOLE – ערכה מעוצבת ודיסקרטית בתוך פחית, מתנה ממש מיוחדת.
אם מסקרן אותך אשמח לספר עוד, ואם לא – הכול טוב!`,
  },
}

const HOTEL_REFERRAL: OpenerTemplates = {
  en: (n, l) => `Hi ${n},
${firstName(l.referredBy) || 'A colleague'} suggested I reach out to you.
I'm Galit from JOOLE – a discreet, hermetically sealed in-room intimacy kit that turns the minibar into a high-margin revenue stream (typically 2–4% of guests buy it).
Would you be open to a short call about ${l.company || 'your hotel'}?
Best regards,
Galit`,
  de: (n, l) => `Hallo ${n},
${firstName(l.referredBy) || 'Ein Kollege'} hat mir empfohlen, mich bei Ihnen zu melden.
Ich bin Galit von JOOLE – ein diskretes, hermetisch versiegeltes Intimacy-Kit für das Zimmer, das die Minibar zu einer margenstarken Einnahmequelle macht (typischerweise kaufen 2–4 % der Gäste).
Hätten Sie Zeit für ein kurzes Gespräch über ${l.company || 'Ihr Hotel'}?
Viele Grüße
Galit`,
  he: (n, l) => `היי ${n}, מה שלומך?
${firstName(l.referredBy) || 'עמית משותף'} המליץ/ה לי לפנות אלייך/אליך.
אני גלית מ-JOOLE – ערכת אינטימיות דיסקרטית ואטומה לחדר, שהופכת את המיני-בר למקור הכנסה ברווחיות גבוהה (בדרך כלל 2%–4% מהאורחים קונים).
אשמח לשיחה קצרה על ${l.company || 'המלון'}. מתי נוח לך?`,
}

/**
 * טיוטת הודעה מותאמת לליד, לפי סוג הלקוח, השלב והשפה.
 * בהודעה הראשונה (שלב "לפנות") הנוסח תלוי גם באיך הגענו לליד – טופס, המלצה או היכרות אישית.
 * זו נקודת פתיחה – כדאי לעבור עליה ולהוסיף משהו אישי לפני ששולחים.
 */
export function draftMessage(
  lead: Lead,
  lang: Lang = defaultLang(lead),
  opener: Opener = defaultOpener(lead),
): string {
  const stage: Stage = lead.stage === 'lost' ? 'contacted' : lead.stage
  const name = firstName(lead.name)
  if (stage === 'to_contact') {
    if (lead.type === 'hotel' && opener === 'referral') return HOTEL_REFERRAL[lang](name, lead)
    if (lead.type === 'private' && (opener === 'referral' || opener === 'personal')) {
      return PRIVATE_OPENERS[opener][lang](name, lead)
    }
  }
  const templates = lead.type === 'hotel' ? HOTEL : PRIVATE
  return templates[lang][stage](name, lead)
}
