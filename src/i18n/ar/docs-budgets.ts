import type { Dict } from '../core';

/** Arabic for the docs of the Budgets page in `lib/metrics/docs/budgets.ts`. */
const arabic: Dict = {
  // Budgets for GitHub Copilot
  'How many budgets for GitHub Copilot are set at GitHub, and how many of them stop usage or only send alerts.':
    'عدد ميزانيات GitHub Copilot المضبوطة في GitHub، وكم منها يوقف الاستخدام أو يرسل تنبيهات فقط.',
  'Budgets = budgets in the GitHub data file that cover AI credits or all of GitHub Copilot': 'الميزانيات = الميزانيات في ملف بيانات GitHub التي تغطي أرصدة الذكاء الاصطناعي أو GitHub Copilot كله',
  'The collector script reads every budget of the enterprise or organization.': 'يقرأ سكربت جمع البيانات كل ميزانيات المؤسسة الكبرى أو المؤسسة.',
  'Budgets for other products, such as GitHub Actions, are left out.': 'تُستبعد ميزانيات المنتجات الأخرى، مثل GitHub Actions.',
  'A budget that stops usage blocks AI credits once it is used up. A budget that only alerts sends emails and lets usage go on.':
    'الميزانية التي توقف الاستخدام تمنع أرصدة الذكاء الاصطناعي عندما تنفد. والميزانية التي تنبّه فقط ترسل رسائل بريد وتترك الاستخدام مستمرًا.',
  'The count is from the day the data was collected. The filters do not change it.': 'العدد من يوم جمع البيانات. لا تغيّره عوامل التصفية.',
  'Budgets for single users and limits for each user are counted too.': 'تُحسب أيضًا ميزانيات المستخدمين الأفراد والحدود لكل مستخدم.',
  'The file has 12 budgets: 10 for GitHub Copilot and 2 for GitHub Actions. 7 of the 10 stop usage and 3 only alert.':
    'في الملف 12 ميزانية: 10 لـ GitHub Copilot و2 لـ GitHub Actions. 7 من الـ 10 توقف الاستخدام و3 تنبّه فقط.',

  // Budgets used up
  'Budgets for the enterprise, organizations, cost centers and repositories that have reached their amount this month.':
    'ميزانيات المؤسسة الكبرى والمؤسسات ومراكز التكلفة والمستودعات التي بلغت مبلغها هذا الشهر.',
  'Used up when amount used ÷ budget ≥ 100%': 'تنفد عندما يكون المبلغ المستخدَم ÷ الميزانية ≥ 100%',
  'GitHub gives the amount used of each budget for the current month.': 'يعطي GitHub المبلغ المستخدَم من كل ميزانية للشهر الحالي.',
  'A budget with no amount used from GitHub, or a budget of $0, is not counted.': 'لا تُحسب الميزانية التي لم يعطِ GitHub مبلغها المستخدَم، ولا الميزانية التي قيمتها $0.',
  'A used-up budget that stops usage blocks AI credits for everyone it covers until the next month.': 'الميزانية النافدة التي توقف الاستخدام تمنع أرصدة الذكاء الاصطناعي عن كل من تغطيهم حتى الشهر القادم.',
  'Budgets for single users are counted on their own, under Users stopped by a budget.': 'تُحسب ميزانيات المستخدمين الأفراد وحدها، تحت مستخدمون أوقفتهم ميزانية.',
  'The budget of northwind-labs is $1,000 and $1,040 is used. It is used up.': 'ميزانية northwind-labs هي $1,000 واستُخدم منها $1,040. لقد نفدت.',

  // Budgets near the limit
  'Budgets that have 80% or more of their amount used, but not all of it.': 'ميزانيات استُخدم منها 80% أو أكثر، لكن ليس كلها.',
  'Near the limit when 80% ≤ amount used ÷ budget < 100%': 'قريبة من الحد عندما يكون 80% ≤ المبلغ المستخدَم ÷ الميزانية < 100%',
  'GitHub sends alerts at set shares of a budget, such as 75%, 90% and 100%, when alerts are on.': 'يرسل GitHub تنبيهات عند حصص محددة من الميزانية، مثل 75% و90% و100%، عندما تكون التنبيهات مفعّلة.',
  'A budget of $500 with $430 used is 86% used, so it is near the limit.': 'ميزانية $500 استُخدم منها $430 مستخدمة بنسبة 86%، فهي قريبة من الحد.',

  // Budgets expected to run out
  'Budgets expected to run out': 'ميزانيات يُتوقع أن تنفد',
  'Budgets that are not used up yet but reach their amount before the month ends if usage goes on at the current pace.':
    'ميزانيات لم تنفد بعد لكنها تبلغ مبلغها قبل نهاية الشهر إذا استمر الاستخدام بالوتيرة الحالية.',
  'Run-out day = last known day + (budget − amount used) ÷ billed per day': 'يوم النفاد = آخر يوم معروف + (الميزانية − المبلغ المستخدَم) ÷ المدفوع إضافيًا في اليوم',
  'For a budget for AI credits that matches rows of the usage report, the billed amount of those rows is added up day by day.':
    'لميزانية أرصدة الذكاء الاصطناعي التي تطابق صفوفًا في تقرير الاستخدام، يُجمع المبلغ المدفوع إضافيًا لتلك الصفوف يومًا بيوم.',
  'Billed per day is the average over the last 7 days, or since billing started if that is later.': 'المدفوع إضافيًا في اليوم هو المتوسط خلال آخر 7 أيام، أو منذ بدء الدفع الإضافي إن كان ذلك لاحقًا.',
  'For other budgets, the amount GitHub showed is spread evenly over the days of the month so far.': 'لباقي الميزانيات، يُوزَّع المبلغ الذي أظهره GitHub بالتساوي على أيام الشهر حتى الآن.',
  'The budget runs out this month when the run-out day is on or before the last day of the month.': 'تنفد الميزانية هذا الشهر عندما يكون يوم النفاد في آخر يوم من الشهر أو قبله.',
  'Usage often changes from week to week, so treat the day as a guide.': 'يتغير الاستخدام غالبًا من أسبوع لآخر، فاعتبر اليوم تقديرًا للاسترشاد.',
  'Seat charges are not in the usage report, so a budget that also counts seats uses the amount GitHub showed.': 'رسوم التراخيص ليست في تقرير الاستخدام، لذلك تعتمد الميزانية التي تحسب التراخيص أيضًا على المبلغ الذي أظهره GitHub.',
  'A budget of $800 has $560 used on day 20, and $30 is billed per day. It runs out on day 28: 20 + (800 − 560) ÷ 30.':
    'ميزانية $800 استُخدم منها $560 في اليوم 20، ويُدفع $30 إضافيًا في اليوم. تنفد في اليوم 28: 20 + (800 − 560) ÷ 30.',

  // Users stopped by a budget
  'Users who have used up the limit GitHub holds them to: their own budget, their cost center limit or the limit for each user. GitHub stops their AI credits until the next month.':
    'مستخدمون استنفدوا الحد الذي يُخضعهم له GitHub: ميزانيتهم الخاصة، أو حد مركز التكلفة، أو الحد لكل مستخدم. يوقف GitHub أرصدة الذكاء الاصطناعي لهم حتى الشهر القادم.',
  'Stopped when amount used ≥ limit of the user': 'يتوقف عندما يكون المبلغ المستخدَم ≥ حد المستخدم',
  'Select the number to see these users on the Users page.': 'اختر الرقم لترى هؤلاء المستخدمين في صفحة المستخدمين.',
  'A user stopped by a budget for an organization or the enterprise is not counted here; see Budgets used up.':
    'لا يُحسب هنا المستخدم الذي أوقفته ميزانية مؤسسة أو المؤسسة الكبرى؛ راجع ميزانيات نفدت.',
  'Each user has a limit of $30. 4 users have used $30, so they are stopped.': 'لكل مستخدم حد $30. استخدم 4 مستخدمين $30، لذلك توقفوا.',

  // Users near their limit
  'Users who have used 80% or more of their own budget or limit, but not all of it.': 'مستخدمون استخدموا 80% أو أكثر من ميزانيتهم أو حدهم، لكن ليس كله.',
  'Near when 80% ≤ amount used ÷ limit < 100%': 'قريب عندما يكون 80% ≤ المبلغ المستخدَم ÷ الحد < 100%',
  'When a user has several limits, only the most specific one counts: their own budget, then their cost center limit, then the limit for each user.':
    'عندما يكون للمستخدم عدة حدود، يُحسب أدقها فقط: ميزانيته الخاصة، ثم حد مركز التكلفة، ثم الحد لكل مستخدم.',
  'A user with a limit of $30 has used $26. That is 87%, so the user is near the limit.': 'مستخدم حده $30 استخدم $26. هذا 87%، فهو قريب من الحد.',

  // How full each budget is
  'One bar for each budget of the enterprise, an organization, a cost center or a repository: the share of it used this month.':
    'عمود لكل ميزانية للمؤسسة الكبرى أو مؤسسة أو مركز تكلفة أو مستودع: الحصة المستخدمة منها هذا الشهر.',
  'Share used = amount used ÷ budget': 'الحصة المستخدمة = المبلغ المستخدَم ÷ الميزانية',
  'Under 50%, 50% to 80%, 80% to 100% and Used up give the color of the bar.': 'أقل من 50%، ومن 50% إلى 80%، ومن 80% إلى 100%، ونفدت، تحدد لون العمود.',
  'The dashed line is 100%.': 'الخط المتقطع هو 100%.',
  'Select a bar to open the Organization page filtered to that organization, cost center or repository.': 'اختر عمودًا لفتح صفحة المؤسسة مصفّاة على تلك المؤسسة أو مركز التكلفة أو المستودع.',
  'At most 30 budgets are drawn. The table at the bottom of the page lists every budget.': 'تُرسم 30 ميزانية على الأكثر. يعرض الجدول أسفل الصفحة كل الميزانيات.',
  'Budgets with no amount used from GitHub are left out.': 'تُستبعد الميزانيات التي لم يعطِ GitHub مبلغها المستخدَم.',
  'northwind-apps has $860 used of $1,000, so its bar shows 86% in the near-the-limit color.': 'استخدمت northwind-apps مبلغ $860 من $1,000، فيُظهر عمودها 86% بلون القرب من الحد.',

  // Month pace of a budget
  'Month pace of a budget': 'وتيرة الشهر لميزانية',
  'How one budget fills up day by day in the month the data was collected, and the day it runs out at the current pace.':
    'كيف تمتلئ ميزانية واحدة يومًا بيوم في شهر جمع البيانات، واليوم الذي تنفد فيه بالوتيرة الحالية.',
  'Projected for the month = amount used + billed per day × days left': 'المتوقع للشهر = المبلغ المستخدَم + المدفوع إضافيًا في اليوم × الأيام المتبقية',
  'The solid line is the billed amount so far for what the budget covers, from the usage report.': 'الخط المتصل هو المبلغ المدفوع إضافيًا حتى الآن لما تغطيه الميزانية، من تقرير الاستخدام.',
  'The dashed line goes on at the average billed per day of the last 7 days.': 'يستمر الخط المتقطع بمتوسط المدفوع إضافيًا في اليوم خلال آخر 7 أيام.',
  'The dashed red line is the budget. The dot marks the day the budget runs out.': 'الخط الأحمر المتقطع هو الميزانية. وتحدد النقطة يوم نفاد الميزانية.',
  'When the usage report cannot show the budget day by day, the chart shows only the amount GitHub showed.': 'عندما لا يستطيع تقرير الاستخدام عرض الميزانية يومًا بيوم، يعرض الرسم المبلغ الذي أظهره GitHub فقط.',
  'The usage report can differ a little from what GitHub counts against a budget.': 'قد يختلف تقرير الاستخدام قليلًا عما يحسبه GitHub على الميزانية.',
  'The filters do not change this chart.': 'لا تغيّر عوامل التصفية هذا الرسم.',
  'On day 20 the budget has $560 used and $30 is billed per day. The month ends at about $860, over the $800 budget.':
    'في اليوم 20 استُخدم من الميزانية $560 ويُدفع $30 إضافيًا في اليوم. ينتهي الشهر عند نحو $860، فوق ميزانية $800.',

  // Users and their budgets
  'Every user that GitHub listed against a limit for users, with how much of it they used.': 'كل مستخدم أدرجه GitHub تحت حد للمستخدمين، مع ما استخدمه منه.',
  'Share used = amount used by the user ÷ limit of the user': 'الحصة المستخدمة = المبلغ الذي استخدمه المستخدم ÷ حد المستخدم',
  'A user with several limits is shown once, with the most specific one: their own budget, then their cost center limit, then the limit for each user.':
    'يظهر المستخدم الذي له عدة حدود مرة واحدة، مع أدقها: ميزانيته الخاصة، ثم حد مركز التكلفة، ثم الحد لكل مستخدم.',
  'The four boxes count the users in each level.': 'تعدّ المربعات الأربعة المستخدمين في كل مستوى.',
  'Users with a special limit that differs from the shared one are left out, because GitHub does not say their amount used.':
    'يُستبعد المستخدمون الذين لهم حد خاص يختلف عن الحد المشترك، لأن GitHub لا يذكر المبلغ الذي استخدموه.',
  'The limit for each user is $30. A user who used $12 is at 40%, under 50%.': 'الحد لكل مستخدم $30. المستخدم الذي استخدم $12 عند 40%، أي أقل من 50%.',

  // Limit map
  'Every AI credit limit for GitHub Copilot on one map, read from the bottom up in the order GitHub checks them. At the bottom, each user is a small glass in the group of the one limit that holds them: their own budget, their cost center, the limit for each user, or no limit. Above them are the included credits, then the spending limits of cost centers, organizations and repositories, and the spending limit of the enterprise at the top. Each glass fills to the share used.':
    'كل حدود أرصدة الذكاء الاصطناعي في GitHub Copilot على خريطة واحدة، تُقرأ من الأسفل إلى الأعلى بالترتيب الذي يفحصها به GitHub. في الأسفل، كل مستخدم كأس صغيرة في مجموعة الحد الوحيد الذي يخضع له: ميزانيته الخاصة، أو مركز التكلفة الخاص به، أو الحد لكل مستخدم، أو بلا حد. وفوقهم الأرصدة المشمولة، ثم حدود الإنفاق لمراكز التكلفة والمؤسسات والمستودعات، ثم حد الإنفاق للمؤسسة الكبرى في الأعلى. وكل كأس تمتلئ بقدر الحصة المستخدمة.',
  'Limit of a user = own budget, else cost center limit, else limit for each user; fill of a glass = amount used ÷ limit':
    'حد المستخدم = الميزانية الخاصة، وإلا حد مركز التكلفة، وإلا الحد لكل مستخدم؛ تعبئة الكأس = المبلغ المستخدَم ÷ الحد',
  'Limits for users cap all AI credit usage of one user, included credits too, and always stop usage.':
    'تحدّ حدود المستخدمين كل استخدام المستخدم لأرصدة الذكاء الاصطناعي، والأرصدة المشمولة أيضًا، وتوقف الاستخدام دائمًا.',
  'Included credits pay for the usage while they last. Only the rest is billed.': 'تدفع الأرصدة المشمولة ثمن الاستخدام ما دامت متاحة. ولا يُفوتر إلا الباقي.',
  'Spending limits (cost center, organization, repository, enterprise) cap the amount billed. They stop usage only when set to stop usage. A large glass fills to the share used of each spending limit, as GitHub showed it.':
    'تحدّ حدود الإنفاق (مركز التكلفة، المؤسسة، المستودع، المؤسسة الكبرى) المبلغ المدفوع إضافيًا. ولا توقف الاستخدام إلا إذا ضُبطت لإيقافه. وتمتلئ الكأس الكبيرة بالحصة المستخدمة من كل حد إنفاق، كما أظهرها GitHub.',
  'The cost center of a user comes from the list GitHub gave for the cost center limit, else the user, team or organization in the cost center, else the usage report. The organizations and repositories of a user come from their seats and from the usage report.':
    'يُؤخذ مركز تكلفة المستخدم من القائمة التي أعطاها GitHub لحد مركز التكلفة، وإلا من المستخدم أو الفريق أو المؤسسة في مركز التكلفة، وإلا من تقرير الاستخدام. وتُؤخذ مؤسسات المستخدم ومستودعاته من مقاعده ومن تقرير الاستخدام.',
  'Users held to a limit are users with usage in the month of the data or listed by GitHub. A user glass fills to the amount GitHub showed, or else the usage in the report, divided by their limit. Its color shows the level: under 50%, 50% to 80%, 80% to 100%, or used up. A user with no limit has an empty glass with a dashed line.':
    'المستخدمون الخاضعون لحد هم من لهم استخدام في شهر البيانات أو أدرجهم GitHub. وتمتلئ كأس المستخدم بالمبلغ الذي أظهره GitHub، وإلا بالاستخدام في التقرير، مقسومًا على حده. ويدل لونها على المستوى: أقل من 50%، أو من 50% إلى 80%، أو من 80% إلى 100%، أو نفد. والمستخدم الذي لا حد له كأسه فارغة بخط متقطع.',
  'Select a user, a group or a glass to see every limit that holds it. Each one gets the number of its step in the order GitHub checks them, the line between the steps moves up, and the rest fades. The side panel explains each step.':
    'اختر مستخدمًا أو مجموعة أو كأسًا لترى كل حد يخضع له. يأخذ كل حد رقم خطوته بالترتيب الذي يفحصها به GitHub، ويتحرك الخط بين الخطوات إلى الأعلى، ويبهت الباقي. وتشرح اللوحة الجانبية كل خطوة.',
  'Play the month to see the user glasses fill day by day. Each day uses the usage report, included credits too, because GitHub gives only the amount used so far. The large glasses keep what GitHub showed when the data was collected.':
    'شغّل الشهر لترى كؤوس المستخدمين تمتلئ يومًا بعد يوم. يعتمد كل يوم على تقرير الاستخدام، مع الأرصدة المشمولة، لأن GitHub لا يعطي إلا المبلغ المستخدَم حتى الآن. وتبقى الكؤوس الكبيرة على ما أظهره GitHub عند جمع البيانات.',
  'Own credit share means the cost center may use only the included credits of its own members.': '«حصة أرصدة خاصة» تعني أن مركز التكلفة يستخدم الأرصدة المشمولة لأعضائه فقط.',
  'When a user is in teams or organizations of different cost centers, the data file does not say which one GitHub picked, so the usage report decides.':
    'عندما يكون المستخدم في فرق أو مؤسسات تتبع مراكز تكلفة مختلفة، لا يذكر ملف البيانات أيها اختار GitHub، لذلك يحسم تقرير الاستخدام الأمر.',
  'The filters do not change this picture.': 'لا تغيّر عوامل التصفية هذه الصورة.',
  'The enterprise has a spending limit of $5,000. Mobile Studio has a limit of $20 for each user, and everyone else has $30. Select a Mobile Studio user who used $16: their glass is 80% full, and the map marks the Mobile Studio spending limit as step 3 and the enterprise as step 4.':
    'للمؤسسة الكبرى حد إنفاق $5,000. ولـ Mobile Studio حد $20 لكل مستخدم، ولكل الآخرين $30. اختر مستخدمًا من Mobile Studio استخدم $16: كأسه ممتلئة بنسبة 80%، وتعلّم الخريطة حد إنفاق Mobile Studio بالخطوة 3 والمؤسسة الكبرى بالخطوة 4.',

  // AI credit limit of a user
  'AI credit limit of a user': 'حد أرصدة الذكاء الاصطناعي لمستخدم',
  'The most specific limit GitHub holds this user to in the month of the data, shown as their target: their own budget, their cost center limit or the limit for each user.':
    'أدق حد يُخضع GitHub له هذا المستخدم في شهر البيانات، ويظهر هدفًا له: ميزانيته الخاصة، أو حد مركز التكلفة، أو الحد لكل مستخدم.',
  'Share used = amount used this month ÷ limit; projected = amount used + usage per day × days left':
    'الحصة المستخدمة = المبلغ المستخدَم هذا الشهر ÷ الحد؛ المتوقع = المبلغ المستخدَم + الاستخدام في اليوم × الأيام المتبقية',
  'The amount used is what GitHub showed for the user. When GitHub did not list the user, it is the usage of the user in the report this month, included credits too.':
    'المبلغ المستخدَم هو ما أظهره GitHub للمستخدم. وعندما لا يُدرج GitHub المستخدم، يكون استخدامه في التقرير هذا الشهر، والأرصدة المشمولة أيضًا.',
  'Usage per day is the average of the last 7 days in the report.': 'الاستخدام في اليوم هو متوسط آخر 7 أيام في التقرير.',
  'Reaches the limit is the day the projection crosses the limit.': '«يبلغ الحد» هو اليوم الذي يتجاوز فيه التوقع الحد.',
  'Replaces lists the broader limits that no longer apply to this user.': '«يحل محل» تسرد الحدود الأوسع التي لم تعد تنطبق على هذا المستخدم.',
  'The usage report can differ a little from what GitHub counts against a limit.': 'قد يختلف تقرير الاستخدام قليلًا عما يحسبه GitHub على الحد.',
  'The filters do not change this section.': 'لا تغيّر عوامل التصفية هذا القسم.',
  'The limit for each user is $30. By day 10 of a 31-day month, a user used $12 and uses about $1.50 a day. The month ends at about $43.50, and the user reaches the limit on day 22.':
    'الحد لكل مستخدم $30. بحلول اليوم 10 من شهر من 31 يومًا، استخدم مستخدم $12 ويستخدم نحو $1.50 في اليوم. ينتهي الشهر عند نحو $43.50، ويبلغ المستخدم الحد في اليوم 22.',

  // Billed usage with no budget
  'Organizations and cost centers with billed usage in the month of the data that have no budget for GitHub Copilot of their own.':
    'مؤسسات ومراكز تكلفة لها استخدام مدفوع إضافيًا في شهر البيانات وليست لها ميزانية خاصة لـ GitHub Copilot.',
  'Billed = sum of net_amount in the month, for each organization and cost center with no budget': 'المدفوع إضافيًا = مجموع net_amount في الشهر، لكل مؤسسة ومركز تكلفة بلا ميزانية',
  'A budget for the whole enterprise may still cover this usage.': 'قد تغطي ميزانية المؤسسة كلها هذا الاستخدام.',
  'The list is shown only when the budgets were read in full, so a failed read is not taken for a missing budget.':
    'تظهر القائمة فقط عندما تُقرأ الميزانيات كاملة، حتى لا تُعدّ القراءة الفاشلة ميزانيةً مفقودة.',
  'northwind-data has $420 billed this month and no budget, so it is listed.': 'لدى northwind-data مبلغ $420 مدفوع إضافيًا هذا الشهر ولا ميزانية لها، لذلك تظهر في القائمة.',

  // Budget changes
  'Budgets that were added, changed or removed, with the day and who did it, from the audit log in the GitHub data file.':
    'الميزانيات التي أُضيفت أو تغيّرت أو أُزيلت، مع اليوم ومن قام بذلك، من سجل التدقيق في ملف بيانات GitHub.',
  'Audit log events about budgets, newest first': 'أحداث سجل التدقيق عن الميزانيات، الأحدث أولًا',
  'The audit log needs an owner account. If the script could not read it, the list is empty.': 'يحتاج سجل التدقيق إلى حساب مالك. إذا لم يستطع السكربت قراءته، تكون القائمة فارغة.',
  'Budget changed, Sep 20 2026, northwind-apps, by MarcusWebb_nwind.': 'تغيّرت ميزانية، 20 سبتمبر 2026، northwind-apps، بواسطة MarcusWebb_nwind.',
};

export default arabic;
