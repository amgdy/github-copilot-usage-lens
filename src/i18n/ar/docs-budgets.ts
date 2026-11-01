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
  'Under 50%, 50% to 80%, 80% to 100% and 100% or more give the color of the bar.': 'أقل من 50%، ومن 50% إلى 80%، ومن 80% إلى 100%، و100% أو أكثر، تحدد لون العمود.',
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
  'All GitHub Copilot AI credit limits in one picture. The outer frame is the limit on all spending of the enterprise or organization. Each row inside it is one spending limit with the people it holds. Each square is one person, filled to the share of their user limit used.':
    'كل حدود أرصدة الذكاء الاصطناعي في GitHub Copilot في صورة واحدة. الإطار الخارجي هو حد الإنفاق كله للمؤسسة الكبرى أو المؤسسة. كل صف داخله حد إنفاق واحد مع الأشخاص الذين يضبطهم. وكل مربع شخص واحد، يمتلئ بقدر ما استخدم من حد المستخدم.',
  'Room left in a row = the smaller of its own room and the room in the frame; square fill = amount used ÷ user limit; limits inside = sum of the row limits ÷ frame limit':
    'المتبقي في صف = الأصغر بين المتبقي في حده والمتبقي في الإطار؛ امتلاء المربع = المبلغ المستخدَم ÷ حد المستخدم؛ الحدود الداخلية = مجموع حدود الصفوف ÷ حد الإطار',
  'The frame is the enterprise limit, or the organization limit in an organization file. Its color follows how full it is. A dashed frame means no limit was found for all spending.':
    'الإطار هو حد المؤسسة الكبرى، أو حد المؤسسة في ملف مؤسسة. يتبع لونه مدى امتلائه. والإطار المتقطع يعني أنه لم يُعثر على حد للإنفاق كله.',
  'A user goes in one row: the cost center row when they are in a cost center, else the row of their only seat organization when it has a limit, else the row of users held only by the frame. Users with seats in several organizations, or no seat, go in a row of their own, because GitHub picks one organization each billing cycle.':
    'يوضع كل مستخدم في صف واحد: صف مركز التكلفة إذا كان في مركز تكلفة، وإلا صف مؤسسة مقعده الوحيدة إذا كان لها حد، وإلا صف المستخدمين الذين لا يضبطهم إلا الإطار. ويوضع المستخدمون الذين لهم مقاعد في عدة مؤسسات، أو لا مقعد لهم، في صف خاص بهم، لأن GitHub يختار مؤسسة واحدة في كل دورة فوترة.',
  'A row shows its own limit, the room left and the user limit of each person. When the frame has less room than the row, the frame is reached first and the row says so.':
    'يعرض الصف حده والمتبقي فيه وحد المستخدم لكل شخص. وعندما يكون المتبقي في الإطار أقل من المتبقي في الصف، يُبلغ الإطار أولًا ويذكر الصف ذلك.',
  'The strip under the frame adds up the row limits. When they add up to more than the frame, they cannot all be used in full.':
    'يجمع الشريط تحت الإطار حدود الصفوف. وعندما يزيد مجموعها على حد الإطار، لا يمكن استخدامها كلها بالكامل.',
  'In an organization file, users in a cost center of the enterprise go in a dashed box under the frame. GitHub bills their usage to the cost center, so the organization limit does not count it. The cost center limit is not in an organization file.':
    'في ملف المؤسسة، يوضع المستخدمون الذين في مركز تكلفة للمؤسسة الكبرى في مربع متقطع تحت الإطار. يحمّل GitHub استخدامهم على مركز التكلفة، لذلك لا يحتسبه حد المؤسسة. وحد مركز التكلفة ليس في ملف المؤسسة.',
  'The user limit is individual, else the cost center default, else the universal default. A broader user limit is replaced, not added. It counts included credits too and always stops usage. A zero limit blocks at once and is drawn full. A missing limit has a dashed square.':
    'حد المستخدم هو الحد الفردي، وإلا حد مركز التكلفة الافتراضي، وإلا الحد العام الافتراضي. يُستبدل حد المستخدم الأوسع ولا يُضاف. ويحتسب الأرصدة المشمولة أيضًا ويوقف الاستخدام دائمًا. الحد الصفري يوقف الاستخدام فورًا ويُرسم ممتلئًا. والحد المفقود مربعه متقطع.',
  'The square colors are the share of the user limit used: under 50%, 50% to 80%, 80% to 100% and 100% or more. The numbers in the legend are counts of users. A row also counts its users who reached their user limit, at 100% or more.':
    'ألوان المربعات هي الحصة المستخدمة من حد المستخدم: أقل من 50%، ومن 50% إلى 80%، ومن 80% إلى 100%، و100% أو أكثر. والأرقام في وسيلة الإيضاح أعداد مستخدمين. ويعدّ كل صف أيضًا مستخدميه الذين بلغوا حد المستخدم، أي 100% أو أكثر.',
  'Select the frame, a row or a square to see its limits on the side. Play the month to fill the squares day by day with reported usage.':
    'اختر الإطار أو صفًا أو مربعًا لترى حدوده على الجانب. شغّل الشهر لتمتلئ المربعات يومًا بيوم بالاستخدام المذكور في التقرير.',
  'Icons show where a limit is set: a globe for the enterprise and the universal default, a building for an organization, a briefcase for a cost center and a person for an individual limit. A question mark marks a row whose spending limit is not clear, and a dashed circle a user with no user limit found.':
    'تبيّن الأيقونات أين وُضع الحد: كرة أرضية للمؤسسة الكبرى وللحد العام الافتراضي، ومبنى للمؤسسة، وحقيبة لمركز التكلفة، وشخص للحد الفردي. وعلامة الاستفهام لصف حد إنفاقه غير واضح، والدائرة المتقطعة لمستخدم لم يُعثر له على حد.',
  'A spending limit stops billed usage only when it is set to stop. Included credits pay first, so only the rest counts against it.':
    'يوقف حد الإنفاق الاستخدام المدفوع فقط إذا ضُبط على الإيقاف. تُدفع الأرصدة المشمولة أولًا، لذلك لا يُحتسب عليه إلا الباقي.',
  'The enterprise limit counts cost center usage by default. A cost center can be left out in GitHub; the file does not show that.':
    'يحتسب حد المؤسسة الكبرى استخدام مراكز التكلفة افتراضيًا. يمكن استثناء مركز تكلفة في GitHub، ولا يُظهر الملف ذلك.',
  'Repository budgets are left out of the map. The budget table lists them.':
    'تُستبعد ميزانيات المستودعات من الخريطة. ويعرضها جدول الميزانيات.',
  'Playback applies the current limits to past usage. Spending limits keep the amount used when the data was collected. It is not a history of who was blocked.':
    'يطبّق التشغيل الحدود الحالية على الاستخدام السابق. وتبقى حدود الإنفاق على المبلغ المستخدَم وقت جمع البيانات. هذا ليس سجلًا لمن أُوقف استخدامه.',
  'Missing limits are not proof of unlimited usage. The paid usage policy is not collected.':
    'غياب الحدود ليس دليلًا على أن الاستخدام غير محدود. ولا تُجمع سياسة الاستخدام المدفوع.',
  'The enterprise limit is $590 with $270 used, so $320 is left. Mobile Studio has a $15 limit with $10 used: its own room is $5, less than $320, so the row shows $5 left. A member with a $20 cost center default who used $16 has a square 80% full.':
    'حد المؤسسة الكبرى $590 واستُخدم منه $270، فيبقى $320. لدى Mobile Studio حد $15 استُخدم منه $10: المتبقي في حده $5، وهو أقل من $320، لذلك يعرض الصف $5 متبقية. والعضو الذي حده الافتراضي في مركز التكلفة $20 واستخدم $16 يمتلئ مربعه بنسبة 80%.',
  'The filters do not change this picture.': 'لا تغيّر عوامل التصفية هذه الصورة.',

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
