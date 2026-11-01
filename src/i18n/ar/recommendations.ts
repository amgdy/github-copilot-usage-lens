import type { Dict, PluralEntry } from '../core';

/** Arabic counted sentence: one, two, 3 to 10, 11 to 99, and 0 or 100 and up. */
const plural = (one: string, two: string, few: string, many: string, other: string): PluralEntry => ({ zero: other, one, two, few, many, other });

/** Arabic for the Recommendations page, the recommendation engine, the personal tips and the executive summary. */
const arabic: Dict = {
  // GitHub Copilot prompt: the dialog
  'Ask GitHub Copilot': 'اسأل GitHub Copilot',
  'Prepare a prompt for GitHub Copilot': 'جهّز مطالبة لـ GitHub Copilot',
  'Choose a task, review the prompt, then copy it into GitHub Copilot. This app does not send your data.':
    'اختر مهمة، وراجع المطالبة، ثم انسخها إلى GitHub Copilot. لا يرسل هذا التطبيق بياناتك.',
  'What should GitHub Copilot do?': 'ما المهمة التي تريد من GitHub Copilot تنفيذها؟',
  'Include real user names': 'تضمين أسماء المستخدمين الحقيقية',
  'Off by default. When off, names are replaced with labels such as {alias}, in tables and in text.':
    'متوقف افتراضيًا. عند إيقافه، تُستبدل الأسماء بتسميات مثل {alias} في الجداول وفي النص.',
  'The prompt holds the data this task needs in a compact form, with clear rules and an answer format. For the best answer, pick a reasoning model and the highest thinking level that your GitHub Copilot client offers.':
    'تحمل المطالبة البيانات التي تحتاجها هذه المهمة في شكل موجز، مع قواعد واضحة وشكل محدد للإجابة. للحصول على أفضل إجابة، اختر نموذجًا يدعم التفكير المعمّق وأعلى مستوى تفكير يتيحه عميل GitHub Copilot لديك.',
  'Prompt preview': 'معاينة المطالبة',
  '{chars} characters, about {tokens} tokens': '{chars} حرفًا، أي نحو {tokens} رمزًا',
  'Download Space instructions': 'تنزيل إرشادات المساحة',
  'Download prompt': 'تنزيل المطالبة',
  'Copy prompt': 'نسخ المطالبة',

  // GitHub Copilot prompt: the tasks
  'Brief leadership': 'إعداد موجز للقيادة',
  'Write a decision brief for leaders who do not read dashboards. Explain what the numbers mean for the business, what is likely to happen next, and what leaders need to decide.':
    'اكتب موجز قرارات لقادة لا يقرؤون لوحات المعلومات. اشرح ما تعنيه الأرقام للعمل، وما يُرجَّح أن يحدث بعد ذلك، وما يجب على القادة أن يقرروه.',
  'Tell the story of the period in three parts: what happened, why it most likely happened, and what happens next if nothing changes.':
    'احكِ قصة الفترة في ثلاثة أجزاء: ماذا حدث، ولماذا حدث على الأرجح، وماذا سيحدث بعد ذلك إن لم يتغير شيء.',
  'Link cost to value. Is usage growing because more people use GitHub Copilot, or because a few people use costly models more? Use users, user_spread, months and models together.':
    'اربط التكلفة بالقيمة. هل يزيد الاستخدام لأن عدد من يستخدمون GitHub Copilot يزيد، أم لأن قلة من الناس يستخدمون النماذج المكلفة أكثر؟ استخدم users وuser_spread وmonths وmodels معًا.',
  'Project the next month from months (proj_*) and weeks. Give a low, a likely and a high case, and say what drives each one.':
    'توقّع الشهر القادم من months (الأعمدة proj_*) وweeks. قدّم حالة منخفضة وحالة مرجّحة وحالة مرتفعة، واذكر ما يحرّك كل واحدة منها.',
  'Choose at most three decisions. For each one, give the options, the cost of acting and of not acting, and who should own it.':
    'اختر ثلاثة قرارات على الأكثر. لكل قرار، اذكر الخيارات، وتكلفة التنفيذ وتكلفة عدم التنفيذ، ومن يجب أن يتولاه.',
  'Name one thing that goes well and should be kept.': 'اذكر أمرًا واحدًا يسير جيدًا ويجب الحفاظ عليه.',
  Outlook: 'التوقعات',
  'A table for next month with a low, likely and high case: usage, billed usage and pool use, with the main driver of each case.':
    'جدول للشهر القادم فيه حالة منخفضة ومرجّحة ومرتفعة: الاستخدام، والاستخدام المدفوع، واستخدام الرصيد المشترك، مع السبب الرئيسي لكل حالة.',
  'Decisions needed': 'القرارات المطلوبة',
  'Up to three numbered decisions. For each: the options, your advice, the owner and a date to decide by.':
    'حتى ثلاثة قرارات مرقّمة. لكل قرار: الخيارات، ونصيحتك، والمسؤول عنه، وموعد لاتخاذه.',
  'Find patterns the dashboards miss': 'اكتشاف أنماط لا تظهرها لوحات المعلومات',
  'Find patterns, links and outliers that a dashboard cannot show because they need several tables at once. Explain the likely causes and how to confirm them.':
    'اكتشف الأنماط والروابط والحالات الشاذة التي لا تستطيع لوحة المعلومات إظهارها لأنها تحتاج إلى عدة جداول معًا. اشرح الأسباب المرجّحة وكيف يمكن التأكد منها.',
  'Look across time: weekday cycles (weekdays), spikes (spikes) and changes between months. Link each spike to the users and models behind it, and check whether the same users drive several spikes.':
    'انظر عبر الزمن: دورات أيام الأسبوع (weekdays)، والقفزات (spikes)، والتغيّرات بين الأشهر. اربط كل قفزة بالمستخدمين والنماذج التي تقف خلفها، وتحقق مما إذا كان المستخدمون أنفسهم وراء عدة قفزات.',
  'Look across groups. Compare the rows of group_mix and find groups that behave differently, for example high usage with low cache use, or many top models with few active days.':
    'انظر عبر المجموعات. قارن صفوف group_mix واعثر على المجموعات التي تتصرف بشكل مختلف، مثل استخدام مرتفع مع استخدام منخفض للذاكرة المؤقتة، أو كثرة النماذج القوية مع قلة أيام النشاط.',
  'Look at dependency: how much of the usage depends on a few users (user_spread, users), and what would change if they stopped.':
    'انظر إلى الاعتماد: كم من الاستخدام يعتمد على قلة من المستخدمين (user_spread وusers)، وماذا سيتغير لو توقفوا.',
  'Find data that does not fit together, such as high usage with few active days, or users active in GitHub but missing in the report. Explain each case.':
    'اعثر على بيانات لا تتوافق معًا، مثل استخدام مرتفع مع قلة أيام النشاط، أو مستخدمين نشطين في GitHub لكنهم غائبون عن التقرير. اشرح كل حالة.',
  'Find early warning signs: a rising trend_pct, more users above their own share, or a pool that runs out earlier each month.':
    'اعثر على علامات الإنذار المبكر: ارتفاع trend_pct، أو زيادة المستخدمين الذين تجاوزوا حصتهم، أو رصيد مشترك ينفد أبكر كل شهر.',
  'For every pattern, give at least two possible explanations and say which data would confirm or rule out each one.':
    'لكل نمط، قدّم تفسيرين محتملين على الأقل، واذكر البيانات التي تؤكد كل تفسير أو تستبعده.',
  'A numbered list. For each pattern: what you see, the evidence (table and row), the most likely explanation and one other, the effect in USD per month when known, and how to confirm it.':
    'قائمة مرقّمة. لكل نمط: ما تراه، والدليل (الجدول والصف)، والتفسير الأرجح وتفسير آخر، والأثر بالدولار الأمريكي شهريًا عندما يكون معروفًا، وكيف تتأكد منه.',
  Outliers: 'الحالات الشاذة',
  'A table of the users, days or models that stand out, with what makes each one stand out.':
    'جدول بالمستخدمين أو الأيام أو النماذج اللافتة، مع ما يجعل كلًا منها لافتًا.',
  'Watch list': 'قائمة المتابعة',
  'Three to five signals to check every month, each with the level that should start an action.':
    'من ثلاث إلى خمس إشارات تُراجع كل شهر، ولكل منها المستوى الذي يستدعي اتخاذ إجراء.',
  'Review seats': 'مراجعة التراخيص',
  'Decide which seats to keep, check, change or remove, with fair and careful evidence. Put the seats in groups so an admin can act on each group at once.':
    'قرّر أي التراخيص تُبقى أو تُراجع أو تُغيَّر أو تُزال، بأدلة عادلة ودقيقة. ضع التراخيص في مجموعات حتى يتمكن المسؤول من التعامل مع كل مجموعة دفعة واحدة.',
  'Combine every signal for each seat: usage in the report (users, seat_candidates), license activity (license_findings), GitHub activity (github_activity, active_without_report_usage) and seat changes (audit_months).':
    'اجمع كل الإشارات لكل ترخيص: الاستخدام في التقرير (users وseat_candidates)، ونشاط قائمة التراخيص (license_findings)، والنشاط في GitHub (github_activity وactive_without_report_usage)، وتغييرات التراخيص (audit_months).',
  'Code completions are not in the report. A seat with no usage in the report but recent activity in the license list or in GitHub is in use. Never advise removing it.':
    'إكمال التعليمات البرمجية ليس في التقرير. الترخيص الذي ليس له استخدام في التقرير لكن له نشاط حديث في قائمة التراخيص أو في GitHub مستخدَم. لا تنصح أبدًا بإزالته.',
  'Put the seats in groups: remove now (strong evidence from two sources), ask the user or manager first, change the plan, and keep. Say what evidence puts a seat in its group.':
    'ضع التراخيص في مجموعات: إزالة الآن (دليل قوي من مصدرين)، وسؤال المستخدم أو المدير أولًا، وتغيير الخطة، والإبقاء. اذكر الدليل الذي يضع كل ترخيص في مجموعته.',
  'Look for problems in how seats are given: organizations that give every member a seat, seats added and never used, pending invitations, and users with seats in several organizations.':
    'ابحث عن مشكلات في طريقة منح التراخيص: منظمات تمنح كل عضو ترخيصًا، وتراخيص أُضيفت ولم تُستخدم قط، ودعوات معلّقة، ومستخدمون لديهم تراخيص في عدة منظمات.',
  'Give the monthly saving of each group from the data. Do not add savings that overlap.':
    'اذكر التوفير الشهري لكل مجموعة من البيانات. لا تجمع الوفورات المتداخلة.',
  'Suggest a fair and respectful process: tell users first, give them time, and make it easy to get a seat back.':
    'اقترح خطوات عادلة ومحترمة: أبلغ المستخدمين أولًا، وامنحهم وقتًا، واجعل استعادة الترخيص سهلة.',
  'Seat groups': 'مجموعات التراخيص',
  'A table: group, number of seats, users, evidence and monthly USD.':
    'جدول: المجموعة، وعدد التراخيص، والمستخدمون، والدليل، والمبلغ الشهري بالدولار الأمريكي.',
  'Steps with timing, for example week 1, week 2 and week 4.': 'خطوات مع توقيتها، مثل الأسبوع 1 والأسبوع 2 والأسبوع 4.',
  'Message to users': 'رسالة إلى المستخدمين',
  'A short and friendly draft message to users whose seat may be removed.': 'مسودة رسالة قصيرة وودودة للمستخدمين الذين قد تُزال تراخيصهم.',
  'Review budgets and limits': 'مراجعة الميزانيات والحدود',
  'Explain how the spending limits and the included credits work together for this account, find where work could be blocked or costs could run over, and suggest better settings.':
    'اشرح كيف تعمل حدود الإنفاق والأرصدة المشمولة معًا في هذا الحساب، واعثر على المواضع التي قد يتوقف فيها العمل أو تتجاوز فيها التكاليف الحد، واقترح إعدادات أفضل.',
  'Explain the structure in plain words. The shared pool of included credits is used first, and only the rest is billed. Spending limits apply to billed usage. The enterprise or organization limit is the frame. Cost center and organization limits sit inside it. User limits (individual, cost center default or universal) cap single users.':
    'اشرح البنية بكلمات بسيطة. يُستخدم الرصيد المشترك للأرصدة المشمولة أولًا، ولا يُدفع إلا الباقي. تنطبق حدود الإنفاق على الاستخدام المدفوع. حد المؤسسة أو المنظمة هو الإطار. وحدود مراكز التكلفة والمنظمات تقع داخله. وحدود المستخدمين (فردي، أو افتراضي لمركز التكلفة، أو عام) تحدّ من استخدام كل مستخدم.',
  'Use limit_frame, limit_rows, limit_users, github_budgets and users_at_limit to find limits that are almost full, the limit that is reached first, rows with no limit, and users who will reach their limit before the month ends.':
    'استخدم limit_frame وlimit_rows وlimit_users وgithub_budgets وusers_at_limit لتعثر على الحدود التي امتلأت تقريبًا، والحد الذي يُبلغ أولًا، والصفوف التي بلا حد، والمستخدمين الذين سيبلغون حدودهم قبل نهاية الشهر.',
  'Compare the projection (months proj_*, monthly_budget) with each limit and say on which day a limit would be reached at the current pace.':
    'قارن التوقع (الأعمدة proj_* في months، وmonthly_budget) بكل حد، واذكر اليوم الذي سيُبلغ فيه كل حد بالوتيرة الحالية.',
  'Check whether each limit fits the usage. A limit far above use gives no control, and a limit far below use blocks work. Use user_spread and users to suggest values, with a reason for each.':
    'تحقق مما إذا كان كل حد يناسب الاستخدام. الحد الأعلى بكثير من الاستخدام لا يضبط شيئًا، والحد الأدنى منه بكثير يوقف العمل. استخدم user_spread وusers لاقتراح قيم، مع سبب لكل منها.',
  'Check github_bills and billing_check for gaps between the report and GitHub billing.':
    'راجع github_bills وbilling_check بحثًا عن فروق بين التقرير وفوترة GitHub.',
  'Do not claim that an enterprise budget blocks every user. GitHub settings that are not in this data can change that.':
    'لا تقل إن ميزانية المؤسسة توقف كل المستخدمين. قد تغيّر ذلك إعدادات في GitHub غير موجودة في هذه البيانات.',
  'How your limits work': 'كيف تعمل حدودك',
  'A short plain explanation of this account, with a small text tree of the frame, the rows inside it and the user limits.':
    'شرح قصير وبسيط لهذا الحساب، مع شجرة نصية صغيرة للإطار والصفوف التي داخله وحدود المستخدمين.',
  'Limit risk': 'مخاطر الحدود',
  'A table: limit, used, room left, the expected day it is reached, and what happens then.':
    'جدول: الحد، والمستخدم منه، والمتبقي، واليوم المتوقع لبلوغه، وما يحدث عندئذ.',
  'Suggested settings': 'الإعدادات المقترحة',
  'A table: limit, current value, suggested value, stop or alert only, and the reason.':
    'جدول: الحد، والقيمة الحالية، والقيمة المقترحة، وإيقاف أم تنبيه فقط، والسبب.',
  'Which alerts to set, at what level, and who should get them.': 'أي التنبيهات تُضبط، وعند أي مستوى، ومن يجب أن يتلقاها.',
  'Review model usage': 'مراجعة استخدام النماذج',
  'Find where the model mix costs more than it needs to, without hurting work that really needs top models, and suggest a model policy.':
    'اعثر على المواضع التي يكلّف فيها مزيج النماذج أكثر من اللازم، دون الإضرار بالعمل الذي يحتاج فعلًا إلى النماذج القوية، واقترح سياسة للنماذج.',
  'Compare models by usd_per_mtok, cache_hit_pct, users and class. Find costly models used for work that a lower-cost model or Auto could do, and models with low cache use.':
    'قارن النماذج حسب usd_per_mtok وcache_hit_pct وusers وclass. اعثر على النماذج المكلفة المستخدمة في عمل يمكن أن ينجزه نموذج أقل تكلفة أو Auto، والنماذج قليلة الاستخدام للذاكرة المؤقتة.',
  'Link models to users: who drives each costly model, and is it a few users or many (users, group_mix)?':
    'اربط النماذج بالمستخدمين: من يقف وراء كل نموذج مكلف، وهل هم قلة أم كثيرون (users وgroup_mix)؟',
  'Check Auto: the discount received, the discount missed and auto_pct of each user. Say where Auto would save the most and where it may not fit.':
    'راجع Auto: الخصم الذي حصلت عليه، والخصم الذي فاتك، وauto_pct لكل مستخدم. اذكر أين يوفّر Auto أكثر وأين قد لا يناسب.',
  'Look at long_context_pct and the extra cost of long context.': 'انظر إلى long_context_pct والتكلفة الإضافية للسياق الطويل.',
  'Use savings_steps and savings_plan for the size of the savings. Single steps overlap, so use the combined plan for a total.':
    'استخدم savings_steps وsavings_plan لمعرفة حجم الوفورات. الخطوات المفردة متداخلة، لذا استخدم الخطة المجمعة للإجمالي.',
  'Never assume that a lower-cost model fits every task. Say which kinds of work should keep top models.':
    'لا تفترض أبدًا أن النموذج الأقل تكلفة يناسب كل مهمة. اذكر أنواع العمل التي يجب أن تبقى على النماذج القوية.',
  'A table: model, class, share of usage, cost per 1M tokens, main users, and your advice (keep, move to Auto, move to a lower class, or check).':
    'جدول: النموذج، والفئة، والحصة من الاستخدام، والتكلفة لكل مليون رمز، والمستخدمون الرئيسيون، ونصيحتك (إبقاء، أو نقل إلى Auto، أو نقل إلى فئة أدنى، أو مراجعة).',
  Opportunities: 'الفرص',
  'A numbered list with USD per month and confidence.': 'قائمة مرقّمة مع المبلغ بالدولار الأمريكي شهريًا ودرجة الثقة.',
  'Model policy': 'سياسة النماذج',
  'A short draft policy for admins and team leads.': 'مسودة سياسة قصيرة للمسؤولين وقادة الفرق.',
  Rollout: 'خطة التطبيق',
  'Steps to roll out the changes and to measure the effect.': 'خطوات لتطبيق التغييرات وقياس أثرها.',
  'Plan next steps for user groups': 'تخطيط الخطوات التالية لمجموعات المستخدمين',
  'Turn the user groups into a practical plan: help light users get value, guide heavy users to use credits wisely, and spread the good habits of the best users.':
    'حوّل مجموعات المستخدمين إلى خطة عملية: ساعد قليلي الاستخدام على الاستفادة، ووجّه كثيري الاستخدام إلى استخدام الأرصدة بحكمة، وانشر العادات الجيدة لأفضل المستخدمين.',
  'Describe each group from group_meaning and group_mix in plain words: who they are, how they work and what they need.':
    'صِف كل مجموعة من group_meaning وgroup_mix بكلمات بسيطة: من هم، وكيف يعملون، وماذا يحتاجون.',
  'Find the groups with the most room to improve: low use with a seat, heavy use of top models, low cache or Auto use, or fading activity.':
    'اعثر على المجموعات التي لديها أكبر مجال للتحسن: استخدام قليل مع وجود ترخيص، أو استخدام كثيف للنماذج القوية، أو قلة استخدام الذاكرة المؤقتة أو Auto، أو نشاط يتراجع.',
  'Find good examples: users or groups with high value and efficient habits (high efficiency, high cache_hit_pct, steady activity). Say what others can learn from them.':
    'اعثر على أمثلة جيدة: مستخدمون أو مجموعات ذوو قيمة عالية وعادات كفؤة (efficiency مرتفع، وcache_hit_pct مرتفع، ونشاط ثابت). اذكر ما يمكن أن يتعلمه الآخرون منهم.',
  'Suggest one action for each group, with the expected effect on usage and cost, and how to measure it in the next report.':
    'اقترح إجراءً واحدًا لكل مجموعة، مع أثره المتوقع على الاستخدام والتكلفة، وكيف يُقاس في التقرير القادم.',
  'Suggest actions for groups. Name a single user only when the evidence is about that user alone.':
    'اقترح إجراءات للمجموعات. لا تذكر مستخدمًا بعينه إلا عندما يخص الدليل ذلك المستخدم وحده.',
  'Group plan': 'خطة المجموعات',
  'A table: group, users, what they need, action, owner, expected effect and how to measure it.':
    'جدول: المجموعة، والمستخدمون، وما يحتاجونه، والإجراء، والمسؤول، والأثر المتوقع، وكيف يُقاس.',
  'Good examples': 'أمثلة جيدة',
  'What the best users do differently and how to share it.': 'ما يفعله أفضل المستخدمين بشكل مختلف، وكيف يُنشر ذلك.',
  'Message draft': 'مسودة رسالة',
  'A short message to the group where it matters most.': 'رسالة قصيرة إلى المجموعة الأهم.',

  // GitHub Copilot prompt: the shared parts
  'In brief': 'باختصار',
  'Three to five bullets with the most important points and their numbers. A reader who stops here should know what to do.':
    'من ثلاث إلى خمس نقاط بأهم ما في التحليل وأرقامه. يجب أن يعرف القارئ ما يفعله حتى لو توقف هنا.',
  Findings: 'النتائج',
  'A table: #, finding, evidence (table and row, for example models: model name), effect (USD per month or users) and confidence (high, medium or low). The most important first.':
    'جدول: #، والنتيجة، والدليل (الجدول والصف، مثل models: اسم النموذج)، والأثر (بالدولار الأمريكي شهريًا أو بعدد المستخدمين)، والثقة (عالية أو متوسطة أو منخفضة). الأهم أولًا.',
  'A table: #, action, owner, effort (low, medium or high), expected effect and how to measure it. The most value first.':
    'جدول: #، والإجراء، والمسؤول، والجهد (منخفض أو متوسط أو مرتفع)، والأثر المتوقع، وكيف يُقاس. الأعلى قيمة أولًا.',
  'Risks and data limits': 'المخاطر وحدود البيانات',
  'Short bullets: what could make your advice wrong, and what data is missing.': 'نقاط قصيرة: ما الذي قد يجعل نصيحتك خاطئة، وما البيانات الناقصة.',
  Questions: 'أسئلة',
  'Up to three questions whose answers would change your advice. Write "None" when there are none.':
    'حتى ثلاثة أسئلة قد تغيّر إجاباتها نصيحتك. اكتب "لا يوجد" إن لم تكن هناك أسئلة.',
  'GitHub Copilot usage analysis: {task}': 'تحليل استخدام GitHub Copilot: {task}',
  'You are a senior analyst for GitHub Copilot usage and costs. An admin gives you data that GitHub Copilot Usage Lens calculated from the GitHub Copilot AI credits usage report. Find what dashboards cannot show: links between tables, likely causes, risks ahead and the best next steps.':
    'أنت محلل أول لاستخدام GitHub Copilot وتكاليفه. يقدّم لك مسؤول بيانات حسبها GitHub Copilot Usage Lens من تقرير استخدام أرصدة الذكاء الاصطناعي في GitHub Copilot. اكتشف ما لا تستطيع لوحات المعلومات إظهاره: الروابط بين الجداول، والأسباب المرجّحة، والمخاطر القادمة، وأفضل الخطوات التالية.',
  'Your task': 'المهمة المطلوبة',
  'The data comes first. The full instructions and the answer format follow after it.': 'تأتي البيانات أولًا، ثم تليها الإرشادات الكاملة وشكل الإجابة.',
  'How to read the data': 'كيف تقرأ البيانات',
  'How to think': 'كيف تفكر',
  Rules: 'القواعد',
  'What to look for': 'ما الذي تبحث عنه',
  'Answer format': 'شكل الإجابة',
  'Write in Markdown. Use these sections in this order, with these titles. Keep tables to 10 rows or fewer.':
    'اكتب بتنسيق Markdown. استخدم هذه الأقسام بهذا الترتيب وبهذه العناوين. اجعل الجداول 10 صفوف أو أقل.',
  'Check before you answer': 'تحقق قبل أن تجيب',
  'Now write the answer. Start with the section "{title}".': 'اكتب الإجابة الآن. ابدأ بالقسم "{title}".',
  'Each section starts with its name. Simple sections have one "key: value" line per item.':
    'يبدأ كل قسم باسمه. في الأقسام البسيطة سطر واحد "key: value" لكل عنصر.',
  'A table starts with name[rows]{columns}: and each line after it is one row of values split by commas. [25/140] means 25 of 140 rows are shown.':
    'يبدأ الجدول بـ name[rows]{columns}: وكل سطر بعده صف واحد من القيم تفصل بينها فواصل. و[25/140] تعني أن 25 صفًا من أصل 140 معروضة.',
  'A value with a comma or a quote is in double quotes. A quote inside it is written twice.':
    'القيمة التي فيها فاصلة أو علامة اقتباس توضع بين علامتي اقتباس مزدوجتين، وتُكتب علامة الاقتباس التي داخلها مرتين.',
  'A line that starts with # explains the table below it.': 'السطر الذي يبدأ بـ # يشرح الجدول الذي تحته.',
  'y means yes, n means no and - means unknown or not available. A | splits a list inside one value.':
    'y تعني نعم، وn تعني لا، و- تعني غير معروف أو غير متاح. والعلامة | تفصل بين عناصر قائمة داخل قيمة واحدة.',
  'Names that end in _usd are US dollars, _pct is a percentage from 0 to 100, _mtok is millions of tokens. Dates are YYYY-MM-DD.':
    'الأسماء التي تنتهي بـ _usd بالدولار الأمريكي، و_pct نسبة مئوية من 0 إلى 100، و_mtok بملايين الرموز. والتواريخ بصيغة YYYY-MM-DD.',
  'usage is the reported usage, after any Auto discount. covered is the part paid by included credits. billed is the rest, which is charged.':
    'usage هو الاستخدام المُبلغ عنه بعد أي خصم Auto. وcovered هو الجزء الذي غطته الأرصدة المشمولة. وbilled هو الباقي الذي يُدفع.',
  "own_share is the included credits of a user's own seat. It is only a yardstick, because the credits are shared.":
    'own_share هو الأرصدة المشمولة في ترخيص المستخدم نفسه. وهو مقياس للمقارنة فقط، لأن الأرصدة مشتركة.',
  'Ids such as persona or tier values are explained in group_meaning when it is present.':
    'المعرّفات مثل قيم persona أو tier مشروحة في group_meaning عند وجوده.',
  'Use your deepest reasoning. If you can choose a reasoning mode or level, use the highest one.':
    'استخدم أعمق تفكير لديك. إن كان بإمكانك اختيار وضع التفكير أو مستواه، فاختر أعلاه.',
  'Read every table before you write. Then link the tables: time with users and models, groups with limits, organizations with seats.':
    'اقرأ كل الجداول قبل أن تكتب. ثم اربط الجداول: الزمن بالمستخدمين والنماذج، والمجموعات بالحدود، والمنظمات بالتراخيص.',
  'For each finding, test at least two explanations and keep the one the data supports best. Say how sure you are.':
    'لكل نتيجة، اختبر تفسيرين على الأقل واحتفظ بالتفسير الذي تدعمه البيانات أكثر. واذكر مدى ثقتك.',
  'Look for what the recommendations of the app miss. Say where you disagree with them and why.':
    'ابحث عمّا فات توصيات التطبيق. واذكر أين تختلف معها ولماذا.',
  'Check every number you quote against the data. Do the math step by step and round only at the end.':
    'طابق كل رقم تذكره مع البيانات. احسب خطوة بخطوة ولا تقرّب إلا في النهاية.',
  'Do not show your working notes. Show only the results, with short reasons.': 'لا تعرض ملاحظات عملك. اعرض النتائج فقط مع أسباب قصيرة.',
  'The data above is your only source. Do not invent numbers, causes, prices or GitHub settings.':
    'البيانات أعلاه هي مصدرك الوحيد. لا تخترع أرقامًا أو أسبابًا أو أسعارًا أو إعدادات في GitHub.',
  'The totals of the app are correct, so do not recalculate them. You may derive new figures such as ratios, shares and differences. Show the formula in short, for example "12.4 / 80 = 15.5%".':
    'إجماليات التطبيق صحيحة، فلا تُعد حسابها. يمكنك استخراج أرقام جديدة مثل النسب والحصص والفروق. اعرض المعادلة باختصار، مثل "12.4 / 80 = 15.5%".',
  '1 AI credit is 0.01 USD. Usage is the amount covered by included credits plus the amount billed.':
    'رصيد الذكاء الاصطناعي الواحد يساوي 0.01 دولار أمريكي. والاستخدام هو المبلغ الذي غطته الأرصدة المشمولة مضافًا إليه المبلغ المدفوع.',
  'Included credits form one shared pool for the account. They are not personal allowances.':
    'تشكّل الأرصدة المشمولة رصيدًا مشتركًا واحدًا للحساب، وليست حصصًا شخصية.',
  'Savings of separate recommendations or steps overlap. Never add them up. Use savings_plan for a combined figure.':
    'وفورات التوصيات أو الخطوات المنفصلة متداخلة. لا تجمعها أبدًا. استخدم savings_plan للحصول على رقم مجمّع.',
  'Code completions and next edit suggestions are not in the report. No usage is not proof that a seat is unused.':
    'إكمال التعليمات البرمجية واقتراحات التعديل التالي ليست في التقرير. وغياب الاستخدام ليس دليلًا على أن الترخيص غير مستخدم.',
  'A - means unknown, not zero. Say when data is missing, filtered or made up for a sample.':
    'العلامة - تعني غير معروف، لا صفرًا. اذكر متى تكون البيانات ناقصة أو مصفّاة أو مختلقة لتقرير تجريبي.',
  'Mark estimates as estimates. Write money in USD with two decimals at most.':
    'ميّز التقديرات بأنها تقديرات. واكتب المبالغ بالدولار الأمريكي بخانتين عشريتين على الأكثر.',
  'Write for managers in plain words and short sentences. Explain a technical term the first time you use it.':
    'اكتب للمديرين بكلمات بسيطة وجمل قصيرة. واشرح أي مصطلح تقني في أول مرة تستخدمه.',
  'User names were replaced with aliases such as {alias}. The lowest number has the most usage. Use the aliases as they are. They are not GitHub logins.':
    'استُبدلت أسماء المستخدمين بتسميات مثل {alias}. وأصغر رقم له أكبر استخدام. استخدم التسميات كما هي، فهي ليست أسماء دخول إلى GitHub.',
  'The admin chose to include real user names. Name a person only when the task needs it.':
    'اختار المسؤول تضمين أسماء المستخدمين الحقيقية. لا تذكر شخصًا بالاسم إلا عندما تحتاج المهمة إلى ذلك.',
  'Answer in Arabic. Keep the names of tables, columns, ids, models and users as they are in the data.':
    'أجب باللغة العربية. واترك أسماء الجداول والأعمدة والمعرّفات والنماذج والمستخدمين كما هي في البيانات.',
  'Answer in English. Keep the names of tables, columns, ids, models and users as they are in the data.':
    'أجب باللغة الإنجليزية. واترك أسماء الجداول والأعمدة والمعرّفات والنماذج والمستخدمين كما هي في البيانات.',
  'Every number in your answer is in the data or comes from a formula you show.': 'كل رقم في إجابتك موجود في البيانات أو ناتج عن معادلة تعرضها.',
  'No savings are added together.': 'لم تُجمع أي وفورات معًا.',
  'Every finding has evidence and a confidence level.': 'لكل نتيجة دليل ودرجة ثقة.',
  'Every action has an owner and a way to measure it.': 'لكل إجراء مسؤول وطريقة لقياسه.',
  'No seat is called unused on report usage alone.': 'لم يوصف أي ترخيص بأنه غير مستخدم بناءً على استخدام التقرير وحده.',
  'The answer uses the sections in the order given.': 'تستخدم الإجابة الأقسام بالترتيب المحدد.',

  // GitHub Copilot prompt: the notes in the data
  'pool_* is the shared pool of included credits; proj_* is the projection for a month that is not over':
    'pool_* هو الرصيد المشترك للأرصدة المشمولة؛ وproj_* هو التوقع لشهر لم ينتهِ بعد',
  'weeks start on Monday; the first and last week can be partial': 'تبدأ الأسابيع يوم الاثنين؛ وقد يكون الأسبوع الأول والأخير غير مكتملين',
  'days far above the usual level; top_* lists who and what drove the day as name:usd':
    'أيام أعلى بكثير من المستوى المعتاد؛ وtop_* يذكر من وما الذي رفع اليوم بصيغة name:usd',
  'by usage; price_* is the price card in USD per 1M tokens; usd_per_mtok is usage divided by all tokens':
    'حسب الاستخدام؛ وprice_* هو سعر بطاقة الأسعار بالدولار الأمريكي لكل مليون رمز؛ وusd_per_mtok هو الاستخدام مقسومًا على كل الرموز',
  'Powerful = top models, Versatile = everyday models, Lightweight = fast low-cost models':
    'Powerful = النماذج القوية، وVersatile = نماذج الاستخدام اليومي، وLightweight = النماذج السريعة منخفضة التكلفة',
  'users can be in several traits; savable_usd overlaps between groups': 'قد يكون للمستخدم عدة سمات؛ وsavable_usd متداخل بين المجموعات',
  'shares are weighted by usage; trend_pct compares the last 7 days with the 7 days before':
    'الحصص موزونة بالاستخدام؛ وtrend_pct يقارن آخر 7 أيام بالأيام السبعة التي قبلها',
  'the top {limit} by usage, plus up to {more} more of each persona': 'أعلى {limit} حسب الاستخدام، مع ما يصل إلى {more} آخرين من كل persona',
  'the top {limit} by usage': 'أعلى {limit} حسب الاستخدام',
  'idle = little use; downgrade = Enterprise seat that never needed more than Business; unused = seat not in the report; keep = not in the report but active by the license data (not a saving)':
    'idle = استخدام قليل؛ وdowngrade = ترخيص Enterprise لم يحتج قط إلى أكثر من Business؛ وunused = ترخيص ليس في التقرير؛ وkeep = ليس في التقرير لكنه نشط وفق بيانات التراخيص (ليس توفيرًا)',
  'reclaim = no activity for a long time; fading = activity getting old; quiet = seat with activity but no usage in the report; no_seat = in the report but not in the license list':
    'reclaim = لا نشاط منذ مدة طويلة؛ وfading = نشاط يتقادم؛ وquiet = ترخيص له نشاط لكن بلا استخدام في التقرير؛ وno_seat = في التقرير لكنه ليس في قائمة التراخيص',
  'active in GitHub metrics (for example code completions) but with no usage in the report':
    'نشط في مقاييس GitHub (مثل إكمال التعليمات البرمجية) لكن بلا استخدام في التقرير',
  'from GitHub billing; open = the month is not closed yet': 'من فوترة GitHub؛ وopen = الشهر لم يُغلق بعد',
  'the report compared with what GitHub billing shows': 'التقرير مقارنةً بما تُظهره فوترة GitHub',
  'the fullest first; {count} budgets for other products are left out': 'الأكثر امتلاءً أولًا؛ واستُبعدت {count} ميزانيات لمنتجات أخرى',
  'the most seats first': 'الأكثر تراخيص أولًا',
  'each row is the spending limit that a group of users checks, rows with own limits and the fullest first; limits lists every own limit as "amount used amount stops|alert-only"; capacity_usd is the smallest limit that stops use; room_left_usd is the smaller of its own room and the frame room':
    'كل صف هو حد الإنفاق الذي تخضع له مجموعة من المستخدمين، والصفوف التي لها حدود خاصة والأكثر امتلاءً أولًا؛ وlimits يذكر كل حد خاص بالصف بصيغة "amount used amount stops|alert-only"؛ وcapacity_usd هو أصغر حد يوقف الاستخدام؛ وroom_left_usd هو الأصغر بين المتبقي في الصف والمتبقي في الإطار',
  'the fullest first; kind: own = individual limit, cost-center = cost center default, everyone = universal limit, none = no user limit':
    'الأكثر امتلاءً أولًا؛ وkind: own = حد فردي، وcost-center = الحد الافتراضي لمركز التكلفة، وeveryone = الحد العام، وnone = لا حد للمستخدم',
  'saving_usd is for the whole period and applied one after the other, so the steps do not overlap; alone_usd is each step on its own and does overlap':
    'saving_usd للفترة كلها ويُطبَّق خطوة بعد أخرى، فلا تتداخل الخطوات؛ وalone_usd لكل خطوة وحدها، وهو متداخل',
  'from the app; for the task first, then by severity and value; monthly_usd values overlap and must never be added':
    'من التطبيق؛ ما يخص المهمة أولًا، ثم حسب الخطورة والقيمة؛ وقيم monthly_usd متداخلة ولا يجوز جمعها أبدًا',
  'parts of a list are split by " / "': 'تُفصل عناصر القائمة بالعلامة " / "',
  'More was covered than the seats in the file can fund, so the pool size is unknown. Do not state pool or seat figures as facts.':
    'غُطّي أكثر مما تستطيع التراخيص في الملف تمويله، لذا فحجم الرصيد المشترك غير معروف. لا تذكر أرقام الرصيد المشترك أو التراخيص على أنها حقائق.',
  'The pool size counts only seats with usage in the report, so it is a lower bound.':
    'يحسب حجم الرصيد المشترك التراخيص التي لها استخدام في التقرير فقط، لذا فهو حد أدنى.',
  'No license list is loaded, so seats without usage are not known.': 'لم تُحمَّل قائمة التراخيص، لذا فالتراخيص بلا استخدام غير معروفة.',
  'No GitHub data file is loaded: no budgets, seats, bills or activity from GitHub.':
    'لم يُحمَّل ملف بيانات GitHub: لا ميزانيات ولا تراخيص ولا فواتير ولا نشاط من GitHub.',
  'Code completions and next edit suggestions are not in the usage report.': 'إكمال التعليمات البرمجية واقتراحات التعديل التالي ليست في تقرير الاستخدام.',

  // Recommendation card
  'Cash saved per month. This filtered view already has billed overage, so at least this much is cash. Included credits cannot be split for a filtered view, so the real saving can be higher.':
    'المبلغ النقدي الموفَّر شهريًا. في هذا العرض المصفّى مبلغ مدفوع إضافيًا بالفعل، لذا فهذا المقدار على الأقل نقد. لا يمكن تقسيم الأرصدة المشمولة في عرض مصفّى، لذلك قد يكون التوفير الفعلي أعلى.',
  'Cash saved per month, after the included credits are used first': 'المبلغ النقدي الموفَّر شهريًا، بعد استخدام الأرصدة المشمولة أولًا',
  'at least {amount}/mo saved': 'توفير {amount} شهريًا على الأقل',
  '≈ {amount}/mo saved': 'توفير نحو {amount} شهريًا',
  'Monthly value of these seats. It only turns into cash when part of the included credits goes unused, because fewer seats also means a smaller pool that is used up sooner.':
    'القيمة الشهرية لهذه التراخيص. لا تتحول إلى نقد إلا إذا بقي جزء من الأرصدة المشمولة دون استخدام، لأن قلة التراخيص تعني أيضًا رصيدًا مشتركًا أصغر ينفد أسرع.',
  '≈ {amount}/mo of seat value': 'نحو {amount} شهريًا من قيمة التراخيص',
  'Usage avoided per month. Whether it saves cash depends on the included credits, which cannot be split for a filtered view.':
    'الاستخدام المتجنَّب شهريًا. يعتمد توفير النقد على الأرصدة المشمولة التي لا يمكن تقسيمها في عرض مصفّى.',
  'Usage avoided per month. No cash saving while usage stays within the included credits.': 'الاستخدام المتجنَّب شهريًا. لا يوجد توفير نقدي ما دام الاستخدام ضمن الأرصدة المشمولة.',
  '≈ {amount}/mo less usage': 'استخدام أقل بنحو {amount} شهريًا',
  'For {audience}': 'الفئة المستهدفة: {audience}',
  'What the data shows': 'ما تُظهره البيانات',
  'Users involved': 'المستخدمون المعنيون',
  'Confidence: {level}': 'مستوى الثقة: {level}',

  // Documentation links
  'Models and pricing': 'النماذج والأسعار',
  'Optimizing your AI usage': 'تحسين استخدامك للذكاء الاصطناعي',
  'Optimizing chat usage': 'تحسين استخدام الدردشة',
  'Optimizing your budget configuration': 'تحسين إعدادات الميزانية',
  'Getting started with budget controls': 'البدء مع ضوابط الميزانية',
  'Setting an AI credit session limit in GitHub Copilot CLI': 'ضبط حد أرصدة الذكاء الاصطناعي للجلسة في GitHub Copilot CLI',
  'Viewing license usage': 'عرض استخدام التراخيص',
  'Seats and billing cycles': 'التراخيص ودورات الفوترة',
  'Monitoring AI usage': 'مراقبة استخدام الذكاء الاصطناعي',
  'GitHub Copilot usage metrics': 'مقاييس استخدام GitHub Copilot',

  // Billed overage
  '{amount} was billed beyond included credits': 'دُفع {amount} إضافيًا فوق الأرصدة المشمولة',
  '{share} of usage was billed as overage because the pooled credits ran out.': 'دُفع {share} من الاستخدام إضافيًا لأن الأرصدة المجمَّعة نفدت.',
  'Usage {usage}: {covered} covered by the pool, {billed} billed.': 'الاستخدام {usage}: غطّى الرصيد المشترك {covered}، ودُفع {billed} إضافيًا.',
  '{name}: {billed} billed ({share} of all overage), {own} of their own allotment.': '{name}: دُفع {billed} إضافيًا ({share} من كل التجاوز)، واستخدم {own} من حصته.',
  'Start with the usage levers below: they reduce usage without removing tools from anyone.': 'ابدأ بإجراءات الاستخدام أدناه: فهي تقلل الاستخدام دون سحب أدوات من أحد.',
  'Add a user-level budget so no single user can drain the pool or run up overage (hard stop at the limit).':
    'أضف ميزانية على مستوى المستخدم حتى لا يستنزف مستخدم واحد الرصيد المشترك أو يتسبب في مبالغ إضافية (إيقاف صارم عند الحد).',
  'Overage costs the same $0.01 per credit as included credits, so adding seats does not make credits cheaper. It only pays off when the new seats get used.':
    'يكلّف الرصيد الإضافي $0.01 للرصيد الواحد مثل الأرصدة المشمولة تمامًا، لذا لا تجعل زيادة التراخيص الأرصدة أرخص. تفيد الزيادة فقط عندما تُستخدم التراخيص الجديدة.',
  'Open Usage and pool': 'افتح الاستخدام والرصيد المشترك',

  // Pool exhaustion and budget
  '{month}: pool used up on {day} (day {n} of {total}).': '{month}: نفد الرصيد المشترك في {day} (اليوم {n} من {total}).',
  '{month}: on the current pace the pool runs out around {day}.': '{month}: بالوتيرة الحالية سينفد الرصيد المشترك نحو {day}.',
  '{month}: projected billed overage {amount} (range {low} to {high}).': '{month}: المتوقع دفعه إضافيًا {amount} (النطاق من {low} إلى {high}).',
  'Budget {budget} for {month}: {burn} used so far, {projected} projected, limit reached around {day}.':
    'ميزانية {budget} ({month}): استُخدم {burn} حتى الآن، والمتوقع {projected}، ويُبلغ الحد نحو {day}.',
  'Budget {budget} for {month}: {burn} used so far, {projected} projected.': 'ميزانية {budget} ({month}): استُخدم {burn} حتى الآن، والمتوقع {projected}.',
  'Budget {budget} for {month}: {burn} used so far, limit reached around {day}.': 'ميزانية {budget} ({month}): استُخدم {burn} حتى الآن، ويُبلغ الحد نحو {day}.',
  'Budget {budget} for {month}: {burn} used so far.': 'ميزانية {budget} ({month}): استُخدم {burn} حتى الآن.',
  'Included credits are pooled across all seats and reset on the 1st (UTC); unused credits do not carry over.':
    'تُجمَّع الأرصدة المشمولة لكل التراخيص وتُصفَّر في الأول من الشهر (بالتوقيت العالمي)؛ ولا تُرحَّل الأرصدة غير المستخدمة.',
  'Configure an enterprise or organization budget with alerts (for example at 75% and 90%) so exhaustion is visible early.':
    'اضبط ميزانية على مستوى المؤسسة أو المنظمة مع تنبيهات (مثلًا عند 75% و90%) ليظهر النفاد مبكرًا.',
  'Decide deliberately: allow metered overage with a cap, or block at the limit. Maximum bill = seat fees + the budget.':
    'قرّر عن قصد: السماح بالدفع الإضافي حسب الاستخدام بحد أقصى، أو الإيقاف عند الحد. أقصى فاتورة = رسوم التراخيص + الميزانية.',
  'Apply the usage levers below to push the exhaustion date later.': 'طبّق إجراءات الاستخدام أدناه لتأخير تاريخ النفاد.',
  'Open pool timeline': 'افتح الجدول الزمني للرصيد المشترك',

  // Pool underuse and idle seats
  'Included credits are at most {share} used': 'استُخدم {share} على الأكثر من الأرصدة المشمولة',
  'Only {share} of the included credits are used': 'يُستخدم {share} فقط من الأرصدة المشمولة',
  'About {amount} of seat value per month goes unused.': 'نحو {amount} شهريًا من قيمة التراخيص بلا استخدام.',
  'Included credits {credits}/month, projected usage {usage}/month.': 'الأرصدة المشمولة {credits} شهريًا، والاستخدام المتوقع {usage} شهريًا.',
  'Only users in this report fund the current estimate. Add a complete license list in Settings for a better estimate; past months may still differ.':
    'يعتمد التقدير الحالي على تراخيص المستخدمين الظاهرين في التقرير فقط. أضف قائمة تراخيص كاملة في الإعدادات لتحسين التقدير، لكن الأشهر السابقة قد تختلف.',
  'The estimate includes your license list and extra seats. It may not match the seats assigned in past months.':
    'يشمل التقدير قائمة تراخيصك والتراخيص الإضافية. وقد لا يطابق التراخيص التي كانت مخصصة في الأشهر السابقة.',
  'Only dated activity from the license list is used here. Recently active seats and seats pending cancellation are excluded. Seats without a recent activity date are not counted as idle. Check the Licenses page for the recorded activity dates.':
    'يُستخدم النشاط المؤرخ في قائمة التراخيص فقط. تُستثنى التراخيص النشطة مؤخرًا والتراخيص التي تنتظر الإلغاء. ولا تُحسب التراخيص التي ليس لها تاريخ نشاط حديث على أنها خاملة. راجع صفحة التراخيص للاطلاع على تواريخ النشاط المسجلة.',
  'Reclaim or reassign idle seats (see the seat recommendations).': 'استرجع التراخيص غير المستخدمة أو أعد تعيينها (راجع توصيات التراخيص).',
  'Roll out to the teams that have licenses but little usage, for example with short training sessions.':
    'وسّع الاستخدام إلى الفرق التي لديها تراخيص لكن استخدامها قليل، مثلًا بجلسات تدريب قصيرة.',
  'Reclaim {seats} to save about {amount}/month': 'استرجاع التراخيص ({seats}) يوفّر نحو {amount} شهريًا',
  '{seats}, but only {amount}/month is recoverable': '{seats}، لكن يمكن استرداد {amount} شهريًا فقط',
  '{n} idle seats currently fund the pool for heavier users': plural(
    'ترخيص واحد غير مستخدم يموّل حاليًا الرصيد المشترك للمستخدمين الأكثر استخدامًا',
    'ترخيصان غير مستخدمين يموّلان حاليًا الرصيد المشترك للمستخدمين الأكثر استخدامًا',
    '{n} تراخيص غير مستخدمة تموّل حاليًا الرصيد المشترك للمستخدمين الأكثر استخدامًا',
    '{n} ترخيصًا غير مستخدم يموّل حاليًا الرصيد المشترك للمستخدمين الأكثر استخدامًا',
    '{n} ترخيص غير مستخدم يموّل حاليًا الرصيد المشترك للمستخدمين الأكثر استخدامًا',
  ),
  'Seats are worth {value}/month. Removing them shrinks the pool, so only the unused part of the pool ({cash}) turns into cash.':
    'قيمة التراخيص {value} شهريًا. إزالتها تُصغّر الرصيد المشترك، لذا لا يتحول إلى نقد إلا الجزء غير المستخدم منه ({cash}).',
  'Removing these seats would not lower the bill while the pool is fully used: heavy users would simply pay for those credits as overage. Reassign the seats to people who will use them.':
    'إزالة هذه التراخيص لن تخفض الفاتورة ما دام الرصيد المشترك مستخدمًا بالكامل: سيدفع المستخدمون الكثيرو الاستخدام ثمن تلك الأرصدة كمبالغ إضافية. أعد تعيين التراخيص لأشخاص سيستخدمونها.',
  '{users} in the report with minimal use and little activity (seat value {value}/month): {names}.':
    '{users} في التقرير باستخدام ضئيل ونشاط قليل (قيمة الترخيص {value} شهريًا): {names}.',
  '{n} roster seats never appear in the report ({value}/month): {names}.': plural(
    'ترخيص واحد في القائمة لم يظهر في التقرير قط ({value} شهريًا): {names}.',
    'ترخيصان في القائمة لم يظهرا في التقرير قط ({value} شهريًا): {names}.',
    '{n} تراخيص في القائمة لم تظهر في التقرير قط ({value} شهريًا): {names}.',
    '{n} ترخيصًا في القائمة لم يظهر في التقرير قط ({value} شهريًا): {names}.',
    '{n} ترخيص في القائمة لم يظهر في التقرير قط ({value} شهريًا): {names}.',
  ),
  'Check the license usage view or usage metrics for completions and chat activity before removing a seat.':
    'راجع عرض استخدام التراخيص أو مقاييس الاستخدام لمعرفة نشاط الإكمالات والدردشة قبل إزالة أي ترخيص.',
  'Ask the owners whether they still need access; reassign or reclaim the seats.': 'اسأل أصحاب التراخيص إن كانوا ما زالوا بحاجة إلى الوصول؛ ثم أعد تعيين التراخيص أو استرجعها.',
  'Revisit at the next billing cycle: seat removals apply from the start of the next cycle.': 'عاود النظر في دورة الفوترة التالية: تسري إزالة التراخيص من بداية الدورة التالية.',
  'This report covers AI-credit usage only. Code completions and next edit suggestions are not billed in credits and do not appear, so "idle in this report" is not the same as "idle seat".':
    'يغطي هذا التقرير استخدام أرصدة الذكاء الاصطناعي فقط. إكمالات الشيفرة واقتراحات التعديل التالي لا تُحتسب بالأرصدة ولا تظهر فيه، لذا فعبارة «خامل في هذا التقرير» لا تعني «ترخيص غير مستخدم».',
  'Show low-activity users': 'اعرض المستخدمين قليلي النشاط',

  // Downgrade
  '{n} Enterprise users never needed more than the Business allotment': plural(
    'مستخدم Enterprise واحد لم يحتج قط إلى أكثر من حصة Business',
    'مستخدما Enterprise لم يحتاجا قط إلى أكثر من حصة Business',
    '{n} مستخدمي Enterprise لم يحتاجوا قط إلى أكثر من حصة Business',
    '{n} مستخدمًا من Enterprise لم يحتاجوا قط إلى أكثر من حصة Business',
    '{n} مستخدم من Enterprise لم يحتاجوا قط إلى أكثر من حصة Business',
  ),
  'Switching them to Business saves $20 per seat per month ({total} in total) when they do not use Enterprise-only features.':
    'نقلهم إلى Business يوفّر $20 لكل ترخيص شهريًا ({total} إجمالًا) إن لم يستخدموا ميزات Enterprise الحصرية.',
  'Peak monthly usage stayed at or below 80% of the $19 Business allotment: {names}.': 'بقي أعلى استخدام شهري عند 80% أو أقل من حصة Business البالغة $19: {names}.',
  'Cash impact after pool slack: {amount}/month (the smaller pool is only a saving when it was not fully used).':
    'الأثر النقدي بعد احتساب الفائض في الرصيد المشترك: {amount} شهريًا (الرصيد المشترك الأصغر لا يوفّر إلا إذا لم يكن مستخدمًا بالكامل).',
  'Confirm none of these users depend on Enterprise-only capabilities.': 'تأكد من أن أيًّا من هؤلاء المستخدمين لا يعتمد على قدرات Enterprise الحصرية.',
  'Downgrade at the start of a billing cycle; decreases apply from the next cycle.': 'نفّذ الخفض في بداية دورة الفوترة؛ وتسري التخفيضات من الدورة التالية.',
  'Open Users': 'افتح المستخدمين',

  // Usage concentration
  '{share} of usage comes from three users': '{share} من الاستخدام يأتي من ثلاثة مستخدمين',
  '{a} of {n} users ({share}) generate at least {threshold} of attributed usage.': '{a} من {n} من المستخدمين ({share}) ينتجون ما لا يقل عن {threshold} من الاستخدام المنسوب.',
  'Top user {name}: {share} of attributed usage ({amount}).': 'أعلى مستخدم {name}: {share} من الاستخدام المنسوب ({amount}).',
  'Top three: {names} = {share}.': 'أعلى ثلاثة: {names} = {share}.',
  'Review how the heaviest users work: long agent sessions, large contexts and Powerful models drive most cost.': 'راجع طريقة عمل أكثر المستخدمين استخدامًا: جلسات الوكيل الطويلة والسياقات الكبيرة والنماذج القوية تسبب معظم التكلفة.',
  'Give them targeted coaching and a per-user limit rather than a blanket restriction. They are often your most productive users.': 'قدّم لهم إرشادًا موجّهًا وحدًّا لكل مستخدم بدل تقييد شامل. غالبًا ما يكونون أكثر مستخدميك إنتاجية.',
  'Show Pareto class A': 'اعرض فئة باريتو A',

  // Runaway users
  '{n} users used at least {multiple}× their included credits': plural(
    'مستخدم واحد استخدم ما لا يقل عن {multiple}× من أرصدته المشمولة',
    'مستخدمان استخدما ما لا يقل عن {multiple}× من أرصدتهما المشمولة',
    '{n} مستخدمين استخدموا ما لا يقل عن {multiple}× من أرصدتهم المشمولة',
    '{n} مستخدمًا استخدموا ما لا يقل عن {multiple}× من أرصدتهم المشمولة',
    '{n} مستخدم استخدموا ما لا يقل عن {multiple}× من أرصدتهم المشمولة',
  ),
  'They drew {amount} from the shared pool beyond their own allotment.': 'سحبوا {amount} من الرصيد المشترك فوق حصتهم.',
  '{name}: {usage} = {own} of allotment; top model {model}; Auto {auto}.': '{name}: {usage} = {own} من الحصة؛ النموذج الأعلى {model}؛ Auto {auto}.',
  'n/a': 'غير متاح',
  'Usage above {cap}× allotment: {above}. The plan assumes {share} of it can be avoided ({saving} over this period).': 'الاستخدام الذي يتجاوز {cap}× من الحصة: {above}. تفترض الخطة أن {share} منه يمكن تجنبه ({saving} خلال هذه الفترة).',
  'Set an individual user-level budget with an expiry date for legitimate heavy work, and a universal budget for everyone else.': 'حدّد ميزانية على مستوى المستخدم الفرد مع تاريخ انتهاء للأعمال الثقيلة المشروعة، وميزانية عامة لبقية المستخدمين.',
  'Use AI credit session limits in GitHub Copilot CLI so one task cannot consume an unbounded amount.': 'استخدم حدود أرصدة الذكاء الاصطناعي لكل جلسة في GitHub Copilot CLI حتى لا تستهلك مهمة واحدة مبلغًا غير محدود.',
  'Check for automation or agent loops on the days with the highest usage (see Patterns).': 'تحقق من وجود أتمتة أو حلقات وكلاء في الأيام الأعلى استخدامًا (انظر أنماط الاستخدام).',
  'Show runaway users': 'اعرض المستخدمين المفرطين',

  // Model right-sizing
  '{share} of usage runs on Powerful models': '{share} من الاستخدام على النماذج القوية',
  'Reasoning models are best for architecture and hard debugging. Routine edits, refactors and docs work well on mid-tier models at a fraction of the price.': 'نماذج الاستدلال أفضل للهندسة المعمارية وتصحيح الأخطاء الصعب. أما التعديلات الروتينية وإعادة الهيكلة والتوثيق فتناسبها نماذج الفئة المتوسطة بجزء من السعر.',
  '{model} → {target}: {usage} of usage; the same tokens cost {ratio} as much on {target} (price card rates).': '{model} → {target}: {usage} من الاستخدام؛ وتساوي تكلفة الرموز نفسها على {target} نسبة {ratio} (بحسب أسعار قائمة الأسعار).',
  'Moving {share} of Powerful-tier usage to mid-tier models would reduce usage by about {amount} per month ({cash} as cash).': 'نقل {share} من استخدام الفئة القوية إلى نماذج الفئة المتوسطة سيخفض الاستخدام بنحو {amount} شهريًا ({cash} نقدًا).',
  'Plan with a strong reasoning model, then implement with a mid-tier model in a fresh session.': 'خطّط بنموذج استدلال قوي، ثم نفّذ بنموذج من الفئة المتوسطة في جلسة جديدة.',
  'Use lighter models for formatting, docs and small well-scoped changes, and for subagents.': 'استخدم نماذج أخف للتنسيق والتوثيق والتغييرات الصغيرة المحددة النطاق، وللوكلاء الفرعيين.',
  'Keep the default reasoning level; raise it only for harder tasks.': 'أبقِ مستوى الاستدلال الافتراضي، ولا ترفعه إلا للمهام الأصعب.',
  'Assumes {share} of Powerful-tier work can move to a mid-tier model without quality loss. Savings use price card ratios for the same token mix.': 'يفترض أن {share} من عمل الفئة القوية يمكن نقله إلى نموذج من الفئة المتوسطة دون فقدان الجودة. تعتمد الوفورات على نسب قائمة الأسعار لمزيج الرموز نفسه.',
  'Open Models': 'افتح النماذج',

  // Auto model selection
  '{rate} (assumed, from Settings)': '{rate} (مفترض، من الإعدادات)',
  'Plan rates: {rates}. Plans without measured Auto usage use {assumed}.': 'معدلات الخطط: {rates}. الخطط التي ليس لها استخدام Auto مقيس تستخدم {assumed}.',
  'No plan has measured Auto usage, so every plan uses {assumed}.': 'لا توجد خطة لها استخدام Auto مقيس، لذلك تستخدم كل خطة {assumed}.',
  'Only {share} of usage goes through Auto model selection': '{share} فقط من الاستخدام يمر عبر الاختيار التلقائي للنموذج',
  'Auto usage in this report received a discount of {rate} off its original price. {share} of it was priced from token counts.': 'حصل استخدام Auto في هذا التقرير على خصم {rate} من سعره الأصلي. وقُدِّر سعر {share} منه من أعداد الرموز.',
  'This report has no measured Auto discount, so the estimate uses the assumed rate of {rate} from Settings.': 'لا يتضمن هذا التقرير خصم Auto مقيسًا، لذلك يستخدم التقدير المعدل المفترض {rate} من الإعدادات.',
  'Hand-picked usage: {direct} of {total}.': 'الاستخدام المختار يدويًا: {direct} من {total}.',
  '{users} used Auto for less than {share} of their usage: {names}.': 'المستخدمون الذين استخدموا Auto لأقل من {share} من استخدامهم ({users}): {names}.',
  'No user used Auto for less than {share} of their usage.': 'لم يستخدم أي مستخدم Auto لأقل من {share} من استخدامه.',
  'If {share} of the hand-picked usage went through Auto, usage would drop by about {amount} per month.': 'لو مرّ {share} من الاستخدام المختار يدويًا عبر Auto، لانخفض الاستخدام بنحو {amount} شهريًا.',
  'Make Auto the default model in GitHub Copilot Chat, GitHub Copilot CLI and the cloud agent.': 'اجعل Auto النموذج الافتراضي في GitHub Copilot Chat وGitHub Copilot CLI والوكيل السحابي.',
  'Pin a specific model only when the task needs it, and keep it for the whole session.': 'ثبّت نموذجًا محددًا فقط عندما تتطلبه المهمة، وأبقِه طوال الجلسة.',
  "The estimate applies the Auto discount rate of each user's plan to hand-picked usage. {rateNote} Auto may route a task to a different model than the one picked by hand.": 'يطبّق التقدير معدل خصم Auto الخاص بخطة كل مستخدم على الاستخدام المختار يدويًا. {rateNote} وقد يوجّه Auto المهمة إلى نموذج مختلف عن النموذج المختار يدويًا.',
  'Show manual selection': 'اعرض الاختيار اليدوي',

  // Prompt cache
  'Only {share} of prompt tokens are cache hits': '{share} فقط من رموز الطلب تُقرأ من الذاكرة المؤقتة',
  '{n} users reuse the prompt cache poorly': plural(
    'مستخدم واحد يعيد استخدام الذاكرة المؤقتة للطلبات بشكل ضعيف',
    'مستخدمان يعيدان استخدام الذاكرة المؤقتة للطلبات بشكل ضعيف',
    '{n} مستخدمين يعيدون استخدام الذاكرة المؤقتة للطلبات بشكل ضعيف',
    '{n} مستخدمًا يعيدون استخدام الذاكرة المؤقتة للطلبات بشكل ضعيف',
    '{n} مستخدم يعيدون استخدام الذاكرة المؤقتة للطلبات بشكل ضعيف',
  ),
  'Cached tokens cost about 10% of normal input. Every cache miss re-sends the whole context at full price.': 'تكلف الرموز المخزنة مؤقتًا نحو 10% من الإدخال العادي. وكل إخفاق في الذاكرة المؤقتة يعيد إرسال السياق كاملًا بالسعر الكامل.',
  'Overall cache hit rate is {share} of prompt tokens.': 'نسبة القراءة من الذاكرة المؤقتة الإجمالية هي {share} من رموز الطلب.',
  'Cache writes cost {writes} of priced usage; cache reads {reads}.': 'تكلف كتابات الذاكرة المؤقتة {writes} من الاستخدام المسعَّر، وقراءاتها {reads}.',
  '{n} users are below {threshold} cache hit: {names}.': plural(
    'مستخدم واحد دون {threshold} في القراءة من الذاكرة المؤقتة: {names}.',
    'مستخدمان دون {threshold} في القراءة من الذاكرة المؤقتة: {names}.',
    '{n} مستخدمين دون {threshold} في القراءة من الذاكرة المؤقتة: {names}.',
    '{n} مستخدمًا دون {threshold} في القراءة من الذاكرة المؤقتة: {names}.',
    '{n} مستخدم دون {threshold} في القراءة من الذاكرة المؤقتة: {names}.',
  ),
  'No individual user is below the cache-hit threshold.': 'لا يوجد مستخدم فرد دون حد القراءة من الذاكرة المؤقتة.',
  'Turning {share} of cache writes into reads would reduce usage by about {amount} per month.': 'تحويل {share} من كتابات الذاكرة المؤقتة إلى قراءات سيخفض الاستخدام بنحو {amount} شهريًا.',
  "Don't switch models mid-session; the next request rebuilds the cache from scratch.": 'لا تبدّل النماذج في منتصف الجلسة؛ فالطلب التالي يعيد بناء الذاكرة المؤقتة من الصفر.',
  'Start a new session, or /compact in GitHub Copilot CLI, instead of resuming an old thread: caches expire after 1 hour (most models) or 24 hours (OpenAI).': 'ابدأ جلسة جديدة، أو استخدم /compact في GitHub Copilot CLI، بدل استئناف محادثة قديمة: تنتهي صلاحية الذاكرة المؤقتة بعد ساعة واحدة (معظم النماذج) أو 24 ساعة (OpenAI).',
  "Don't change reasoning effort, context size or enabled tools and MCP servers during a session.": 'لا تغيّر مستوى الاستدلال أو حجم السياق أو الأدوات وخوادم MCP المفعّلة أثناء الجلسة.',
  'Open Efficiency': 'افتح الكفاءة',

  // Prompt context
  '{share} of priced usage is prompt context': '{share} من الاستخدام المسعَّر هو سياق الطلب',
  'Open tabs, attached files, tool definitions and long conversation history are sent with every request.': 'تُرسل علامات التبويب المفتوحة والملفات المرفقة وتعريفات الأدوات وسجل المحادثة الطويل مع كل طلب.',
  'Trimming input-side tokens by {share} would reduce usage by about {amount} per month.': 'تقليص رموز جانب الإدخال بنسبة {share} سيخفض الاستخدام بنحو {amount} شهريًا.',
  'Start a new conversation when you switch problems (/new or a new chat).': 'ابدأ محادثة جديدة عند الانتقال إلى مشكلة أخرى (/new أو محادثة جديدة).',
  'Use /compact to shrink a long GitHub Copilot CLI session you want to keep, and /context to check usage.': 'استخدم /compact لتقليص جلسة GitHub Copilot CLI الطويلة التي تريد الاحتفاظ بها، و/context للتحقق من الاستخدام.',
  'Keep AGENTS.md or .github/copilot-instructions.md current so agents read fewer files to orient themselves.': 'أبقِ AGENTS.md أو .github/copilot-instructions.md محدّثًا حتى يقرأ الوكلاء ملفات أقل ليفهموا المشروع.',
  'Enable only the MCP toolsets the task needs.': 'فعّل فقط مجموعات أدوات MCP التي تحتاجها المهمة.',

  // Long-context surcharges
  'Long-context surcharges cost at least {amount}': 'تكلف رسوم السياق الطويل الإضافية {amount} على الأقل',
  "{share} of usage is the surcharge on requests whose prompts crossed a model's long-context threshold.": '{share} من الاستخدام هو الرسم الإضافي على الطلبات التي تجاوزت رموز الطلب فيها حد السياق الطويل للنموذج.',
  '{n} requests were billed at the long-context rate.': plural(
    'طلب واحد حُوسب بسعر السياق الطويل.',
    'طلبان حُوسبا بسعر السياق الطويل.',
    '{n} طلبات حُوسبت بسعر السياق الطويل.',
    '{n} طلبًا حُوسبت بسعر السياق الطويل.',
    '{n} طلب حُوسبت بسعر السياق الطويل.',
  ),
  'Mostly on {models}.': 'معظمها على {models}.',
  'Most affected users: {names}.': 'أكثر المستخدمين تأثرًا: {names}.',
  'Split work into smaller tasks or summarize earlier steps instead of carrying the whole history.': 'قسّم العمل إلى مهام أصغر أو لخّص الخطوات السابقة بدل حمل السجل كاملًا.',
  'Narrow the file scope and avoid attaching large directories or logs.': 'ضيّق نطاق الملفات وتجنب إرفاق مجلدات كبيرة أو سجلات.',
  'Pick a model without a long-context tier when the task does not need a huge window.': 'اختر نموذجًا بلا فئة سياق طويل عندما لا تحتاج المهمة إلى نافذة ضخمة.',
  'The premium is a conservative lower bound estimated from token counts and price card rates.': 'الرسم الإضافي حد أدنى متحفظ مقدَّر من أعداد الرموز وأسعار قائمة الأسعار.',
  'Show long-context users': 'اعرض مستخدمي السياق الطويل',

  // Budgets
  'Put budgets in place before the next overage': 'ضع الميزانيات قبل التجاوز القادم',
  'User-level budgets protect the shared pool; enterprise, organization and cost-center budgets cap what you pay once the pool is empty.': 'تحمي ميزانيات المستخدمين الرصيد المشترك؛ أما ميزانيات Enterprise والمؤسسة ومراكز التكلفة فتحدّ مما تدفعه بعد نفاد الرصيد.',
  'A per-user monthly limit near the 90th percentile of monthly usage (about {cap}) would have touched {above} of {total} user-months and held back {excess} of usage.': 'حدّ شهري لكل مستخدم قرب المئين التسعين للاستخدام الشهري (نحو {cap}) كان سيشمل {above} من {total} من أشهر استخدام المستخدمين، ويحجب {excess} من الاستخدام.',
  'A metered-overage budget of about {budget} per month covers the projected overage with 25% headroom. Your maximum bill = seat fees + that budget.': 'ميزانية للتجاوز المقيس بنحو {budget} شهريًا تغطي التجاوز المتوقع مع هامش 25%. أقصى فاتورة لك = رسوم التراخيص + هذه الميزانية.',
  'No overage so far, so an enterprise budget can start small (for example {budget}) and act as an early warning. Your maximum bill = seat fees + that budget.': 'لا يوجد تجاوز حتى الآن، لذلك يمكن أن تبدأ ميزانية Enterprise صغيرة (مثلًا {budget}) وتعمل كإنذار مبكر. أقصى فاتورة لك = رسوم التراخيص + هذه الميزانية.',
  'Create a universal user-level budget for fair access to the pool. It is a hard stop on pool and metered usage combined.': 'أنشئ ميزانية عامة على مستوى المستخدم لضمان وصول عادل إلى الرصيد المشترك. وهي إيقاف صارم على الاستخدام من الرصيد المشترك والمقيس معًا.',
  'Add individual or cost-center user-level budgets (with expiry) for teams that legitimately need more.': 'أضف ميزانيات فردية أو على مستوى مركز التكلفة (مع تاريخ انتهاء) للفرق التي تحتاج إلى المزيد فعلًا.',
  'Set an enterprise budget with alerts for the overage phase, and use cost-center included-usage controls to keep each team within the credits its licenses fund.': 'حدّد ميزانية Enterprise مع تنبيهات لمرحلة التجاوز، واستخدم ضوابط الاستخدام المشمول لكل مركز تكلفة لإبقاء كل فريق ضمن الأرصدة التي تموّلها تراخيصه.',
  'The suggested figures are starting points based on the loaded data. Review with team leads before enforcing a hard stop.': 'الأرقام المقترحة نقاط انطلاق مبنية على البيانات المحمّلة. راجعها مع قادة الفرق قبل فرض إيقاف صارم.',
  'Enter your budget in Settings': 'أدخل ميزانيتك في الإعدادات',

  // Cost-center coverage
  '{n} users are not assigned to a cost center': plural(
    'مستخدم واحد غير مسند إلى مركز تكلفة',
    'مستخدمان غير مسندين إلى مركز تكلفة',
    '{n} مستخدمين غير مسندين إلى مركز تكلفة',
    '{n} مستخدمًا غير مسندين إلى مركز تكلفة',
    '{n} مستخدم غير مسندين إلى مركز تكلفة',
  ),
  '{amount} ({share} of usage) cannot be charged back or budgeted by team.': 'لا يمكن توزيع تكلفة {amount} ({share} من الاستخدام) ولا وضع ميزانية لها بحسب الفريق.',
  'Without a cost center: {names}.': 'بلا مركز تكلفة: {names}.',
  'Assign every licensed user to a cost center (directly, through an organization or an enterprise team).': 'أسند كل مستخدم مرخَّص إلى مركز تكلفة (مباشرة، أو عبر مؤسسة أو فريق Enterprise).',
  'Then use cost-center budgets and included-usage controls to keep each team within its own credits.': 'ثم استخدم ميزانيات مراكز التكلفة وضوابط الاستخدام المشمول لإبقاء كل فريق ضمن أرصدته.',
  'Show unassigned users': 'اعرض المستخدمين غير المسندين',

  // Unattributed usage
  '{amount} is not tied to a user': '{amount} غير مرتبط بمستخدم',
  'Repository-level products (such as code quality and security scanning) bill credits without a username, so per-user budgets cannot control them.': 'منتجات مستوى المستودع (مثل جودة الكود والفحص الأمني) تحتسب الأرصدة دون اسم مستخدم، لذلك لا تستطيع ميزانيات المستخدمين التحكم بها.',
  'Products: {list}.': 'المنتجات: {list}.',
  'Repositories: {list}.': 'المستودعات: {list}.',
  'Review whether those features are needed on every repository.': 'راجع ما إذا كانت هذه الميزات مطلوبة في كل مستودع.',
  'Track them by repository or cost center and budget them separately from user activity.': 'تتبّعها بحسب المستودع أو مركز التكلفة وضع لها ميزانية منفصلة عن نشاط المستخدمين.',
  'Show unattributed usage': 'اعرض الاستخدام غير المنسوب',

  // Several organizations
  '{n} users bill to more than one organization': plural(
    'مستخدم واحد يُحاسَب عبر أكثر من مؤسسة',
    'مستخدمان يُحاسَبان عبر أكثر من مؤسسة',
    '{n} مستخدمين يُحاسَبون عبر أكثر من مؤسسة',
    '{n} مستخدمًا يُحاسَبون عبر أكثر من مؤسسة',
    '{n} مستخدم يُحاسَبون عبر أكثر من مؤسسة',
  ),
  'If these users hold licenses from several organizations, GitHub picks one organization per cycle to bill the seat, so organization budgets apply unpredictably.': 'إذا كان لدى هؤلاء المستخدمين تراخيص من عدة مؤسسات، فإن GitHub تختار مؤسسة واحدة في كل دورة لمحاسبة الترخيص عليها، لذلك تنطبق ميزانيات المؤسسات بشكل غير متوقع.',
  'Users: {names}.': 'المستخدمون: {names}.',
  'Give each user a single license source, or use cost-center budgets with direct user assignment.': 'امنح كل مستخدم مصدر ترخيص واحدًا، أو استخدم ميزانيات مراكز التكلفة مع إسناد المستخدمين مباشرة.',

  // Lapsed users
  '{users} stopped using AI credits': 'انقطع استخدام أرصدة الذكاء الاصطناعي: {users}',
  'No usage for at least {days}, after earlier activity.': 'مدة عدم الاستخدام {days} على الأقل، بعد نشاط سابق.',
  'Together they generated {amount} of usage earlier in the period: {names}.': 'ولّدوا معًا {amount} من الاستخدام في وقت سابق من الفترة: {names}.',
  'Ask what stopped them: blockers, a budget hard stop, or a change of tasks.': 'اسأل عما أوقفهم: عوائق، أو إيقاف صارم بسبب الميزانية، أو تغيّر في المهام.',
  'Offer a short working session on agent mode or the CLI, or reclaim the seat if it is no longer needed.': 'اعرض جلسة عمل قصيرة حول وضع الوكيل أو CLI، أو استرجع الترخيص إذا لم تعد الحاجة إليه قائمة.',
  'Show lapsed users': 'اعرض المستخدمين المتوقفين',

  // New users
  '{users} started in the last {days}': 'بدأ الاستخدام خلال آخر {days}: {users}',
  'They have generated {amount} of usage so far.': 'ولّدوا حتى الآن {amount} من الاستخدام.',
  'New users: {names}.': 'المستخدمون الجدد: {names}.',
  'Share the playbook early: Auto by default, one model per session, fresh threads per task.': 'شارك دليل العمل مبكرًا: Auto افتراضيًا، ونموذج واحد لكل جلسة، ومحادثة جديدة لكل مهمة.',
  'Show new users': 'اعرض المستخدمين الجدد',

  // Champions
  '{n} champions use GitHub Copilot often and heavily': plural(
    'رائد واحد يستخدم GitHub Copilot كثيرًا وبكثافة',
    'رائدان يستخدمان GitHub Copilot كثيرًا وبكثافة',
    '{n} روّاد يستخدمون GitHub Copilot كثيرًا وبكثافة',
    '{n} رائدًا يستخدمون GitHub Copilot كثيرًا وبكثافة',
    '{n} رائد يستخدمون GitHub Copilot كثيرًا وبكثافة',
  ),
  'They account for {share} of attributed usage.': 'يمثلون {share} من الاستخدام المنسوب.',
  'Champions: {names}.': 'الروّاد: {names}.',
  'Ask them to share workflows, prompts and custom instructions with their teams.': 'اطلب منهم مشاركة أساليب عملهم والمطالبات والتعليمات المخصصة مع فرقهم.',
  'Check their model mix and cache hit rate: their habits are the template for everyone else.': 'راجع مزيج النماذج ونسبة القراءة من الذاكرة المؤقتة لديهم: فعاداتهم هي القدوة لبقية المستخدمين.',
  'Show champions': 'اعرض الروّاد',

  // Spiky users
  '{n} users concentrate their usage on a single day': plural(
    'مستخدم واحد يركّز استخدامه في يوم واحد',
    'مستخدمان يركّزان استخدامهما في يوم واحد',
    '{n} مستخدمين يركّزون استخدامهم في يوم واحد',
    '{n} مستخدمًا يركّزون استخدامهم في يوم واحد',
    '{n} مستخدم يركّزون استخدامهم في يوم واحد',
  ),
  "At least {share} of each user's usage happened on one day.": 'ما لا يقل عن {share} من استخدام كل مستخدم حدث في يوم واحد.',
  '{name}: {share} of {amount} on {day}.': '{name}: {share} من {amount} في {day}.',
  'Look at what ran on those days: a long agent session, a migration or a loop.': 'انظر إلى ما جرى في تلك الأيام: جلسة وكيل طويلة، أو عملية ترحيل، أو حلقة.',
  'Use AI credit session limits for open-ended agent tasks.': 'استخدم حدود أرصدة الذكاء الاصطناعي لكل جلسة لمهام الوكيل المفتوحة.',
  'Show spiky users': 'اعرض المستخدمين ذوي القفزات',

  // Trend and anomalies
  'Usage is accelerating: {multiple} the week before': 'الاستخدام يتسارع: {multiple} ما كان عليه في الأسبوع السابق',
  'Usage is accelerating: +{share} week over week': 'الاستخدام يتسارع: زيادة {share} مقارنة بالأسبوع السابق',
  'If this pace continues, the pool runs out sooner than the monthly average suggests.': 'إذا استمر هذا المعدل، فسينفد الرصيد المشترك أبكر مما يوحي به المتوسط الشهري.',
  'Last 7 days {recent} vs {prior} in the 7 days before.': 'آخر 7 أيام: {recent} مقابل {prior} في الأيام السبعة السابقة.',
  'Fastest growth: {list}.': 'أسرع نمو: {list}.',
  'Find out what changed: a new rollout, a new model or an automation.': 'اكتشف ما الذي تغيّر: إطلاق جديد، أو نموذج جديد، أو أتمتة.',
  'Put alerts on the pool before it is exhausted.': 'فعّل تنبيهات على الرصيد المشترك قبل أن ينفد.',
  'Open Patterns': 'افتح أنماط الاستخدام',
  'Usage dropped {share} week over week': 'انخفض الاستخدام بنسبة {share} مقارنة بالأسبوع السابق',
  'A sharp fall can mean a holiday, a freeze, or users blocked by a budget limit.': 'قد يعني الانخفاض الحاد عطلة، أو تجميدًا، أو مستخدمين أوقفهم حد الميزانية.',
  'Check that user-level budgets are not blocking people unintentionally.': 'تحقق من أن ميزانيات المستخدمين لا تحظر الأشخاص دون قصد.',
  '{days} with unusually high usage': '{days} باستخدام مرتفع على غير المعتاد',
  'The biggest, {day}, reached {multiple} a typical day.': 'أكبرها في {day}، وبلغ {multiple} اليوم المعتاد.',
  '{day}: {amount} ({multiple} typical), mostly {user} ({userAmount}) on {model}.': '{day}: {amount} ({multiple} المعتاد)، معظمها من {user} ({userAmount}) على {model}.',
  '{day}: {amount} ({multiple} typical), mostly {user} ({userAmount}).': '{day}: {amount} ({multiple} المعتاد)، معظمها من {user} ({userAmount}).',
  '{day}: {amount} ({multiple} typical) on {model}.': '{day}: {amount} ({multiple} المعتاد) على {model}.',
  '{day}: {amount} ({multiple} typical).': '{day}: {amount} ({multiple} المعتاد).',
  'Open those days in Patterns and look at who and which model drove them.': 'افتح تلك الأيام في أنماط الاستخدام وانظر من وأي نموذج تسبب فيها.',
  'Use session limits and budgets so a single runaway task cannot cost this much again.': 'استخدم حدود الجلسات والميزانيات حتى لا تكلّف مهمة مفرطة واحدة هذا المبلغ مرة أخرى.',

  // Group balance
  'Organization {name} used {share} of the credits its licenses fund ({usage} vs {funded}); it draws {drawn} from the pool.': 'استخدمت المؤسسة {name} ما نسبته {share} من الأرصدة التي تموّلها تراخيصها ({usage} مقابل {funded})، وهي تسحب {drawn} من الرصيد المشترك.',
  'Cost center {name} used {share} of the credits its licenses fund ({usage} vs {funded}); it draws {drawn} from the pool.': 'استخدم مركز التكلفة {name} ما نسبته {share} من الأرصدة التي تموّلها تراخيصه ({usage} مقابل {funded})، وهو يسحب {drawn} من الرصيد المشترك.',
  'Organization {name} used only {share} of its licensed credits ({users}).': 'استخدمت المؤسسة {name} ما نسبته {share} فقط من أرصدتها المرخّصة ({users}).',
  'Cost center {name} used only {share} of its licensed credits ({users}).': 'استخدم مركز التكلفة {name} ما نسبته {share} فقط من أرصدته المرخّصة ({users}).',
  'Some teams lend credits to the pool while others draw heavily from it': 'بعض الفرق تقرض أرصدتها للرصيد المشترك بينما تسحب فرق أخرى منه بكثافة',
  'Pooling hides the difference. Teams that draw far more than their licenses fund may need a budget or a different seat mix.': 'التجميع يخفي هذا الفرق. قد تحتاج الفرق التي تسحب أكثر بكثير مما تموّله تراخيصها إلى ميزانية أو إلى مزيج تراخيص مختلف.',
  'Use cost-center included-usage controls to cap each team at the credits its licenses fund, choosing block or paid overage when it is reached.': 'استخدم ضوابط الاستخدام المشمول لكل مركز تكلفة لتحديد سقف كل فريق بالأرصدة التي تموّلها تراخيصه، مع اختيار الحظر أو التجاوز المدفوع عند بلوغه.',
  'Move under-using teams to coaching or fewer seats.': 'انقل الفرق قليلة الاستخدام إلى التدريب أو إلى عدد أقل من التراخيص.',
  'Open Organization': 'افتح المؤسسة',

  // Healthy pool
  'The pool is well used and fully covered': 'الرصيد المشترك مستخدم جيدًا ومغطى بالكامل',
  'Utilization is about {share} with no billed overage.': 'نسبة الاستخدام نحو {share} دون تجاوز مدفوع.',
  'Usage {usage} against {credits} of included credits.': 'الاستخدام {usage} مقابل {credits} من الأرصدة المشمولة.',
  'Keep monitoring the trend and set alerts so a change shows up early.': 'واصل متابعة الاتجاه وفعّل التنبيهات ليظهر أي تغيّر مبكرًا.',

  // Data coverage and notes
  'Some figures are hidden or assumed because of what the file does not contain.': 'بعض الأرقام مخفية أو مفترضة بسبب ما لا يحتويه الملف.',
  'Export the AI usage report again from GitHub and load the complete file.': 'صدّر تقرير استخدام الذكاء الاصطناعي من GitHub مرة أخرى وحمّل الملف الكامل.',
  'Open Data': 'افتح البيانات',
  'The pool covered {covered}, more than the {capacity} that the seats in this file fund. Other seats share the pool (a partial export, or files from different billing entities), so pool size, utilization and seat recommendations are not shown. Add your seat roster or extra seats in Settings to complete the picture.': 'غطّى الرصيد المشترك {covered}، وهو أكثر من {capacity} التي تموّلها التراخيص الموجودة في هذا الملف. هناك تراخيص أخرى تشترك في الرصيد (تصدير جزئي، أو ملفات من جهات فوترة مختلفة)، لذلك لا يُعرض حجم الرصيد المشترك ولا نسبة الاستخدام ولا توصيات التراخيص. أضف قائمة التراخيص أو تراخيص إضافية في الإعدادات لاستكمال الصورة.',
  'The size of the pool is unknown (see the missing columns below), so pool size, utilization and seat recommendations are not shown.': 'حجم الرصيد المشترك غير معروف (انظر الأعمدة الناقصة أدناه)، لذلك لا يُعرض حجم الرصيد المشترك ولا نسبة الاستخدام ولا توصيات التراخيص.',
  'The current estimate only includes users in this report. Add a complete license list in Settings to improve included-credit and seat-activity estimates.':
    'يشمل التقدير الحالي المستخدمين الظاهرين في التقرير فقط. أضف قائمة تراخيص كاملة في الإعدادات لتحسين تقديرات الأرصدة المشمولة ونشاط أصحاب التراخيص.',
  'Only {n} days of data: projections and trends are indicative.': plural(
    'يوم واحد فقط من البيانات: التوقعات والاتجاهات استرشادية.',
    'يومان فقط من البيانات: التوقعات والاتجاهات استرشادية.',
    '{n} أيام فقط من البيانات: التوقعات والاتجاهات استرشادية.',
    '{n} يومًا فقط من البيانات: التوقعات والاتجاهات استرشادية.',
    '{n} يوم فقط من البيانات: التوقعات والاتجاهات استرشادية.',
  ),
  '{amount} is on models that are not in the built-in price card. What-if savings exclude them; add overrides in Settings.': '{amount} على نماذج غير موجودة في قائمة الأسعار المدمجة. تستثنيها وفورات «ماذا لو»؛ أضف تعديلات الأسعار في الإعدادات.',
  '{amount} is on usage lines without token counts or a model name, so price card estimates and what-if savings exclude it.': '{amount} على أسطر استخدام بلا أعداد رموز أو اسم نموذج، لذلك تستثنيها تقديرات قائمة الأسعار ووفورات «ماذا لو».',
  'The report covers AI-credit usage only. Code completions and next edit suggestions are not included.': 'يغطي التقرير استخدام أرصدة الذكاء الاصطناعي فقط. إكمالات الكود واقتراحات التعديل التالي غير مشمولة.',
  '{n} duplicate rows were dropped while merging files.': plural(
    'أُسقط صف مكرر واحد أثناء دمج الملفات.',
    'أُسقط صفان مكرران أثناء دمج الملفات.',
    'أُسقطت {n} صفوف مكررة أثناء دمج الملفات.',
    'أُسقط {n} صفًا مكررًا أثناء دمج الملفات.',
    'أُسقط {n} صف مكرر أثناء دمج الملفات.',
  ),
  '{count} failed validation (see Data).': 'فشل التحقق: {count} (انظر البيانات).',
  'Estimates are only as complete as the loaded files.': 'التقديرات لا تكون أكمل من الملفات المحمّلة.',
  'This file does not say what was billed': 'لا يبيّن هذا الملف ما دُفع إضافيًا',
  'Overage, pool and seat findings need the discount_amount, net_amount and total_monthly_quota columns.': 'تحتاج نتائج التجاوز والرصيد المشترك والتراخيص إلى الأعمدة discount_amount وnet_amount وtotal_monthly_quota.',

  // Headline
  'Pool utilization {share}': 'استخدام الرصيد المشترك {share}',
  'Auto {share} of usage': 'Auto {share} من الاستخدام',
  '{amount} billed overage and {actions}': 'تجاوز مدفوع بقيمة {amount} و{actions}',
  'No urgent issues, {items} worth a look': 'لا مشكلات عاجلة، ويوجد ما يستحق النظر: {items}',
  'Usage looks healthy': 'الاستخدام يبدو سليمًا',

  // Personal tips
  'You used {multiple} your included credits': 'استخدمت ما يعادل {multiple} أرصدتك المشمولة',
  'Set an AI credit session limit for open-ended agent tasks, split big jobs into plan then implement sessions, and watch for loops. If the work is legitimate, ask your admin for an individual budget with an expiry date.': 'حدّد حدًّا لأرصدة الذكاء الاصطناعي في الجلسة لمهام الوكيل المفتوحة، وقسّم المهام الكبيرة إلى جلسة تخطيط ثم جلسة تنفيذ، وانتبه إلى الحلقات. إذا كان العمل مشروعًا، فاطلب من المسؤول ميزانية فردية بتاريخ انتهاء.',
  '{share} of your usage is on Powerful models': '{share} من استخدامك على النماذج القوية',
  'Use reasoning models for planning, architecture and hard debugging. Implement the plan with a mid-tier model in a fresh session, and use lighter models for docs, formatting and small refactors.': 'استخدم نماذج الاستدلال للتخطيط والهندسة المعمارية وتصحيح الأخطاء الصعب. ونفّذ الخطة بنموذج من الفئة المتوسطة في جلسة جديدة، واستخدم نماذج أخف للتوثيق والتنسيق وإعادة الهيكلة الصغيرة.',
  'Auto handled {share} of your usage': 'تولّى Auto نسبة {share} من استخدامك',
  'Make Auto your default model. It routes each task to an efficient model, and Auto usage gets a discount off the original price of its tokens. Moving your hand-picked usage to Auto would have earned an estimated discount of {amount}. Pin a model only when a task needs it.': 'اجعل Auto نموذجك الافتراضي. فهو يوجّه كل مهمة إلى نموذج كفء، ويحصل استخدام Auto على خصم من السعر الأصلي لرموزه. ولو نقلت استخدامك المختار يدويًا إلى Auto لحصلت على خصم مقدَّر بنحو {amount}. ثبّت نموذجًا محددًا فقط عندما تتطلبه المهمة.',
  'Make Auto your default model. It routes each task to an efficient model. The Auto discount rate for your plan is 0% in this report, so the benefit is a fitting model for each task, not a lower price. Pin a model only when a task needs it.': 'اجعل Auto نموذجك الافتراضي. فهو يوجّه كل مهمة إلى نموذج كفء. معدل خصم Auto لخطتك هو 0% في هذا التقرير، لذلك فالفائدة هي نموذج مناسب لكل مهمة وليست سعرًا أقل. ثبّت نموذجًا محددًا فقط عندما تتطلبه المهمة.',
  'Your cache hit rate is {rate}': 'نسبة القراءة من الذاكرة المؤقتة لديك {rate}',
  'Cached input costs about 10% of normal. Stay on one model for the whole session, start a new session (or /compact) instead of resuming an old thread, and avoid changing reasoning effort or tools mid-session.': 'يكلّف الإدخال المخزّن مؤقتًا نحو 10% من العادي. ابقَ على نموذج واحد طوال الجلسة، وابدأ جلسة جديدة (أو استخدم /compact) بدل استئناف محادثة قديمة، وتجنب تغيير مستوى الاستدلال أو الأدوات في منتصف الجلسة.',
  '{share} of your usage is long-context surcharge': '{share} من استخدامك رسوم إضافية للسياق الطويل',
  "Prompts above a model's long-context threshold are billed at a higher rate. Split the work, summarize earlier steps and narrow the files you attach.": 'تُحاسَب الطلبات التي تتجاوز حد السياق الطويل للنموذج بسعر أعلى. قسّم العمل ولخّص الخطوات السابقة وضيّق الملفات التي ترفقها.',
  'Trim the context you send': 'قلّص السياق الذي ترسله',
  'Start a new conversation when you change problem, use /compact for long CLI sessions, keep AGENTS.md or copilot-instructions.md current and enable only the MCP tools you need.': 'ابدأ محادثة جديدة عند الانتقال إلى مشكلة أخرى، واستخدم /compact لجلسات CLI الطويلة، وأبقِ AGENTS.md أو copilot-instructions.md محدّثًا، وفعّل فقط أدوات MCP التي تحتاجها.',
  '{share} of your usage happened on {day}': '{share} من استخدامك حدث في {day}',
  'Review what ran on that day. A session limit stops an open-ended agent task before it grows into one very large day.': 'راجع ما جرى في ذلك اليوم. يوقف حد الجلسة مهمة الوكيل المفتوحة قبل أن تتحول إلى يوم واحد ضخم.',
  'You used {n} different models': plural(
    'استخدمت نموذجًا واحدًا مختلفًا',
    'استخدمت نموذجين مختلفين',
    'استخدمت {n} نماذج مختلفة',
    'استخدمت {n} نموذجًا مختلفًا',
    'استخدمت {n} نموذج مختلف',
  ),
  'Switching models mid-session throws away the cache. Pick one model per session and switch only at natural breaks.': 'تبديل النماذج في منتصف الجلسة يهدر الذاكرة المؤقتة. اختر نموذجًا واحدًا لكل جلسة ولا تبدّل إلا عند الفواصل الطبيعية.',
  'Your usage rose to {recent} from {prior} the week before': 'ارتفع استخدامك إلى {recent} من {prior} في الأسبوع السابق',
  'If this is a new project, that is expected. If not, review what ran, and ask for a budget before the pool runs out.': 'إذا كان هذا مشروعًا جديدًا فهذا متوقع. وإن لم يكن كذلك، فراجع ما جرى واطلب ميزانية قبل أن ينفد الرصيد المشترك.',
  'No usage since {day}': 'لا استخدام منذ {day}',
  'Your usage is fading': 'استخدامك يتراجع',
  'Try agent mode on a well-scoped task, or GitHub Copilot CLI for repetitive work. Tell your admin if something is blocking you.': 'جرّب وضع الوكيل على مهمة محددة النطاق، أو GitHub Copilot CLI للأعمال المتكررة. أخبر المسؤول إذا كان هناك ما يعيقك.',
  'You use {share} of your included credits': 'تستخدم {share} من أرصدتك المشمولة',
  'There is room to do more with GitHub Copilot: ask it to plan a change, write tests or review a diff. If you no longer need the seat, let your admin know so it can be reassigned.': 'هناك مجال لتفعل المزيد مع GitHub Copilot: اطلب منه تخطيط تغيير أو كتابة اختبارات أو مراجعة فروقات. وإذا لم تعد بحاجة إلى الترخيص، فأبلغ المسؤول ليعيد إسناده.',
  'Welcome: start with good habits': 'أهلًا بك: ابدأ بعادات جيدة',
  'Use Auto by default, keep one model per session, start a fresh thread for each task and give the agent a clear goal and a stopping point.': 'استخدم Auto افتراضيًا، وأبقِ نموذجًا واحدًا لكل جلسة، وابدأ محادثة جديدة لكل مهمة، وأعطِ الوكيل هدفًا واضحًا ونقطة توقف.',
  'You use GitHub Copilot often and heavily': 'تستخدم GitHub Copilot كثيرًا وبكثافة',
  'Share your prompts, custom instructions and workflows with your team. Your habits are a good template.': 'شارك المطالبات والتعليمات المخصصة وأساليب عملك مع فريقك. عاداتك قدوة جيدة.',
  'Efficient model mix': 'مزيج نماذج كفء',
  'Mostly mid-tier and light models with {share} on Auto. Keep it up.': 'معظمها نماذج من الفئة المتوسطة والخفيفة مع {share} على Auto. واصل على هذا النهج.',
  'You are not assigned to a cost center': 'أنت غير مسند إلى مركز تكلفة',
  'Ask your admin to add you so your usage can be budgeted and reported by team.': 'اطلب من المسؤول إضافتك حتى يمكن وضع ميزانية لاستخدامك والإبلاغ عنه بحسب الفريق.',

  // Playbook
  'Match the model to the task': 'طابق النموذج مع المهمة',
  'Defaulting to the most capable model for everything raises token use without improving the result, and over-thinking can add unnecessary changes.': 'الاعتماد على النموذج الأقدر لكل شيء يزيد استهلاك الرموز دون تحسين النتيجة، والإفراط في التفكير قد يضيف تغييرات غير ضرورية.',
  'Reasoning models: architecture decisions, complex debugging, system design.': 'نماذج الاستدلال: قرارات الهندسة المعمارية، وتصحيح الأخطاء المعقد، وتصميم الأنظمة.',
  'Mid-tier models: executing a plan that is already clear.': 'نماذج الفئة المتوسطة: تنفيذ خطة واضحة بالفعل.',
  'Lighter models: refactoring, formatting, documentation and other routine, well-scoped changes.': 'النماذج الأخف: إعادة الهيكلة والتنسيق والتوثيق وغيرها من التغييرات الروتينية المحددة النطاق.',
  'Make Auto your default': 'اجعل Auto الخيار الافتراضي',
  'A small router sends each prompt to a model that can handle it efficiently, avoids models that burn through budget and changes model only at cache-friendly boundaries. Auto usage also gets a discount off the original price of its tokens; the Overview shows the rate in this report.': 'يرسل مُوجِّه صغير كل مطالبة إلى نموذج قادر على التعامل معها بكفاءة، ويتجنب النماذج التي تستنزف الميزانية، ولا يبدّل النموذج إلا عند حدود لا تضر بالذاكرة المؤقتة. كما يحصل استخدام Auto على خصم من السعر الأصلي لرموزه؛ وتعرض نظرة عامة المعدل في هذا التقرير.',
  'Select Auto in GitHub Copilot Chat, GitHub Copilot CLI, the GitHub Copilot app and the cloud agent.': 'اختر Auto في GitHub Copilot Chat وGitHub Copilot CLI وتطبيق GitHub Copilot والوكيل السحابي.',
  'Pin a model only when a task needs it, and keep it for the whole session.': 'ثبّت نموذجًا فقط عندما تتطلبه المهمة، وأبقِه طوال الجلسة.',
  'Keep reasoning at the regular level': 'أبقِ الاستدلال عند المستوى العادي',
  'A higher reasoning level helps hard problems but consumes more tokens, and therefore more credits.': 'مستوى الاستدلال الأعلى يساعد في المشكلات الصعبة لكنه يستهلك رموزًا أكثر، وبالتالي أرصدة أكثر.',
  'Use the regular level by default.': 'استخدم المستوى العادي افتراضيًا.',
  'Raise it only for harder tasks (VS Code and GitHub Copilot CLI, supported models).': 'ارفعه فقط للمهام الأصعب (في VS Code وGitHub Copilot CLI، مع النماذج المدعومة).',
  'Run subagents on cheaper models': 'شغّل الوكلاء الفرعيين على نماذج أرخص',
  "Subagents run in their own session without the main agent's history, so a lighter model is usually enough, and assigning one does not disturb the main agent's cache.": 'يعمل الوكلاء الفرعيون في جلسة خاصة بهم دون سجل الوكيل الرئيسي، لذلك يكفي عادةً نموذج أخف، ولا يؤثر تعيين نموذج لهم في الذاكرة المؤقتة للوكيل الرئيسي.',
  'Assign a lighter model to subagents that do focused, single-task work.': 'عيّن نموذجًا أخف للوكلاء الفرعيين الذين ينفذون عملًا محددًا بمهمة واحدة.',
  'Write clear prompts with a stopping point': 'اكتب مطالبات واضحة بنقطة توقف',
  'Vague prompts lead to retries, scope drift and extra exploration. Clear guidance costs few tokens and saves many agent runs.': 'تؤدي المطالبات الغامضة إلى إعادة المحاولات وانحراف النطاق واستكشاف زائد. أما التوجيه الواضح فيكلّف رموزًا قليلة ويوفر تشغيلات كثيرة للوكيل.',
  'State the task: what the issue is, where it happens and the expected outcome.': 'اذكر المهمة: ما المشكلة، وأين تحدث، وما النتيجة المتوقعة.',
  'Include the files, logs or errors that matter.': 'أرفق الملفات أو السجلات أو الأخطاء المهمة.',
  'Say what "done" looks like so the agent does not keep going.': 'حدّد شكل «الانتهاء» حتى لا يستمر الوكيل في العمل.',
  'Keep your context lean': 'أبقِ سياقك خفيفًا',
  'Open tabs, attached files, tool definitions and the whole conversation history are sent as input tokens with every request.': 'تُرسل علامات التبويب المفتوحة والملفات المرفقة وتعريفات الأدوات وسجل المحادثة كاملًا كرموز إدخال مع كل طلب.',
  'Start a new conversation when you switch problems (/new or /clear in the CLI, a new chat elsewhere).': 'ابدأ محادثة جديدة عند الانتقال إلى مشكلة أخرى (/new أو /clear في CLI، ومحادثة جديدة في غيره).',
  'Use /compact to shrink a long CLI session you want to continue, and /context to check usage.': 'استخدم /compact لتقليص جلسة CLI الطويلة التي تريد متابعتها، و/context للتحقق من الاستخدام.',
  'Keep AGENTS.md or .github/copilot-instructions.md current so agents do not read many files to orient themselves.': 'أبقِ AGENTS.md أو .github/copilot-instructions.md محدّثًا حتى لا يقرأ الوكلاء ملفات كثيرة ليفهموا المشروع.',
  'Preserve the cache': 'حافظ على الذاكرة المؤقتة',
  'Cached tokens are billed at about 10% of normal input. Anything that invalidates the cache re-sends the whole context at full price.': 'تُحاسَب الرموز المخزنة مؤقتًا بنحو 10% من الإدخال العادي. وكل ما يبطل الذاكرة المؤقتة يعيد إرسال السياق كاملًا بالسعر الكامل.',
  'Do not switch models mid-session.': 'لا تبدّل النماذج في منتصف الجلسة.',
  'Do not resume old sessions after the cache expires (1 hour for most models, 24 hours for OpenAI): start a new one or /compact first.': 'لا تستأنف الجلسات القديمة بعد انتهاء صلاحية الذاكرة المؤقتة (ساعة واحدة لمعظم النماذج، و24 ساعة لـ OpenAI): ابدأ جلسة جديدة أو استخدم /compact أولًا.',
  'Do not change reasoning effort, context size or the set of tools and MCP servers during a session.': 'لا تغيّر مستوى الاستدلال أو حجم السياق أو مجموعة الأدوات وخوادم MCP أثناء الجلسة.',
  'Stay under the long-context threshold': 'ابقَ دون حد السياق الطويل',
  'Some models bill prompts above a size threshold at a higher rate.': 'بعض النماذج تحاسب الطلبات التي تتجاوز حدًا معينًا للحجم بسعر أعلى.',
  'Split large tasks, summarize earlier steps and narrow the files you attach.': 'قسّم المهام الكبيرة ولخّص الخطوات السابقة وضيّق الملفات التي ترفقها.',
  'Choose a model without a long-context tier when you do not need a very large window.': 'اختر نموذجًا بلا فئة سياق طويل عندما لا تحتاج إلى نافذة كبيرة جدًا.',
  'Research, plan, then implement': 'ابحث، ثم خطّط، ثم نفّذ',
  'Doing everything in one session grows the context with material the later steps do not need.': 'تنفيذ كل شيء في جلسة واحدة يضخّم السياق بمواد لا تحتاجها الخطوات اللاحقة.',
  'Research: explore the codebase and dependencies.': 'البحث: استكشف قاعدة الكود والتبعيات.',
  'Plan: write a structured plan with a strong reasoning model (/plan in the CLI, Plan mode in VS Code).': 'التخطيط: اكتب خطة منظمة بنموذج استدلال قوي (/plan في CLI، ووضع Plan في VS Code).',
  'Implement: start a new session and execute the plan with a model suited to execution.': 'التنفيذ: ابدأ جلسة جديدة ونفّذ الخطة بنموذج مناسب للتنفيذ.',
  'Set AI credit session limits': 'حدّد حدود أرصدة الذكاء الاصطناعي لكل جلسة',
  'A session limit stops an open-ended task before it uses more credits than you intended. It is a soft limit per session and does not replace budgets.': 'يوقف حد الجلسة مهمة مفتوحة قبل أن تستهلك أرصدة أكثر مما قصدت. وهو حد مرن لكل جلسة ولا يغني عن الميزانيات.',
  'Set a limit before starting a task in GitHub Copilot CLI or the GitHub Copilot SDK.': 'حدّد حدًّا قبل بدء المهمة في GitHub Copilot CLI أو GitHub Copilot SDK.',
  'When it is reached, choose whether to continue or raise the limit.': 'عند بلوغه، اختر بين المتابعة أو رفع الحد.',
  'Learn from your own history': 'تعلّم من سجلك الخاص',
  'Your session history shows which habits cost the most.': 'يُظهر سجل جلساتك أي العادات هي الأكثر كلفة.',
  'Run /chronicle tips and /chronicle cost-tips in GitHub Copilot CLI.': 'شغّل /chronicle tips و/chronicle cost-tips في GitHub Copilot CLI.',
  'Put recurring fixes into copilot-instructions.md so every session benefits.': 'ضع الإصلاحات المتكررة في copilot-instructions.md لتستفيد منها كل جلسة.',
  'Set budgets: users first, then the pool': 'حدّد الميزانيات: المستخدمون أولًا، ثم الرصيد المشترك',
  'User-level budgets are the only control active in both the pool and the metered phase, and always stop usage at the limit. Enterprise, organization and cost-center budgets only cap metered overage, so your maximum bill is seat fees plus the budget.': 'ميزانيات المستخدمين هي الضبط الوحيد الفعّال في مرحلتي الرصيد المشترك والتجاوز المقيس، وهي توقف الاستخدام دائمًا عند الحد. أما ميزانيات Enterprise والمؤسسة ومراكز التكلفة فتحدّ التجاوز المقيس فقط، لذلك فأقصى فاتورة لك هي رسوم التراخيص مضافًا إليها الميزانية.',
  'Create a universal user-level budget for fair access to the pool.': 'أنشئ ميزانية عامة على مستوى المستخدم لضمان وصول عادل إلى الرصيد المشترك.',
  'Add cost-center or individual budgets (with expiry) where teams need more.': 'أضف ميزانيات لمراكز التكلفة أو للأفراد (مع تاريخ انتهاء) حيث تحتاج الفرق إلى المزيد.',
  'Add an enterprise budget with alerts for the overage phase.': 'أضف ميزانية Enterprise مع تنبيهات لمرحلة التجاوز.',
  'Use cost-center included-usage controls to cap each team at the credits its licenses fund.': 'استخدم ضوابط الاستخدام المشمول لكل مركز تكلفة لتحديد سقف كل فريق بالأرصدة التي تموّلها تراخيصه.',
  'Right-size seats': 'اضبط عدد التراخيص بما يناسب',
  'A seat costs the same as the credits it includes, so an unused seat wastes its credits unless other users consume them. Overage is priced at the same rate per credit, so seats are not a discount.': 'يكلّف الترخيص ما تكلّفه الأرصدة التي يتضمنها، لذلك يهدر الترخيص غير المستخدم أرصدته ما لم يستهلكها مستخدمون آخرون. ويُسعَّر التجاوز بالمعدل نفسه لكل رصيد، فالتراخيص ليست خصمًا.',
  'Review users with minimal usage and reassign or reclaim their seats at the next billing cycle.': 'راجع المستخدمين ذوي الاستخدام الضئيل وأعد إسناد تراخيصهم أو استرجعها في دورة الفوترة التالية.',
  'Check completions and chat activity in the license usage view first: this report does not include them.': 'تحقق أولًا من نشاط الإكمال والمحادثة في عرض استخدام التراخيص: هذا التقرير لا يتضمنه.',
  'Consider Business instead of Enterprise for light users who do not need Enterprise-only features.': 'فكّر في Business بدل Enterprise للمستخدمين الخفيفين الذين لا يحتاجون إلى ميزات Enterprise الحصرية.',

  // Per-user action CSV headers
  'Usage USD': 'الاستخدام بالدولار',
  'Billed USD': 'المدفوع إضافيًا بالدولار',
  'Avoidable USD (default levers)': 'القابل للتجنب بالدولار (الإجراءات الافتراضية)',
  'Top action': 'أهم إجراء',
  'Auto usage USD': 'استخدام Auto بالدولار',
  'Original price of Auto usage USD': 'السعر الأصلي لاستخدام Auto بالدولار',
  'Auto discount received USD': 'خصم Auto المُستلَم بالدولار',
  'Auto discount missed USD': 'خصم Auto الفائت بالدولار',
  'Auto use': 'استخدام Auto',
  'License seat': 'لديه ترخيص',
  'License plan': 'خطة الترخيص',
  'License status': 'حالة الترخيص',
  'Last surface': 'آخر واجهة',

  // Executive summary export
  'GitHub Copilot AI usage: executive summary': 'استخدام الذكاء الاصطناعي في GitHub Copilot: ملخص تنفيذي',
  '**Data:** {label} · **Period:** {range} ({days})': '**البيانات:** {label} · **الفترة:** {range} ({days})',
  '**Filters:** {filters}': '**عوامل التصفية:** {filters}',
  '**Filters:** none (all rows)': '**عوامل التصفية:** لا شيء (كل الصفوف)',
  Headline: 'الخلاصة',
  'The report is narrowed by filters, so organization-wide statements about the shared pool and seats are left out.': 'التقرير مضيَّق بعوامل التصفية، لذلك حُذفت العبارات على مستوى المؤسسة بأكملها عن الرصيد المشترك والتراخيص.',
  '{change} vs previous {days}': '{change} مقارنة بالفترة السابقة ({days})',
  'Key figures': 'الأرقام الرئيسية',
  'not in this file': 'غير موجود في هذا الملف',
  'Users with usage': 'المستخدمون الذين لديهم استخدام',
  'Average per user': 'المتوسط لكل مستخدم',
  'Repo-level / unattributed usage': 'استخدام على مستوى المستودع / غير منسوب',
  'Included credits by month': 'الأرصدة المشمولة بحسب الشهر',
  '{amount} (proj.)': '{amount} (متوقع)',
  'Pool ran out {date}': 'نفد الرصيد المشترك في {date}',
  'Projected to run out {date}': 'يُتوقع أن ينفد في {date}',
  'Month in progress': 'شهر جارٍ',
  Segment: 'الشريحة',
  'Tier (usage vs own included credits)': 'المستوى (الاستخدام مقابل أرصدته المشمولة الخاصة)',
  'Top {n} users by usage': plural(
    'أعلى مستخدم بحسب الاستخدام',
    'أعلى مستخدمين بحسب الاستخدام',
    'أعلى {n} مستخدمين بحسب الاستخدام',
    'أعلى {n} مستخدمًا بحسب الاستخدام',
    'أعلى {n} مستخدم بحسب الاستخدام',
  ),
  'Of own credits': 'من أرصدته الخاصة',
  Actions: 'الإجراءات',
  'about {amount} of {kind} per month, of which at least {cash} is cash saved.': 'نحو {amount} من {kind} شهريًا، منها {cash} على الأقل وفر نقدي.',
  'about {amount} of {kind} per month, of which about {cash} is cash saved.': 'نحو {amount} من {kind} شهريًا، منها نحو {cash} وفر نقدي.',
  'about {amount} of {kind} per month, with no cash saving while the pool is fully used.': 'نحو {amount} من {kind} شهريًا، دون وفر نقدي ما دام الرصيد المشترك مستخدمًا بالكامل.',
  'about {amount} of {kind} per month, with the cash effect depending on the pool, which cannot be split for a filtered view.': 'نحو {amount} من {kind} شهريًا، ويتوقف الأثر النقدي على الرصيد المشترك الذي لا يمكن تقسيمه في العرض المصفّى.',
  'about {amount} of {kind} per month, with no cash saving while usage stays within the included credits.': 'نحو {amount} من {kind} شهريًا، دون وفر نقدي ما دام الاستخدام ضمن الأرصدة المشمولة.',
  Potential: 'الوفر المحتمل',
  'Caveat: {caveat}': 'تحفظ: {caveat}',
  'Affects: {list}.': 'يؤثر في: {list}.',
  'Savings plan (default assumptions)': 'خطة التوفير (بالافتراضات الأولية)',
  Lever: 'الإجراء',
  'Usage avoided (period)': 'الاستخدام المتجنَّب (الفترة)',
  'Combined cash effect of the usage levers and seat actions: about **{amount} per month**. Usage reductions only save cash once usage exceeds the included credits; seat changes only save what the pool does not need.': 'الأثر النقدي المجمَّع لإجراءات الاستخدام وإجراءات التراخيص: نحو **{amount} شهريًا**. لا يوفّر خفض الاستخدام نقدًا إلا عندما يتجاوز الاستخدام الأرصدة المشمولة؛ ولا توفّر تغييرات التراخيص إلا ما لا يحتاجه الرصيد المشترك.',
  'Combined effect of the usage levers: about **{amount} less usage per month**. Whether this saves cash depends on the shared pool, which cannot be split for a filtered view; the overlapping levers are not double counted.': 'الأثر المجمَّع لإجراءات الاستخدام: نحو **{amount} أقل استخدامًا شهريًا**. ويتوقف كون ذلك يوفّر نقدًا على الرصيد المشترك الذي لا يمكن تقسيمه في العرض المصفّى؛ ولا تُحتسب الإجراءات المتداخلة مرتين.',
  'Combined effect of the usage levers: about **{amount} less usage per month**. Whether this saves cash depends on the shared pool, which this file does not describe; the overlapping levers are not double counted.': 'الأثر المجمَّع لإجراءات الاستخدام: نحو **{amount} أقل استخدامًا شهريًا**. ويتوقف كون ذلك يوفّر نقدًا على الرصيد المشترك الذي لا يصفه هذا الملف؛ ولا تُحتسب الإجراءات المتداخلة مرتين.',
  'How to read this report': 'كيف تقرأ هذا التقرير',
  'Usage = AI credits × $0.01. Included credits are pooled across all seats of a billing entity and reset on the 1st (UTC); anything above the pool is billed.': 'الاستخدام = أرصدة الذكاء الاصطناعي × $0.01. تُجمَّع الأرصدة المشمولة عبر كل تراخيص جهة الفوترة وتُعاد ضبطها في اليوم الأول من الشهر (UTC)؛ وأي استخدام فوق الرصيد المشترك يُحاسَب عليه.',
  'Prices come from the model price card ({url}); token-based estimates are approximations.': 'الأسعار مأخوذة من قائمة أسعار النماذج ({url})؛ والتقديرات المبنية على الرموز تقريبية.',
  'Completions and next-edit suggestions are not in this export, so a user who looks idle here may still use GitHub Copilot.': 'الإكمالات واقتراحات التعديل التالي ليست في هذا التصدير، لذلك قد يظل المستخدم الذي يبدو خاملًا هنا يستخدم GitHub Copilot.',
  'Pool size only counts users that appear in the report. Add the seat roster in Settings for the exact pool size.': 'حجم الرصيد المشترك يحتسب فقط المستخدمين الظاهرين في التقرير. أضف قائمة التراخيص في الإعدادات للحصول على الحجم الدقيق.',
  'The included credits used exceed what the seats in this file fund, so the file likely covers only part of a larger billing entity. Pool-size statements are suppressed.': 'الأرصدة المشمولة المستخدمة تتجاوز ما تموّله التراخيص في هذا الملف، لذلك يرجَّح أن يغطي الملف جزءًا فقط من جهة فوترة أكبر. وقد حُجبت العبارات المتعلقة بحجم الرصيد المشترك.',

  // Page header, tabs and actions
  'What to do, in what order, and what it is worth.': 'ماذا تفعل، وبأي ترتيب، وما قيمته.',
  'What-if simulator': 'محاكي «ماذا لو»',
  Playbook: 'دليل العمل',
  'Headline, key figures, segments and recommendations as Markdown': 'الخلاصة والأرقام الرئيسية والشرائح والتوصيات بصيغة Markdown',
  'Download summary (.md)': 'نزّل الملخص (.md)',
  'One row per user with the segment, usage and the suggested next step': 'صف لكل مستخدم مع الشريحة والاستخدام والخطوة التالية المقترحة',
  'Download action list (CSV)': 'نزّل قائمة الإجراءات (CSV)',
  'Print this page or save it as a PDF': 'اطبع هذه الصفحة أو احفظها بصيغة PDF',
  Print: 'اطبع',
  'Recommendations sections': 'أقسام التوصيات',
  '{n} to review': '{n} للمراجعة',
  'Seats in the lists on this tab: idle seats, Enterprise seats that fit Business and roster seats that never appear.':
    'التراخيص في قوائم هذا القسم: التراخيص الخاملة، وتراخيص Enterprise التي تناسب Business، وتراخيص القائمة التي لا تظهر أبدًا.',
  'Copied to the clipboard': 'تم النسخ إلى الحافظة',
  'Copying failed. Select the text and copy it by hand.': 'فشل النسخ. حدّد النص وانسخه يدويًا.',

  // Simulator: waterfall and models
  'Usage per month. Each lever works on what the earlier ones left, so the effects add up without double counting.': 'الاستخدام شهريًا. يعمل كل إجراء على ما تركته الإجراءات السابقة، لذلك تُجمع الآثار دون احتساب مزدوج.',
  '{amount} on its own': '{amount} بمفرده',
  'This chart averages the whole period. The month table below projects the unfinished month to its end, so its totals differ a little.': 'يحسب هذا المخطط متوسط الفترة كاملة. أما جدول الأشهر أدناه فيُسقط الشهر غير المكتمل حتى نهايته، لذلك تختلف إجمالياته قليلًا.',
  'No usage of Powerful-tier models with a known price was found, so there is nothing to right-size.': 'لم يُعثر على استخدام لنماذج الفئة القوية ذات السعر المعروف، لذلك لا يوجد ما يُستبدل بنموذج أنسب.',
  'Moving to {target} would not cost less than the Powerful-tier models used here, so right-sizing saves nothing. Pick another target model.': 'الانتقال إلى {target} لن يكلّف أقل من نماذج الفئة القوية المستخدمة هنا، لذلك لا يوفّر اختيار النموذج المناسب شيئًا. اختر نموذجًا مستهدفًا آخر.',
  'Moves to': 'ينتقل إلى',
  'Saving at {pct}': 'الوفر عند {pct}',
  'Showing the {models} with the largest saving, out of {total}.': 'يُعرض الأكبر وفرًا: {models} من أصل {total}.',
  'Same work costs is the target price divided by the current price for the same mix of input, cache and output tokens, at price card rates.': 'تكلفة العمل نفسه هي سعر النموذج الهدف مقسومًا على السعر الحالي لمزيج رموز الإدخال والذاكرة المؤقتة والإخراج نفسه، بأسعار قائمة الأسعار.',

  // Simulator: month table
  'Usage in the month': 'الاستخدام في الشهر',
  'Usage after the levers': 'الاستخدام بعد الإجراءات',
  'Included credits of all seats, which equal the seat prices': 'الأرصدة المشمولة لكل التراخيص، وهي تساوي أسعار التراخيص',
  'Pool after the seat actions': 'الرصيد المشترك بعد إجراءات التراخيص',
  'The larger of the pool and the usage': 'الأكبر بين الرصيد المشترك والاستخدام',
  'The larger of the new pool and the new usage': 'الأكبر بين الرصيد المشترك الجديد والاستخدام الجديد',
  'Usage above the pool, billed on top of seats': 'الاستخدام فوق الرصيد المشترك، ويُحاسَب عليه إضافة إلى التراخيص',
  'Usage above the pool after the levers': 'الاستخدام فوق الرصيد المشترك بعد الإجراءات',
  'Cost minus new cost': 'التكلفة ناقص التكلفة الجديدة',
  'Figures in US dollars. Cost is the larger of the pool and the usage.': 'الأرقام بالدولار الأمريكي. التكلفة هي الأكبر بين الرصيد المشترك والاستخدام.',
  'Figures in US dollars. The pool size is unknown, so only the part billed on top of seats is shown.': 'الأرقام بالدولار الأمريكي. حجم الرصيد المشترك غير معروف، لذلك يُعرض فقط الجزء المحاسَب عليه إضافة إلى التراخيص.',
  'Usage in US dollars. The pool and cost columns are hidden, see the note above.': 'الاستخدام بالدولار الأمريكي. عمودا الرصيد المشترك والتكلفة مخفيان، انظر الملاحظة أعلاه.',
  'Usage, pool and cost for each month before and after the scenario': 'الاستخدام والرصيد المشترك والتكلفة لكل شهر قبل السيناريو وبعده',
  'The month is not over. Its usage is projected to the end of the month from the recent daily rate.': 'الشهر لم ينتهِ بعد. يُسقَط استخدامه حتى نهاية الشهر بحسب المعدل اليومي الأخير.',
  'Cost is the larger of the pool and the usage. Using less saves cash only for the part of the usage above the pool, because the pool is paid for anyway. Removing seats shrinks the pool, so it saves cash only up to the unused part of the pool.': 'التكلفة هي الأكبر بين الرصيد المشترك والاستخدام. وخفض الاستخدام يوفّر نقدًا فقط في الجزء الذي يتجاوز الرصيد المشترك، لأن الرصيد المشترك مدفوع في كل الأحوال. وإزالة التراخيص تقلّص الرصيد المشترك، لذلك توفّر نقدًا فقط بقدر الجزء غير المستخدم منه.',
  'Using less saves cash only for the part of the usage above the pool. A month that ran out of included credits shows the real pool size, and a month that did not billed nothing.': 'خفض الاستخدام يوفّر نقدًا فقط في الجزء الذي يتجاوز الرصيد المشترك. والشهر الذي نفدت فيه الأرصدة المشمولة يُظهر الحجم الحقيقي للرصيد المشترك، أما الشهر الذي لم تنفد فيه فلم يُدفع فيه شيء إضافي.',
  '* The pool counts only the seats that appear in the report. Add your roster in Settings for the real pool size.': '* يحتسب الرصيد المشترك فقط التراخيص الظاهرة في التقرير. أضف قائمة التراخيص في الإعدادات للحصول على الحجم الحقيقي.',

  // Plan and playbook cards
  'Who owns this action': 'من المسؤول عن هذا الإجراء',
  'First step:': 'الخطوة الأولى:',
  'A starting point drawn from the top recommendations, largest impact first': 'نقطة انطلاق مستمدة من أهم التوصيات، الأكبر أثرًا أولًا',
  'Starting point': 'نقطة الانطلاق',
  'No recommendation needs action in this period, so there is nothing to schedule. Keep the habits below in mind as usage grows.': 'لا توصية تحتاج إلى إجراء في هذه الفترة، لذلك لا شيء يُجدول. ضع العادات أدناه في الحسبان مع نمو الاستخدام.',
  "The first {size} recommendations that need action go in the first 30 days, the next {size} in days 31 to 60 and the rest in days 61 to 90. Their values overlap, so they are not added up. Adjust the order to your team's capacity, and use the What-if simulator to size the combined effect.": 'أول {size} من التوصيات التي تحتاج إلى إجراء تدخل في أول 30 يومًا، و{size} التالية في الأيام من 31 إلى 60، والبقية في الأيام من 61 إلى 90. وتتداخل قيمها، لذلك لا تُجمع. اضبط الترتيب بحسب طاقة فريقك، واستخدم محاكي «ماذا لو» لتقدير الأثر المجمَّع.',
  '{n} more recommendations need action and are listed on the Recommendations tab.': plural(
    'توصية واحدة أخرى تحتاج إلى إجراء وهي مدرجة في تبويب التوصيات.',
    'توصيتان أخريان تحتاجان إلى إجراء وهما مدرجتان في تبويب التوصيات.',
    '{n} توصيات أخرى تحتاج إلى إجراء وهي مدرجة في تبويب التوصيات.',
    '{n} توصية أخرى تحتاج إلى إجراء وهي مدرجة في تبويب التوصيات.',
    '{n} توصية أخرى تحتاج إلى إجراء وهي مدرجة في تبويب التوصيات.',
  ),
  'Usage that the "{lever}" lever avoids on its own, per month. Whether it saves cash depends on the pool.': 'الاستخدام الذي يتجنبه إجراء «{lever}» بمفرده شهريًا. ويتوقف كونه يوفّر نقدًا على الرصيد المشترك.',
  'Saving of the "{lever}" lever on its own, shared with {habits}.': 'وفر إجراء «{lever}» بمفرده، وهو مشترك مع: {habits}.',
  'Saving of the "{lever}" lever on its own.': 'وفر إجراء «{lever}» بمفرده.',
  'No saving found for this habit in this report.': 'لم يُعثر على وفر لهذه العادة في هذا التقرير.',
  'The plan and the savings cover only the selected rows': 'الخطة والوفورات تغطي الصفوف المحددة فقط',
  'Savings are the usage that each habit avoids in the selected rows. Cash savings are not shown for a filtered view, because included credits are shared by the whole organization.': 'الوفورات هي الاستخدام الذي تتجنبه كل عادة في الصفوف المحددة. ولا تُعرض الوفورات النقدية في العرض المصفّى، لأن الأرصدة المشمولة مشتركة بين المؤسسة كلها.',
  'Savings are what the matching lever avoids on its own, in usage per month, using the Balanced assumptions of the What-if simulator. Several habits share one lever and levers overlap, so the figures are not added up. Whether less usage saves cash depends on the pool. Habits without a figure cannot be measured from this report.': 'الوفورات هي ما يتجنبه الإجراء المطابق بمفرده، بالاستخدام شهريًا، وفق افتراضات «متوازن» في محاكي «ماذا لو». وتشترك عدة عادات في إجراء واحد وتتداخل الإجراءات، لذلك لا تُجمع الأرقام. ويتوقف كون الاستخدام الأقل يوفّر نقدًا على الرصيد المشترك. أما العادات التي بلا رقم فلا يمكن قياسها من هذا التقرير.',

  // Recommendations tab
  'Search title, evidence and actions': 'ابحث في العنوان والأدلة والإجراءات',
  'Search recommendations': 'ابحث في التوصيات',
  'Sort recommendations': 'رتّب التوصيات',
  'Showing {shown} of {recs}': 'عرض {shown} من {recs}',
  '({n} hidden by the filters)': '({n} مخفية بعوامل التصفية)',
  'Nothing to recommend for this period': 'لا شيء للتوصية به في هذه الفترة',
  'No finding needs action in these dates. Check the included credits again as usage changes, and see the Playbook tab for habits that keep usage efficient.': 'لا توجد نتيجة تحتاج إلى إجراء في هذه التواريخ. تحقق من الأرصدة المشمولة مرة أخرى مع تغيّر الاستخدام، وانظر تبويب دليل العمل للعادات التي تُبقي الاستخدام كفؤًا.',
  'There is no usage here, so there is nothing to optimize. Choose a longer date range or clear the filters to see more.': 'لا يوجد استخدام هنا، لذلك لا شيء يمكن تحسينه. اختر نطاق تواريخ أطول أو امسح عوامل التصفية لعرض المزيد.',
  'No recommendation matches these filters': 'لا توصية تطابق عوامل التصفية هذه',
  'Try a different search word or remove a filter.': 'جرّب كلمة بحث مختلفة أو أزل أحد عوامل التصفية.',

  // Seat economics
  'plus {seats} that never appear': '+ {seats}، دون ظهور في التقرير',
  'Seat economics': 'اقتصاديات التراخيص',
  'What the seats cost and how much of the pool is used': 'كلفة التراخيص ومقدار المستخدم من الرصيد المشترك',
  'Users who appear in the loaded files within the selected dates.': 'المستخدمون الظاهرون في الملفات المحمّلة ضمن التواريخ المحددة.',
  'average of {months}': 'متوسط الفترة: {months}',
  'A seat costs the same as the included credits it carries: one credit is $0.01, so Business is $19 and Enterprise is $39 a month.': 'يكلّف الترخيص ما تكلّفه الأرصدة المشمولة فيه: الرصيد الواحد يساوي $0.01، لذلك Business بـ $19 وEnterprise بـ $39 شهريًا.',
  'pool size unknown': 'حجم الرصيد المشترك غير معروف',
  'latest month projected to its end': 'أحدث شهر مُسقَط حتى نهايته',
  'usage against included credits': 'الاستخدام مقابل الأرصدة المشمولة',
  'Usage that the included credits cover, as a share of the pool of all seats.': 'الاستخدام الذي تغطيه الأرصدة المشمولة، كحصة من الرصيد المشترك لكل التراخيص.',
  '{share} of the pool, per month': '{share} من الرصيد المشترك، شهريًا',
  'Included credits that are paid for but not used. This is the most that removing seats can save.': 'الأرصدة المشمولة المدفوعة وغير المستخدمة. وهذا أقصى ما يمكن أن توفّره إزالة التراخيص.',
  'The size of the pool is not known': 'حجم الرصيد المشترك غير معروف',
  'Rule of thumb.': 'قاعدة عامة.',
  'Together, the lists below are worth {value} a month in seat value and about {cash} a month in cash today. They draw on the same unused included credits, so their cash savings overlap.': 'إجمالًا، تساوي القوائم أدناه {value} شهريًا من قيمة التراخيص ونحو {cash} شهريًا نقدًا اليوم. وهي تعتمد على الأرصدة المشمولة غير المستخدمة نفسها، لذلك تتداخل وفوراتها النقدية.',
  'Together, the lists below are worth {value} a month in seat value. Cash savings need a known pool size. They draw on the same unused included credits, so their cash savings overlap.': 'إجمالًا، تساوي القوائم أدناه {value} شهريًا من قيمة التراخيص. وتتطلب الوفورات النقدية حجمًا معروفًا للرصيد المشترك. وهي تعتمد على الأرصدة المشمولة غير المستخدمة نفسها، لذلك تتداخل وفوراتها النقدية.',
  'On its own this would not lower the bill now, because the pool has no unused included credits to give up.': 'هذا وحده لن يخفض الفاتورة الآن، لأن الرصيد المشترك لا يحتوي على أرصدة مشمولة غير مستخدمة يمكن التخلي عنها.',
  'On its own this lowers the bill by about {amount} a month, because only the unused part of the pool is saved.': 'هذا وحده يخفض الفاتورة بنحو {amount} شهريًا، لأن ما يُوفَّر هو الجزء غير المستخدم من الرصيد المشترك فقط.',
  'On its own this lowers the bill by about {amount} a month.': 'هذا وحده يخفض الفاتورة بنحو {amount} شهريًا.',
  '{seats} · {value} a month in seat value if actioned': '{seats} · {value} شهريًا من قيمة التراخيص عند التنفيذ',

  // Seat lists
  'How seats are chosen': 'كيف تُختار التراخيص',
  'Seat lists are not shown for a filtered view': 'لا تُعرض قوائم التراخيص في العرض المصفّى',
  'Seats belong to the whole organization and included credits are shared, so a filter cannot show which seats are idle or what a change would save. Clear the row and segment filters (the date range can stay) to see the lists.': 'التراخيص تخص المؤسسة كلها والأرصدة المشمولة مشتركة، لذلك لا يستطيع عامل التصفية أن يُظهر أي التراخيص خامل أو ما الذي سيوفّره تغيير ما. امسح عوامل تصفية الصفوف والشرائح (ويمكن إبقاء نطاق التواريخ) لعرض القوائم.',
  'A seat is listed when its user used less than {share} of their own included credits in these dates and is either dormant (low intensity and few active days) or lapsed (no usage for {days} days or more after earlier use). New users are never listed.': 'يُدرج الترخيص عندما يستخدم صاحبه أقل من {share} من أرصدته المشمولة الخاصة في هذه التواريخ ويكون إما خاملًا (كثافة منخفضة وأيام نشاط قليلة) وإما منقطعًا (بلا استخدام طوال {days} من الأيام أو أكثر بعد استخدام سابق). ولا يُدرج المستخدمون الجدد أبدًا.',
  "This report has no seat-assignment or completions data. A seat that only uses code completions can look idle here. Check the user's last activity in GitHub before you remove a seat.": 'لا يحتوي هذا التقرير على بيانات إسناد التراخيص أو الإكمالات. قد يبدو هنا خاملًا الترخيص الذي يستخدم إكمالات الكود فقط. تحقق من آخر نشاط للمستخدم في GitHub قبل أن تزيل ترخيصًا.',
  'No seat qualifies as idle': 'لا يوجد ترخيص يصنَّف خاملًا',
  'Everyone either uses a meaningful share of their included credits, is active regularly, or is new.': 'كل المستخدمين إما يستخدمون حصة معتبرة من أرصدتهم المشمولة، أو نشطون بانتظام، أو جدد.',
  'Search idle seats': 'ابحث في التراخيص الخاملة',
  'Enterprise seats that fit Business': 'تراخيص Enterprise التي تناسب Business',
  'An Enterprise user is listed when their busiest month stayed at or below {headroom} of the Business allotment ({limit} of {allotment} of included credits), so a Business seat would still have {spare} to spare. Idle seats and new users are left out. Each move saves {saving} a month.': 'يُدرج مستخدم Enterprise عندما بقي شهره الأكثر استخدامًا عند {headroom} من حصة Business أو دونها ({limit} من {allotment} من الأرصدة المشمولة)، فيبقى لدى ترخيص Business فائض قدره {spare}. وتُستبعد التراخيص الخاملة والمستخدمون الجدد. وكل نقل يوفّر {saving} شهريًا.',
  'This report has no seat-assignment or completions data. It also cannot show which Enterprise-only features a user relies on. Check last activity and feature use in GitHub before you move a seat.': 'لا يحتوي هذا التقرير على بيانات إسناد التراخيص أو الإكمالات. كما لا يستطيع أن يُظهر أي ميزات Enterprise الحصرية يعتمد عليها المستخدم. تحقق من آخر نشاط واستخدام الميزات في GitHub قبل أن تنقل ترخيصًا.',
  'No Enterprise seat qualifies': 'لا يوجد ترخيص Enterprise مؤهل',
  'Either nobody has an Enterprise seat in this report, or every Enterprise user came close to the Business allotment in at least one month.': 'إما أنه لا أحد لديه ترخيص Enterprise في هذا التقرير، أو أن كل مستخدم Enterprise اقترب من حصة Business في شهر واحد على الأقل.',
  'Search Enterprise seats': 'ابحث في تراخيص Enterprise',
  'A seat is listed when its user is in the seat roster from Settings but never appears in the loaded files. Seat value follows the plan in the roster, or the typical seat size in the report when the roster has no plan.': 'يُدرج الترخيص عندما يكون صاحبه في قائمة التراخيص من الإعدادات لكنه لا يظهر أبدًا في الملفات المحمّلة. وتتبع قيمة الترخيص الخطة المذكورة في القائمة، أو حجم الترخيص المعتاد في التقرير عندما لا تتضمن القائمة خطة.',
  'This report has no seat-assignment or completions data. A roster seat can be missing here because its user only uses code completions, or because the loaded files do not cover every billing entity. Check last activity in GitHub before you remove the seat.': 'لا يحتوي هذا التقرير على بيانات إسناد التراخيص أو الإكمالات. قد يغيب هنا ترخيص من القائمة لأن صاحبه يستخدم إكمالات الكود فقط، أو لأن الملفات المحمّلة لا تغطي كل جهات الفوترة. تحقق من آخر نشاط في GitHub قبل أن تزيل الترخيص.',
  'No seat roster loaded': 'لم تُحمَّل قائمة تراخيص',
  'Add your seat roster in Settings to find seats that never appear in the report.': 'أضف قائمة التراخيص في الإعدادات للعثور على التراخيص التي لا تظهر أبدًا في التقرير.',
  'Every roster seat appears in the loaded files': 'كل ترخيص في القائمة يظهر في الملفات المحمّلة',
  'Search roster seats': 'ابحث في تراخيص القائمة',

  // Simulator controls and results
  'A slider no longer matches a preset.': 'لم يعد أحد المنزلقات مطابقًا لإعداد مسبق.',
  'Saves about {amount} of usage a month on its own.': 'يوفّر نحو {amount} من الاستخدام شهريًا بمفرده.',
  Assumptions: 'الافتراضات',
  'Move a slider and the result updates.': 'حرّك أحد المنزلقات وستتحدث النتيجة.',
  'Back to the Balanced preset with every seat action on': 'العودة إلى الإعداد المسبق «متوازن» مع تشغيل كل إجراءات التراخيص',
  'You changed a slider, so the values no longer match a preset.': 'غيّرت أحد المنزلقات، لذلك لم تعد القيم مطابقة لإعداد مسبق.',
  'Usage levers': 'إجراءات الاستخدام',
  'Target model for right-sizing': 'النموذج المستهدف لاختيار النموذج المناسب',
  "Usage above this multiple of the credits included with a user's seat counts as runaway. A lower multiple is a stricter limit.": 'يُعد الاستخدام الذي يتجاوز هذا المضاعف من الأرصدة المشمولة في ترخيص المستخدم استخدامًا مفرطًا. وكلما قلّ المضاعف كان الحد أشد.',
  '{seats}, {value} a month of seat value': '{seats}، {value} شهريًا من قيمة التراخيص',
  '{before} to {after} a month': 'من {before} إلى {after} شهريًا',
  'now {amount} a month': 'الآن {amount} شهريًا',
  'The share of usage that the levers avoid. It does not depend on the size of the pool.': 'حصة الاستخدام التي تتجنبها الإجراءات. ولا تتوقف على حجم الرصيد المشترك.',
  'Cost is the larger of the pool and the usage. Using less saves cash only for the part of the usage above the pool. Seat actions add to it.': 'التكلفة هي الأكبر بين الرصيد المشترك والاستخدام. وخفض الاستخدام يوفّر نقدًا فقط في الجزء الذي يتجاوز الرصيد المشترك. وتُضاف إليه إجراءات التراخيص.',
  '12 times the monthly saving': '12 ضعف الوفر الشهري',
  'Usage above the pool, per month. It is what using less can save while the number of seats stays the same.': 'الاستخدام فوق الرصيد المشترك شهريًا. وهو ما يمكن أن يوفّره خفض الاستخدام مع بقاء عدد التراخيص كما هو.',
  'now {before}, {pct} lower': 'الآن {before}، أقل بنسبة {pct}',
  'now {before}, no change': 'الآن {before}، بلا تغيير',
  'Average cost per month over the months in the report: seats plus usage above the pool.': 'متوسط التكلفة شهريًا على مدى أشهر التقرير: التراخيص مضافًا إليها الاستخدام فوق الرصيد المشترك.',
  'Included credits that are paid for but not used, per month. Using less leaves more of the pool unused, which is why usage below the pool does not lower the bill.': 'الأرصدة المشمولة المدفوعة وغير المستخدمة شهريًا. وخفض الاستخدام يترك جزءًا أكبر من الرصيد المشترك دون استخدام، ولهذا لا يخفض الاستخدام الواقع دون الرصيد المشترك الفاتورة.',
  '{seats} reclaimed or moved, per month': 'التراخيص المستردة أو المنقولة شهريًا: {seats}',
  'The monthly price of the seats the switches remove or move to Business. It lowers the pool, and saves cash only where the pool had unused credits.': 'السعر الشهري للتراخيص التي تزيلها المفاتيح أو تنقلها إلى Business. وهو يخفض الرصيد المشترك، ولا يوفّر نقدًا إلا حيث كان في الرصيد المشترك أرصدة غير مستخدمة.',
  Result: 'النتيجة',
  'Copy scenario': 'انسخ السيناريو',
  'Cash savings are not shown': 'لا تُعرض الوفورات النقدية',
  'The usage reduction does not depend on the pool, so it is still shown.': 'خفض الاستخدام لا يتوقف على الرصيد المشترك، لذلك يظل معروضًا.',
  'Cash savings come from the billed overage': 'الوفورات النقدية تأتي من التجاوز المدفوع',
  'A month that ran out of included credits shows the real pool size, and a month that did not billed nothing, so the cash effect of using less is known.': 'الشهر الذي نفدت فيه الأرصدة المشمولة يُظهر الحجم الحقيقي للرصيد المشترك، أما الشهر الذي لم تنفد فيه فلم يُدفع فيه شيء إضافي، لذلك يُعرف الأثر النقدي لخفض الاستخدام.',
  'filtered view ({filters})': 'عرض مصفّى ({filters})',
  'whole organization ({filters})': 'المؤسسة كلها ({filters})',
  'Cash savings and seat actions are not shown for a filtered view': 'لا تُعرض الوفورات النقدية وإجراءات التراخيص في العرض المصفّى',
  'Included credits are shared by the whole organization and cannot be split by a filter. The simulator still shows how much usage the levers avoid for the rows you selected.': 'الأرصدة المشمولة مشتركة بين المؤسسة كلها ولا يمكن تقسيمها بعامل تصفية. ولا يزال المحاكي يعرض مقدار الاستخدام الذي تتجنبه الإجراءات في الصفوف التي حددتها.',

  // Summary strip and plan value
  'Usage that the whole plan avoids. {reason}': 'الاستخدام الذي تتجنبه الخطة كلها. {reason}',
  'The cash saving cannot be worked out from this data.': 'لا يمكن حساب الوفر النقدي من هذه البيانات.',
  '{amount} saved per month': 'وفر {amount} شهريًا',
  'Cash, about {year} a year, on top of any seat savings, if every recommendation is followed. The plan also avoids about {usage} of usage per month.': 'نقدًا، نحو {year} سنويًا، إضافة إلى أي وفورات في التراخيص، إذا اتُّبعت كل توصية. وتتجنب الخطة أيضًا نحو {usage} من الاستخدام شهريًا.',
  'Usage stays within the included credits, so using less would not lower the bill today. The plan avoids about {usage} of usage per month, which turns into cash if usage grows past the included credits.': 'يبقى الاستخدام ضمن الأرصدة المشمولة، لذلك لن يخفض خفض الاستخدام الفاتورة اليوم. وتتجنب الخطة نحو {usage} من الاستخدام شهريًا، ويتحول ذلك إلى نقد إذا تجاوز الاستخدام الأرصدة المشمولة.',
  'Recommendations overlap, so their individual values are not added up. This figure comes from one combined plan that applies each lever once.': 'تتداخل التوصيات، لذلك لا تُجمع قيمها الفردية. يأتي هذا الرقم من خطة مجمَّعة واحدة تطبّق كل إجراء مرة واحدة.',
  '{n} that need action': plural(
    'واحدة تحتاج إلى إجراء',
    'اثنتان تحتاجان إلى إجراء',
    '{n} منها تحتاج إلى إجراء',
    '{n} منها تحتاج إلى إجراء',
    '{n} منها تحتاج إلى إجراء',
  ),
  'Nothing to act on for this period.': 'لا شيء يحتاج إلى إجراء في هذه الفترة.',
  'By theme': 'بحسب الموضوع',
  'Controls for the people who manage GitHub Copilot seats and budgets.': 'ضوابط للأشخاص الذين يديرون تراخيص GitHub Copilot والميزانيات.',
  'Habits that every GitHub Copilot user can apply in daily work.': 'عادات يستطيع كل مستخدم لـ GitHub Copilot تطبيقها في عمله اليومي.',
  'Small habit changes that most teams can adopt quickly.': 'تغييرات صغيرة في العادات تستطيع معظم الفرق اعتمادها بسرعة.',
  'The assumptions behind the plan shown on the other pages.': 'الافتراضات التي تقوم عليها الخطة المعروضة في الصفحات الأخرى.',
  'Needs steady coaching and limits that are actually enforced.': 'يحتاج إلى توجيه مستمر وحدود تُطبَّق فعلًا.',
  'Mid-tier model of the same vendor (default)': 'نموذج الفئة المتوسطة من المزوّد نفسه (الافتراضي)',

  // Scenario notes and lever descriptions
  'Included credits are shared by the whole organization and cannot be split by a filter, so cash savings are not shown for a filtered view.': 'الأرصدة المشمولة مشتركة بين المؤسسة كلها ولا يمكن تقسيمها بعامل تصفية، لذلك لا تُعرض الوفورات النقدية في العرض المصفّى.',
  'The file does not say what was billed on top of seats, so cash savings cannot be calculated.': 'لا يذكر الملف ما حوسب عليه إضافة إلى التراخيص، لذلك لا يمكن حساب الوفورات النقدية.',
  'The pool size is not known, so cash savings cannot be calculated.': 'حجم الرصيد المشترك غير معروف، لذلك لا يمكن حساب الوفورات النقدية.',
  'The included credits used are more than the seats in this file provide, so the real pool size is unknown. Add your seat roster or extra seats in Settings to see the pool, its unused credits and seat savings.': 'الأرصدة المشمولة المستخدمة أكبر مما توفره التراخيص في هذا الملف، لذلك فإن الحجم الحقيقي للرصيد المشترك غير معروف. أضف قائمة التراخيص أو التراخيص الإضافية في الإعدادات لعرض الرصيد المشترك وأرصدته غير المستخدمة ووفورات التراخيص.',
  'Seats belong to the whole organization, so they are not available for a filtered view.': 'التراخيص تخص المؤسسة كلها، لذلك لا تتوفر في العرض المصفّى.',
  'The pool is larger than the seats in the file, so seat savings cannot be sized. Add the roster or extra seats in Settings.': 'الرصيد المشترك أكبر من التراخيص الموجودة في الملف، لذلك لا يمكن تقدير وفورات التراخيص. أضف القائمة أو التراخيص الإضافية في الإعدادات.',
  'Reclaim idle seats': 'استرداد التراخيص الخاملة',
  'No idle seats were found in this period.': 'لم يُعثر على تراخيص خاملة في هذه الفترة.',
  'Move Enterprise seats to Business': 'نقل تراخيص Enterprise إلى Business',
  'No Enterprise user stays within {share} of the Business allotment.': 'لا يبقى أي مستخدم Enterprise ضمن {share} من حصة Business.',
  'Remove roster seats that never appear': 'إزالة تراخيص القائمة التي لا تظهر أبدًا',
  'No seat roster is loaded. Add it in Settings to find seats that never appear.': 'لم تُحمَّل قائمة تراخيص. أضفها في الإعدادات للعثور على التراخيص التي لا تظهر أبدًا.',
  'Every roster seat appears in the files.': 'كل ترخيص في القائمة يظهر في الملفات.',
  'The slider is at 0%.': 'المنزلق عند 0%.',
  'No Powerful-tier model usage with a cheaper target was found.': 'لم يُعثر على استخدام لنماذج الفئة القوية له نموذج مستهدف أرخص.',
  'The saving is too small to measure.': 'الوفر أصغر من أن يُقاس.',
  'There is no manual model usage left to move to Auto.': 'لم يتبقَّ استخدام بنموذج مختار يدويًا لنقله إلى Auto.',
  'No long-context surcharges were found.': 'لم يُعثر على رسوم إضافية للسياق الطويل.',
  'Nobody goes above {multiple} their included credits.': 'لا أحد يتجاوز {multiple} من أرصدته المشمولة.',
  '{pct} of Powerful-tier usage moves to {target}': 'ينتقل {pct} من استخدام الفئة القوية إلى {target}',
  '{pct} of manually chosen model usage moves to Auto': 'ينتقل {pct} من استخدام النماذج المختارة يدويًا إلى Auto',
  '{pct} of cache-write tokens become cache reads': 'يتحول {pct} من رموز الكتابة في الذاكرة المؤقتة إلى قراءات منها',
  '{pct} less input-side token usage': 'انخفاض استخدام رموز الإدخال بنسبة {pct}',
  '{pct} of long-context surcharges avoided': 'تُتجنب {pct} من رسوم السياق الطويل الإضافية',
  '{pct} of usage above {multiple} included credits avoided': 'يُتجنب {pct} من الاستخدام الذي يتجاوز {multiple} من الأرصدة المشمولة',

  // Copied scenario text
  'GitHub Copilot AI credits: what-if scenario': 'أرصدة الذكاء الاصطناعي في GitHub Copilot: سيناريو «ماذا لو»',
  'Period: {period}': 'الفترة: {period}',
  'Scope: {scope}, {users}': 'النطاق: {scope}، {users}',
  'Preset: {preset}': 'الإعداد المسبق: {preset}',
  'on, {seats}, {value} a month of seat value': 'قيد التشغيل، {seats}، {value} شهريًا من قيمة التراخيص',
  'Results, per month': 'النتائج، شهريًا',
  'Usage reduction: {pct} (usage goes from {before} to {after})': 'خفض الاستخدام: {pct} (ينتقل الاستخدام من {before} إلى {after})',
  'Cash saving: {month} a month, {year} a year': 'الوفر النقدي: {month} شهريًا، {year} سنويًا',
  'Monthly cost: {before} now, {after} after': 'التكلفة الشهرية: {before} الآن، {after} بعد التغيير',
  'Unused included credits: {before} now, {after} after': 'الأرصدة المشمولة غير المستخدمة: {before} الآن، {after} بعد التغيير',
  'Billed on top of seats: {before} now, {after} after': 'المحاسَب عليه إضافة إلى التراخيص: {before} الآن، {after} بعد التغيير',
  'Pool size, cost and unused credits: not shown. {reason}': 'حجم الرصيد المشترك والتكلفة والأرصدة غير المستخدمة: غير معروضة. {reason}',
  'Cash saving: not shown.': 'الوفر النقدي: غير معروض.',
  'Effect of each lever, in order (usage per month)': 'أثر كل إجراء بالترتيب (الاستخدام شهريًا)',
  '{lever}: -{saving} (-{alone} on its own)': '{lever}: أقل بمقدار {saving} (أقل بمقدار {alone} بمفرده)',
  'Cost is the larger of the pool of included credits and the usage. Using less saves cash only above the pool, and removing seats saves only up to the unused part of the pool.': 'التكلفة هي الأكبر بين الرصيد المشترك من الأرصدة المشمولة والاستخدام. وخفض الاستخدام يوفّر نقدًا فقط فيما يتجاوز الرصيد المشترك، وإزالة التراخيص توفّر فقط بقدر الجزء غير المستخدم منه.',
  'The levers are applied one after the other, so they do not double count.': 'تُطبَّق الإجراءات واحدًا بعد الآخر، لذلك لا تُحتسب مرتين.',
  'Cash savings come from the overage that was billed: a month that ran out of included credits shows the real pool size, and a month that did not billed nothing.': 'الوفورات النقدية تأتي من التجاوز المدفوع: الشهر الذي نفدت فيه الأرصدة المشمولة يُظهر الحجم الحقيقي للرصيد المشترك، أما الشهر الذي لم تنفد فيه فلم يُدفع فيه شيء إضافي.',
  'The pool size counts only the seats that appear in the report, so cash figures are a rough guide.': 'يحتسب حجم الرصيد المشترك فقط التراخيص الظاهرة في التقرير، لذلك فالأرقام النقدية تقريبية.',
  'These are estimates from past usage, not a forecast.': 'هذه تقديرات مبنية على الاستخدام السابق، وليست توقعًا.',

  // Seat list columns and seat economics advice
  'Usage in the selected dates': 'الاستخدام في التواريخ المحددة',
  "Usage as a share of the user's own included credits": 'الاستخدام كحصة من الأرصدة المشمولة الخاصة بالمستخدم',
  'Last day with usage in the loaded files. Completions are not in the report.': 'آخر يوم فيه استخدام في الملفات المحمّلة. والإكمالات ليست في التقرير.',
  'Days between the last usage and the end of the selected dates': 'الأيام بين آخر استخدام ونهاية التواريخ المحددة',
  'Seat value (USD)': 'قيمة الترخيص (بالدولار)',
  'Highest usage in any single month': 'أعلى استخدام في أي شهر واحد',
  'Busiest month (USD)': 'الشهر الأكثر استخدامًا (بالدولار)',
  'Busiest month as a share of the {allotment} of included credits in a Business seat': 'الشهر الأكثر استخدامًا كحصة من {allotment} من الأرصدة المشمولة في ترخيص Business',
  'Saving (USD)': 'الوفر (بالدولار)',
  'Enterprise price minus Business price, per month': 'سعر Enterprise ناقص سعر Business، شهريًا',
  'You pay for whichever is larger, the pool or your usage. A seat is only worth removing while the pool has unused included credits, and using less saves cash only once usage is above the pool.': 'تدفع الأكبر بين الرصيد المشترك واستخدامك. ولا تستحق إزالة الترخيص العناء إلا ما دام في الرصيد المشترك أرصدة مشمولة غير مستخدمة، ولا يوفّر خفض الاستخدام نقدًا إلا عندما يتجاوز الاستخدام الرصيد المشترك.',
  'On average {unused} of included credits go unused and {overage} is billed on top of seats each month. Months differ, so check the month table in the simulator before you change seats.': 'في المتوسط يبقى {unused} من الأرصدة المشمولة دون استخدام ويُحاسَب {overage} إضافة إلى التراخيص كل شهر. وتختلف الأشهر، لذلك راجع جدول الأشهر في المحاكي قبل تغيير التراخيص.',
  'About {unused} of included credits go unused each month. That is the most that removing seats can save. Using less would not lower the bill while usage stays below the pool.': 'يبقى نحو {unused} من الأرصدة المشمولة دون استخدام كل شهر. وهذا أقصى ما يمكن أن توفّره إزالة التراخيص. ولن يخفض خفض الاستخدام الفاتورة ما دام الاستخدام دون الرصيد المشترك.',
  'Usage is above the pool and about {overage} a month is billed on top of seats. Using less lowers the bill directly. Removing seats would not, because the included credits they carry would turn into billed usage.': 'الاستخدام فوق الرصيد المشترك ويُحاسَب نحو {overage} شهريًا إضافة إلى التراخيص. وخفض الاستخدام يخفض الفاتورة مباشرة. أما إزالة التراخيص فلن تفعل ذلك، لأن الأرصدة المشمولة التي تحملها ستتحول إلى استخدام يُحاسَب عليه.',
  'Usage is almost exactly the size of the pool, so fewer seats or less usage saves cash only when it is combined with the other.': 'الاستخدام يكاد يساوي حجم الرصيد المشترك تمامًا، لذلك لا يوفّر تقليل التراخيص أو خفض الاستخدام نقدًا إلا إذا اقترن بالآخر.',

  // Themes, audiences and rule titles
  Cost: 'التكلفة',
  Adoption: 'التبنّي',
  Governance: 'الحوكمة',
  'Data quality': 'جودة البيانات',
  Management: 'الإدارة',
  Admins: 'المشرفون',
  'The shared pool runs out before month end': 'ينفد الرصيد المشترك قبل نهاية الشهر',
  'The shared pool is on track to run out': 'الرصيد المشترك في طريقه إلى النفاد',
  'The file is missing columns the analysis relies on': 'الملف ينقصه أعمدة يعتمد عليها التحليل',
  'How to read these numbers': 'كيف تقرأ هذه الأرقام',

  // Executive summary export
  '; ': '؛ ',
  Metric: 'المقياس',
  Value: 'القيمة',
  Note: 'ملاحظة',
  'seat value': 'قيمة التراخيص',

  // Simulator waterfall, month table and controls
  'Where the usage reduction comes from': 'من أين يأتي خفض الاستخدام',
  'Usage now': 'الاستخدام الآن',
  'no effect': 'بلا أثر',
  'Usage after': 'الاستخدام بعد التغيير',
  'Right-sizing detail': 'تفاصيل اختيار النموذج المناسب',
  'Same work costs': 'تكلفة العمل نفسه',
  'New usage': 'الاستخدام الجديد',
  'New pool': 'الرصيد المشترك الجديد',
  'New cost': 'التكلفة الجديدة',
  'New billed': 'المدفوع الإضافي الجديد',
  Saving: 'الوفر',
  projected: 'مُسقَط',
  'Projected months are included in the total and the average.': 'الأشهر المُسقَطة مشمولة في الإجمالي والمتوسط.',
  Custom: 'مخصص',
  'No measurable effect in this data.': 'لا أثر قابلًا للقياس في هذه البيانات.',
  Preset: 'الإعداد المسبق',
  'Move Powerful-tier usage to': 'انقل استخدام الفئة القوية إلى',
  'Cap level': 'مستوى الحد الأقصى',
  'Seat actions': 'إجراءات التراخيص',
  'Usage per month once the levers are applied.': 'الاستخدام شهريًا بعد تطبيق الإجراءات.',
  'Cash saving per year': 'الوفر النقدي سنويًا',
  'New monthly cost': 'التكلفة الشهرية الجديدة',
  'Seat value removed': 'قيمة التراخيص المزالة',
  'no seat action is on': 'لا يوجد إجراء تراخيص قيد التشغيل',
  'not available': 'غير متاح',
  on: 'قيد التشغيل',
  off: 'متوقف',
  'whole organization': 'المؤسسة كلها',
  Conservative: 'متحفظ',
  Ambitious: 'طموح',
  'the mid-tier model of the same vendor': 'نموذج الفئة المتوسطة من المزوّد نفسه',
  Notes: 'ملاحظات',

  // Plan, filters and summary strip
  'No dollar value': 'بلا قيمة بالدولار',
  '30/60/90-day plan': 'خطة 30/60/90 يومًا',
  'First 30 days': 'أول 30 يومًا',
  'Days 31 to 60': 'الأيام من 31 إلى 60',
  'Days 61 to 90': 'الأيام من 61 إلى 90',
  'Sort by severity': 'الترتيب بحسب الخطورة',
  'Sort by impact': 'الترتيب بحسب الأثر',
  'Sort by confidence': 'الترتيب بحسب الثقة',
  'Hide positive findings': 'إخفاء النتائج الإيجابية',
  Severity: 'الخطورة',
  'No cash saving yet': 'لا وفر نقديًا بعد',
  'Combined value of the plan': 'القيمة المجمَّعة للخطة',
  'Recommendations by severity': 'التوصيات بحسب الخطورة',
  'Recommendations by theme': 'التوصيات بحسب الموضوع',

  // Seats tab
  'every roster seat appears': 'كل ترخيص في القائمة يظهر',
  'no seat roster loaded': 'لم تُحمَّل قائمة تراخيص',
  'Seats in the report': 'التراخيص في التقرير',
  'Seat value per month': 'قيمة التراخيص شهريًا',
  'one month': 'شهر واحد',
  'Share of the pool used': 'حصة الرصيد المشترك المستخدمة',
  'Unused included credits': 'الأرصدة المشمولة غير المستخدمة',
  'Idle seats': 'التراخيص الخاملة',
  'Roster seats that never appear': 'تراخيص القائمة التي لا تظهر أبدًا',
  'Seat value': 'قيمة الترخيص',
  'Busiest month': 'الشهر الأكثر استخدامًا',
  'Share of Business allotment': 'النسبة من حصة Business',
};

export default arabic;
