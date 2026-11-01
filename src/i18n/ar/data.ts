import type { Dict, PluralEntry } from '../core';

const plural = (one: string, two: string, few: string, many: string, other: string): PluralEntry => ({ zero: other, one, two, few, many, other });

/** Arabic for the Data page (src/pages/DataPage.tsx, src/pages/data) and the data coverage notes (lib/analytics/coverage.ts). */
const arabic: Dict = {
  // Page and header
  'Download filtered rows (CSV)': 'تنزيل الصفوف المصفّاة (CSV)',
  'Everything on this page describes all the rows you loaded, except the rows explorer and the download, which follow your filters.':
    'كل ما في هذه الصفحة يصف جميع الصفوف التي حمّلتها، ما عدا مستكشف الصفوف والتنزيل، فهما يتبعان عوامل التصفية.',

  // Coverage notes
  'It has neither discount_amount nor net_amount, so the covered and billed amounts are left at $0. Usage still shows. Overage, pool and seat findings are hidden because the file does not have what they need.':
    'ليس فيه discount_amount ولا net_amount، لذا تبقى المبالغ المشمولة بالخطة والمدفوعة إضافيًا عند $0. يظهر الاستخدام كما هو. تُخفى نتائج التجاوز والرصيد المشترك والتراخيص لأن الملف لا يحتوي على ما تحتاجه.',
  'The file has no seat sizes': 'الملف لا يحتوي على أحجام التراخيص',
  'total_monthly_quota is missing or empty, so the size of the included-credit pool is unknown. Pool utilization and seat findings are hidden, and per-user utilization assumes a {credits}-credit seat. Import your license list on the Licenses page for a better estimate.':
    'العمود total_monthly_quota غير موجود أو فارغ، لذا حجم رصيد الأرصدة المشمولة المشترك غير معروف. تُخفى نسبة استخدام الرصيد المشترك ونتائج التراخيص، ونسبة الاستخدام لكل مستخدم تفترض ترخيصًا بحجم {credits} رصيد. استورد قائمة التراخيص في صفحة التراخيص لتقدير أفضل.',
  'The file has no username column': 'الملف لا يحتوي على عمود اسم المستخدم',
  'All usage is put in one unnamed group, so rankings, segments and seat findings do not apply.':
    'يوضع كل الاستخدام في مجموعة واحدة بلا اسم، لذا لا تنطبق الترتيبات والشرائح ونتائج التراخيص.',
  'The file has no model names': 'الملف لا يحتوي على أسماء النماذج',
  'Model comparison, the Auto share and model-based savings are not available.': 'مقارنة النماذج وحصة Auto والتوفير المعتمد على النموذج غير متاحة.',
  'The file has no token columns': 'الملف لا يحتوي على أعمدة الرموز',
  'Cache, context and model-mix savings cannot be estimated. Only credit totals are available.':
    'لا يمكن تقدير التوفير من الذاكرة المؤقتة والسياق ومزيج النماذج. تتوفر مجاميع الأرصدة فقط.',
  'For most admins, the GitHub Copilot activity report is the easiest license list to get. It adds activity dates; the REST API is an advanced option for plan and seat details.':
    'لدى معظم المسؤولين، تقرير نشاط GitHub Copilot هو أسهل قائمة تراخيص للحصول عليها. يضيف تواريخ النشاط؛ أما REST API فهو خيار متقدم لتفاصيل الخطط والتراخيص.',

  // Column picker
  'Choose the columns to show': 'اختر الأعمدة المعروضة',
  'Show all': 'عرض الكل',

  // What is in the data
  '{n} rows have no username': plural('صف واحد بلا اسم مستخدم', 'صفان بلا اسم مستخدم', '{n} صفوف بلا اسم مستخدم', '{n} صفًا بلا اسم مستخدم', '{n} صف بلا اسم مستخدم'),
  '{n} rows have no product': plural('صف واحد بلا منتج', 'صفان بلا منتج', '{n} صفوف بلا منتج', '{n} صفًا بلا منتج', '{n} صف بلا منتج'),
  '{n} rows have no SKU': plural('صف واحد بلا SKU', 'صفان بلا SKU', '{n} صفوف بلا SKU', '{n} صفًا بلا SKU', '{n} صف بلا SKU'),
  '{n} rows have no model': plural('صف واحد بلا نموذج', 'صفان بلا نموذج', '{n} صفوف بلا نموذج', '{n} صفًا بلا نموذج', '{n} صف بلا نموذج'),
  '{n} rows have no organization': plural('صف واحد بلا مؤسسة', 'صفان بلا مؤسسة', '{n} صفوف بلا مؤسسة', '{n} صفًا بلا مؤسسة', '{n} صف بلا مؤسسة'),
  Apps: 'التطبيقات',
  '{n} rows have no app client': plural('صف واحد بلا تطبيق عميل', 'صفان بلا تطبيق عميل', '{n} صفوف بلا تطبيق عميل', '{n} صفًا بلا تطبيق عميل', '{n} صف بلا تطبيق عميل'),
  '{n} rows have no repository': plural('صف واحد بلا مستودع', 'صفان بلا مستودع', '{n} صفوف بلا مستودع', '{n} صفًا بلا مستودع', '{n} صف بلا مستودع'),
  '{n} rows have no cost center': plural('صف واحد بلا مركز تكلفة', 'صفان بلا مركز تكلفة', '{n} صفوف بلا مركز تكلفة', '{n} صفًا بلا مركز تكلفة', '{n} صف بلا مركز تكلفة'),
  'Set on every row': 'موجود في كل صف',
  'Empty on every row': 'فارغ في كل صف',
  '{text} ({share} of usage)': '{text} ({share} من الاستخدام)',
  'Ranked by rows, as no value has usage.': 'مرتبة حسب عدد الصفوف، لأنه لا توجد قيمة لها استخدام.',
  'Top values of {group} by rows': 'أكبر قيم {group} حسب عدد الصفوف',
  'Top values of {group} by usage': 'أكبر قيم {group} حسب الاستخدام',
  '{name}: {usage} in {rows}': '{name}: {usage} في {rows}',
  '{name}: share of rows': '{name}: الحصة من الصفوف',
  '{name}: share of usage': '{name}: الحصة من الاستخدام',
  'What is in the data': 'ما الذي في البيانات',
  'Distinct values, rows with an empty value and the three biggest values by usage, for everything you loaded.':
    'القيم المختلفة والصفوف ذات القيمة الفارغة وأكبر ثلاث قيم حسب الاستخدام، لكل ما حمّلته.',
  'Open filters': 'فتح عوامل التصفية',

  // Download
  '{percent} · {done} of {total} rows': '{percent} · {done} من {total} صف',
  '{n} rows, {columns} columns in the order of the report.': plural(
    'صف واحد، و{columns} أعمدة بترتيب التقرير.',
    'صفان، و{columns} أعمدة بترتيب التقرير.',
    '{n} صفوف، و{columns} أعمدة بترتيب التقرير.',
    '{n} صفًا، و{columns} أعمدة بترتيب التقرير.',
    '{n} صف، و{columns} أعمدة بترتيب التقرير.',
  ),
  'aic_quantity and aic_gross_amount are not written because the app does not read them. unit_type is written as ai-credits and applied_cost_per_quantity as 0.01. The file is built in your browser and large exports take a moment.':
    'لا يُكتب aic_quantity وaic_gross_amount لأن التطبيق لا يقرأهما. يُكتب unit_type بالقيمة ai-credits وapplied_cost_per_quantity بالقيمة 0.01. يُبنى الملف في متصفحك، وقد يستغرق التصدير الكبير بعض الوقت.',
  'Export failed: {reason}': 'فشل التصدير: {reason}',

  // What else you can add
  'Seat list from the GitHub REST API': 'قائمة التراخيص من GitHub REST API',
  'Advanced option for plan, seat start and pending-cancellation details, or repeatable exports. Its activity dates still have the same 90-day limit.':
    'خيار متقدم لمعرفة الخطة وتاريخ بدء الترخيص والإلغاءات المعلّقة، أو لإنشاء صادرات متكررة. وما زالت تواريخ النشاط محدودة بـ90 يومًا.',
  'Save every page as JSON with the GitHub CLI, then load it with the usage report.':
    'احفظ كل الصفحات بصيغة JSON باستخدام GitHub CLI، ثم حمّلها مع تقرير الاستخدام.',
  'GitHub Copilot activity report': 'تقرير نشاط GitHub Copilot',
  'For most admins, this is the easiest seat list to get. It shows last activity, sign-in date and last feature or editor, but not plan or seat start date.':
    'لدى معظم المسؤولين، هذه أسهل قائمة تراخيص للحصول عليها. تعرض آخر نشاط وتسجيل دخول وآخر ميزة أو محرر مستخدم، لكنها لا تعرض الخطة أو تاريخ بدء الترخيص.',
  'For an organization, open Settings, GitHub Copilot, Access, Get usage report, then Get activity report. For an enterprise, open Billing and licensing, Licensing, then Get activity report. Check the scope and seat count before acting.':
    'للمؤسسة، افتح Settings ثم GitHub Copilot ثم Access ثم Get usage report ثم Get activity report. لحساب Enterprise، افتح Billing and licensing ثم Licensing ثم Get activity report. تحقق من النطاق وعدد التراخيص قبل اتخاذ إجراء.',
  'Recommended for most admins': 'موصى به لمعظم المسؤولين',
  Advanced: 'متقدم',
  'Usage metrics API': 'API مقاييس الاستخدام',
  'Daily use by editor, language and feature. Useful to see how people work with GitHub Copilot, not what it costs.':
    'الاستخدام اليومي حسب المحرر واللغة والميزة. مفيد لمعرفة كيف يعمل الناس مع GitHub Copilot، لا كم يكلّف.',
  'Team members API': 'API أعضاء الفرق',
  'Which team each user is in. Useful to compare usage by team.': 'الفريق الذي ينتمي إليه كل مستخدم. مفيد لمقارنة الاستخدام حسب الفريق.',
  'Cost centers API': 'API مراكز التكلفة',
  'All cost centers and their members, including people with no usage yet.': 'كل مراكز التكلفة وأعضاؤها، بمن فيهم من لا استخدام لهم بعد.',
  'Billing usage API': 'API استخدام الفوترة',
  'Budgets API': 'API الميزانيات',
  'The budgets set for AI credits and how much of each is spent.': 'الميزانيات المحددة لأرصدة الذكاء الاصطناعي وكم أُنفق من كل منها.',
  'Audit log': 'سجل التدقيق',
  'GitHub data file from the collector script': 'ملف بيانات GitHub من سكربت جمع البيانات',
  'Budgets, seats, members, the whole bill, activity with code completions and seat changes, in one file. It makes the pool, budget and seat findings more exact and adds more recommendations.':
    'الميزانيات والتراخيص والأعضاء والفاتورة كاملة والنشاط مع إكمالات التعليمات البرمجية وتغييرات التراخيص، في ملف واحد. يجعل نتائج الرصيد المشترك والميزانية والتراخيص أدق ويضيف توصيات أكثر.',
  'Run the collector script with the command from the GitHub data file card, then load its file.':
    'شغّل سكربت جمع البيانات بالأمر من بطاقة ملف بيانات GitHub، ثم حمّل ملفه.',
  'Needs the GitHub CLI': 'يحتاج إلى GitHub CLI',
  'Read from the GitHub data file. The Budgets page lists each budget, and the AI credit budget becomes the monthly budget when Settings has none.':
    'يُقرأ من ملف بيانات GitHub. تعرض صفحة الميزانيات كل ميزانية، وتصبح ميزانية أرصدة الذكاء الاصطناعي هي الميزانية الشهرية عندما لا توجد ميزانية في الإعدادات.',
  'What GitHub billed each month, seats included.': 'ما فوترته GitHub كل شهر، بما في ذلك التراخيص.',
  'Read from the GitHub data file. Usage and pool shows the whole bill, and the Data page checks the usage report against it.':
    'يُقرأ من ملف بيانات GitHub. تعرض صفحة «الاستخدام والرصيد المشترك» الفاتورة كاملة، وتقارن صفحة «البيانات» تقرير الاستخدام بها.',
  'Read from the GitHub data file. Licenses shows who is active, including people who use only code completions.':
    'يُقرأ من ملف بيانات GitHub. تعرض صفحة «التراخيص» من هو نشط، بمن فيهم من يستخدم إكمالات التعليمات البرمجية فقط.',
  'When seats were added or removed, and when plans, budgets and policies changed.': 'متى أُضيفت التراخيص أو أُزيلت، ومتى تغيّرت الخطط والميزانيات والسياسات.',
  'Read from the GitHub data file. Licenses shows the seats added and removed each month.': 'يُقرأ من ملف بيانات GitHub. تعرض صفحة «التراخيص» التراخيص المضافة والمزالة كل شهر.',
  'Read from the GitHub data file when the script runs with --teams. The Organization page then groups usage by team.':
    'يُقرأ من ملف بيانات GitHub عند تشغيل السكربت مع --teams. عندها تجمّع صفحة «المؤسسة» الاستخدام حسب الفريق.',
  'Read from the GitHub data file. The Budgets page uses their user, team and organization assignments to find the applicable limits and shows their included credit pool controls.':
    'تُقرأ من ملف بيانات GitHub. تستخدم صفحة الميزانيات تعيينات المستخدمين والفرق والمؤسسات لتحديد الحدود السارية، وتعرض ضوابط الرصيد المشترك للأرصدة المشمولة.',
  'What else you can add': 'ما الذي يمكنك إضافته أيضًا',
  'Other GitHub data that adds to the usage report, from the most useful.': 'بيانات GitHub أخرى تضيف إلى تقرير الاستخدام، بدءًا من الأكثر فائدة.',
  'Read by this app': 'يقرأه هذا التطبيق',
  'Not read yet': 'لا يُقرأ بعد',

  // Files card
  'Rows read': 'الصفوف المقروءة',
  'Data rows in the file, not counting the header.': 'صفوف البيانات في الملف، دون احتساب سطر العناوين.',
  'Rows kept': 'الصفوف المحتفظ بها',
  'Rows added to the dataset: rows read, minus duplicates dropped and rows with an unreadable date.':
    'الصفوف المضافة إلى البيانات: الصفوف المقروءة، مطروحًا منها المكررات المحذوفة والصفوف ذات التاريخ غير المقروء.',
  'Duplicates dropped': 'المكررات المحذوفة',
  'Rows identical to a row already loaded from another file: same day, user, product, SKU, model, Auto flag, organization, app, repository, cost center, quantity, amounts and token counts. The seat size and the unit price are not compared. Only checked when several files are loaded; identical rows inside one file are kept.':
    'صفوف مطابقة لصف حُمّل بالفعل من ملف آخر: اليوم والمستخدم والمنتج وSKU والنموذج وعلامة Auto والمؤسسة والتطبيق والمستودع ومركز التكلفة والكمية والمبالغ وأعداد الرموز نفسها. لا يُقارن حجم الترخيص ولا سعر الوحدة. يُفحص ذلك فقط عند تحميل عدة ملفات، وتبقى الصفوف المتطابقة داخل الملف الواحد.',
  'Bad dates': 'تواريخ غير مقروءة',
  'Rows skipped because their date could not be read.': 'صفوف تم تخطيها لأن تاريخها لم يُقرأ.',
  'Bad numbers': 'أرقام غير مقروءة',
  'Cells in number columns that are not numbers. Each counts as 0 and its row is kept.': 'خلايا في أعمدة الأرقام ليست أرقامًا. تُحسب كل منها 0 ويبقى صفها.',
  'Balance mismatches': 'مبالغ غير متوازنة',
  'Rows where usage is not covered plus billed.': 'صفوف لا يساوي فيها الاستخدام المشمول بالخطة زائد المدفوع إضافيًا.',
  'Price mismatches': 'أسعار غير متطابقة',
  'Rows where usage is not quantity × the unit price, normally $0.01 per AI credit.': 'صفوف لا يساوي فيها الاستخدام الكمية × سعر الوحدة، وهو عادة $0.01 لكل رصيد ذكاء اصطناعي.',
  'Negative rows': 'صفوف سالبة',
  'Rows with a usage, covered or billed amount below 0.': 'صفوف فيها مبلغ استخدام أو مشمول بالخطة أو مدفوع إضافي أقل من 0.',
  'Missing columns': 'أعمدة ناقصة',
  'Optional report columns the file does not have. The checks below explain what each one limits.': 'أعمدة اختيارية في التقرير لا يحتوي عليها الملف. توضح الفحوص أدناه ما يحدّه غياب كل منها.',
  'Extra columns': 'أعمدة إضافية',
  'Columns the app does not use. They are ignored.': 'أعمدة لا يستخدمها التطبيق. يتم تجاهلها.',
  Delimiter: 'الفاصل',
  'The separator the app found between fields.': 'الفاصل الذي وجده التطبيق بين الحقول.',
  'File size': 'حجم الملف',
  'File size as the browser reports it.': 'حجم الملف كما يذكره المتصفح.',
  'Rows added to the dataset. A file that kept no rows added nothing.': 'الصفوف المضافة إلى البيانات. الملف الذي لم يحتفظ بأي صف لم يضف شيئًا.',
  'Rows identical to a row already loaded from another file.': 'صفوف مطابقة لصف حُمّل بالفعل من ملف آخر.',
  'Rows skipped because the date could not be read.': 'صفوف تم تخطيها لأن التاريخ لم يُقرأ.',
  'Cells that are not numbers. They count as 0 and the row is kept.': 'خلايا ليست أرقامًا. تُحسب 0 ويبقى الصف.',
  'Rows where usage is not quantity × the unit price.': 'صفوف لا يساوي فيها الاستخدام الكمية × سعر الوحدة.',
  'First day': 'أول يوم',
  'Last day': 'آخر يوم',
  'Optional report columns this file does not have.': 'أعمدة اختيارية في التقرير لا يحتوي عليها هذا الملف.',
  Files: 'الملفات',
  'One row per file you loaded. Amber counts are worth a look, blue ones are for information.': 'صف واحد لكل ملف حمّلته. الأعداد بالكهرماني تستحق النظر، والزرقاء للعلم فقط.',
  'Search files…': 'البحث في الملفات…',
  'No files.': 'لا توجد ملفات.',
  'Mismatch and negative counts are taken before duplicates are dropped, so a duplicate row can count in them too.':
    'تُحسب أعداد عدم التطابق والقيم السالبة قبل حذف المكررات، لذا قد يُحسب فيها صف مكرر أيضًا.',

  // Help card
  'People and places': 'الأشخاص والأماكن',
  'What was used': 'ما الذي اُستخدم',
  Amounts: 'المبالغ',
  'How to get the report': 'كيف تحصل على التقرير',
  'Where the file comes from, which columns the app reads and how it is handled.': 'من أين يأتي الملف، وأي الأعمدة يقرأها التطبيق، وكيف يتم التعامل معه.',
  'The AI usage report is a CSV file. You download it from the billing and usage area of your GitHub enterprise or organization. GitHub explains where to find it.':
    'تقرير استخدام الذكاء الاصطناعي ملف CSV. تنزّله من قسم الفوترة والاستخدام في حساب المؤسسة أو المؤسسة على GitHub. يشرح GitHub مكان العثور عليه.',
  'Your data stays on this computer.': 'تبقى بياناتك على هذا الكمبيوتر.',
  'The app runs only in your browser and the file is never uploaded.': 'يعمل التطبيق في متصفحك فقط، ولا يُرفع الملف أبدًا.',
  'Several files can be loaded together, for example one per month or per organization.': 'يمكن تحميل عدة ملفات معًا، مثل ملف لكل شهر أو لكل مؤسسة.',
  'They are joined into one dataset. A row that repeats a row from an earlier file is dropped. Identical rows inside one file are all kept.':
    'تُدمج في مجموعة بيانات واحدة. يُحذف الصف الذي يكرر صفًا من ملف سابق. وتبقى كل الصفوف المتطابقة داخل الملف الواحد.',
  'Loading new usage files replaces the usage data you have now.': 'تحميل ملفات استخدام جديدة يستبدل بيانات الاستخدام الموجودة لديك الآن.',
  'Select every file you want in one go.': 'اختر كل الملفات التي تريدها دفعة واحدة.',
  'A license list can be loaded with the usage files.': 'يمكن تحميل قائمة التراخيص مع ملفات الاستخدام.',
  'The app sees which file is which. The list is added to the license list you already have.': 'يميّز التطبيق كل ملف. تُضاف القائمة إلى قائمة التراخيص الموجودة لديك.',
  'Required columns': 'الأعمدة المطلوبة',
  '{date} and at least one of {gross} or {quantity}. A file without them is rejected with a message. Without a {gross} column, usage is worked out as {quantity} × {price}, or as {quantity} × $0.01 when that column is missing too.':
    '{date} وواحد على الأقل من {gross} أو {quantity}. يُرفض الملف الذي لا يحتوي عليها مع رسالة توضيحية. عند غياب العمود {gross}، يُحسب الاستخدام بالصيغة {quantity} × {price}، أو {quantity} × $0.01 إن غاب ذلك العمود أيضًا.',
  'Optional columns': 'الأعمدة الاختيارية',
  'A missing optional column is not an error. The app works out what it can, and the checks above say what is limited. Header names ignore capitals, and a space, dash or similar character counts as an underscore, so {spaced} is read as {gross}. Common other names such as {login}, {org} or {repo} are accepted. {unit}, {aicQty} and {aicGross} are accepted and ignored.':
    'غياب عمود اختياري ليس خطأ. يحسب التطبيق ما يستطيع، وتذكر الفحوص أعلاه ما هو محدود. لا تفرّق أسماء العناوين بين الأحرف الكبيرة والصغيرة، وتُعامل المسافة أو الشرطة أو ما يشبهها كشرطة سفلية، لذا يُقرأ {spaced} على أنه {gross}. تُقبل أسماء بديلة شائعة مثل {login} أو {org} أو {repo}. وتُقبل {unit} و{aicQty} و{aicGross} ثم يتم تجاهلها.',

  // KPIs
  '{n} duplicates dropped': plural('حُذف مكرر واحد', 'حُذف مكرران', 'حُذفت {n} مكررات', 'حُذف {n} مكررًا', 'حُذف {n} مكرر'),
  '{n} bad dates': plural('تاريخ واحد غير مقروء', 'تاريخان غير مقروءين', '{n} تواريخ غير مقروءة', '{n} تاريخًا غير مقروء', '{n} تاريخ غير مقروء'),
  '{credits} AI credits · {billed} billed': '{credits} رصيد ذكاء اصطناعي · {billed} مدفوع إضافي',
  '{credits} AI credits · billed amount not in the file': '{credits} رصيد ذكاء اصطناعي · المبلغ المدفوع إضافيًا غير موجود في الملف',
  'Usage of all rows kept, including the part covered by included credits. One AI credit is $0.01. Billed is the part charged on top of seats.':
    'استخدام كل الصفوف المحتفظ بها، بما فيه الجزء المشمول بالأرصدة المشمولة. رصيد الذكاء الاصطناعي الواحد يساوي $0.01. المدفوع إضافيًا هو الجزء الذي يُحاسب عليه فوق سعر التراخيص.',
  'Every row has a username': 'كل صف فيه اسم مستخدم',
  'Distinct usernames. Rows without a username, such as repository-level products, are counted separately.':
    'أسماء المستخدمين المختلفة. الصفوف التي ليس فيها اسم مستخدم، مثل منتجات مستوى المستودع، تُحسب على حدة.',
  'Date span': 'المدة الزمنية',
  'One day of data': 'يوم واحد من البيانات',
  'Every day has rows': 'كل يوم فيه صفوف',
  '{n} with rows, {m} empty': '{n} فيها صفوف، {m} فارغة',
  'First to last day with rows. Weekdays inside the span without rows are flagged in the checks below. Quiet weekends are normal.':
    'من أول يوم إلى آخر يوم فيه صفوف. تُشار أيام العمل داخل المدة التي ليس فيها صفوف في الفحوص أدناه. هدوء عطلات نهاية الأسبوع أمر طبيعي.',
  'Rows in the dataset. Rows read, minus rows already loaded from another file (duplicates) and rows whose date could not be read.':
    'الصفوف في البيانات. الصفوف المقروءة، مطروحًا منها الصفوف المحمّلة بالفعل من ملف آخر (المكررات) والصفوف التي لم يُقرأ تاريخها.',
  '{size} in total': '{size} إجمالًا',
  'CSV files loaded together. Their rows are joined into one dataset.': 'ملفات CSV المحمّلة معًا. تُدمج صفوفها في مجموعة بيانات واحدة.',
  'Distinct model names. The Auto prefix is removed from the name and the row is marked as an Auto row.':
    'أسماء النماذج المختلفة. تُزال البادئة Auto من الاسم ويُعلَّم الصف على أنه صف Auto.',
  'Distinct organizations in the data.': 'المؤسسات المختلفة في البيانات.',
  'Distinct cost centers in the data.': 'مراكز التكلفة المختلفة في البيانات.',
  'Distinct repositories in the data. Rows without a repository are counted separately.': 'المستودعات المختلفة في البيانات. الصفوف التي ليس فيها مستودع تُحسب على حدة.',

  // License list card
  'List of usernames, with no activity dates': 'قائمة أسماء مستخدمين، بلا تواريخ نشاط',
  'Open the Licenses page': 'فتح صفحة التراخيص',
  'License list': 'قائمة التراخيص',
  'No license list is loaded.': 'لم يتم تحميل قائمة تراخيص.',
  'A license list shows who holds a GitHub Copilot seat. With it, the app finds unused seats and users with no seat. Load it with the usage files, or on the Licenses page.':
    'تُظهر قائمة التراخيص من يملك ترخيص GitHub Copilot. بها يجد التطبيق التراخيص غير المستخدمة والمستخدمين بلا ترخيص. حمّلها مع ملفات الاستخدام، أو في صفحة التراخيص.',
  '{n} of {total}': '{n} من {total}',
  'List date': 'تاريخ القائمة',
  'The list is {n} days older than the last day of the usage report. Export a new list to see current seats.': plural(
    'القائمة أقدم بيوم واحد من آخر يوم في تقرير الاستخدام. صدّر قائمة جديدة لترى التراخيص الحالية.',
    'القائمة أقدم بيومين من آخر يوم في تقرير الاستخدام. صدّر قائمة جديدة لترى التراخيص الحالية.',
    'القائمة أقدم بـ{n} أيام من آخر يوم في تقرير الاستخدام. صدّر قائمة جديدة لترى التراخيص الحالية.',
    'القائمة أقدم بـ{n} يومًا من آخر يوم في تقرير الاستخدام. صدّر قائمة جديدة لترى التراخيص الحالية.',
    'القائمة أقدم بـ{n} يوم من آخر يوم في تقرير الاستخدام. صدّر قائمة جديدة لترى التراخيص الحالية.',
  ),

  // Loading files
  'Choose files to load': 'اختر الملفات لتحميلها',
  'A usage report replaces the loaded data. Select every report you want in one go: they are joined, and a row that repeats a row from an earlier file is dropped. A GitHub Copilot license list is added to your license list. A GitHub data file from the collector script adds budgets, seats and billing.':
    'تقرير الاستخدام يستبدل البيانات المحمّلة. اختر كل التقارير التي تريدها دفعة واحدة: تُدمج معًا، ويُحذف الصف الذي يكرر صفًا من ملف سابق. أما قائمة تراخيص GitHub Copilot فتُضاف إلى قائمة التراخيص لديك. ويضيف ملف بيانات GitHub من سكربت جمع البيانات الميزانيات والتراخيص والفوترة.',
  'Load other files': 'تحميل ملفات أخرى',
  'Loading files': 'جارٍ تحميل الملفات',
  'The files could not be loaded': 'تعذّر تحميل الملفات',
  'The data that was already loaded is unchanged.': 'البيانات المحمّلة من قبل لم تتغير.',
  'Activity report (CSV)': 'تقرير النشاط (CSV)',
  '{name} is larger than 25 MB, so it was not read. A license list is much smaller. Check that this is the right file.':
    'حجم {name} أكبر من 25 MB، لذا لم يُقرأ. قائمة التراخيص أصغر بكثير. تحقق من أنه الملف الصحيح.',
  '{name}: no seats found.': '{name}: لم يُعثر على تراخيص.',
  '{name}: {kind}, {seats}.': '{name}: {kind}، {seats}.',
  'License list updated': 'تم تحديث قائمة التراخيص',
  'The license list did not change': 'لم تتغير قائمة التراخيص',
  'Some files were not loaded': 'لم يتم تحميل بعض الملفات',
  '{n} entries without a usable username were left out.': plural(
    'تم استبعاد إدخال واحد بلا اسم مستخدم صالح.',
    'تم استبعاد إدخالين بلا اسم مستخدم صالح.',
    'تم استبعاد {n} إدخالات بلا اسم مستخدم صالح.',
    'تم استبعاد {n} إدخالًا بلا اسم مستخدم صالح.',
    'تم استبعاد {n} إدخال بلا اسم مستخدم صالح.',
  ),
  'There was no license list yet, so this became your list.': 'لم تكن هناك قائمة تراخيص بعد، فأصبحت هذه قائمتك.',
  'Added to the license list you had.': 'أُضيفت إلى قائمة التراخيص التي كانت لديك.',
  '{added} added, {updated} updated, {unchanged} unchanged, {removed} removed. The list now has {total}.':
    'أُضيف {added}، وحُدّث {updated}، وبقي {unchanged} دون تغيير، وأُزيل {removed}. القائمة الآن فيها {total}.',
  'The list is too big to keep in full in this browser. It was kept with usernames and plans only. Load the file again on your next visit to see activity dates.':
    'القائمة أكبر من أن تُحفظ كاملة في هذا المتصفح. حُفظت بأسماء المستخدمين والخطط فقط. حمّل الملف مرة أخرى في زيارتك القادمة لترى تواريخ النشاط.',
  'This browser could not keep the list, so it is gone when you close the tab. Load the file again on your next visit.':
    'لم يتمكن هذا المتصفح من حفظ القائمة، لذا ستختفي عند إغلاق علامة التبويب. حمّل الملف مرة أخرى في زيارتك القادمة.',
  'Not loaded: {names}. They are not a usage report or a license list.': 'لم يتم تحميل: {names}. فهي ليست تقرير استخدام ولا قائمة تراخيص.',
  '{names} and {n} more': '{names} و{n} غيرها',
  'This is a license list. Load your usage report first, then import the list on the Licenses page.':
    'هذه قائمة تراخيص. حمّل تقرير الاستخدام أولًا، ثم استورد القائمة في صفحة التراخيص.',

  // Quality card
  'For your information': 'للعلم',
  Passed: 'ناجح',
  'Data quality checks': 'فحوص جودة البيانات',
  'Worked out from all the files you loaded, whatever the filters. Items that need attention come first.':
    'محسوبة من كل الملفات التي حمّلتها، بغض النظر عن عوامل التصفية. تأتي العناصر التي تحتاج إلى انتباه أولًا.',
  '{n} need attention': plural('عنصر واحد يحتاج إلى انتباه', 'عنصران يحتاجان إلى انتباه', '{n} عناصر تحتاج إلى انتباه', '{n} عنصرًا يحتاج إلى انتباه', '{n} عنصر يحتاج إلى انتباه'),
  '{n} notes': plural('ملاحظة واحدة', 'ملاحظتان', '{n} ملاحظات', '{n} ملاحظة', '{n} ملاحظة'),
  '{n} passed': plural('فحص واحد ناجح', 'فحصان ناجحان', '{n} فحوص ناجحة', '{n} فحصًا ناجحًا', '{n} فحص ناجح'),

  // Rows explorer
  'First page': 'الصفحة الأولى',
  'Page {page} of {pages}': 'الصفحة {page} من {pages}',
  'Go to page': 'الانتقال إلى الصفحة',
  Go: 'انتقال',
  'Last page': 'الصفحة الأخيرة',
  'All {n} rows you loaded.': plural('الصف الوحيد الذي حمّلته.', 'الصفان اللذان حمّلتهما.', 'كل الصفوف الـ{n} التي حمّلتها.', 'كل الصفوف الـ{n} التي حمّلتها.', 'كل الصفوف الـ{n} التي حمّلتها.'),
  'Your filters keep {n} of {total} rows.': 'عوامل التصفية تُبقي {n} من {total} صف.',
  'Rows explorer': 'مستكشف الصفوف',
  'The rows in your current filters.': 'الصفوف ضمن عوامل التصفية الحالية.',
  'Click a column to sort. Search words must all match.': 'انقر عمودًا للترتيب. يجب أن تتطابق كل كلمات البحث.',
  'Sorting {n} rows…': plural('جارٍ ترتيب صف واحد…', 'جارٍ ترتيب صفين…', 'جارٍ ترتيب {n} صفوف…', 'جارٍ ترتيب {n} صفًا…', 'جارٍ ترتيب {n} صف…'),
  'Download rows (CSV)': 'تنزيل الصفوف (CSV)',
  'Downloads the rows that match your search, in the order shown.': 'ينزّل الصفوف المطابقة لبحثك، بالترتيب المعروض.',
  'Downloads these rows in the order shown.': 'ينزّل هذه الصفوف بالترتيب المعروض.',
  'Showing {from} to {to} of {n} matching rows': plural(
    'عرض {from} إلى {to} من صف واحد مطابق',
    'عرض {from} إلى {to} من صفين مطابقين',
    'عرض {from} إلى {to} من {n} صفوف مطابقة',
    'عرض {from} إلى {to} من {n} صفًا مطابقًا',
    'عرض {from} إلى {to} من {n} صف مطابق',
  ),
  '(from {n} in scope)': '(من أصل {n} ضمن النطاق)',
  'All matching rows: usage {usage} · covered {covered} · billed {billed}': 'كل الصفوف المطابقة: الاستخدام {usage} · مشمول بالخطة {covered} · مدفوع إضافي {billed}',
  'Files with neither a discount_amount nor a net_amount column count as $0 for covered and billed.':
    'الملفات التي ليس فيها عمود discount_amount ولا net_amount تُحسب $0 للمشمول بالخطة والمدفوع إضافيًا.',
  'Widen the date range or remove some filters to see rows.': 'وسّع نطاق التاريخ أو أزل بعض عوامل التصفية لترى الصفوف.',
  'Search user, model, repository, SKU, organization or cost center': 'ابحث عن مستخدم أو نموذج أو مستودع أو SKU أو مؤسسة أو مركز تكلفة',
  'No rows match your search': 'لا توجد صفوف تطابق بحثك',
  'Try fewer words or a shorter part of a name.': 'جرّب كلمات أقل أو جزءًا أقصر من الاسم.',

  // Explorer columns
  'Yes when the model in the file is written as Auto: followed by a model name, or just as Auto. The Model column shows the name without the prefix.':
    'نعم عندما يُكتب النموذج في الملف بالشكل Auto: متبوعًا باسم نموذج، أو Auto فقط. يعرض عمود النموذج الاسم دون البادئة.',
  'The quantity column of the file: AI credits used on the row.': 'عمود quantity في الملف: أرصدة الذكاء الاصطناعي المستخدمة في الصف.',
  'The gross_amount column of the file: the usage on the row, in dollars.': 'عمود gross_amount في الملف: الاستخدام في الصف، بالدولار.',
  'The discount_amount column of the file: the part of usage covered by included credits.': 'عمود discount_amount في الملف: جزء الاستخدام المشمول بالأرصدة المشمولة.',
  'The net_amount column of the file: the part of usage billed on top of seats.': 'عمود net_amount في الملف: جزء الاستخدام المدفوع إضافيًا فوق سعر التراخيص.',
  'Seat size': 'حجم الترخيص',
  'The total_monthly_quota column of the file: the credits included in the seat each month.': 'عمود total_monthly_quota في الملف: الأرصدة المشمولة في الترخيص كل شهر.',
  'The input column of the file.': 'عمود input في الملف.',
  'The output column of the file.': 'عمود output في الملف.',
  'The cache_read column of the file.': 'عمود cache_read في الملف.',
  'The cache_write column of the file.': 'عمود cache_write في الملف.',

  // Quality checks
  'Product views show a single group.': 'تعرض عروض المنتجات مجموعة واحدة.',
  'SKU views show a single group.': 'تعرض عروض SKU مجموعة واحدة.',
  'Model comparison and model-based savings are not available.': 'مقارنة النماذج والتوفير المعتمد على النموذج غير متاحين.',
  'Usage is worked out as AI credits × the unit price, so the unit price check has nothing to compare.': 'يُحسب الاستخدام بالصيغة أرصدة الذكاء الاصطناعي × سعر الوحدة، لذا لا يجد فحص سعر الوحدة ما يقارنه.',
  'AI credits are worked out from usage and the unit price.': 'تُحسب أرصدة الذكاء الاصطناعي من الاستخدام وسعر الوحدة.',
  'Each AI credit is taken to cost $0.01.': 'يُفترض أن كل رصيد ذكاء اصطناعي يكلّف $0.01.',
  'Covered is worked out as usage minus billed.': 'يُحسب المشمول بالخطة على أنه الاستخدام ناقص المدفوع إضافيًا.',
  'Billed is worked out as usage minus covered.': 'يُحسب المدفوع إضافيًا على أنه الاستخدام ناقص المشمول بالخطة.',
  'The size of the pool of included credits is unknown. Import your license list on the Licenses page.': 'حجم الرصيد المشترك من الأرصدة المشمولة غير معروف. استورد قائمة التراخيص في صفحة التراخيص.',
  'Organization views show a single group.': 'تعرض عروض المؤسسات مجموعة واحدة.',
  'Repository views show a single group.': 'تعرض عروض المستودعات مجموعة واحدة.',
  'Cost center views show a single group.': 'تعرض عروض مراكز التكلفة مجموعة واحدة.',
  'The file does not say what was billed, so covered and billed amounts are left at $0 and overage, pool and seat findings are hidden.':
    'الملف لا يذكر ما تم دفعه إضافيًا، لذا تبقى المبالغ المشمولة بالخطة والمدفوعة إضافيًا عند $0، وتُخفى نتائج التجاوز والرصيد المشترك والتراخيص.',
  '{from} to {to} ({n} weekdays)': plural(
    '{from} إلى {to} (يوم عمل واحد)',
    '{from} إلى {to} (يوما عمل)',
    '{from} إلى {to} ({n} أيام عمل)',
    '{from} إلى {to} ({n} يوم عمل)',
    '{from} إلى {to} ({n} يوم عمل)',
  ),
  '{column} ({n} of {total} files): {impact}': '{column} ({n} من {total} ملفات): {impact}',
  '{column}: {impact}': '{column}: {impact}',
  '{a} and {b}': '{a} و{b}',
  'Expected columns are present': 'الأعمدة المتوقعة موجودة',
  'Every file has all the optional columns, apart from the token columns checked below.': 'كل ملف فيه كل الأعمدة الاختيارية، ما عدا أعمدة الرموز التي تُفحص أدناه.',
  'The file does not have: {names}.': 'الملف لا يحتوي على: {names}.',
  '{n} of {total} files do not have: {names}.': plural(
    'ملف واحد من {total} لا يحتوي على: {names}.',
    'ملفان من {total} لا يحتويان على: {names}.',
    '{n} ملفات من {total} لا تحتوي على: {names}.',
    '{n} ملفًا من {total} لا تحتوي على: {names}.',
    '{n} ملف من {total} لا تحتوي على: {names}.',
  ),
  'The total_monthly_quota column has no values.': 'عمود total_monthly_quota ليس فيه قيم.',
  'Export the report again with every column if you can. Otherwise the app works with what is there, within the limits listed.':
    'صدّر التقرير مرة أخرى بكل الأعمدة إن أمكن. وإلا فسيعمل التطبيق بما هو موجود، ضمن الحدود المذكورة.',
  'Dates can be read': 'التواريخ مقروءة',
  'Every row has a readable date.': 'كل صف فيه تاريخ مقروء.',
  '{n} rows ({share}) have a date the app cannot read and were skipped.': plural(
    'صف واحد ({share}) فيه تاريخ لا يستطيع التطبيق قراءته، وتم تخطيه.',
    'صفان ({share}) فيهما تاريخ لا يستطيع التطبيق قراءته، وتم تخطيهما.',
    '{n} صفوف ({share}) فيها تاريخ لا يستطيع التطبيق قراءته، وتم تخطيها.',
    '{n} صفًا ({share}) فيها تاريخ لا يستطيع التطبيق قراءته، وتم تخطيها.',
    '{n} صف ({share}) فيها تاريخ لا يستطيع التطبيق قراءته، وتم تخطيها.',
  ),
  'Dates such as 2026-03-05 or 3/5/2026 are read. Fix the date column in the file and load it again.': 'تُقرأ تواريخ مثل 2026-03-05 أو 3/5/2026. أصلح عمود التاريخ في الملف وحمّله مرة أخرى.',
  'Numbers can be read': 'الأرقام مقروءة',
  'Every filled-in amount, quantity, token and seat-size cell is a number.': 'كل خلية مملوءة للمبلغ والكمية والرموز وحجم الترخيص هي رقم.',
  '{n} cells could not be read as a number and were counted as 0. The rows are kept.': plural(
    'تعذّرت قراءة خلية واحدة كرقم وحُسبت 0. يبقى الصف.',
    'تعذّرت قراءة خليتين كرقم وحُسبتا 0. تبقى الصفوف.',
    'تعذّرت قراءة {n} خلايا كأرقام وحُسبت 0. تبقى الصفوف.',
    'تعذّرت قراءة {n} خلية كأرقام وحُسبت 0. تبقى الصفوف.',
    'تعذّرت قراءة {n} خلية كأرقام وحُسبت 0. تبقى الصفوف.',
  ),
  'Numbers need a dot for decimals, and no thousands separators, currency signs or text such as N/A. Fix those cells and load the file again.':
    'تحتاج الأرقام إلى نقطة للكسور العشرية، ودون فواصل للآلاف أو رموز عملات أو نص مثل N/A. أصلح تلك الخلايا وحمّل الملف مرة أخرى.',
  'Duplicate rows': 'الصفوف المكررة',
  'One file loaded. Duplicates are only looked for between different files, so identical rows inside one file are kept.':
    'تم تحميل ملف واحد. يُبحث عن المكررات بين الملفات المختلفة فقط، لذا تبقى الصفوف المتطابقة داخل الملف الواحد.',
  'No row appears in more than one of the {n} files.': plural(
    'لا يظهر أي صف في أكثر من ملف.',
    'لا يظهر أي صف في الملفين كليهما.',
    'لا يظهر أي صف في أكثر من ملف من الملفات الـ{n}.',
    'لا يظهر أي صف في أكثر من ملف من الملفات الـ{n}.',
    'لا يظهر أي صف في أكثر من ملف من الملفات الـ{n}.',
  ),
  '{n} rows ({share}) are identical to a row from another file and were dropped.': plural(
    'صف واحد ({share}) مطابق لصف من ملف آخر، وتم حذفه.',
    'صفان ({share}) مطابقان لصفوف من ملف آخر، وتم حذفهما.',
    '{n} صفوف ({share}) مطابقة لصفوف من ملف آخر، وتم حذفها.',
    '{n} صفًا ({share}) مطابقة لصفوف من ملف آخر، وتم حذفها.',
    '{n} صف ({share}) مطابقة لصفوف من ملف آخر، وتم حذفها.',
  ),
  'This is expected when exports overlap or the same file is loaded twice. Nothing to do unless you meant those rows to count twice.':
    'هذا متوقع عندما تتداخل الملفات المصدّرة أو يُحمّل الملف نفسه مرتين. لا شيء تفعله إلا إذا أردت أن تُحسب تلك الصفوف مرتين.',
  '{names} added no rows. Every row with a readable date was already loaded from another file.': 'لم يضف {names} أي صف. كل صف بتاريخ مقروء كان محمّلًا بالفعل من ملف آخر.',
  'Amounts add up (usage = covered + billed)': 'المبالغ متوازنة (الاستخدام = المشمول بالخطة + المدفوع إضافيًا)',
  'Not checked. No file has discount_amount or net_amount.': 'لم يُفحص. لا يوجد ملف فيه discount_amount أو net_amount.',
  'Export the report with both columns to see what was covered by the included credits and what was billed.': 'صدّر التقرير بالعمودين لترى ما غطته الأرصدة المشمولة وما تم دفعه إضافيًا.',
  '{n} files without discount_amount and net_amount columns are not checked.': plural(
    'ملف واحد بلا عمودي discount_amount وnet_amount لم يُفحص.',
    'ملفان بلا عمودي discount_amount وnet_amount لم يُفحصا.',
    '{n} ملفات بلا عمودي discount_amount وnet_amount لم تُفحص.',
    '{n} ملفًا بلا عمودي discount_amount وnet_amount لم تُفحص.',
    '{n} ملف بلا عمودي discount_amount وnet_amount لم تُفحص.',
  ),
  'Usage equals covered plus billed on every row.': 'الاستخدام يساوي المشمول بالخطة زائد المدفوع إضافيًا في كل صف.',
  '{n} rows ({share}) have usage that is not covered plus billed.': plural(
    'صف واحد ({share}) استخدامه لا يساوي المشمول بالخطة زائد المدفوع إضافيًا.',
    'صفان ({share}) استخدامهما لا يساوي المشمول بالخطة زائد المدفوع إضافيًا.',
    '{n} صفوف ({share}) استخدامها لا يساوي المشمول بالخطة زائد المدفوع إضافيًا.',
    '{n} صفًا ({share}) استخدامها لا يساوي المشمول بالخطة زائد المدفوع إضافيًا.',
    '{n} صف ({share}) استخدامها لا يساوي المشمول بالخطة زائد المدفوع إضافيًا.',
  ),
  'On those rows usage is not covered plus billed, so the three totals will not tie out. Check the source export, or treat the affected totals with care.':
    'في تلك الصفوف لا يساوي الاستخدام المشمول بالخطة زائد المدفوع إضافيًا، لذا لن تتطابق المجاميع الثلاثة. تحقق من الملف المصدّر الأصلي، أو تعامل مع المجاميع المتأثرة بحذر.',
  'Usage matches the unit price (usage = quantity × unit price)': 'الاستخدام يطابق سعر الوحدة (الاستخدام = الكمية × سعر الوحدة)',
  'Not checked. No file has a quantity column, so AI credits are worked out from usage.': 'لم يُفحص. لا يوجد ملف فيه عمود quantity، لذا تُحسب أرصدة الذكاء الاصطناعي من الاستخدام.',
  'Usage equals quantity × the unit price on every row.': 'الاستخدام يساوي الكمية × سعر الوحدة في كل صف.',
  '{n} rows ({share}) have usage that differs from quantity × the unit price.': plural(
    'صف واحد ({share}) استخدامه يختلف عن الكمية × سعر الوحدة.',
    'صفان ({share}) استخدامهما يختلف عن الكمية × سعر الوحدة.',
    '{n} صفوف ({share}) استخدامها يختلف عن الكمية × سعر الوحدة.',
    '{n} صفًا ({share}) استخدامها يختلف عن الكمية × سعر الوحدة.',
    '{n} صف ({share}) استخدامها يختلف عن الكمية × سعر الوحدة.',
  ),
  'AI credit counts follow quantity and dollar amounts follow usage, so the two disagree on those rows. Check the source export.':
    'أعداد أرصدة الذكاء الاصطناعي تتبع الكمية، والمبالغ بالدولار تتبع الاستخدام، لذا يختلف الاثنان في تلك الصفوف. تحقق من الملف المصدّر الأصلي.',
  'Rows have a username': 'الصفوف فيها اسم مستخدم',
  'Every row has a username.': 'كل صف فيه اسم مستخدم.',
  'No row has a username.': 'لا يوجد صف فيه اسم مستخدم.',
  'Per-user views, segments and seat findings need it. Check that the username column is in the export and filled in.':
    'تحتاج إليه العروض لكل مستخدم والشرائح ونتائج التراخيص. تحقق من أن عمود اسم المستخدم موجود في الملف المصدّر ومملوء.',
  '{n} rows ({share}) have no username.': plural(
    'صف واحد ({share}) بلا اسم مستخدم.',
    'صفان ({share}) بلا اسم مستخدم.',
    '{n} صفوف ({share}) بلا اسم مستخدم.',
    '{n} صفًا ({share}) بلا اسم مستخدم.',
    '{n} صف ({share}) بلا اسم مستخدم.',
  ),
  'That is {share} of usage.': 'وهذا {share} من الاستخدام.',
  'Normal for repository-level products such as code quality. This usage counts in the totals but cannot be linked to a person.':
    'أمر طبيعي لمنتجات مستوى المستودع مثل جودة الكود. يُحسب هذا الاستخدام في المجاميع لكن لا يمكن ربطه بشخص.',
  'Mostly from {names}.': 'معظمها من {names}.',
  'Models with prices': 'النماذج التي لها أسعار',
  'No row has a model name, so there is nothing to price.': 'لا يوجد صف فيه اسم نموذج، لذا لا يوجد ما يُسعَّر.',
  'Export the report with the model column to see the model mix and the cost by token type.': 'صدّر التقرير مع عمود النموذج لترى مزيج النماذج والتكلفة حسب نوع الرمز.',
  'All {n} models have a price on the price card.': plural(
    'للنموذج سعر في قائمة الأسعار.',
    'لكلا النموذجين سعر في قائمة الأسعار.',
    'لكل النماذج الـ{n} أسعار في قائمة الأسعار.',
    'لكل النماذج الـ{n} أسعار في قائمة الأسعار.',
    'لكل النماذج الـ{n} أسعار في قائمة الأسعار.',
  ),
  'The model has no price on the price card.': 'ليس للنموذج سعر في قائمة الأسعار.',
  '{n} of {total} models have no price on the price card.': plural(
    'نموذج واحد من {total} ليس له سعر في قائمة الأسعار.',
    'نموذجان من {total} ليس لهما سعر في قائمة الأسعار.',
    '{n} نماذج من {total} ليس لها سعر في قائمة الأسعار.',
    '{n} نموذجًا من {total} ليس لها سعر في قائمة الأسعار.',
    '{n} نموذج من {total} ليس لها سعر في قائمة الأسعار.',
  ),
  'Their usage still counts in every total, but the cost by token type and the long-context premium skip them, and the Auto discount on their rows is estimated, not measured. Add their prices under Model pricing in Settings.':
    'يبقى استخدامها محسوبًا في كل المجاميع، لكن التكلفة حسب نوع الرمز وعلاوة السياق الطويل تتجاهلها، وخصم Auto في صفوفها مقدّر لا مقيس. أضف أسعارها في قسم أسعار النماذج في الإعدادات.',
  'Token columns are present': 'أعمدة الرموز موجودة',
  'The data has no input or output token columns.': 'البيانات ليس فيها أعمدة رموز الإدخال أو المخرجات.',
  'The cost by token type, the cache hit rate, the long-context premium and the measured Auto discount need them, so only credit totals are available. Export the report with token columns if your export offers them.':
    'تحتاج إليها التكلفة حسب نوع الرمز ونسبة الإصابة في الذاكرة المؤقتة وعلاوة السياق الطويل وخصم Auto المقيس، لذا تتوفر مجاميع الأرصدة فقط. صدّر التقرير مع أعمدة الرموز إن كان التصدير يتيحها.',
  'The input, output, cache read and cache write token columns are present in every file.': 'أعمدة رموز الإدخال والمخرجات والقراءة من الذاكرة المؤقتة والكتابة فيها موجودة في كل ملف.',
  '{column}: missing in {n} of {total} files.': '{column}: غير موجود في {n} من {total} ملفات.',
  'Some token columns are missing in the file.': 'بعض أعمدة الرموز غير موجودة في الملف.',
  'Some token columns are missing in {n} of {total} files.': 'بعض أعمدة الرموز غير موجودة في {n} من {total} ملفات.',
  'Missing token columns read as 0, so token totals and the cache hit rate under-count the rows from those files, and the cost by token type is skewed. Rows from a file with no token columns cannot be priced at all, so token coverage is lower. Export those files again with all token columns.':
    'تُقرأ أعمدة الرموز الغائبة على أنها 0، لذا تُحسب مجاميع الرموز ونسبة الإصابة في الذاكرة المؤقتة لصفوف تلك الملفات بأقل من الحقيقة، وتنحرف التكلفة حسب نوع الرمز. لا يمكن تسعير صفوف ملف بلا أعمدة رموز إطلاقًا، لذا تقل تغطية الرموز. صدّر تلك الملفات مرة أخرى بكل أعمدة الرموز.',
  'No gaps in the date range': 'لا فجوات في نطاق التاريخ',
  'The data covers a single day.': 'البيانات تغطي يومًا واحدًا.',
  'There is no range to check for gaps. Trends and month projections need more days.': 'لا يوجد نطاق لفحص الفجوات. تحتاج الاتجاهات وتوقعات الشهر إلى أيام أكثر.',
  'Every day from {from} to {to} has rows.': 'كل يوم من {from} إلى {to} فيه صفوف.',
  '{n} weekend days have none, which is normal for most teams.': plural(
    'يوم عطلة واحد ليس فيه صفوف، وهذا طبيعي لمعظم الفرق.',
    'يوما عطلة ليس فيهما صفوف، وهذا طبيعي لمعظم الفرق.',
    '{n} أيام عطلة ليس فيها صفوف، وهذا طبيعي لمعظم الفرق.',
    '{n} يوم عطلة ليس فيها صفوف، وهذا طبيعي لمعظم الفرق.',
    '{n} يوم عطلة ليس فيها صفوف، وهذا طبيعي لمعظم الفرق.',
  ),
  'Every weekday from {from} to {to} has rows.': 'كل يوم عمل من {from} إلى {to} فيه صفوف.',
  '{n} weekdays from {from} to {to} have no rows.': plural(
    'يوم عمل واحد من {from} إلى {to} ليس فيه صفوف.',
    'يوما عمل من {from} إلى {to} ليس فيهما صفوف.',
    '{n} أيام عمل من {from} إلى {to} ليس فيها صفوف.',
    '{n} يوم عمل من {from} إلى {to} ليس فيها صفوف.',
    '{n} يوم عمل من {from} إلى {to} ليس فيها صفوف.',
  ),
  'Public holidays and quiet days are normal. If usage was expected, export the missing period and load it together with the other files.':
    'العطلات الرسمية والأيام الهادئة أمر طبيعي. إن كان الاستخدام متوقعًا، صدّر الفترة الناقصة وحمّلها مع الملفات الأخرى.',
  'More than one month of data': 'بيانات أكثر من شهر واحد',
  'Only one month of data ({month}).': 'بيانات شهر واحد فقط ({month}).',
  'Trends and pool projections are limited with one month. Load more months to compare them. Several files can be loaded together.':
    'الاتجاهات وتوقعات الرصيد المشترك محدودة مع شهر واحد. حمّل أشهرًا أكثر للمقارنة. يمكن تحميل عدة ملفات معًا.',
  '{n} months of data, from {from} to {to}.': plural(
    'شهر واحد من البيانات، من {from} إلى {to}.',
    'شهران من البيانات، من {from} إلى {to}.',
    '{n} أشهر من البيانات، من {from} إلى {to}.',
    '{n} شهرًا من البيانات، من {from} إلى {to}.',
    '{n} شهر من البيانات، من {from} إلى {to}.',
  ),
  'The last month is complete': 'الشهر الأخير مكتمل',
  'The data starts on {date}, so the first month is partial too.': 'تبدأ البيانات في {date}، لذا الشهر الأول جزئي أيضًا.',
  'The data ends on {date}, the last day of {month}.': 'تنتهي البيانات في {date}، آخر يوم من {month}.',
  'The data ends on {date}, {n} days before the end of {month}.': plural(
    'تنتهي البيانات في {date}، قبل يوم واحد من نهاية {month}.',
    'تنتهي البيانات في {date}، قبل يومين من نهاية {month}.',
    'تنتهي البيانات في {date}، قبل {n} أيام من نهاية {month}.',
    'تنتهي البيانات في {date}، قبل {n} يومًا من نهاية {month}.',
    'تنتهي البيانات في {date}، قبل {n} يوم من نهاية {month}.',
  ),
  'The last month is projected from the days so far, so its month-end figures are estimates. Load the full month once it ends for final numbers.':
    'يُتوقع الشهر الأخير من الأيام التي مضت حتى الآن، لذا أرقام نهاية الشهر تقديرات. حمّل الشهر كاملًا بعد انتهائه للحصول على الأرقام النهائية.',
  'Negative amounts': 'مبالغ سالبة',
  'No row has a negative amount.': 'لا يوجد صف فيه مبلغ سالب.',
  '{n} rows ({share}) have a negative usage, covered or billed amount.': plural(
    'صف واحد ({share}) فيه مبلغ استخدام أو مشمول بالخطة أو مدفوع إضافي سالب.',
    'صفان ({share}) فيهما مبلغ استخدام أو مشمول بالخطة أو مدفوع إضافي سالب.',
    '{n} صفوف ({share}) فيها مبلغ استخدام أو مشمول بالخطة أو مدفوع إضافي سالب.',
    '{n} صفًا ({share}) فيها مبلغ استخدام أو مشمول بالخطة أو مدفوع إضافي سالب.',
    '{n} صف ({share}) فيها مبلغ استخدام أو مشمول بالخطة أو مدفوع إضافي سالب.',
  ),
  'The app does not know why an amount is negative. A credit or a refund can look like this. The rows are included in every total, so totals can be lower than the sum of the positive rows.':
    'لا يعرف التطبيق سبب كون المبلغ سالبًا. قد يبدو رصيد دائن أو استرداد هكذا. تُضمّن الصفوف في كل المجاميع، لذا قد تكون المجاميع أقل من مجموع الصفوف الموجبة.',
  comma: 'فاصلة',
  semicolon: 'فاصلة منقوطة',
  tab: 'علامة جدولة',
  pipe: 'خط عمودي',
};

export default arabic;
