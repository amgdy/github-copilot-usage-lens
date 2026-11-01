import type { Dict } from '../core';

/** Arabic for the docs of the GitHub data file cards in `lib/metrics/docs/github.ts`. */
const arabic: Dict = {
  // GitHub data file
  'GitHub data file': 'ملف بيانات GitHub',
  'The file that the collector script saves: budgets, seats, members, billing, activity and seat changes, read from GitHub with the GitHub CLI. It adds what the usage report does not have.':
    'الملف الذي يحفظه سكربت جمع البيانات: الميزانيات والتراخيص والأعضاء والفوترة والنشاط وتغييرات التراخيص، مقروءة من GitHub باستخدام GitHub CLI. يضيف ما لا يحتويه تقرير الاستخدام.',
  'Parts complete = parts of the data that came back in full ÷ all parts the script asked for': 'الأجزاء المكتملة = أجزاء البيانات التي وصلت كاملة ÷ كل الأجزاء التي طلبها السكربت',
  'The script asks GitHub for each part of the data, for each organization and, for billing, for each month. Some parts take several requests, such as the users of each budget; they count as one part.':
    'يطلب السكربت من GitHub كل جزء من البيانات، لكل مؤسسة، ولكل شهر في حالة الفوترة. تحتاج بعض الأجزاء إلى عدة طلبات، مثل مستخدمي كل ميزانية، وتُحسب جزءًا واحدًا.',
  'Each part is complete, came back only in part, failed or was skipped. A part fails when the account has no access to it, when the feature is off, or when GitHub gives an error. The table shows what GitHub said.':
    'كل جزء إما مكتمل، أو وصل جزئيًا، أو فشل، أو تم تخطيه. يفشل الجزء عندما لا يملك الحساب صلاحية الوصول إليه، أو عندما تكون الميزة متوقفة، أو عندما تُرجع GitHub خطأ. يعرض الجدول ما قالته GitHub.',
  'The first line of the file says who collected it, when, for which enterprise or organizations, and for which months. The last line shows that the script finished.':
    'يذكر السطر الأول من الملف من جمعه ومتى، ولأي حساب Enterprise أو مؤسسات، ولأي أشهر. ويُظهر السطر الأخير أن السكربت انتهى.',
  'The app reads the file in this browser and keeps it in memory only. It is gone when you close the page or remove it.':
    'يقرأ التطبيق الملف في هذا المتصفح ويحتفظ به في الذاكرة فقط. ويختفي عندما تغلق الصفحة أو تزيله.',
  'When you load several GitHub data files, only the newest is used.': 'عندما تحمّل عدة ملفات بيانات GitHub، يُستخدم أحدثها فقط.',
  'The seats in the file are added to your license list, like a seat list from the REST API.': 'تُضاف التراخيص الموجودة في الملف إلى قائمة التراخيص، مثل قائمة التراخيص من REST API.',
  'Your own file is never used with the sample report, because it holds real people. The sample has made-up GitHub data of its own.':
    'لا يُستخدم ملفك أبدًا مع التقرير التجريبي، لأنه يضم أشخاصًا حقيقيين. للتقرير التجريبي بيانات GitHub وهمية خاصة به.',
  'A file that ends early is still read, and this page says so.': 'يُقرأ الملف الذي ينتهي قبل أوانه أيضًا، وتذكر هذه الصفحة ذلك.',
  'The script asked for 20 parts. 18 are complete, the audit log failed because it needs an owner, and the members of one organization came back only in part. The card shows 18 of 20 parts complete.':
    'طلب السكربت 20 جزءًا. اكتمل 18 منها، وفشل سجل التدقيق لأنه يتطلب مالكًا، ووصل أعضاء مؤسسة واحدة جزئيًا. تعرض البطاقة 18 من 20 جزءًا مكتملة.',

  // Usage report and GitHub billing by month
  'Usage report and GitHub billing by month': 'تقرير الاستخدام وفوترة GitHub حسب الشهر',
  'Sets each month of the usage report against the AI credit billing of GitHub in the GitHub data file, so you know whether the report is complete.':
    'يقارن كل شهر في تقرير الاستخدام بفوترة أرصدة الذكاء الاصطناعي في GitHub من ملف بيانات GitHub، لتعرف هل التقرير كامل.',
  'Gap = amount at GitHub − amount in the report, for each month': 'الفرق = المبلغ في GitHub − المبلغ في التقرير، لكل شهر',
  'GitHub billing for a month is the AI credit usage report of GitHub billing, or else the AI credit lines of the billing usage summary.':
    'فوترة GitHub لشهر ما هي تقرير استخدام أرصدة الذكاء الاصطناعي في فوترة GitHub، وإلا فأسطر أرصدة الذكاء الاصطناعي في ملخص استخدام الفوترة.',
  'An organization file is compared with the report rows of its organizations only. If none match, it is marked Not in the report instead of being compared with every row. An enterprise file is compared with every row.':
    'تُقارن بيانات المؤسسة بصفوف التقرير الخاصة بمؤسساتها فقط. وإذا لم تطابق أي مؤسسة، فتُعلّم بأنها غير موجودة في التقرير بدلًا من مقارنتها بكل الصفوف. أما ملف المؤسسة الكبرى فيُقارن بكل الصفوف.',
  'Same means the amounts agree. Report has less and Report has more mean they do not.': '«متطابق» يعني أن المبالغ متفقة. و«التقرير أقل» و«التقرير أكثر» يعنيان أنها غير متفقة.',
  'Month not over: the month had not ended when the data was collected. Part of the month: the report misses more than 3 days at the start or end of the month. Not in the report: the report has no days in the month or no matching organization. No GitHub billing: the file has no complete billing for the month.':
    '«الشهر لم ينتهِ»: لم يكن الشهر قد انتهى عند جمع البيانات. «جزء من الشهر»: يفتقد التقرير أكثر من 3 أيام في بداية الشهر أو نهايته. «غير موجود في التقرير»: لا يحتوي التقرير على أيام من الشهر أو لا توجد مؤسسة مطابقة. «لا توجد فوترة GitHub»: لا يحتوي الملف على فوترة كاملة للشهر.',
  'For September the report shows $9,000 of usage and GitHub shows $10,000. The gap of $1,000 is more than 2%, so the result is Report has less.':
    'في سبتمبر يُظهر التقرير استخدامًا بقيمة $9,000 وتُظهر GitHub مبلغ $10,000. الفرق $1,000 أكبر من 2%، لذا النتيجة «التقرير أقل».',

  // Whole GitHub Copilot bill
  'Whole GitHub Copilot bill': 'فاتورة GitHub Copilot كاملة',
  'What GitHub billed for GitHub Copilot each month: the seats and the AI credits billed on top of them. The usage report shows only the AI credits.':
    'ما فوترته GitHub مقابل GitHub Copilot كل شهر: التراخيص وأرصدة الذكاء الاصطناعي المدفوعة إضافيًا فوقها. يعرض تقرير الاستخدام أرصدة الذكاء الاصطناعي فقط.',
  'Total = seats + AI credits billed': 'الإجمالي = التراخيص + أرصدة الذكاء الاصطناعي المدفوعة إضافيًا',
  'Seats is the amount billed for GitHub Copilot seats in the billing usage summary of GitHub, after discounts.':
    'التراخيص هي المبلغ المفوتر مقابل تراخيص GitHub Copilot في ملخص استخدام الفوترة في GitHub، بعد الخصومات.',
  'AI credits billed is the amount billed for AI credits after the included credits and discounts. It comes from the AI credit usage report of GitHub billing, or else from the billing usage summary.':
    'أرصدة الذكاء الاصطناعي المدفوعة إضافيًا هي المبلغ المفوتر مقابل أرصدة الذكاء الاصطناعي بعد الأرصدة المشمولة والخصومات. تأتي من تقرير استخدام أرصدة الذكاء الاصطناعي في فوترة GitHub، وإلا فمن ملخص استخدام الفوترة.',
  'Seat-months is the number of seats billed for the month, as GitHub counts them.': 'أشهر التراخيص هي عدد التراخيص المفوترة عن الشهر، كما تحسبها GitHub.',
  'A month that was not over when the data was collected can still grow.': 'قد تزيد مبالغ الشهر الذي لم يكن قد انتهى عند جمع البيانات.',
  'A dash means the file has no complete billing for that part of the month, for example because the account cannot read it. The total then needs both parts.':
    'تعني الشرطة أن الملف لا يحتوي على فوترة كاملة لهذا الجزء من الشهر، مثلًا لأن الحساب لا يستطيع قراءتها. ولا يظهر الإجمالي إلا عند توفر الجزأين.',
  'The amounts cover the whole enterprise or the organizations in the file. The filters do not change them.':
    'تشمل المبالغ حساب Enterprise كله أو المؤسسات الموجودة في الملف. لا تغيّرها عوامل التصفية.',
  'In September 100 Business seats cost $1,900 and $350 of AI credits were billed on top. The total is $2,250.':
    'في سبتمبر كلّفت 100 ترخيص Business مبلغ $1,900، ودُفع $350 إضافيًا مقابل أرصدة الذكاء الاصطناعي. الإجمالي $2,250.',

  // Budgets at GitHub
  'Budgets at GitHub': 'الميزانيات في GitHub',
  'The budgets for GitHub Copilot that are set at GitHub, how much of each is used, and whether each one stops usage or only sends alerts.':
    'ميزانيات GitHub Copilot المحددة في GitHub، وكم استُخدم من كل منها، وهل توقف كل منها الاستخدام أم ترسل تنبيهات فقط.',
  'The list has the budgets for AI credits and the budgets for all of GitHub Copilot. Budgets for other products are only counted.':
    'تضم القائمة ميزانيات أرصدة الذكاء الاصطناعي وميزانيات GitHub Copilot كله. أما ميزانيات المنتجات الأخرى فتُعدّ فقط.',
  'The budget used as the monthly budget comes first. It is the AI credit budget of the same enterprise, or of the one organization in an organization file. When several apply, the smallest one is used. The others follow by scope, name and amount.':
    'تأتي أولًا الميزانية المستخدمة كميزانية شهرية. وهي ميزانية أرصدة الذكاء الاصطناعي لحساب Enterprise نفسه، أو للمؤسسة الوحيدة في ملف المؤسسة. وعندما تنطبق عدة ميزانيات، تُستخدم أصغرها. وتليها البقية حسب النطاق والاسم والمبلغ.',
  'Stops usage: GitHub blocks usage that costs AI credits once the budget is used up. Alerts only: GitHub keeps billing and sends alerts. Budgets for users always stop usage.':
    '«توقف الاستخدام»: تمنع GitHub الاستخدام الذي يكلّف أرصدة الذكاء الاصطناعي بمجرد نفاد الميزانية. «تنبيهات فقط»: تواصل GitHub الفوترة وترسل تنبيهات. ميزانيات المستخدمين توقف الاستخدام دائمًا.',
  'When Settings has no monthly budget, the budget used here becomes the monthly budget of this app. A budget you set in Settings is used instead.':
    'عندما لا توجد ميزانية شهرية في الإعدادات، تصبح الميزانية المستخدمة هنا الميزانية الشهرية لهذا التطبيق. أما الميزانية التي تحددها في الإعدادات فتُستخدم بدلًا منها.',
  'The amounts used are from the day the data was collected.': 'المبالغ المستخدمة هي كما كانت يوم جمع البيانات.',
  'A budget for all of GitHub Copilot is not used as the monthly budget, because it may cover more than AI credits.':
    'لا تُستخدم ميزانية GitHub Copilot كله كميزانية شهرية، لأنها قد تشمل أكثر من أرصدة الذكاء الاصطناعي.',
  'The enterprise has a $500 budget for AI credits that only sends alerts, and $450 of it is used. The list shows 90% used and Alerts only, and the app uses $500 as the monthly budget.':
    'لدى حساب Enterprise ميزانية $500 لأرصدة الذكاء الاصطناعي ترسل تنبيهات فقط، واستُخدم منها $450. تعرض القائمة 90% مستخدمة و«تنبيهات فقط»، ويستخدم التطبيق $500 ميزانيةً شهرية.',

  // Seats at GitHub
  'Seats at GitHub': 'التراخيص في GitHub',
  'The GitHub Copilot seats of each organization as GitHub counts them: all seats, seats with and without activity in this billing cycle, new seats and seats that end soon.':
    'تراخيص GitHub Copilot في كل مؤسسة كما تحسبها GitHub: كل التراخيص، والتراخيص التي لها نشاط والتي ليس لها نشاط في دورة الفوترة هذه، والتراخيص الجديدة، والتراخيص التي تنتهي قريبًا.',
  'Seats = GitHub Copilot seats that GitHub counts in each organization, added up': 'التراخيص = مجموع تراخيص GitHub Copilot التي تحسبها GitHub في كل مؤسسة',
  'The numbers come from the seat summary in the GitHub Copilot settings of each organization.': 'تأتي الأرقام من ملخص التراخيص في إعدادات GitHub Copilot لكل مؤسسة.',
  'Active and Inactive: seats with and without any GitHub Copilot activity in this billing cycle.': '«نشط» و«غير نشط»: تراخيص لها أو ليس لها أي نشاط في GitHub Copilot خلال دورة الفوترة هذه.',
  'Added: seats given in this billing cycle. Pending cancellation: seats that end at the end of this billing cycle. Pending invitation: seats that wait for the person to accept an invitation to the organization.':
    '«المُضاف»: تراخيص مُنحت في دورة الفوترة هذه. «بانتظار الإلغاء»: تراخيص تنتهي بنهاية دورة الفوترة هذه. «بانتظار قبول الدعوة»: تراخيص تنتظر أن يقبل الشخص دعوة إلى المؤسسة.',
  'How seats are given: to all members, to selected members or teams, turned off, or not set up yet.':
    'طريقة منح التراخيص: لكل الأعضاء، أو لأعضاء أو فرق مختارة، أو متوقفة، أو لم تُضبط بعد.',
  'The numbers are from the day the data was collected.': 'الأرقام كما كانت يوم جمع البيانات.',
  'The total adds up the organizations, so a person with a seat in more than one organization can count more than once.':
    'يجمع الإجمالي المؤسسات، لذا قد يُحسب الشخص الذي لديه ترخيص في أكثر من مؤسسة أكثر من مرة.',
  'An organization that the account could not read is left out.': 'تُستبعد المؤسسة التي لم يستطع الحساب قراءتها.',
  'An organization has 50 seats. 38 had activity in this billing cycle and 12 had none. 4 seats were added in this cycle and 2 end at the end of it.':
    'لدى مؤسسة 50 ترخيصًا. كان لـ38 منها نشاط في دورة الفوترة هذه ولم يكن لـ12 أي نشاط. أُضيفت 4 تراخيص في هذه الدورة وينتهي ترخيصان بنهايتها.',

  // Members without a seat
  'Members without a seat': 'أعضاء بلا ترخيص',
  'Members of the enterprise or organizations who have no GitHub Copilot seat. They are the people who could still get one.':
    'أعضاء حساب Enterprise أو المؤسسات الذين ليس لديهم ترخيص GitHub Copilot. هم من يمكن أن يحصلوا على ترخيص.',
  'Members without a seat = members − members who have a seat in the file': 'أعضاء بلا ترخيص = الأعضاء − الأعضاء الذين لديهم ترخيص في الملف',
  'Members are the members of the enterprise, or of the organizations in an organization file. Each person counts once.':
    'الأعضاء هم أعضاء حساب Enterprise، أو أعضاء المؤسسات في ملف المؤسسة. يُحسب كل شخص مرة واحدة.',
  'A member has a seat when the seat list of the file has their login.': 'يكون للعضو ترخيص عندما تحتوي قائمة التراخيص في الملف على اسم المستخدم الخاص به.',
  'It is shown only when both the member list and the seat list came back in full.': 'لا يظهر إلا عندما تصل قائمة الأعضاء وقائمة التراخيص كاملتين.',
  'Outside collaborators are not members, so they are not counted.': 'المتعاونون الخارجيون ليسوا أعضاء، لذا لا يُحسبون.',
  'The organizations have 120 members and 100 of them have a seat, so 20 members have no seat.': 'لدى المؤسسات 120 عضوًا، ولدى 100 منهم ترخيص، لذا ليس لدى 20 عضوًا ترخيص.',

  // Activity at GitHub
  'Activity at GitHub': 'النشاط في GitHub',
  'Who used GitHub Copilot and which features, from the GitHub Copilot usage metrics. Unlike the usage report, it includes code completions, which cost no AI credits.':
    'من استخدم GitHub Copilot وأي الميزات، من مقاييس استخدام GitHub Copilot. وعلى خلاف تقرير الاستخدام، تشمل إكمالات التعليمات البرمجية، التي لا تكلّف أرصدة ذكاء اصطناعي.',
  'Active users = people with at least one day of activity in the usage metrics': 'المستخدمون النشطون = الأشخاص الذين لهم يوم نشاط واحد على الأقل في مقاييس الاستخدام',
  'The usage metrics have one line per person and day. A day counts when it shows any activity.': 'تحتوي مقاييس الاستخدام على سطر لكل شخص ويوم. يُحسب اليوم عندما يظهر فيه أي نشاط.',
  'Code completions, Chat, Agent and GitHub Copilot CLI count the people who used that feature on at least one day. One person can count in several.':
    'تعدّ إكمالات التعليمات البرمجية والمحادثة والوكيل وGitHub Copilot CLI الأشخاص الذين استخدموا تلك الميزة في يوم واحد على الأقل. وقد يُحسب الشخص الواحد في أكثر من واحدة.',
  'The period runs from the first to the last day of the usage metrics in the file.': 'تمتد الفترة من أول يوم إلى آخر يوم في مقاييس الاستخدام في الملف.',
  'By default the script reads the last 28 days. With the option --daily-metrics it reads every day of the months it collects.':
    'يقرأ السكربت افتراضيًا آخر 28 يومًا. ومع الخيار --daily-metrics يقرأ كل أيام الأشهر التي يجمعها.',
  'The usage metrics need the usage metrics policy for GitHub Copilot to be on. Without it this card is not shown.':
    'تحتاج مقاييس الاستخدام إلى تفعيل سياسة مقاييس استخدام GitHub Copilot. ومن دونها لا تظهر هذه البطاقة.',
  'Agent counts agent mode in the editor and the GitHub Copilot coding agent.': 'يشمل الوكيل وضع الوكيل في المحرر ووكيل البرمجة في GitHub Copilot.',
  'In the last 28 days 80 people were active: 75 used code completions, 60 used chat and 20 used agent mode.':
    'في آخر 28 يومًا كان 80 شخصًا نشطين: استخدم 75 منهم إكمالات التعليمات البرمجية، و60 المحادثة، و20 وضع الوكيل.',

  // Active at GitHub with no usage in the report
  'Active at GitHub with no usage in the report': 'نشطون في GitHub بلا استخدام في التقرير',
  'People who were active in the GitHub Copilot usage metrics on days the usage report covers, but have no row in the report on those days. They use their seat, often for code completions only, so do not treat it as idle.':
    'أشخاص كانوا نشطين في مقاييس استخدام GitHub Copilot في أيام يغطيها تقرير الاستخدام، لكن ليس لهم صف في التقرير في تلك الأيام. إنهم يستخدمون ترخيصهم، غالبًا لإكمالات التعليمات البرمجية فقط، فلا تعامله كترخيص خامل.',
  'Active with no usage = people active at GitHub on the shared days − people with a row in the report on those days':
    'نشطون بلا استخدام = الأشخاص النشطون في GitHub في الأيام المشتركة − الأشخاص الذين لهم صف في التقرير في تلك الأيام',
  'The shared days are the days that both the usage metrics and the usage report cover.': 'الأيام المشتركة هي الأيام التي تغطيها مقاييس الاستخدام وتقرير الاستخدام معًا.',
  'A person is active on the shared days when the time between their first and last day of activity at GitHub covers part of them.':
    'يُعدّ الشخص نشطًا في الأيام المشتركة عندما تغطي الفترة بين أول يوم وآخر يوم من نشاطه في GitHub جزءًا منها.',
  'Logins are matched without regard to upper and lower case.': 'تُطابق أسماء المستخدمين دون اعتبار للأحرف الكبيرة والصغيرة.',
  'It uses every report row in the scope of the GitHub data file, not your filters.': 'يستخدم كل صفوف التقرير ضمن نطاق ملف بيانات GitHub، لا عوامل التصفية.',
  'It uses every row you loaded, not the filters.': 'يستخدم كل الصفوف التي حمّلتها، لا عوامل التصفية.',
  'Only the first and the last day of activity are known, so a person who was active only before and after the shared days is counted too. This is rare.':
    'لا يُعرف إلا أول يوم وآخر يوم من النشاط، لذا يُحسب أيضًا الشخص الذي كان نشطًا قبل الأيام المشتركة وبعدها فقط. وهذا نادر.',
  'It is not shown when the usage report and the usage metrics have no day in common.': 'لا يظهر عندما لا يكون بين تقرير الاستخدام ومقاييس الاستخدام أي يوم مشترك.',
  'The usage metrics cover October 1 to 28 and the report covers October 1 to 31. 80 people were active at GitHub and 70 of them have rows in the report, so 10 people are active with no usage.':
    'تغطي مقاييس الاستخدام من 1 إلى 28 أكتوبر، ويغطي التقرير من 1 إلى 31 أكتوبر. كان 80 شخصًا نشطين في GitHub، ولـ70 منهم صفوف في التقرير، لذا فإن 10 أشخاص نشطون بلا استخدام.',

  // Seat changes
  'Seat changes': 'تغييرات التراخيص',
  'How many GitHub Copilot seats were added and removed each month, and how many plan, budget and policy changes were made, from the audit log.':
    'كم ترخيص GitHub Copilot أُضيف وأُزيل كل شهر، وكم تغييرًا جرى على الخطط والميزانيات والسياسات، من سجل التدقيق.',
  'Seats added or removed = audit log events that give or take away a GitHub Copilot seat, by month':
    'التراخيص المضافة أو المزالة = أحداث سجل التدقيق التي تمنح ترخيص GitHub Copilot أو تسحبه، حسب الشهر',
  'The script reads the GitHub Copilot and billing events of the audit log for the months it collects.': 'يقرأ السكربت أحداث GitHub Copilot والفوترة من سجل التدقيق للأشهر التي يجمعها.',
  'An event about a seat counts as added when its name says the seat was created, assigned or given, and as removed when its name says the seat was cancelled, removed or taken away.':
    'يُحسب حدث الترخيص إضافةً عندما يذكر اسمه أن الترخيص أُنشئ أو عُيّن أو مُنح، ويُحسب إزالةً عندما يذكر اسمه أن الترخيص أُلغي أو أُزيل أو سُحب.',
  'Other events count as plan, budget or policy changes by their name. The rest count as other changes.':
    'تُحسب الأحداث الأخرى تغييرات في الخطة أو الميزانية أو السياسة حسب اسمها. ويُحسب الباقي تغييرات أخرى.',
  'Reading the audit log needs an owner of the enterprise or organization.': 'تتطلب قراءة سجل التدقيق مالكًا لحساب Enterprise أو المؤسسة.',
  'GitHub keeps audit log events for a limited time, so older months can be empty.': 'تحتفظ GitHub بأحداث سجل التدقيق لمدة محدودة، لذا قد تكون الأشهر الأقدم فارغة.',
  'An event without a readable date counts in the totals but not in a month.': 'يُحسب الحدث الذي ليس له تاريخ مقروء في المجاميع، لكنه لا يُحسب في أي شهر.',
  'In September the audit log shows 12 seats added and 5 removed, so 7 more seats were in use at the end of the month.':
    'في سبتمبر يُظهر سجل التدقيق إضافة 12 ترخيصًا وإزالة 5، لذا زاد عدد التراخيص المستخدمة في نهاية الشهر بمقدار 7.',
};

export default arabic;
