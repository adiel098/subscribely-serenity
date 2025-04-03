תיאור מקיף של כל הטבלאות בדאטאבייס, עם פירוט על השדות שלהן והקשרים ביניהן.

תיאור מקיף של טבלאות Supabase
1. admin_users - ניהול משתמשי אדמין
טבלה זו מנהלת את משתמשי האדמין במערכת ואת הרשאותיהם.

id: מזהה ייחודי (UUID)
user_id: מזהה המשתמש (מקושר למשתמש)
role: תפקיד (מסוג אנום admin_role, ברירת מחדל: 'moderator')
created_at: זמן יצירה
updated_at: זמן עדכון
2. broadcast_messages - הודעות שנשלחו לרשימת תפוצה
טבלה זו מאחסנת הודעות שנשלחו למשתמשים רבים בבת אחת.

id: מזהה ייחודי
community_id: מזהה הקהילה שאליה שייכת ההודעה (מפתח זר ל-communities)
message: תוכן ההודעה
filter_type: סוג הסינון (all/active/expired/plan)
filter_data: נתוני הסינון (JSON)
status: סטטוס ההודעה (draft/sending/sent/failed)
sent_at: זמן השליחה
created_at, updated_at: זמני יצירה ועדכון
total_recipients: מספר הנמענים הכולל
sent_success: מספר השליחות המוצלחות
sent_failed: מספר השליחות שנכשלו
subscription_plan_id: מזהה תוכנית מנוי לסינון (מפתח זר ל-subscription_plans)
image: URL של תמונה (אופציונלי)
include_button: האם לכלול כפתור בהודעה
3. communities - קהילות
טבלה זו מכילה את כל הקהילות במערכת.

id: מזהה ייחודי
owner_id: מזהה הבעלים (מפתח זר ל-profiles)
name: שם הקהילה
description: תיאור הקהילה
created_at, updated_at: זמני יצירה ועדכון
telegram_photo_url: URL לתמונת הקהילה בטלגרם
custom_link: קישור מותאם אישית לקהילה
is_group: האם זו קבוצה (ולא קהילה רגילה)
telegram_chat_id: מזהה צ'אט בטלגרם
4. community_logs - לוגים של פעילות בקהילות
טבלה המתעדת פעילויות שונות בקהילות.

id: מזהה ייחודי
community_id: מזהה הקהילה (מפתח זר ל-communities)
event_type: סוג האירוע (אנום של סוגי אירועים אנליטיים)
user_id: מזהה המשתמש שהפעיל את האירוע
metadata: מידע נוסף (JSON)
amount: סכום (לאירועי תשלום)
created_at: זמן האירוע
5. community_relationships - קשרים בין קהילות
טבלה זו מגדירה קשרים בין קהילות, למשל קהילות שהן חלק מקבוצה.

community_id: מזהה הקהילה (מפתח זר ל-communities)
member_id: מזהה הקהילה החברה (מפתח זר ל-communities)
added_at: זמן הוספה
display_order: סדר תצוגה
relationship_type: סוג הקשר (ברירת מחדל: 'group')
6. community_subscribers - מנויים לקהילות
טבלה המכילה את כל המשתמשים המנויים לקהילות.

id: מזהה ייחודי
community_id: מזהה הקהילה (מפתח זר ל-communities)
telegram_user_id: מזהה משתמש בטלגרם
telegram_username: שם משתמש בטלגרם
joined_at: תאריך הצטרפות
last_active: תאריך פעילות אחרון
subscription_plan_id: מזהה תוכנית מנוי (מפתח זר ל-subscription_plans)
subscription_start_date: תאריך התחלת המנוי
subscription_end_date: תאריך סיום המנוי
is_active: האם המנוי פעיל
last_checked: מתי נבדק המנוי לאחרונה
is_trial: האם זה מנוי ניסיון
trial_end_date: תאריך סיום תקופת הניסיון
subscription_status: סטטוס המנוי (active/expired/inactive)
7. payment_methods - שיטות תשלום
טבלה זו מכילה את שיטות התשלום הזמינות.

id: מזהה ייחודי
provider: ספק התשלום
is_active: האם שיטת התשלום פעילה
config: הגדרות שיטת התשלום (JSON)
created_at, updated_at: זמני יצירה ועדכון
owner_id: מזהה הבעלים
8. platform_payment_methods - שיטות תשלום פלטפורמה
טבלה זו מכילה את שיטות התשלום הזמינות ברמת הפלטפורמה.

id: מזהה ייחודי
provider: ספק התשלום
config: הגדרות (JSON)
is_active: האם פעיל
created_at, updated_at: זמני יצירה ועדכון
9. platform_payments - תשלומים פלטפורמה
טבלה זו מתעדת תשלומים שבוצעו לפלטפורמה (להבדיל מתשלומים לקהילות).

