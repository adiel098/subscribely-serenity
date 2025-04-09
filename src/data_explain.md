אחרי שסקרתי את כל הטבלאות ושדות הדאטאבייס, אציג כעת תיאור מקיף של מבנה הנתונים:

תיאור מקיף של מבנה הדאטאבייס
1. טבלת admin_users - משתמשי מנהל
טבלה זו מנהלת משתמשים בעלי הרשאות ניהול במערכת.

id (uuid): מזהה ייחודי של רשומת המנהל
user_id (uuid): מזהה המשתמש המקושר
role (USER-DEFINED): תפקיד המשתמש במערכת (סוג enum, ברירת מחדל: 'moderator')
created_at (timestamp): זמן יצירת רשומת המנהל
updated_at (timestamp): זמן עדכון אחרון
2. טבלת communities - קהילות
מכילה את כל הקהילות הקיימות במערכת.

id (uuid): מזהה ייחודי של הקהילה
owner_id (uuid): מזהה הבעלים של הקהילה
name (text): שם הקהילה
description (text): תיאור הקהילה (אופציונלי)
created_at (timestamp): זמן יצירת הקהילה
updated_at (timestamp): זמן עדכון אחרון
telegram_photo_url (text): כתובת URL של תמונת הקהילה בטלגרם (אופציונלי)
telegram_chat_id (text): מזהה הצ'אט בטלגרם (אופציונלי)
project_id (uuid): מזהה הפרויקט שהקהילה שייכת אליו (אופציונלי)
3. טבלת owner_payment_methods - אמצעי תשלום של בעלים
שיטות תשלום שמוגדרות עבור בעלי קהילות.

id (uuid): מזהה ייחודי של שיטת התשלום
provider (varchar): ספק שירות התשלום
is_active (boolean): האם שיטת התשלום פעילה (ברירת מחדל: false)
config (jsonb): הגדרות נוספות בפורמט JSON (ברירת מחדל: '{}')
created_at (timestamp): זמן יצירה
updated_at (timestamp): זמן עדכון אחרון
owner_id (uuid): מזהה הבעלים (אופציונלי)
4. טבלת platform_global_settings - הגדרות גלובליות של הפלטפורמה
הגדרות כלליות של הפלטפורמה, כולל פרטי בוט ברירת מחדל.

id (uuid): מזהה ייחודי של רשומת ההגדרות
bot_token (text): טוקן של בוט טלגרם רשמי של הפלטפורמה
created_at (timestamp): זמן יצירה
updated_at (timestamp): זמן עדכון אחרון
bot_username (text): שם המשתמש של הבוט (אופציונלי)
5. טבלת platform_payment_methods - אמצעי תשלום פלטפורמה
שיטות תשלום שזמינות ברמת הפלטפורמה.

id (uuid): מזהה ייחודי
provider (text): ספק התשלום
config (jsonb): הגדרות בפורמט JSON
is_active (boolean): האם שיטת התשלום פעילה (ברירת מחדל: false)
created_at (timestamp): זמן יצירה (ברירת מחדל: now())
updated_at (timestamp): זמן עדכון אחרון (ברירת מחדל: now())
6. טבלת platform_payments - תשלומים לפלטפורמה
תיעוד תשלומים שבוצעו לפלטפורמה עצמה (לא לקהילות).

id (uuid): מזהה ייחודי
owner_id (uuid): מזהה הבעלים המשלם
plan_id (uuid): מזהה תוכנית המנוי
subscription_id (uuid): מזהה המנוי (אופציונלי)
amount (numeric): סכום התשלום
payment_method (text): שיטת התשלום (אופציונלי)
payment_status (text): סטטוס התשלום (ברירת מחדל: 'completed')
transaction_id (text): מזהה עסקה חיצוני (אופציונלי)
created_at (timestamp): זמן ביצוע התשלום (ברירת מחדל: now())
7. טבלת platform_plans - תוכניות מנוי פלטפורמה
תוכניות מנוי לפלטפורמה עצמה (לא לקהילות).

