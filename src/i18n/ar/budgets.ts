import type { Dict, PluralEntry } from '../core';

/** Arabic counted sentence: one, two, 3 to 10, 11 to 99, and 0 or 100 and up. */
const plural = (one: string, two: string, few: string, many: string, other: string): PluralEntry => ({ zero: other, one, two, few, many, other });

/** Arabic for the Budgets page and the pointer to it on the Usage and pool page. */
const arabic: Dict = {
  // Navigation and page
  'AI budgets at GitHub: how much is used, which run out and who is stopped': 'ميزانيات الذكاء الاصطناعي في GitHub: كم استُخدم منها، وأيها ينفد، ومن توقف',
  'The budgets for GitHub Copilot that are set at GitHub: how full each one is, which run out this month, and which users are stopped.':
    'ميزانيات GitHub Copilot المضبوطة في GitHub: كم امتلأت كل ميزانية، وأيها ينفد هذا الشهر، وأي المستخدمين توقفوا.',
  'Month: {month}.': 'الشهر: {month}.',
  'Load a GitHub data file to see your budgets': 'حمّل ملف بيانات GitHub لترى ميزانياتك',
  'The usage report does not hold budgets. The collector script reads them from GitHub.': 'لا يحتوي تقرير الاستخدام على الميزانيات. يقرؤها سكربت جمع البيانات من GitHub.',
  'Go to the Data page': 'اذهب إلى صفحة البيانات',
  'No budget for GitHub Copilot': 'لا توجد ميزانية لـ GitHub Copilot',
  'Nothing limits the amount billed on top of seats. Set a budget at GitHub to get alerts or to stop usage at a set amount.':
    'لا شيء يحدّ المبلغ المدفوع إضافيًا فوق رسوم التراخيص. اضبط ميزانية في GitHub لتصلك تنبيهات أو لإيقاف الاستخدام عند مبلغ محدد.',
  'Budget levels': 'مستويات الميزانيات',
  'How much of each budget is used, and how fast it fills up this month.': 'كم استُخدم من كل ميزانية، وما سرعة امتلائها هذا الشهر.',
  'Gaps and changes': 'الثغرات والتغييرات',
  'All budgets': 'كل الميزانيات',
  '{budget}, all of GitHub Copilot': '{budget}، GitHub Copilot كله',

  // Levels
  'Under {high}': 'أقل من {high}',
  'Used up': 'نفدت',

  // Headline numbers
  'Budgets for GitHub Copilot': 'ميزانيات GitHub Copilot',
  '{stopping} stop usage, {alerting} only alert': '{stopping} توقف الاستخدام، و{alerting} تنبّه فقط',
  'Budgets used up': 'ميزانيات نفدت',
  'of {n} budgets with an amount used': plural(
    'من ميزانية واحدة لها مبلغ مستخدَم',
    'من ميزانيتين لهما مبلغ مستخدَم',
    'من {n} ميزانيات لها مبلغ مستخدَم',
    'من {n} ميزانية لها مبلغ مستخدَم',
    'من {n} ميزانية لها مبلغ مستخدَم',
  ),
  'Budgets near the limit': 'ميزانيات قريبة من الحد',
  '{share} or more used': 'استُخدم {share} أو أكثر',
  'Expected to run out': 'يُتوقع أن تنفد',
  'Budgets that reach their amount before the month ends at the current pace': 'ميزانيات تبلغ مبلغها قبل نهاية الشهر بالوتيرة الحالية',
  'Users stopped by a budget': 'مستخدمون أوقفتهم ميزانية',
  'Cannot use AI credits until the next month': 'لا يمكنهم استخدام أرصدة الذكاء الاصطناعي حتى الشهر القادم',
  'Users near their limit': 'مستخدمون قريبون من حدهم',
  '{share} or more of their budget used': 'استخدموا {share} أو أكثر من ميزانيتهم',

  // How full each budget is
  '{used} of {amount}': '{used} من {amount}',
  'How full each budget is': 'كم امتلأت كل ميزانية',
  'Share of each budget used on the day the data was collected. Budgets for single users are in the users section below.':
    'الحصة المستخدمة من كل ميزانية يوم جمع البيانات. ميزانيات المستخدمين الأفراد في قسم المستخدمين أدناه.',
  'No budget with an amount used': 'لا توجد ميزانية لها مبلغ مستخدَم',
  '{n} more budgets are in the table below.': plural(
    'توجد ميزانية أخرى في الجدول أدناه.',
    'توجد ميزانيتان أخريان في الجدول أدناه.',
    'توجد {n} ميزانيات أخرى في الجدول أدناه.',
    'توجد {n} ميزانية أخرى في الجدول أدناه.',
    'توجد {n} ميزانية أخرى في الجدول أدناه.',
  ),

  // Month pace
  'Used so far': 'المستخدَم حتى الآن',
  Projected: 'المتوقع',
  'Runs out {date}': 'تنفد في {date}',
  'Budget {amount}': 'الميزانية {amount}',
  'Billed amounts from the usage report for what this budget covers. The projection uses the average billed per day over the last {n} days.':
    'المبالغ المدفوعة إضافيًا من تقرير الاستخدام لما تغطيه هذه الميزانية. يعتمد التوقع على متوسط المدفوع إضافيًا في اليوم خلال آخر {n} أيام.',
  'The usage report cannot show this budget day by day, so the amount GitHub showed is spread evenly over the days so far.':
    'لا يستطيع تقرير الاستخدام عرض هذه الميزانية يومًا بيوم، لذلك يُوزَّع المبلغ الذي أظهره GitHub بالتساوي على الأيام حتى الآن.',
  'Month pace': 'وتيرة الشهر',
  'How {budget} fills up this month, and when it runs out at the current pace.': 'كيف تمتلئ {budget} هذا الشهر، ومتى تنفد بالوتيرة الحالية.',
  'Projected for the month': 'المتوقع للشهر',
  'Runs out': 'تنفد',
  'Already used up': 'نفدت بالفعل',
  'Not this month': 'ليس هذا الشهر',

  // Users and their budgets
  Limit: 'الحد',
  Level: 'المستوى',
  'Users and their budgets': 'المستخدمون وميزانياتهم',
  'Each user is held to one limit: a budget of their own, the limit of their cost center, or the limit for each user, in that order. When a user reaches the limit, GitHub stops their AI credits until the next month.':
    'يخضع كل مستخدم لحد واحد: ميزانيته الخاصة، أو حد مركز التكلفة الخاص به، أو الحد لكل مستخدم، بهذا الترتيب. عندما يبلغ المستخدم الحد، يوقف GitHub أرصدة الذكاء الاصطناعي له حتى الشهر القادم.',
  'Show users at {share} or more': 'اعرض المستخدمين عند {share} أو أكثر',
  'Limit type': 'نوع الحد',

  // Kinds of user limits
  'Own budget': 'ميزانية خاصة',
  'Cost center limit': 'حد مركز التكلفة',
  'Limit for each user': 'الحد لكل مستخدم',
  'No limit': 'بلا حد',

  // Limit map
  Limits: 'الحدود',
  'Where each limit sits, from the whole enterprise down to each user.': 'أين يقع كل حد، من المؤسسة الكبرى كلها حتى كل مستخدم.',
  'Limit map': 'خريطة الحدود',
  'Each limit is a glass that fills as AI credits are used. GitHub checks them from the bottom up. Select anything to see the limits that hold it.':
    'كل حد كأس تمتلئ كلما استُخدمت أرصدة الذكاء الاصطناعي. ويفحصها GitHub من الأسفل إلى الأعلى. اختر أي شيء لترى الحدود التي يخضع لها.',
  'Spending limit of the enterprise': 'حد الإنفاق للمؤسسة الكبرى',
  'Spending limit of the organization': 'حد الإنفاق للمؤسسة',
  'Spending limit of the cost center': 'حد الإنفاق لمركز التكلفة',
  'Spending limits of cost centers, organizations and repositories': 'حدود الإنفاق لمراكز التكلفة والمؤسسات والمستودعات',
  'Included credits pay first. The spending limits above count only the amount billed.': 'تدفع الأرصدة المشمولة أولًا. ولا تحسب حدود الإنفاق في الأعلى إلا المبلغ المدفوع إضافيًا.',
  'Limit of each user': 'حد كل مستخدم',
  'No users with usage this month or listed by GitHub.': 'لا يوجد مستخدمون لهم استخدام هذا الشهر أو أدرجهم GitHub.',
  'All other users': 'كل المستخدمين الآخرين',
  'Users with no limit': 'مستخدمون بلا حد',
  'Users of {group}': 'مستخدمو {group}',
  '{amount} each': '{amount} لكل مستخدم',
  'No spending limit at the top.': 'لا يوجد حد إنفاق في الأعلى.',
  'Enterprise account': 'حساب Enterprise',
  'The limit of the user: their own budget, else their cost center limit, else the limit for each user.': 'حد المستخدم: ميزانيته الخاصة، وإلا حد مركز التكلفة الخاص به، وإلا الحد لكل مستخدم.',
  'Included credits pay for the usage while they last.': 'تدفع الأرصدة المشمولة ثمن الاستخدام ما دامت متاحة.',
  'The spending limit of the cost center or organization, for the amount billed.': 'حد الإنفاق لمركز التكلفة أو المؤسسة، للمبلغ المدفوع إضافيًا.',
  'The spending limit of the enterprise, for the amount billed.': 'حد الإنفاق للمؤسسة الكبرى، للمبلغ المدفوع إضافيًا.',
  'Spending limit': 'حد الإنفاق',
  'Spending limit, all of GitHub Copilot': 'حد الإنفاق، GitHub Copilot كله',
  'Amount used not known': 'المبلغ المستخدَم غير معروف',
  '{share} used': 'استُخدم {share}',
  '{n} users, {usedUp} used up': plural(
    'مستخدم واحد، استنفد {usedUp} منهم الحد',
    'مستخدمان، استنفد {usedUp} منهما الحد',
    '{n} مستخدمين، استنفد {usedUp} منهم الحد',
    '{n} مستخدمًا، استنفد {usedUp} منهم الحد',
    '{n} مستخدم، استنفد {usedUp} منهم الحد',
  ),
  'This cost center may use only the included credits of its own members.': 'يستخدم مركز التكلفة هذا الأرصدة المشمولة لأعضائه فقط.',
  'Own credit share': 'حصة أرصدة خاصة',
  'No spending limit at the top. Nothing caps the amount billed for all users.': 'لا يوجد حد إنفاق في الأعلى. لا شيء يحدّ المبلغ المدفوع إضافيًا لكل المستخدمين.',
  'No limits for cost centers, organizations or repositories.': 'لا توجد حدود لمراكز التكلفة أو المؤسسات أو المستودعات.',
  'Show fewer': 'اعرض أقل',
  '{n} cost centers have no limit of their own.': plural(
    'مركز تكلفة واحد ليس له حد خاص.',
    'مركزا تكلفة ليس لهما حد خاص.',
    '{n} مراكز تكلفة ليس لها حد خاص.',
    '{n} مركز تكلفة ليس لها حد خاص.',
    '{n} مركز تكلفة ليس لها حد خاص.',
  ),
  'Users with a budget of their own': 'مستخدمون لهم ميزانية خاصة',
  'Order GitHub checks': 'الترتيب الذي يتحقق به GitHub',
  'Users by the limit that holds them': 'المستخدمون حسب الحد الذي يخضعون له',
  'Out of {n} users with usage this month or listed by GitHub.': plural(
    'من أصل مستخدم واحد له استخدام هذا الشهر أو أدرجه GitHub.',
    'من أصل مستخدمَين لهما استخدام هذا الشهر أو أدرجهما GitHub.',
    'من أصل {n} مستخدمين لهم استخدام هذا الشهر أو أدرجهم GitHub.',
    'من أصل {n} مستخدمًا لهم استخدام هذا الشهر أو أدرجهم GitHub.',
    'من أصل {n} مستخدم لهم استخدام هذا الشهر أو أدرجهم GitHub.',
  ),

  // AI credit limit of a user, in the user details
  'AI credit limit': 'حد أرصدة الذكاء الاصطناعي',
  'In {month}, GitHub holds this user to this limit, the most specific one that applies. When usage reaches it, GitHub stops their AI credits until the next month. The filters do not change it.':
    'في {month}، يُخضع GitHub هذا المستخدم لهذا الحد، وهو أدق حد ينطبق عليه. عندما يبلغه الاستخدام، يوقف GitHub أرصدة الذكاء الاصطناعي له حتى الشهر القادم. لا تغيّره عوامل التصفية.',
  'GitHub has no limit for users that applies to this user. Only a spending limit on the amount billed can stop their AI credits.':
    'لا يوجد في GitHub حد للمستخدمين ينطبق على هذا المستخدم. لا يوقف أرصدة الذكاء الاصطناعي له إلا حد إنفاق على المبلغ المدفوع إضافيًا.',
  'Shown by GitHub': 'كما أظهره GitHub',
  '{name}, as GitHub listed it': '{name}، كما أدرجه GitHub',
  '{name}, assigned to the user': '{name}، مسند إلى المستخدم',
  '{name}, through the team {team}': '{name}، عبر الفريق {team}',
  '{name}, through the organization {organization}': '{name}، عبر المؤسسة {organization}',
  '{name}, from the usage report': '{name}، من تقرير الاستخدام',
  'Reaches the limit {date}': 'يبلغ الحد في {date}',
  'Limit {amount}': 'الحد {amount}',
  'Already reached': 'بلغه بالفعل',
  'Amount used as GitHub showed it on {day}. It counts all usage, included credits too.': 'المبلغ المستخدَم كما أظهره GitHub في {day}. يشمل كل الاستخدام، والأرصدة المشمولة أيضًا.',
  'GitHub did not list this user, so the amount used is the usage in the report this month, included credits too.':
    'لم يُدرج GitHub هذا المستخدم، لذلك المبلغ المستخدَم هو استخدامه في التقرير هذا الشهر، والأرصدة المشمولة أيضًا.',
  'The report has no usage for this month, and GitHub did not list this user.': 'ليس في التقرير استخدام لهذا الشهر، ولم يُدرج GitHub هذا المستخدم.',
  'of {limit}': 'من {limit}',
  'Share of the limit used': 'الحصة المستخدمة من الحد',
  'Set by': 'مصدره',
  Ends: 'ينتهي',
  'Left this month': 'المتبقي هذا الشهر',
  'Reaches the limit': 'يبلغ الحد',
  Replaces: 'يحل محل',
  '{kind}: {amount}': '{kind}: {amount}',
  'Usage of {name} against the limit': 'استخدام {name} مقارنة بالحد',

  // Billed usage with no budget
  Type: 'النوع',
  'Billed usage with no budget': 'استخدام مدفوع إضافيًا بلا ميزانية',
  'Organizations and cost centers billed in {month} that have no budget of their own.': 'مؤسسات ومراكز تكلفة دفعت مبالغ إضافية في {month} وليست لها ميزانية خاصة.',
  'The budgets were not read in full, so this list cannot be made.': 'لم تُقرأ الميزانيات كاملة، لذلك لا يمكن إعداد هذه القائمة.',
  'Every organization and cost center with billed usage has a budget.': 'لكل مؤسسة ومركز تكلفة له استخدام مدفوع إضافيًا ميزانية.',
  'The budget for the whole enterprise still covers this usage.': 'ما زالت ميزانية المؤسسة كلها تغطي هذا الاستخدام.',

  // Budget changes
  'Budget added': 'أُضيفت ميزانية',
  'Budget changed': 'تغيّرت ميزانية',
  'Budget removed': 'أُزيلت ميزانية',
  'Changed by': 'غيّرها',
  'Budgets that were added, changed or removed, from the audit log.': 'الميزانيات التي أُضيفت أو تغيّرت أو أُزيلت، من سجل التدقيق.',
  'The audit log has no budget changes.': 'لا يحتوي سجل التدقيق على تغييرات في الميزانيات.',

  // Pointer on the Usage and pool page
  '{n} budgets for GitHub Copilot.': plural(
    'ميزانية واحدة لـ GitHub Copilot.',
    'ميزانيتان لـ GitHub Copilot.',
    '{n} ميزانيات لـ GitHub Copilot.',
    '{n} ميزانية لـ GitHub Copilot.',
    '{n} ميزانية لـ GitHub Copilot.',
  ),
  '{n} users have used up their budget.': plural(
    'استنفد مستخدم واحد ميزانيته.',
    'استنفد مستخدمان ميزانيتهما.',
    'استنفد {n} مستخدمين ميزانياتهم.',
    'استنفد {n} مستخدمًا ميزانياتهم.',
    'استنفد {n} مستخدم ميزانياتهم.',
  ),
  'Open the Budgets page': 'افتح صفحة الميزانيات',

  // Limit map: finding a user, playing the month and the side panel
  'Find a user': 'ابحث عن مستخدم',
  'No user found.': 'لم يُعثر على مستخدم.',
  'Play the month': 'شغّل الشهر',
  Pause: 'إيقاف مؤقت',
  Now: 'الآن',
  'Shown: usage up to the end of {day}, from the usage report. {month} has {days} days.': 'المعروض: الاستخدام حتى نهاية {day}، من تقرير الاستخدام. في {month} {days} يومًا.',
  'Back to the whole picture': 'العودة إلى الصورة كاملة',
  'Credit left': 'الرصيد المتبقي',
  'No users here.': 'لا يوجد مستخدمون هنا.',
  'Closest to their limit': 'الأقرب إلى حدهم',
  '{n} more': 'و{n} آخرون',
  'Show its usage': 'اعرض استخدامه',
  'Show its users': 'اعرض مستخدميه',
  'Show its spending limit': 'اعرض حد إنفاقه',
  'Users with a budget of their own. Their own budget is the only limit that holds them.':
    'مستخدمون لهم ميزانية خاصة. ميزانيتهم الخاصة هي الحد الوحيد الذي يخضعون له.',
  'Users of this cost center. Its limit for each user holds them, unless they have a budget of their own.':
    'مستخدمو مركز التكلفة هذا. يخضعون لحده لكل مستخدم، إلا إذا كانت لهم ميزانية خاصة.',
  'Users without a budget of their own and outside the cost centers with a limit. The limit for each user holds them.':
    'مستخدمون ليس لهم ميزانية خاصة وليسوا في مراكز تكلفة لها حد. ويخضعون للحد لكل مستخدم.',
  'Users without a budget of their own and outside the cost centers with a limit. No limit holds them.':
    'مستخدمون ليس لهم ميزانية خاصة وليسوا في مراكز تكلفة لها حد. ولا يخضعون لأي حد.',
  'No limit for each user': 'لا يوجد حد لكل مستخدم',
  'Amount used as GitHub showed it.': 'المبلغ المستخدَم كما أظهره GitHub.',
  'Amount used from the usage report, included credits too.': 'المبلغ المستخدَم من تقرير الاستخدام، مع الأرصدة المشمولة.',
  '{share} of {amount}': '{share} من {amount}',
  '{used} of {limit}': '{used} من {limit}',
  '{used}, no limit': '{used}، بلا حد',
  'GitHub checks these limits for each request, from the first step up. Any one can stop the usage.':
    'يفحص GitHub هذه الحدود لكل طلب، من الخطوة الأولى صعودًا. وأي منها قد يوقف الاستخدام.',
  'The limit of the user': 'حد المستخدم',
  'Used up. GitHub stops the usage of this user.': 'نفد. يوقف GitHub استخدام هذا المستخدم.',
  'No limit holds this user. Only the spending limits above can stop them.': 'لا يخضع هذا المستخدم لأي حد. ولا توقفه إلا حدود الإنفاق في الأعلى.',
  'Included credits pay for the usage while they last. Only the rest is billed and counts against the spending limits.':
    'تدفع الأرصدة المشمولة ثمن الاستخدام ما دامت متاحة. ولا يُفوتر إلا الباقي، وهو ما يُحسب من حدود الإنفاق.',
  'Spending limits that count their usage': 'حدود الإنفاق التي تحسب استخدامهم',
  'No cost center, organization or repository limit counts their usage.': 'لا يحسب استخدامهم أي حد لمركز تكلفة أو مؤسسة أو مستودع.',
  'It counts the amount billed for every user. When it stops usage, it stops everyone.': 'يحسب المبلغ المدفوع إضافيًا لكل مستخدم. وعندما يوقف الاستخدام، يوقفه للجميع.',
  'It counts the amount billed for the usage of these users. When it stops usage, it stops them all, whatever their own limit.':
    'يحسب المبلغ المدفوع إضافيًا لاستخدام هؤلاء المستخدمين. وعندما يوقف الاستخدام، يوقفهم جميعًا مهما كان حد كل منهم.',
  'Users it counts': 'المستخدمون الذين يحسبهم',
  'Select a glass, a group or a user to see every limit that holds it. Each one gets the number of its step.': 'اختر كأسًا أو مجموعة أو مستخدمًا لترى كل حد يخضع له. ويأخذ كل حد رقم خطوته.',
  'Users without a budget of their own or a cost center limit can use AI credits without a cap. Only the spending limits above stop them.':
    'يمكن للمستخدمين الذين ليس لهم ميزانية خاصة أو حد مركز تكلفة استخدام أرصدة الذكاء الاصطناعي بلا سقف. ولا توقفهم إلا حدود الإنفاق في الأعلى.',
  'Colors of the user glasses': 'ألوان كؤوس المستخدمين',
  'Select a color to fade the other users.': 'اختر لونًا لتخفيت المستخدمين الآخرين.',
  'The large glasses show the spending limits as GitHub showed them when the data was collected.': 'تعرض الكؤوس الكبيرة حدود الإنفاق كما أظهرها GitHub عند جمع البيانات.',
  'The map shows {n} users: users with usage this month or listed by GitHub.': plural(
    'تعرض الخريطة مستخدمًا واحدًا: له استخدام هذا الشهر أو أدرجه GitHub.',
    'تعرض الخريطة مستخدمَين: لهما استخدام هذا الشهر أو أدرجهما GitHub.',
    'تعرض الخريطة {n} مستخدمين: لهم استخدام هذا الشهر أو أدرجهم GitHub.',
    'تعرض الخريطة {n} مستخدمًا: لهم استخدام هذا الشهر أو أدرجهم GitHub.',
    'تعرض الخريطة {n} مستخدم: لهم استخدام هذا الشهر أو أدرجهم GitHub.',
  ),
};

export default arabic;