id: מזהה ייחודי
owner_id: מזהה הבעלים (מפתח זר ל-profiles)
plan_id: מזהה תוכנית (מפתח זר ל-platform_plans)
subscription_id: מזהה המנוי (מפתח זר ל-platform_subscriptions)
amount: סכום התשלום
payment_method: שיטת התשלום
payment_status: סטטוס התשלום
transaction_id: מזהה העסקה החיצוני
created_at: זמן יצירה
10. platform_plans - תוכניות פלטפורמה
טבלה זו מכילה את תוכניות המנוי לפלטפורמה עצמה.

id: מזהה ייחודי
name: שם התוכנית
description: תיאור התוכנית
price: מחיר
interval: תדירות החיוב (monthly/quarterly/yearly וכו')
features: תכונות התוכנית (JSON)
is_active: האם התוכנית פעילה
max_communities: מספר מרבי של קהילות לתוכנית זו
max_members_per_community: מספר מרבי של חברים לקהילה
created_at, updated_at: זמני יצירה ועדכון
11. platform_subscriptions - מנויים לפלטפורמה
טבלה זו מתעדת את מנויי הפלטפורמה.

id: מזהה ייחודי
owner_id: מזהה הבעלים (מפתח זר ל-profiles)
plan_id: מזהה תוכנית (מפתח זר ל-platform_plans)
status: סטטוס המנוי
subscription_start_date: תאריך התחלת המנוי
subscription_end_date: תאריך סיום המנוי
auto_renew: האם לחדש אוטומטית
created_at, updated_at: זמני יצירה ועדכון
12. profiles - פרופילי משתמשים
טבלה זו מכילה את פרופילי המשתמשים במערכת.

id: מזהה ייחודי (מפתח זר ל-auth.users)
full_name: שם מלא
first_name: שם פרטי
last_name: שם משפחה
email: כתובת אימייל
phone: מספר טלפון
status: סטטוס המשתמש
created_at, updated_at: זמני יצירה ועדכון
registration_date: תאריך הרשמה
last_login: תאריך התחברות אחרון
is_suspended: האם המשתמש מושעה
onboarding_completed: האם השלים את תהליך ההרשמה
onboarding_step: שלב ההרשמה הנוכחי
initial_telegram_code, current_telegram_code: קודי אימות לטלגרם
use_custom_bot: האם להשתמש בבוט טלגרם מותאם אישית
custom_bot_token: טוקן של בוט טלגרם מותאם אישית
13. subscription_activity_logs - לוגים של פעילות מנויים
טבלה זו מתעדת פעילות הקשורה למנויים.

id: מזהה ייחודי
community_id: מזהה הקהילה
telegram_user_id: מזהה משתמש בטלגרם
activity_type: סוג הפעילות
details: פרטים נוספים
status: סטטוס האירוע
created_at: זמן האירוע
14. subscription_coupons - קופונים למנויים
טבלה זו מכילה קופוני הנחה למנויים.

id: מזהה ייחודי
code: קוד הקופון
description: תיאור הקופון
discount_type: סוג ההנחה
discount_amount: סכום/אחוז ההנחה
max_uses: מספר שימושים מרבי
used_count: מספר השימושים עד כה
is_active: האם הקופון פעיל
expires_at: תאריך תפוגה
created_at, updated_at: זמני יצירה ועדכון
owner_id: מזהה בעלים
community_id: מזהה קהילה שהקופון שייך אליה
15. subscription_notifications - התראות מנויים
טבלה זו מתעדת התראות שנשלחו למנויים.

id: מזהה ייחודי
member_id: מזהה החבר (מפתח זר ל-community_subscribers)
community_id: מזהה הקהילה
notification_type: סוג ההתראה (welcome/reminder/expiration וכו')
status: סטטוס השליחה
sent_at: זמן שליחה
error: שגיאה (אם היתה)
16. subscription_payments - תשלומי מנויים
טבלה זו מתעדת תשלומים למנויים לקהילות.

id: מזהה ייחודי
community_id: מזהה הקהילה
plan_id: מזהה תוכנית המנוי
amount: סכום התשלום
status: סטטוס התשלום
payment_method: שיטת התשלום
telegram_user_id: מזהה המשתמש בטלגרם
telegram_username: שם המשתמש בטלגרם
first_name, last_name: שם פרטי ושם משפחה
invite_link: קישור הזמנה (אם רלוונטי)
coupon_id: מזהה קופון (אם נעשה שימוש)
discount_amount: סכום ההנחה
original_amount: הסכום המקורי (לפני הנחה)
created_at, updated_at: זמני יצירה ועדכון
17. subscription_plans - תוכניות מנוי
טבלה זו מכילה תוכניות מנוי לקהילות השונות.

id: מזהה ייחודי
community_id: מזהה הקהילה
name: שם התוכנית
description: תיאור התוכנית
price: מחיר
interval: תדירות החיוב (monthly/quarterly/yearly וכו')
is_active: האם התוכנית פעילה
features: תכונות התוכנית (JSON)
has_trial_period: האם כוללת תקופת ניסיון
trial_days: מספר ימי ניסיון
created_at, updated_at: זמני יצירה ועדכון
18. system_logs - לוגים מערכתיים
טבלה זו מתעדת אירועים מערכתיים.

id: מזהה ייחודי
created_at: זמן האירוע
event_type: סוג האירוע
details: פרטי האירוע
user_id: מזהה המשתמש (מפתח זר ל-profiles)
metadata: מידע נוסף (JSON)

19. telegram_bot_settings - הגדרות בוט טלגרם
טבלה זו מכילה את הגדרות בוט הטלגרם לכל קהילה.

id: מזהה ייחודי
community_id: מזהה הקהילה
chat_id: מזהה הצ'אט בטלגרם
is_admin: האם הבוט הוא אדמין
welcome_message: הודעת ברוכים הבאים
welcome_image: תמונה להודעת ברוכים הבאים
verification_code: קוד אימות
verified_at: זמן האימות
subscription_reminder_days: ימים לפני שליחת תזכורת על מנוי
subscription_reminder_message: הודעת תזכורת על מנוי
first_reminder_days, second_reminder_days: ימים לפני שליחת תזכורות
first_reminder_message, second_reminder_message: הודעות תזכורת
first_reminder_image, second_reminder_image: תמונות לתזכורות
expired_subscription_message: הודעה על פקיעת מנוי
auto_remove_expired: האם להסיר אוטומטית מנויים שפקעו
renewal_discount_enabled: האם לאפשר הנחת חידוש
renewal_discount_percentage: אחוז הנחת חידוש
auto_welcome_message: האם לשלוח אוטומטית הודעת ברוכים הבאים
bot_signature: חתימת הבוט
language: שפה
max_messages_per_day: מספר הודעות מרבי ליום
created_at, updated_at: זמני יצירה ועדכון
20. telegram_events - אירועי טלגרם
טבלה זו מתעדת אירועים שקרו בטלגרם.

id: מזהה ייחודי
created_at: זמן האירוע
event_type: סוג האירוע
chat_id: מזהה הצ'אט
user_id: מזהה המשתמש
username: שם המשתמש
message_id: מזהה ההודעה
message_text: תוכן ההודעה
raw_data: נתונים גולמיים (JSON)
error: שגיאה (אם היתה)
21. telegram_global_settings - הגדרות גלובליות לטלגרם
טבלה זו מכילה הגדרות גלובליות לבוט הטלגרם.

id: מזהה ייחודי
bot_token: טוקן הבוט הראשי
bot_username: שם משתמש הבוט
created_at, updated_at: זמני יצירה ועדכון
22. telegram_mini_app_users - משתמשי מיני-אפליקציית טלגרם
טבלה זו מכילה נתונים על משתמשים במיני-אפליקציית הטלגרם.

id: מזהה ייחודי
telegram_id: מזהה בטלגרם
username: שם משתמש
first_name: שם פרטי
last_name: שם משפחה
photo_url: URL לתמונת הפרופיל
community_id: מזהה הקהילה
email: כתובת אימייל
created_at: זמן יצירה
last_active: זמן פעילות אחרון
קשרים מרכזיים במסד הנתונים
קהילות ובעלים:

communities.owner_id → profiles.id: כל קהילה שייכת לבעלים מסוים.
קהילות ומנויים:

community_subscribers.community_id → communities.id: מנויים משויכים לקהילה ספציפית.
community_subscribers.subscription_plan_id → subscription_plans.id: מנויים משויכים לתוכנית מנוי ספציפית.
קהילות וקבוצות:

community_relationships: מגדיר קשרים בין קהילות, למשל קהילות שהן חלק מקבוצה.
community_relationships.community_id → communities.id: הקהילה/קבוצה הראשית.
community_relationships.member_id → communities.id: הקהילה החברה בקבוצה.
תשלומים ומנויים:

subscription_payments.community_id → communities.id: תשלומים משויכים לקהילה.
subscription_payments.plan_id → subscription_plans.id: תשלומים משויכים לתוכנית מנוי.
subscription_payments.coupon_id → subscription_coupons.id: תשלומים יכולים להשתמש בקופון.
הגדרות בוט טלגרם וקהילות:

telegram_bot_settings.community_id → communities.id: הגדרות בוט ספציפיות לכל קהילה.
מנויי פלטפורמה:

platform_subscriptions.owner_id → profiles.id: מנויי פלטפורמה משויכים לבעלים.
platform_subscriptions.plan_id → platform_plans.id: מנויי פלטפורמה משויכים לתוכנית פלטפורמה.
platform_payments.subscription_id → platform_subscriptions.id: תשלומי פלטפורמה משויכים למנוי פלטפורמה.
הודעות ברודקאסט:

broadcast_messages.community_id → communities.id: הודעות משויכות לקהילה.
broadcast_messages.subscription_plan_id → subscription_plans.id: הודעות יכולות להיות מסוננות לתוכנית מנוי ספציפית.
התראות מנויים:

subscription_notifications.member_id → community_subscribers.id: התראות משויכות למנוי ספציפי.
subscription_notifications.community_id → communities.id: התראות משויכות לקהילה ספציפית.