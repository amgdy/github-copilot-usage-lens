import type { Dict, PluralEntry } from '../core';

/** Arabic counted sentence: one, two, 3 to 10, 11 to 99, and 0 or 100 and up. */
const plural = (one: string, two: string, few: string, many: string, other: string): PluralEntry => ({ zero: other, one, two, few, many, other });

/** Arabic for the GitHub data file of the collector scripts: reading and loading it, its recommendations and its cards. */
const arabic: Dict = {
  // Reading the file (lib/collection)
  'This is not a GitHub data file from the collector script.': 'هذا ليس ملف بيانات GitHub من سكربت جمع البيانات.',
  'This GitHub data file was made by a newer version of the collector script. Open the newest version of this app to read it.':
    'أُنشئ ملف بيانات GitHub هذا بإصدار أحدث من سكربت جمع البيانات. افتح أحدث إصدار من هذا التطبيق لقراءته.',
  'The GitHub data file is empty.': 'ملف بيانات GitHub فارغ.',

  // Loading the file
  'This GitHub data file has no AI usage report. Choose it together with the usage report CSV from GitHub billing.':
    'لا يحوي ملف بيانات GitHub هذا تقرير استخدام الذكاء الاصطناعي. اختره مع ملف تقرير الاستخدام (CSV) من صفحة الفوترة في GitHub.',
  'The usage data comes from the AI usage report in this file: {months}.': 'بيانات الاستخدام مأخوذة من تقرير استخدام الذكاء الاصطناعي في هذا الملف: {months}.',
  'GitHub had not made the AI usage report for {months} yet. Run the script again in a few minutes to add it.':
    'لم يكن GitHub قد أعدّ تقرير استخدام الذكاء الاصطناعي عن {months} بعد. شغّل السكربت مرة أخرى بعد بضع دقائق لإضافته.',
  'The AI usage report for {months} has no usage.': 'لا يحوي تقرير استخدام الذكاء الاصطناعي عن {months} أي استخدام.',
  'The AI usage report for {month} has no usage yet. Run the script again later to add new usage.':
    'لا يحوي تقرير استخدام الذكاء الاصطناعي عن {month} أي استخدام بعد. شغّل السكربت مرة أخرى لاحقًا لإضافة الاستخدام الجديد.',
  'GitHub did not give the AI usage report for {months}. The Data page says why.':
    'لم يُرجع GitHub تقرير استخدام الذكاء الاصطناعي عن {months}. توضّح صفحة البيانات السبب.',
  'The AI usage report in this file was not used, because you chose a usage report CSV too.':
    'لم يُستخدم تقرير استخدام الذكاء الاصطناعي في هذا الملف، لأنك اخترت ملف تقرير استخدام (CSV) أيضًا.',
  'Some organizations did not give their seat list, so the list may be short.': 'لم تُرجع بعض المؤسسات قائمة تراخيصها، لذا قد تكون القائمة ناقصة.',
  '{name}: {problem}': '{name}: {problem}',
  '{name}: GitHub data file, {records}.': '{name}: ملف بيانات GitHub، {records}.',
  '{n} records': plural('سجل واحد', 'سجلان', '{n} سجلات', '{n} سجلًا', '{n} سجل'),
  'The file ends early, so some data may be missing. Run the script again and wait until it says the file is saved.':
    'ينتهي الملف قبل أوانه، لذا قد تنقص بعض البيانات. شغّل السكربت مرة أخرى وانتظر حتى يذكر أنه حفظ الملف.',
  '{n} parts of the data failed or came back only in part. The Data page lists them.': plural(
    'تعذّر جلب جزء واحد من البيانات أو وصل ناقصًا. تعرضه صفحة البيانات.',
    'تعذّر جلب جزأين من البيانات أو وصلا ناقصين. تعرضهما صفحة البيانات.',
    'تعذّر جلب {n} أجزاء من البيانات أو وصلت ناقصة. تعرضها صفحة البيانات.',
    'تعذّر جلب {n} جزءًا من البيانات أو وصلت ناقصة. تعرضها صفحة البيانات.',
    'تعذّر جلب {n} جزء من البيانات أو وصلت ناقصة. تعرضها صفحة البيانات.',
  ),
  'Only the newest GitHub data file is used. Not used: {names}.': 'يُستخدم أحدث ملف بيانات GitHub فقط. لم يُستخدم: {names}.',
  'GitHub data loaded': 'تم تحميل بيانات GitHub',
  'The GitHub data file was not loaded': 'لم يُحمَّل ملف بيانات GitHub',

  // Recommendations from the GitHub data file
  'The GitHub data file lists {n} budgets for GitHub Copilot. Check them on the Budgets page before you add more.': plural(
    'يذكر ملف بيانات GitHub ميزانية واحدة لـ GitHub Copilot. راجعها في صفحة الميزانيات قبل أن تضيف غيرها.',
    'يذكر ملف بيانات GitHub ميزانيتين لـ GitHub Copilot. راجعهما في صفحة الميزانيات قبل أن تضيف غيرهما.',
    'يذكر ملف بيانات GitHub {n} ميزانيات لـ GitHub Copilot. راجعها في صفحة الميزانيات قبل أن تضيف غيرها.',
    'يذكر ملف بيانات GitHub {n} ميزانية لـ GitHub Copilot. راجعها في صفحة الميزانيات قبل أن تضيف غيرها.',
    'يذكر ملف بيانات GitHub {n} ميزانية لـ GitHub Copilot. راجعها في صفحة الميزانيات قبل أن تضيف غيرها.',
  ),
  'As of {day}, when the GitHub data was collected.': 'حتى {day}، يوم جمع بيانات GitHub.',
  'GitHub shows {consumed} of the {amount} budget used ({share}).': 'يُظهر GitHub استخدام {consumed} من ميزانية {amount} ({share}).',
  'The {amount} budget only sends alerts, so the bill can go past it': 'ميزانية {amount} ترسل تنبيهات فقط، لذا قد تتجاوزها الفاتورة',
  'This budget does not stop usage. GitHub keeps billing after the limit and only sends alerts. Decide whether that is what you want.':
    'هذه الميزانية لا توقف الاستخدام. يواصل GitHub الفوترة بعد الحد ويكتفي بإرسال التنبيهات. قرّر هل هذا ما تريده.',
  'Budget alerts are on: GitHub sends an email at 75%, 90% and 100% of the budget.': 'تنبيهات الميزانية مفعّلة: يرسل GitHub رسالة بريد إلكتروني عند 75% و90% و100% من الميزانية.',
  'Budget alerts are off, so nobody is told when the budget runs out.': 'تنبيهات الميزانية متوقفة، لذا لن يعلم أحد عند نفاد الميزانية.',
  'To cap the bill, edit the budget and select "Stop usage when budget limit is reached".': 'لوضع حد للفاتورة، عدّل الميزانية واختر «Stop usage when budget limit is reached».',
  'To keep everyone working, raise the budget to what you expect to pay, so its alerts still mean something.': 'لكي يواصل الجميع العمل، ارفع الميزانية إلى ما تتوقع دفعه، لتبقى تنبيهاتها مفيدة.',
  'Check that the right people get the budget alerts.': 'تأكد من أن تنبيهات الميزانية تصل إلى الأشخاص المناسبين.',
  'Turn on budget alerts so the right people hear about it early.': 'فعّل تنبيهات الميزانية ليعلم الأشخاص المناسبون مبكرًا.',
  'Usage that costs AI credits stops when the {amount} budget runs out': 'يتوقف الاستخدام الذي يكلّف أرصدة الذكاء الاصطناعي عند نفاد ميزانية {amount}',
  'This budget stops usage. Once it runs out, GitHub blocks usage that costs AI credits until the next billing cycle or until the budget is raised.':
    'هذه الميزانية توقف الاستخدام. عند نفادها يمنع GitHub الاستخدام الذي يكلّف أرصدة الذكاء الاصطناعي حتى دورة الفوترة التالية أو حتى رفع الميزانية.',
  'Decide before the limit is reached: raise the budget so the work can go on, or keep the stop and tell people when usage comes back.':
    'قرّر قبل بلوغ الحد: ارفع الميزانية ليستمر العمل، أو أبقِ الإيقاف وأخبر الناس متى يعود الاستخدام.',
  'Apply the usage levers below to make the budget last longer.': 'طبّق إجراءات الاستخدام أدناه لتدوم الميزانية مدة أطول.',
  '{n} users reached their budget and cannot use AI credits': plural(
    'مستخدم واحد بلغ ميزانيته ولا يمكنه استخدام أرصدة الذكاء الاصطناعي',
    'مستخدمان بلغا ميزانيتهما ولا يمكنهما استخدام أرصدة الذكاء الاصطناعي',
    '{n} مستخدمين بلغوا ميزانياتهم ولا يمكنهم استخدام أرصدة الذكاء الاصطناعي',
    '{n} مستخدمًا بلغوا ميزانياتهم ولا يمكنهم استخدام أرصدة الذكاء الاصطناعي',
    '{n} مستخدم بلغوا ميزانياتهم ولا يمكنهم استخدام أرصدة الذكاء الاصطناعي',
  ),
  'Budgets for users always stop usage. These people cannot use features that cost AI credits until the next billing cycle or until their budget is raised.':
    'ميزانيات المستخدمين توقف الاستخدام دائمًا. لا يستطيع هؤلاء استخدام الميزات التي تكلّف أرصدة الذكاء الاصطناعي حتى دورة الفوترة التالية أو حتى رفع ميزانيتهم.',
  '{name}: {consumed} used of a {limit} budget.': '{name}: استُخدم {consumed} من ميزانية قدرها {limit}.',
  '{n} more users also reached their budget.': plural(
    'بلغ مستخدم آخر ميزانيته أيضًا.',
    'بلغ مستخدمان آخران ميزانيتهما أيضًا.',
    'بلغ {n} مستخدمين آخرين ميزانياتهم أيضًا.',
    'بلغ {n} مستخدمًا آخر ميزانياتهم أيضًا.',
    'بلغ {n} مستخدم آخر ميزانياتهم أيضًا.',
  ),
  'Ask each person whether the work needs more. If it does, give them their own budget, with an end date for a short need.':
    'اسأل كل شخص هل يحتاج عمله إلى المزيد. إن كان كذلك، فامنحه ميزانية خاصة به، مع تاريخ انتهاء إذا كانت الحاجة قصيرة.',
  'If many people reach the same budget, raise it for everyone or for their cost center.': 'إذا بلغ كثيرون الميزانية نفسها، فارفعها للجميع أو لمركز التكلفة الخاص بهم.',
  'Share the usage levers below with people who reach their budget early in the month.': 'شارك إجراءات الاستخدام أدناه مع من يبلغون ميزانيتهم في أول الشهر.',
  'Show these users': 'اعرض هؤلاء المستخدمين',
  'The usage report does not match GitHub billing': 'تقرير الاستخدام لا يطابق فوترة GitHub',
  'In some months the usage report and GitHub billing do not agree, so figures from the report may be off. GitHub billing is what you pay.':
    'في بعض الأشهر لا يتفق تقرير الاستخدام مع فوترة GitHub، لذا قد تكون أرقام التقرير غير دقيقة. فوترة GitHub هي ما تدفعه.',
  '{month}: usage {reportUsage} in the report and {githubUsage} at GitHub; billed {reportBilled} and {githubBilled}.':
    '{month}: الاستخدام {reportUsage} في التقرير و{githubUsage} في GitHub؛ والمدفوع إضافيًا {reportBilled} و{githubBilled}.',
  'Only the report rows of {orgs} are compared, the organizations in the GitHub data file.': 'تُقارن صفوف التقرير الخاصة بـ {orgs} فقط، وهي المؤسسات الموجودة في ملف بيانات GitHub.',
  'Download the usage report again for the whole month and load all its files together.': 'نزّل تقرير الاستخدام مرة أخرى للشهر كاملًا وحمّل كل ملفاته معًا.',
  'Check that the usage report and the GitHub data file cover the same enterprise or organizations.': 'تأكد من أن تقرير الاستخدام وملف بيانات GitHub يغطيان Enterprise نفسها أو المؤسسات نفسها.',
  '{n} organizations give a seat to every member, used or not': plural(
    'مؤسسة واحدة تمنح ترخيصًا لكل عضو، سواء استُخدم أم لا',
    'مؤسستان تمنحان ترخيصًا لكل عضو، سواء استُخدم أم لا',
    '{n} مؤسسات تمنح ترخيصًا لكل عضو، سواء استُخدم أم لا',
    '{n} مؤسسة تمنح ترخيصًا لكل عضو، سواء استُخدم أم لا',
    '{n} مؤسسة تمنح ترخيصًا لكل عضو، سواء استُخدم أم لا',
  ),
  'Each member of these organizations gets a paid seat, and billing starts when the seat is given, not at first use. Giving seats only to chosen members or teams keeps them for people who use them.':
    'يحصل كل عضو في هذه المؤسسات على ترخيص مدفوع، وتبدأ الفوترة عند منح الترخيص لا عند أول استخدام. ومنح التراخيص لأعضاء أو فرق مختارة فقط يبقيها لمن يستخدمها.',
  '{org}: {inactive} of {total} seats had no GitHub Copilot activity this billing cycle.':
    '{org}: لم يُسجَّل أي نشاط في GitHub Copilot خلال دورة الفوترة هذه على {inactive} من أصل {total} من التراخيص.',
  'In the GitHub Copilot settings of the organization, give access to selected members or teams instead of all members.':
    'في إعدادات GitHub Copilot للمؤسسة، امنح الوصول لأعضاء أو فرق مختارة بدلًا من كل الأعضاء.',
  'Ask the owners of the inactive seats whether they still need access.': 'اسأل أصحاب التراخيص غير النشطة هل ما زالوا يحتاجون إلى الوصول.',

  // Shared labels of the GitHub cards (pages/githubText.ts)
  'From the GitHub data file collected on {day}.': 'من ملف بيانات GitHub الذي جُمع في {day}.',
  'Enterprise {name}': 'حساب Enterprise {name}',
  'Organization {name}': 'المؤسسة {name}',
  'Organizations {names}': 'المؤسسات {names}',
  'Organizations in the enterprise': 'المؤسسات في حساب Enterprise',
  'GitHub Copilot seats': 'تراخيص GitHub Copilot',
  'Seat totals and policies': 'مجاميع التراخيص والسياسات',
  Members: 'الأعضاء',
  'Members of each team': 'أعضاء كل فريق',
  Budgets: 'الميزانيات',
  'AI credits billed': 'أرصدة الذكاء الاصطناعي المدفوعة إضافيًا',
  'Billing summary': 'ملخص الفوترة',
  'Daily charges': 'الرسوم اليومية',
  'Activity per user': 'النشاط لكل مستخدم',
  'Activity totals': 'مجاميع النشاط',
  'Teams of each user': 'فرق كل مستخدم',
  Complete: 'مكتمل',
  'In part': 'جزئي',
  Failed: 'فشل',
  Skipped: 'تم تخطيه',
  Same: 'متطابق',
  'Report has more': 'التقرير أكثر',
  'Report has less': 'التقرير أقل',
  'Part of the month': 'جزء من الشهر',
  'Month not over': 'الشهر لم ينتهِ',
  'No GitHub billing': 'لا توجد فوترة GitHub',
  'Each user': 'كل مستخدم',
  'Each user in a cost center': 'كل مستخدم في مركز تكلفة',
  'One user': 'مستخدم واحد',
  '{scope}: {name}': '{scope}: {name}',
  'All members': 'كل الأعضاء',
  'Selected members or teams': 'أعضاء أو فرق مختارة',
  'Turned off': 'متوقف',
  'Not set up': 'غير مضبوط',

  // GitHub data file card (Data page)
  'Mac or Linux': 'Mac أو Linux',
  'Get the GitHub CLI': 'ثبّت GitHub CLI',
  'Install it and sign in with {command}. The script asks for any other access it needs.': 'ثبّته وسجّل الدخول بالأمر {command}. يطلب السكربت أي صلاحية أخرى يحتاجها.',
  'Make the command': 'جهّز الأمر',
  'Your computer': 'جهازك',
  Collect: 'اجمع من',
  'Enterprise name in its GitHub address': 'اسم حساب Enterprise كما في عنوانه على GitHub',
  'Organization names': 'أسماء المؤسسات',
  Months: 'الأشهر',
  'Counting this month, 1 to 24.': 'مع الشهر الحالي، من ١ إلى ٢٤.',
  'GitHub host': 'خادم GitHub',
  'Leave it empty for GitHub.com. With data residency, type your host, for example octocorp.ghe.com.':
    'اتركه فارغًا لموقع GitHub.com. ومع إقامة البيانات، اكتب اسم خادمك، مثل octocorp.ghe.com.',
  'Activity of every day': 'نشاط كل يوم',
  'Makes older months exact. It takes longer and the file is larger.': 'يجعل الأشهر الأقدم دقيقة. يستغرق وقتًا أطول ويكون الملف أكبر.',
  'Team members': 'أعضاء الفرق',
  'Adds the teams of each user. It sends one request per team.': 'يضيف فرق كل مستخدم. يرسل طلبًا واحدًا لكل فريق.',
  'Without a name, the script asks for it when it starts.': 'إن لم تكتب اسمًا، يطلبه السكربت عند بدئه.',
  'The command gets the script from GitHub and runs it, so there is nothing to download or install.':
    'يجلب الأمر السكربت من GitHub ويشغّله، فلا حاجة إلى تنزيل شيء أو تثبيته.',
  'Read the script on GitHub': 'اقرأ السكربت على GitHub',
  'Run it and load the file': 'شغّله وحمّل الملف',
  'Open a terminal, paste the command and press Enter. The script shows its plan and asks before it starts. It only reads from GitHub.':
    'افتح الطرفية، والصق الأمر واضغط Enter. يعرض السكربت خطته ويسألك قبل أن يبدأ. وهو يقرأ من GitHub فقط.',
  'Open PowerShell or Command Prompt, paste the command and press Enter. The script shows its plan and asks before it starts. It only reads from GitHub.':
    'افتح PowerShell أو موجه الأوامر، والصق الأمر واضغط Enter. يعرض السكربت خطته ويسألك قبل أن يبدأ. وهو يقرأ من GitHub فقط.',
  'When it says the file is saved, drop the file here. It has the AI usage report too, so it is the only file you need. You need to be an enterprise owner or billing manager.':
    'حين يذكر أنه حفظ الملف، أفلت الملف هنا. فهو يحوي تقرير استخدام الذكاء الاصطناعي أيضًا، فلا تحتاج إلى ملف آخر. يلزم أن تكون مالك حساب Enterprise أو مدير فوترة فيه.',
  'When it says the file is saved, drop it here together with the usage report CSV from GitHub billing. GitHub makes the AI usage report file only for enterprises. You need to be an organization owner or billing manager.':
    'حين يذكر أنه حفظ الملف، أفلته هنا مع ملف تقرير الاستخدام (CSV) من صفحة الفوترة في GitHub. لا يُعدّ GitHub ملف تقرير استخدام الذكاء الاصطناعي إلا لحسابات Enterprise. يلزم أن تكون مالك المؤسسة أو مدير فوترة فيها.',
  'Left out: {names}. A name has only letters, digits, dots, dashes and underscores.': 'لم يُضف: {names}. يتكون الاسم من حروف وأرقام ونقاط وشرطات وشرطات سفلية فقط.',
  'Only the first enterprise is used. Run the script once for each enterprise.': 'يُستخدم أول حساب Enterprise فقط. شغّل السكربت مرة لكل حساب Enterprise.',
  'Left out: the host. Type only the host name, for example octocorp.ghe.com.': 'لم يُضف الخادم. اكتب اسم الخادم فقط، مثل octocorp.ghe.com.',
  'Your computer cannot run scripts from the internet?': 'لا يسمح جهازك بتشغيل سكربتات من الإنترنت؟',
  'Download the scripts and unpack the ZIP file. Open a terminal in the unpacked folder and run this command instead.':
    'نزّل السكربتات وفُك ضغط ملف ZIP. ثم افتح الطرفية في المجلد الذي فككت ضغطه وشغّل هذا الأمر بدلًا من الأمر السابق.',
  'Download the scripts (ZIP)': 'تنزيل السكربتات (ZIP)',
  'Copy the command for the downloaded scripts': 'نسخ أمر السكربتات المنزّلة',
  Windows: 'Windows',
  'The collector script reads budgets, seats, members, billing, activity and seat changes from GitHub and saves them in one file. For an enterprise it adds the AI usage report too. Load that file here to make the numbers more exact and to get more findings.':
    'يقرأ سكربت جمع البيانات الميزانيات والتراخيص والأعضاء والفوترة والنشاط وتغييرات التراخيص من GitHub ويحفظها في ملف واحد. ولحساب Enterprise يضيف تقرير استخدام الذكاء الاصطناعي أيضًا. حمّل هذا الملف هنا لتصبح الأرقام أدق ولتحصل على نتائج أكثر.',
  'The file holds GitHub logins and activity, so keep it safe and delete it when you are done.':
    'يحتوي الملف على أسماء مستخدمي GitHub ونشاطهم، لذا احفظه في مكان آمن واحذفه عندما تنتهي.',
  'How to run the collector script': 'كيف تشغّل سكربت جمع البيانات',
  '{target}, {month}': '{target}، {month}',
  'Part of the data': 'جزء البيانات',
  For: 'يخص',
  Records: 'السجلات',
  'What GitHub or the script said': 'ما قالته GitHub أو السكربت',
  'Search parts…': 'البحث في الأجزاء…',
  Covers: 'يشمل',
  'Collected on': 'تاريخ الجمع',
  'Billing months': 'أشهر الفوترة',
  'Parts complete': 'الأجزاء المكتملة',
  'The file ends early': 'ينتهي الملف قبل أوانه',
  'Some data may be missing. Run the script again and wait until it says the file is saved.': 'قد تنقص بعض البيانات. شغّل السكربت مرة أخرى وانتظر حتى يذكر أنه حفظ الملف.',
  '{n} parts did not come back in full': plural('جزء واحد لم يصل كاملًا', 'جزآن لم يصلا كاملين', '{n} أجزاء لم تصل كاملة', '{n} جزءًا لم تصل كاملة', '{n} جزء لم تصل كاملة'),
  'Their numbers are left out or may be short. The table says what GitHub or the script said. Often the account needs more access, or a feature is off.':
    'أرقامها مستبعدة أو قد تكون ناقصة. يذكر الجدول ما قالته GitHub أو السكربت. غالبًا يحتاج الحساب إلى صلاحيات أكثر، أو تكون إحدى الميزات متوقفة.',
  'Some lists are cut short': 'بعض القوائم ناقصة',
  'The file has more members, seats or events than this app keeps, so some lists are not complete.':
    'يحتوي الملف على أعضاء أو تراخيص أو أحداث أكثر مما يحتفظ به هذا التطبيق، لذا بعض القوائم غير كاملة.',
  '{n} lines of the file could not be read and were left out.': plural(
    'تعذّرت قراءة سطر واحد من الملف فاستُبعد.',
    'تعذّرت قراءة سطرين من الملف فاستُبعدا.',
    'تعذّرت قراءة {n} أسطر من الملف فاستُبعدت.',
    'تعذّرت قراءة {n} سطرًا من الملف فاستُبعدت.',
    'تعذّرت قراءة {n} سطر من الملف فاستُبعدت.',
  ),
  'The script {name} {version} made this file on {host}.': 'أنشأ السكربت {name} {version} هذا الملف على {host}.',
  'It is kept in this browser tab only.': 'يبقى في علامة التبويب هذه فقط.',
  'Its seats were added to your license list.': 'أُضيفت تراخيصه إلى قائمتك.',
  'No GitHub data file is loaded.': 'لم يُحمَّل أي ملف بيانات GitHub.',
  'Remove the GitHub data': 'إزالة بيانات GitHub',
  'The sample has made-up GitHub data': 'يحتوي التقرير التجريبي على بيانات GitHub وهمية',
  'It shows what a GitHub data file adds: budgets, seats, billing and activity. It was made in this browser from the sample report. It is collected on the day the included credits of the second month ran out, so the budgets have billed usage to show.':
    'يوضح ما يضيفه ملف بيانات GitHub: الميزانيات والتراخيص والفوترة والنشاط. أُنشئ في هذا المتصفح من التقرير التجريبي. وجُمع في اليوم الذي نفدت فيه الأرصدة المشمولة في الشهر الثاني، لذلك تُظهر الميزانيات استخدامًا مدفوعًا إضافيًا.',
  'Your own GitHub data file is not used with the sample. It is used when you open your own usage report.':
    'لا يُستخدم ملف بيانات GitHub الخاص بك مع التقرير التجريبي. ويُستخدم عندما تفتح تقرير الاستخدام الخاص بك.',
  'It is kept in this browser tab only and is never added to your license list.': 'يُحتفظ به في علامة التبويب هذه فقط، ولا يُضاف أبدًا إلى قائمة التراخيص.',
  'Usage in the report': 'الاستخدام في التقرير',
  'Usage at GitHub': 'الاستخدام في GitHub',
  'Billed in the report': 'المدفوع إضافيًا في التقرير',
  'Billed at GitHub': 'المدفوع إضافيًا في GitHub',
  'Usage report and GitHub billing': 'تقرير الاستخدام وفوترة GitHub',
  'Whether each month of the usage report has the same amounts as GitHub billing. It uses every report row in the scope of the GitHub data file, not your filters.':
    'هل لكل شهر في تقرير الاستخدام المبالغ نفسها الموجودة في فوترة GitHub. يستخدم كل صفوف التقرير ضمن نطاق ملف بيانات GitHub، لا عوامل التصفية.',
  'The file has no billing months.': 'لا يحتوي الملف على أشهر فوترة.',

  // Bill and budgets at GitHub (Usage and pool page)
  'Bill and budgets at GitHub': 'الفاتورة والميزانيات في GitHub',
  'The filters do not change these amounts.': 'لا تغيّر عوامل التصفية هذه المبالغ.',
  'Seat-months': 'أشهر التراخيص',
  'Seats and the AI credits billed on top of them, by month. The usage report shows only the AI credits.':
    'التراخيص وأرصدة الذكاء الاصطناعي المدفوعة إضافيًا فوقها، حسب الشهر. يعرض تقرير الاستخدام أرصدة الذكاء الاصطناعي فقط.',
  'Share of the budget used': 'حصة الميزانية المستخدمة',
  'Used as the monthly budget': 'مستخدمة كميزانية شهرية',
  'All of GitHub Copilot': 'GitHub Copilot كله',
  'Share used': 'الحصة المستخدمة',
  'When used up': 'عند النفاد',
  'Stops usage': 'توقف الاستخدام',
  'Alerts only': 'تنبيهات فقط',
  Alerts: 'التنبيهات',
  On: 'مفعّلة',
  Off: 'متوقفة',
  'The budgets for GitHub Copilot and how much of each was used on the day the data was collected.': 'ميزانيات GitHub Copilot وكم استُخدم من كل منها يوم جمع البيانات.',
  'The budgets could not be read in full. The Data page says why.': 'تعذّرت قراءة الميزانيات كاملة. تذكر صفحة «البيانات» السبب.',
  'The file has no budget for GitHub Copilot.': 'لا يحتوي الملف على ميزانية لـGitHub Copilot.',
  'The script did not read the budgets.': 'لم يقرأ السكربت الميزانيات.',
  '{n} users have used up their budget and cannot use AI credits until the next billing cycle.': plural(
    'استنفد مستخدم واحد ميزانيته ولا يمكنه استخدام أرصدة الذكاء الاصطناعي حتى دورة الفوترة التالية.',
    'استنفد مستخدمان ميزانيتهما ولا يمكنهما استخدام أرصدة الذكاء الاصطناعي حتى دورة الفوترة التالية.',
    'استنفد {n} مستخدمين ميزانياتهم ولا يمكنهم استخدام أرصدة الذكاء الاصطناعي حتى دورة الفوترة التالية.',
    'استنفد {n} مستخدمًا ميزانياتهم ولا يمكنهم استخدام أرصدة الذكاء الاصطناعي حتى دورة الفوترة التالية.',
    'استنفد {n} مستخدم ميزانياتهم ولا يمكنهم استخدام أرصدة الذكاء الاصطناعي حتى دورة الفوترة التالية.',
  ),
  '{n} budgets for other products are not shown.': plural(
    'لا تظهر ميزانية واحدة لمنتجات أخرى.',
    'لا تظهر ميزانيتان لمنتجات أخرى.',
    'لا تظهر {n} ميزانيات لمنتجات أخرى.',
    'لا تظهر {n} ميزانية لمنتجات أخرى.',
    'لا تظهر {n} ميزانية لمنتجات أخرى.',
  ),

  // Budget card when the budget comes from GitHub
  'This is the AI credit budget {name} at GitHub, from the GitHub data file collected on {day}.': 'هذه ميزانية أرصدة الذكاء الاصطناعي ({name}) في GitHub، من ملف بيانات GitHub الذي جُمع في {day}.',
  'GitHub stops usage that costs AI credits once it is used up.': 'توقف GitHub الاستخدام الذي يكلّف أرصدة الذكاء الاصطناعي بمجرد نفادها.',
  'GitHub only sends alerts once it is used up, and keeps billing.': 'ترسل GitHub تنبيهات فقط بمجرد نفادها، وتواصل الفوترة.',
  'A monthly budget set in Settings takes its place in this app.': 'الميزانية الشهرية المحددة في الإعدادات تحل محلها في هذا التطبيق.',
  '{amount} a month on top of seats, from the budget at GitHub': '{amount} شهريًا فوق التراخيص، من الميزانية في GitHub',

  // Seats and activity at GitHub (Licenses page)
  'Seats and activity at GitHub': 'التراخيص والنشاط في GitHub',
  Active: 'نشط',
  'Pending invitation': 'بانتظار قبول الدعوة',
  'How seats are given': 'طريقة منح التراخيص',
  'GitHub Copilot seats as GitHub counts them in this billing cycle, including code completions.':
    'تراخيص GitHub Copilot كما تحسبها GitHub في دورة الفوترة هذه، بما في ذلك إكمالات التعليمات البرمجية.',
  'In {n} organizations': plural('في مؤسسة واحدة', 'في مؤسستين', 'في {n} مؤسسات', 'في {n} مؤسسة', 'في {n} مؤسسة'),
  'People in the seat list': 'الأشخاص في قائمة التراخيص',
  'Active this cycle': 'نشط في هذه الدورة',
  'Any GitHub Copilot activity': 'أي نشاط في GitHub Copilot',
  'Inactive this cycle': 'غير نشط في هذه الدورة',
  'No activity at all': 'لا نشاط على الإطلاق',
  'Added this cycle': 'مُضاف في هذه الدورة',
  'End with this billing cycle': 'تنتهي مع دورة الفوترة هذه',
  'Of {n} members': plural('من عضو واحد', 'من عضوين', 'من {n} أعضاء', 'من {n} عضوًا', 'من {n} عضو'),
  'Needs the full member list': 'يحتاج إلى قائمة الأعضاء كاملة',
  'Code completions': 'إكمالات التعليمات البرمجية',
  Chat: 'المحادثة',
  Agent: 'الوكيل',
  'GitHub Copilot CLI': 'GitHub Copilot CLI',
  'Days with activity': 'أيام النشاط',
  'Last day with activity': 'آخر يوم نشاط',
  'Features used': 'الميزات المستخدمة',
  'From the GitHub Copilot usage metrics, which include code completions.': 'من مقاييس استخدام GitHub Copilot، وهي تشمل إكمالات التعليمات البرمجية.',
  'Active with no usage in the report': 'نشطون بلا استخدام في التقرير',
  'No days in common with the report': 'لا أيام مشتركة مع التقرير',
  'Do not treat as idle': 'لا تعاملهم كخاملين',
  'These people used GitHub Copilot on days the usage report covers, but have no row in it. They use their seat, often for code completions only, which cost no AI credits.':
    'استخدم هؤلاء الأشخاص GitHub Copilot في أيام يغطيها تقرير الاستخدام، لكن ليس لهم صف فيه. إنهم يستخدمون ترخيصهم، غالبًا لإكمالات التعليمات البرمجية فقط، وهي لا تكلّف أرصدة ذكاء اصطناعي.',
  'Seats added': 'التراخيص المضافة',
  'Seats removed': 'التراخيص المزالة',
  Change: 'التغيّر',
  'From the audit log: seats added and removed, and changes to plans, budgets and policies.': 'من سجل التدقيق: التراخيص المضافة والمزالة، والتغييرات على الخطط والميزانيات والسياسات.',
  'Plan changes': 'تغييرات الخطة',
  'Budget changes': 'تغييرات الميزانية',
  'Policy changes': 'تغييرات السياسات',
  'Other changes': 'تغييرات أخرى',
  'The audit log has no seat changes in these months.': 'لا يحتوي سجل التدقيق على تغييرات في التراخيص في هذه الأشهر.',
};

export default arabic;
