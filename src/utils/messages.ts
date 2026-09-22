import type { Lead } from '../types/lead'

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? ''
}

/**
 * טיוטת הודעה מותאמת לליד, לפי סוג הלקוח והשלב שבו הוא נמצא.
 * זו נקודת פתיחה – כדאי לעבור עליה ולהוסיף משהו אישי לפני ששולחים.
 */
export function draftMessage(lead: Lead): string {
  const name = firstName(lead.name)
  const hotel = lead.company || 'המלון'

  if (lead.type === 'hotel') {
    switch (lead.stage) {
      case 'to_contact':
        return `היי ${name}, מה שלומך?
ראיתי שאת/ה ${lead.role ? `${lead.role} ב` : 'עובד/ת ב'}${hotel}, וחשבתי שזה יכול לעניין אותך.
אני משווקת את Joole – מוצר שבתי מלון משתמשים בו כדי לשדרג את החוויה של האורחים.
אשמח לשלוח פרטים או להגיע להראות אותו בכמה דקות. מתי נוח לך?`
      case 'contacted':
        return `היי ${name}, רק מקפיצה את ההודעה הקודמת 🙂
אם זה רלוונטי ל${hotel}, אשמח לתאם שיחה קצרה או להשאיר דוגמה של Joole.`
      case 'talking':
        return `היי ${name}, תודה על השיחה!
כמו שדיברנו, אשמח להכין הצעה ל${hotel}${lead.units ? ` לכ-${lead.units} יחידות` : ''}.
יש עוד משהו שחשוב שאכלול בה?`
      default:
        return `היי ${name}, מה נשמע? רציתי לשמוע איך הולך עם Joole ב${hotel} 🙂`
    }
  }

  switch (lead.stage) {
    case 'to_contact':
      return `היי ${name}! מה שלומך?
התחלתי לשווק מוצר שאני ממש אוהבת – Joole.
חשבתי עלייך/עליך, רוצה שאספר לך עליו בכמה מילים?`
    case 'contacted':
      return `היי ${name}, רק בודקת אם ראית את ההודעה שלי על Joole 🙂 בלי לחץ בכלל.`
    case 'talking':
      return `היי ${name}, שמחתי שדיברנו! רוצה שאשמור לך אחד?`
    default:
      return `היי ${name}, מה נשמע? איך את/ה מסתדר/ת עם ה-Joole?`
  }
}