id (uuid): מזהה ייחודי
name (text): שם התוכנית
description (text): תיאור התוכנית (אופציונלי)
price (numeric): מחיר
interval (USER-DEFINED): תדירות החיוב (חודשי, שנתי וכו')
features (jsonb): מאפייני התוכנית (ברירת מחדל: '[]')
is_active (boolean): האם התוכנית פעילה (ברירת מחדל: true)
max_communities (integer): מספר מרבי של קהילות (ברירת מחדל: 1)
max_members_per_community (integer): מספר מרבי של חברים לקהילה (אופציונלי)
created_at (timestamp): זמן יצירה
updated_at (timestamp): זמן עדכון אחרון
8. טבלת platform_subscriptions - מנויים לפלטפורמה
תיעוד מנויים לפלטפורמה עצמה.

id (uuid): מזהה ייחודי
owner_id (uuid): מזהה הבעלים
plan_id (uuid): מזהה תוכנית המנוי
status (text): סטטוס המנוי (ברירת מחדל: 'active')
subscription_start_date (timestamp): תאריך התחלת המנוי (ברירת מחדל: now())
subscription_end_date (timestamp): תאריך סיום המנוי (אופציונלי)
auto_renew (boolean): האם לחדש אוטומטית (ברירת מחדל: true)
created_at (timestamp): זמן יצירה
updated_at (timestamp): זמן עדכון אחרון
9. טבלת project_coupons - קופוני הנחה
קופוני הנחה למנויי קהילות.

id (uuid): מזהה ייחודי
code (text): קוד הקופון
description (text): תיאור הקופון (אופציונלי)
discount_type (text): סוג ההנחה
discount_amount (numeric): סכום או אחוז ההנחה
max_uses (integer): מספר שימושים מרבי (אופציונלי)
used_count (integer): מספר שימושים עד כה (ברירת מחדל: 0)
is_active (boolean): האם הקופון פעיל (ברירת מחדל: true)
expires_at (timestamp): תאריך תפוגה (אופציונלי)
created_at (timestamp): זמן יצירה
updated_at (timestamp): זמן עדכון אחרון
owner_id (uuid): מזהה הבעלים (אופציונלי)
community_id (uuid): מזהה הקהילה הרלוונטית (אופציונלי)
10. טבלת project_subscribers - מנויים לפרויקטים
מתעדת את כל המשתמשים המנויים לפרויקטים.

id (uuid): מזהה ייחודי
project_id (uuid): מזהה הפרויקט
telegram_user_id (text): מזהה משתמש בטלגרם
telegram_username (text): שם משתמש בטלגרם (אופציונלי)
joined_at (timestamp): תאריך הצטרפות
last_active (timestamp): תאריך פעילות אחרון (אופציונלי)
subscription_plan_id (uuid): מזהה תוכנית המנוי (אופציונלי)
subscription_start_date (timestamp): תאריך התחלת המנוי (אופציונלי)
subscription_end_date (timestamp): תאריך סיום המנוי (אופציונלי)
is_active (boolean): האם המנוי פעיל (ברירת מחדל: true)
last_checked (timestamp): מתי נבדק המנוי לאחרונה (אופציונלי)
is_trial (boolean): האם זה מנוי ניסיון (ברירת מחדל: false)
trial_end_date (timestamp): תאריך סיום תקופת הניסיון (אופציונלי)
subscription_status (text): סטטוס המנוי (ברירת מחדל: 'inactive')
11. טבלת projects - פרויקטים
פרויקטים המנוהלים במערכת.

id (uuid): מזהה ייחודי
name (text): שם הפרויקט
description (text): תיאור הפרויקט (אופציונלי)
owner_id (uuid): מזהה הבעלים
bot_token (text): טוקן של בוט טלגרם (אופציונלי)
created_at (timestamp): זמן יצירה
updated_at (timestamp): זמן עדכון אחרון
12. טבלת subscription_payments - תשלומי מנויים
תיעוד תשלומים עבור מנויים לקהילות.

id (uuid): מזהה ייחודי
project_id (uuid): מזהה הפרויקט (אופציונלי)
plan_id (uuid): מזהה תוכנית המנוי (אופציונלי)
amount (numeric): סכום התשלום
status (text): סטטוס התשלום
payment_method (text): שיטת התשלום (אופציונלי)
created_at (timestamp): זמן ביצוע התשלום
updated_at (timestamp): זמן עדכון אחרון
telegram_user_id (text): מזהה המשתמש בטלגרם (אופציונלי)
invite_link (text): קישור הזמנה (אופציונלי)
telegram_username (text): שם המשתמש בטלגרם (אופציונלי)
first_name (text): שם פרטי (אופציונלי)
last_name (text): שם משפחה (אופציונלי)
coupon_id (uuid): מזהה קופון (אופציונלי)
discount_amount (numeric): סכום ההנחה (ברירת מחדל: 0)
original_amount (numeric): הסכום המקורי לפני הנחה (אופציונלי)
13. טבלת subscription_plans - תוכניות מנוי
תוכניות מנוי לקהילות.

id (uuid): מזהה ייחודי
community_id (uuid): מזהה הקהילה (אופציונלי)
name (text): שם התוכנית
description (text): תיאור התוכנית (אופציונלי)
price (numeric): מחיר
interval (text): תדירות החיוב (monthly, yearly וכו')
is_active (boolean): האם התוכנית פעילה (ברירת מחדל: true)
features (jsonb): תכונות התוכנית (ברירת מחדל: '[]')
created_at (timestamp): זמן יצירה
updated_at (timestamp): זמן עדכון אחרון
has_trial_period (boolean): האם כוללת תקופת ניסיון (ברירת מחדל: false)
trial_days (integer): מספר ימי ניסיון (ברירת מחדל: 0)
14. טבלת telegram_bot_settings - הגדרות בוט טלגרם
הגדרות ספציפיות לבוט טלגרם בכל פרוייקט.

id (uuid): מזהה ייחודי
welcome_message (text): הודעת ברוכים הבאים (עם ברירת מחדל)
created_at (timestamp): זמן יצירה
updated_at (timestamp): זמן עדכון אחרון
subscription_reminder_days (integer): ימים לפני תזכורת (ברירת מחדל: 3)
subscription_reminder_message (text): הודעת תזכורת (עם ברירת מחדל)
expired_subscription_message (text): הודעת פקיעת מנוי (עם ברירת מחדל)
renewal_discount_enabled (boolean): האם הנחת חידוש מופעלת (ברירת מחדל: false)
renewal_discount_percentage (integer): אחוז הנחת חידוש (ברירת מחדל: 10)
language (text): שפה (ברירת מחדל: 'en')
welcome_image (text): תמונה להודעת ברוכים הבאים (אופציונלי)
first_reminder_days (integer): ימים לתזכורת ראשונה (ברירת מחדל: 3)
first_reminder_message (text): הודעת תזכורת ראשונה (עם ברירת מחדל)
first_reminder_image (text): תמונה לתזכורת ראשונה (אופציונלי)
second_reminder_days (integer): ימים לתזכורת שנייה (ברירת מחדל: 1)
second_reminder_message (text): הודעת תזכורת שנייה (עם ברירת מחדל)
second_reminder_image (text): תמונה לתזכורת שנייה (אופציונלי)
project_id (uuid): מזהה הפרויקט (אופציונלי)
15. טבלת telegram_mini_app_users - משתמשי מיני-אפליקציית טלגרם
מידע על משתמשים במיני-אפליקציית טלגרם.

id (uuid): מזהה ייחודי
telegram_id (text): מזהה הטלגרם של המשתמש
username (text): שם משתמש בטלגרם (אופציונלי)
first_name (text): שם פרטי (אופציונלי)
last_name (text): שם משפחה (אופציונלי)
photo_url (text): כתובת URL של תמונת פרופיל (אופציונלי)
community_id (uuid): מזהה הקהילה (אופציונלי)
created_at (timestamp): זמן יצירה
last_active (timestamp): זמן פעילות אחרון
email (text): כתובת אימייל (אופציונלי)
16. טבלת users - משתמשים
מידע על משתמשי המערכת.

id (uuid): מזהה ייחודי
full_name (text): שם מלא (אופציונלי)
updated_at (timestamp): זמן עדכון אחרון
status (text): סטטוס המשתמש (ברירת מחדל: 'active')
registration_date (timestamp): תאריך הרשמה
last_login (timestamp): תאריך התחברות אחרון (אופציונלי)
email (text): כתובת אימייל (אופציונלי)
first_name (text): שם פרטי (אופציונלי)
last_name (text): שם משפחה (אופציונלי)
onboarding_completed (boolean): האם תהליך ההרשמה הושלם (ברירת מחדל: false)
onboarding_step (text): שלב נוכחי בתהליך ההרשמה (ברירת מחדל: 'welcome')
קשרים מרכזיים במסד הנתונים
קשרי משתמשים וקהילות:
communities.owner_id → users.id: כל קהילה שייכת לבעלים מסוים
projects.owner_id → users.id: כל פרויקט שייך לבעלים מסוים
קשרי פרויקטים וקהילות:
communities.project_id → projects.id: קהילות שייכות לפרויקטים
קשרי מנויים:
project_subscribers.project_id → projects.id: מנויים משויכים לפרויקט ספציפי
project_subscribers.subscription_plan_id → subscription_plans.id: מנויים משויכים לתוכנית מנוי
קשרי תשלומים:
subscription_payments.project_id → projects.id: תשלומים משויכים לפרויקט
subscription_payments.plan_id → subscription_plans.id: תשלומים משויכים לתוכנית מנוי
subscription_payments.coupon_id → project_coupons.id: תשלומים יכולים להשתמש בקופון
קשרי פלטפורמה:
platform_subscriptions.owner_id → users.id: מנויי פלטפורמה משויכים לבעלים
platform_subscriptions.plan_id → platform_plans.id: מנויי פלטפורמה משויכים לתוכנית
platform_payments.subscription_id → platform_subscriptions.id: תשלומי פלטפורמה משויכים למנוי
קשרי בוט טלגרם:
telegram_bot_settings.project_id → projects.id: הגדרות בוט משויכות לפרויקט ספציפי
מבנה הדאטאבייס מתוכנן לתמוך במערכת שמאפשרת ניהול קהילות טלגרם, מנויים, תשלומים ואינטראקציות עם בוטים של טלגרם, כאשר המודל העסקי מאפשר גם מנויים לפלטפורמה עצמה וגם מנויים לקהילות ספציפיות.