import type { Dict } from '../core';

/** Arabic for the metric docs of the Usage and pool page in `lib/metrics/docs/spend.ts`. */
const arabic: Dict = {
  // Average per day
  'The average value of the AI credits used on one calendar day of the selected period.':
    'متوسط قيمة أرصدة الذكاء الاصطناعي المستخدمة في يوم تقويمي واحد من الفترة المحددة.',
  'Average per day = usage ÷ days in the period': 'المتوسط اليومي = الاستخدام ÷ عدد أيام الفترة',
  'Usage is the total of gross_amount in the period. Every calendar day of the period counts, including weekends and days without usage.':
    'الاستخدام هو مجموع gross_amount في الفترة. ويُحتسب كل يوم تقويمي في الفترة، بما في ذلك عطلات نهاية الأسبوع والأيام التي لا استخدام فيها.',
  'The line under the number is the average × 30.4375 (the average number of days in a month), rounded to whole dollars. A period shorter than 7 days shows its number of days instead.':
    'السطر أسفل الرقم هو المتوسط × 30.4375 (متوسط عدد أيام الشهر)، مقرّبًا إلى أقرب دولار. والفترة الأقصر من 7 أيام تعرض عدد أيامها بدلًا من ذلك.',
  'The Peak day card divides the peak day by this average and shows it as "N× the daily average". It is left out for a period of one day and for an average of $0.':
    'تقسم بطاقة «يوم الذروة» استخدام يوم الذروة على هذا المتوسط وتعرضه بصيغة «N× المتوسط اليومي». ولا يظهر ذلك لفترة من يوم واحد ولا لمتوسط قدره $0.',
  'It follows the filters and the selected dates.': 'يتبع عوامل التصفية والتواريخ المحددة.',
  'The Month by month table on the Patterns page shows usage per active day instead, which leaves out the days without usage.':
    'يعرض جدول «شهرًا بشهر» في صفحة «أنماط الاستخدام» الاستخدام لكل يوم نشط بدلًا من ذلك، فيستبعد الأيام التي لا استخدام فيها.',
  '$3,000 over 30 days is $100 a day, or about $3,044 a month. A peak day of $400 is 4.0× the daily average.':
    '$3,000 على مدى 30 يومًا تساوي $100 في اليوم، أو نحو $3,044 في الشهر. ويوم ذروة قدره $400 يساوي 4.0× المتوسط اليومي.',

  // Billed share
  'The part of the usage that was billed on top of seats. The rest of the usage was covered by the included credits.':
    'جزء الاستخدام الذي دُفع إضافيًا فوق التراخيص. أما باقي الاستخدام فقد غطته الأرصدة المشمولة.',
  'Billed share = billed ÷ usage': 'نسبة المدفوع إضافيًا = المدفوع إضافيًا ÷ الاستخدام',
  'Billed is the total of net_amount and usage is the total of gross_amount, both for the whole selected period.':
    'المدفوع إضافيًا هو مجموع net_amount، والاستخدام هو مجموع gross_amount، وكلاهما للفترة المحددة كاملة.',
  'The line under the number is the covered share, which is 1 − the billed share, as a whole percent.':
    'السطر أسفل الرقم هو نسبة المشمول بالخطة، أي 1 − نسبة المدفوع إضافيًا، كنسبة مئوية دون كسور.',
  'A dash appears when the period has no usage, and when the file does not say what was billed.':
    'تظهر شرطة عندما لا يكون في الفترة استخدام، وعندما لا يذكر الملف ما دُفع إضافيًا.',
  'With a filter on, it is the billed share of the selected rows only.': 'عند تفعيل عامل تصفية، تكون النسبة للصفوف المحددة فقط.',
  '$1,800 billed out of $9,000 of usage is 20%. The other 80% was covered.':
    'دفع $1,800 إضافيًا من استخدام قدره $9,000 يساوي 20%. أما الـ 80% الباقية فكانت مشمولة بالخطة.',

  // Months the pool ran out
  'In how many of the months with usage the included credits ran out, so that usage was billed on top of seats.':
    'في كم شهر من الأشهر التي فيها استخدام نفدت الأرصدة المشمولة، فدُفع الاستخدام إضافيًا فوق التراخيص.',
  'Months the pool ran out = months with a billed amount above $0, out of months with usage':
    'الأشهر التي نفد فيها الرصيد المشترك = الأشهر التي فيها مبلغ مدفوع إضافيًا أكبر من $0، من بين الأشهر التي فيها استخدام',
  'A month counts when it has a day with a billed amount above $0 (the day the pool ran out).':
    'يُحتسب الشهر إذا كان فيه يوم بمبلغ مدفوع إضافيًا أكبر من $0 (يوم نفاد الرصيد المشترك).',
  'The number is shown as "N of M", where M is the number of months that have usage rows in the period.':
    'يظهر الرقم بصيغة «N من M»، حيث M عدد الأشهر التي فيها صفوف استخدام في الفترة.',
  'It follows the billed amount, not the pool size.': 'يعتمد على المبلغ المدفوع إضافيًا، لا على حجم الرصيد المشترك.',
  'A month in progress counts as soon as billing has begun. Months without usage rows are not counted.':
    'يُحتسب الشهر الجاري بمجرد بدء الدفع الإضافي. ولا تُحتسب الأشهر التي ليس فيها صفوف استخدام.',
  'The card is hidden in a filtered view and when the pool size is unknown.':
    'تُخفى البطاقة في العرض المُصفّى وعندما يكون حجم الرصيد المشترك غير معروف.',
  'March, April and May have usage. Billing began on 21 March and on 6 May, and April stayed inside the pool, so the card shows 2 of 3.':
    'في مارس وأبريل ومايو استخدام. بدأ الدفع الإضافي في 21 مارس وفي 6 مايو، وبقي أبريل ضمن الرصيد المشترك، فتعرض البطاقة 2 من 3.',

  // Cost per month
  'What one month costs on average when a seat is priced at the value of its credits: the whole pool is paid for, and usage above the pool is billed on top.':
    'كم يكلّف الشهر الواحد في المتوسط عندما يُسعَّر الترخيص بقيمة أرصدته: يُدفع ثمن الرصيد المشترك كاملًا، ويُدفع الاستخدام الذي يتجاوزه إضافيًا.',
  'Cost per month = average of max(pool size, usage) over the months': 'التكلفة في الشهر = متوسط max(حجم الرصيد المشترك، الاستخدام) على الأشهر',
  'For each month with usage rows, the monthly cost is the larger of its pool size and its usage (see Monthly cost).':
    'لكل شهر فيه صفوف استخدام، التكلفة الشهرية هي الأكبر بين حجم رصيده المشترك واستخدامه (انظر «التكلفة الشهرية»).',
  'The cost per month is the average of those monthly costs.': 'التكلفة في الشهر هي متوسط هذه التكاليف الشهرية.',
  'The line under the number splits it into seats, the average pool size, and overage, the average of max(0, usage − pool size).':
    'يقسم السطر أسفل الرقم التكلفة إلى التراخيص، أي متوسط حجم الرصيد المشترك، والتجاوز، أي متوسط max(0، الاستخدام − حجم الرصيد المشترك).',
  'A dash appears when the pool size of any month is unknown: the file has no seat sizes or does not say what was billed, or the covered credits are above the seats the file shows.':
    'تظهر شرطة إذا كان حجم الرصيد المشترك لأي شهر غير معروف: لأن الملف ليس فيه أحجام التراخيص أو لا يذكر ما دُفع إضافيًا، أو لأن الأرصدة المشمولة المستخدمة تتجاوز التراخيص التي يعرضها الملف.',
  'A month in progress counts its usage so far, and a month cut by the selected dates counts only the days inside them, so the overage of such a month can be understated.':
    'يحتسب الشهر الجاري استخدامه حتى الآن، ويحتسب الشهر الذي تقطعه التواريخ المحددة الأيام الواقعة داخلها فقط، لذا قد يظهر التجاوز في مثل هذا الشهر أقل من حقيقته.',
  'Months without usage rows are not counted. The card is hidden in a filtered view.':
    'لا تُحتسب الأشهر التي ليس فيها صفوف استخدام. وتُخفى البطاقة في العرض المُصفّى.',
  'Two months with a pool of $9,600 each. Usage is $8,000 and $10,500, so the monthly costs are $9,600 and $10,500. The average is $10,050: $9,600 of seats plus $450 of overage.':
    'شهران رصيد كل منهما المشترك $9,600. الاستخدام $8,000 و$10,500، فالتكلفتان الشهريتان $9,600 و$10,500. والمتوسط $10,050: ‏$9,600 للتراخيص و$450 للتجاوز.',

  // Budget used
  'How much of the monthly budget for the billed amount the latest month has used.':
    'كم استهلك آخر شهر من الميزانية الشهرية المخصصة للمبلغ المدفوع إضافيًا.',
  'Budget used = billed in the latest month ÷ monthly budget': 'نسبة استخدام الميزانية = المدفوع إضافيًا في آخر شهر ÷ الميزانية الشهرية',
  'The monthly budget is the amount you enter in Settings. When Settings has none, it is the AI credit budget of your enterprise or organization from the GitHub data file. Only the billed amount counts against it. Seat fees are not part of it.':
    'الميزانية الشهرية هي المبلغ الذي تُدخله في الإعدادات. وإن لم تُحدَّد فيها، فهي ميزانية أرصدة الذكاء الاصطناعي لـ Enterprise أو المؤسسة من ملف بيانات GitHub. ولا يُحتسب منها إلا المبلغ المدفوع إضافيًا، فرسوم التراخيص ليست جزءًا منها.',
  'The latest month is the last month with usage rows in the selected period. A month in progress counts what was billed so far, and a month cut by the selected dates counts only what was billed inside them.':
    'آخر شهر هو آخر شهر فيه صفوف استخدام في الفترة المحددة. يحتسب الشهر الجاري ما دُفع إضافيًا حتى الآن، ويحتسب الشهر الذي تقطعه التواريخ المحددة ما دُفع داخلها فقط.',
  'The bar is green below 80%, amber from 80% and red from 100%. The color follows the worse of the share used now and the share projected for the end of the month.':
    'يكون الشريط أخضر تحت 80%، وكهرمانيًا من 80%، وأحمر من 100%. ويتبع اللون الأسوأ بين النسبة المستخدمة الآن والنسبة المتوقعة في نهاية الشهر.',
  'For a month in progress, the lighter part of the bar is the projected rest of the month, and "Projected at month end" is the projected billed amount (see Projected month total).':
    'في الشهر الجاري، الجزء الأفتح من الشريط هو المتوقع لبقية الشهر، و«المتوقع في نهاية الشهر» هو المبلغ المدفوع إضافيًا المتوقع (انظر «إجمالي الشهر المتوقع»).',
  'A finished month shows Budget left, or Over budget by when more than the budget was billed.':
    'يعرض الشهر المنتهي «المتبقي من الميزانية»، أو «تجاوز الميزانية بمقدار» إذا دُفع إضافيًا أكثر من الميزانية.',
  'The share can go above 100%.': 'قد تتجاوز النسبة 100%.',
  'A budget applies to the whole bill. In a filtered view the card shows a notice instead of the figures, and the Budget used card at the top is hidden.':
    'تنطبق الميزانية على الفاتورة كلها. في العرض المُصفّى تعرض البطاقة تنبيهًا بدل الأرقام، وتُخفى بطاقة «نسبة استخدام الميزانية» في الأعلى.',
  'When the file does not say what was billed, the card says so instead of showing 0%, and the Budget used card at the top is hidden.':
    'إذا لم يذكر الملف ما دُفع إضافيًا، تقول البطاقة ذلك بدل أن تعرض 0%، وتُخفى بطاقة «نسبة استخدام الميزانية» في الأعلى.',
  'The budget is only used for this comparison in the app. It does not set or change a budget in GitHub.':
    'تُستخدم الميزانية لهذه المقارنة داخل التطبيق فقط، ولا تضبط ميزانية في GitHub ولا تغيّرها.',
  'A budget of $2,000 and $500 billed so far is 25% used. If $1,700 is projected for the month end, the bar turns amber at 85% although only 25% is used so far.':
    'ميزانية قدرها $2,000 دُفع منها $500 حتى الآن تعني استخدام 25%. وإذا كان المتوقع في نهاية الشهر $1,700، يصبح الشريط كهرمانيًا عند 85% مع أن المستخدم حتى الآن 25% فقط.',

  // Budget used up on
  'The day on which the billed amount of the month is expected to reach the monthly budget.':
    'اليوم الذي يُتوقع أن يبلغ فيه المبلغ المدفوع إضافيًا في الشهر الميزانيةَ الشهرية.',
  'Budget used up on = last day with data + ceil((budget − billed so far) ÷ daily rate)':
    'تاريخ نفاد الميزانية = آخر يوم فيه بيانات + ceil((الميزانية − المدفوع إضافيًا حتى الآن) ÷ المعدل اليومي)',
  'The daily rate is the average of the month-to-date usage rate and the usage rate of the last 7 days (see Projected month total).':
    'المعدل اليومي هو متوسط معدل الاستخدام منذ بداية الشهر ومعدل الاستخدام في آخر 7 أيام (انظر «إجمالي الشهر المتوقع»).',
  'When the pool already ran out, every further day is billed in full, and the formula above gives the day. A day after the end of the month is not shown.':
    'إذا كان الرصيد المشترك قد نفد، يُدفع كل يوم لاحق إضافيًا بالكامل، وتعطي المعادلة أعلاه اليوم. ولا يُعرض يوم بعد نهاية الشهر.',
  'When the pool has not run out, the day is the expected run-out day + ceil(budget ÷ daily rate), and never later than the last day of the month. It is shown only when the projected billed amount reaches the budget.':
    'إذا لم ينفد الرصيد المشترك، يكون اليوم هو يوم النفاد المتوقع + ceil(الميزانية ÷ المعدل اليومي)، ولا يتجاوز آخر يوم في الشهر. ولا يُعرض إلا إذا بلغ المبلغ المدفوع إضافيًا المتوقع الميزانية.',
  'In every other case the card says that the budget is not expected to be used up this month, or that the day is not known.':
    'وفي كل الحالات الأخرى تقول البطاقة إن الميزانية لا يُتوقع أن تنفد هذا الشهر، أو إن اليوم غير معروف.',
  'It is shown for a month in progress only. When the billed amount is already at or above the budget, the card says that the budget is reached.':
    'يُعرض للشهر الجاري فقط. وإذا كان المبلغ المدفوع إضافيًا قد بلغ الميزانية أو تجاوزها، تقول البطاقة إن الميزانية بُلغت.',
  'When the pool has not run out and its size is unknown, the day is not known.':
    'إذا لم ينفد الرصيد المشترك وكان حجمه غير معروف، فاليوم غير معروف.',
  'Every day counts the same, so it is a trend and not a commitment.': 'تُحتسب كل الأيام بالتساوي، لذا فهو اتجاه وليس التزامًا.',
  'A budget of $2,000 with $500 billed and a pool that already ran out. The daily rate is $300, so (2,000 − 500) ÷ 300 = 5 days. With data up to 12 June, the budget is used up on 17 June.':
    'ميزانية قدرها $2,000 دُفع منها $500، والرصيد المشترك قد نفد. المعدل اليومي $300، إذن (2,000 − 500) ÷ 300 = 5 أيام. ومع بيانات حتى 12 يونيو، تنفد الميزانية في 17 يونيو.',

  // Included credits, month by month
  'How the usage of one month builds up day by day against the included credits of that month, and the day the pool ran out.':
    'كيف يتراكم استخدام شهر واحد يومًا بعد يوم مقابل الأرصدة المشمولة في ذلك الشهر، واليوم الذي نفد فيه الرصيد المشترك.',
  'Usage so far on a day = total of gross_amount from the first selected day of the month up to that day':
    'الاستخدام حتى الآن في يوم ما = مجموع gross_amount من أول يوم محدد في الشهر حتى ذلك اليوم',
  'The stacked areas split the usage so far into the covered part (total of discount_amount) and the billed part (total of net_amount). A file that does not say what was billed shows one "Usage so far" area instead.':
    'تقسم المساحات المكدسة الاستخدام حتى الآن إلى الجزء المشمول بالخطة (مجموع discount_amount) والجزء المدفوع إضافيًا (مجموع net_amount). والملف الذي لا يذكر ما دُفع إضافيًا يعرض مساحة واحدة باسم «الاستخدام حتى الآن» بدلًا من ذلك.',
  'The dashed line "Included credits" is the pool size of the month. It is drawn only when the pool size is known, and a star after the amount means it may be a lower bound.':
    'الخط المتقطع «الأرصدة المشمولة» هو حجم الرصيد المشترك للشهر. لا يُرسم إلا إذا كان حجم الرصيد المشترك معروفًا، والنجمة بعد المبلغ تعني أنه قد يكون حدًا أدنى.',
  'A marker on the first day with a billed amount reads "Ran out {date}" when the pool size is known and "Billing began {date}" when it is not.':
    'تظهر على أول يوم فيه مبلغ مدفوع إضافيًا علامة نصها «نفد في {date}» إذا كان حجم الرصيد المشترك معروفًا، و«بدأ الدفع الإضافي في {date}» إذا لم يكن معروفًا.',
  'For a month in progress, a dashed "Projected usage" line runs to the end of the month inside a "Likely range" band. An "Expected to run out {date}" marker appears when the pool is expected to run out inside the month (see Projected month total).':
    'في الشهر الجاري، يمتد خط متقطع باسم «الاستخدام المتوقع» حتى نهاية الشهر داخل شريط «النطاق المرجّح». وتظهر علامة «يُتوقع النفاد في {date}» إذا كان يُتوقع أن ينفد الرصيد المشترك خلال الشهر (انظر «إجمالي الشهر المتوقع»).',
  'The list under the chart restates the month in words. It also names how many users used more than the credits of their own seat, and by how much together.':
    'تعيد القائمة أسفل المخطط وصف الشهر بالكلمات. وتذكر أيضًا عدد المستخدمين الذين استخدموا أكثر من أرصدة تراخيصهم، ومقدار ذلك مجتمعًا.',
  'The month picker lists only months that have usage rows.': 'لا يعرض منتقي الشهر إلا الأشهر التي فيها صفوف استخدام.',
  'In a filtered view the chart has no pool line and no run-out marker. The list under it then gives only the usage, covered and billed amounts of the selected rows and the projection, because the pool belongs to the whole organization.':
    'في العرض المُصفّى لا يظهر في المخطط خط الرصيد المشترك ولا علامة النفاد. وتذكر القائمة أسفله حينها مبالغ الاستخدام والمشمول بالخطة والمدفوع إضافيًا للصفوف المحددة والتوقع فقط، لأن الرصيد المشترك يخص المؤسسة كلها.',
  'The line about users above the credits of their own seat needs seat sizes in the file, and it is left out in a filtered view.':
    'يحتاج السطر الخاص بالمستخدمين الذين تجاوزوا أرصدة تراخيصهم إلى أحجام التراخيص في الملف، ولا يظهر في العرض المُصفّى.',
  'A month cut by the selected dates is understated. Only a month in progress has a projection.':
    'الشهر الذي تقطعه التواريخ المحددة تظهر أرقامه أقل من حقيقتها. ولا يوجد توقع إلا للشهر الجاري.',
  'A pool of $9,600. The usage so far passes $9,600 on 18 May, so the marker reads "Ran out 18 May" and the billed area starts there.':
    'رصيد مشترك قدره $9,600. يتجاوز الاستخدام حتى الآن $9,600 في 18 مايو، فتظهر العلامة «نفد في 18 مايو» وتبدأ مساحة المدفوع إضافيًا من هناك.',

  // Usage and pool by month
  'One row for each calendar month with usage in the selected period: its usage, the covered and billed parts, the included credits and the people behind it. The last row is the total.':
    'صف لكل شهر تقويمي فيه استخدام في الفترة المحددة: استخدامه، والجزءان المشمول بالخطة والمدفوع إضافيًا، والأرصدة المشمولة، والأشخاص الذين يقفون وراءه. والصف الأخير هو الإجمالي.',
  'Each row = totals of gross_amount, discount_amount and net_amount of one calendar month':
    'كل صف = مجاميع gross_amount وdiscount_amount وnet_amount لشهر تقويمي واحد',
  'A month is labeled "so far" while it is in progress, and "partial" when the selected dates cut into it.':
    'يُوسم الشهر بـ«حتى الآن» ما دام جاريًا، وبـ«جزئي» إذا قطعته التواريخ المحددة.',
  'Usage, Covered and Billed are the totals of gross_amount, discount_amount and net_amount in the month.':
    '«الاستخدام» و«مشمول بالخطة» و«مدفوع إضافي» هي مجاميع gross_amount وdiscount_amount وnet_amount في الشهر.',
  'Pool size, Included credits used and Included credits left come from the pool of the month. Monthly cost = max(pool size, usage).':
    '«حجم الرصيد المشترك» و«نسبة استخدام الأرصدة المشمولة» و«الأرصدة المشمولة المتبقية» تأتي من الرصيد المشترك للشهر. التكلفة الشهرية = max(حجم الرصيد المشترك، الاستخدام).',
  'Ran out on shows the day billing began. "Lasted" means the pool lasted to the end of the month, "Expected {date}" is the forecast for a month in progress, and "Not yet" means the pool has not run out so far. A dash means the pool size is not known and nothing was billed.':
    '«تاريخ النفاد» يعرض اليوم الذي بدأ فيه الدفع الإضافي. «كفى حتى النهاية» تعني أن الرصيد المشترك كفى حتى نهاية الشهر، و«متوقع في {date}» هو التوقع للشهر الجاري، و«ليس بعد» تعني أن الرصيد المشترك لم ينفد حتى الآن. والشرطة تعني أن حجم الرصيد المشترك غير معروف ولم يُدفع شيء إضافي.',
  'Active users counts the named users whose usage in the month is above $0, and Usage per user is their usage divided by that count. Projected usage is shown for a month in progress.':
    '«المستخدمون النشطون» يعدّ المستخدمين المعروفين بالاسم الذين يزيد استخدامهم في الشهر على $0، و«الاستخدام لكل مستخدم» هو استخدامهم مقسومًا على هذا العدد. ويظهر «الاستخدام المتوقع» للشهر الجاري.',
  'The total row adds up Usage, Covered and Billed. Pool size and Monthly cost are added only when every month has a known pool size, and Included credits used = total covered ÷ total pool size. Ran out on reads "N of M" months. Active users counts every named user with at least one row in the period once, so it is not the sum of the months.':
    'يجمع صف الإجمالي «الاستخدام» و«مشمول بالخطة» و«مدفوع إضافي». ولا يُجمع «حجم الرصيد المشترك» و«التكلفة الشهرية» إلا إذا كان حجم الرصيد المشترك معروفًا لكل شهر، و«نسبة استخدام الأرصدة المشمولة» = إجمالي المشمول بالخطة ÷ إجمالي حجم الرصيد المشترك. ويعرض «تاريخ النفاد» «N من M» من الأشهر. ويعدّ «المستخدمون النشطون» كل مستخدم معروف بالاسم له صف واحد على الأقل في الفترة مرة واحدة، لذا فهو ليس مجموع الأشهر.',
  'The token columns are hidden at first. Open the Columns menu to show them, and they are part of the CSV export once shown. Their total row adds up the months, and Cache hit rate = cache read ÷ (input + cache read + cache write).':
    'أعمدة الرموز مخفية في البداية. افتح قائمة «الأعمدة» لإظهارها، فتصبح جزءًا من تصدير CSV بعد إظهارها. ويجمع صف الإجمالي فيها الأشهر، و«نسبة القراءة من الذاكرة المؤقتة» = القراءة من الذاكرة المؤقتة ÷ (الإدخال + القراءة من الذاكرة المؤقتة + الكتابة فيها).',
  'The pool columns are hidden in a filtered view and when no month has a known pool size. A month whose pool size is not known shows a dash in them. Covered, Billed and Ran out on are hidden when the file does not say what was billed.':
    'تُخفى أعمدة الرصيد المشترك في العرض المُصفّى وعندما لا يكون حجم الرصيد المشترك معروفًا لأي شهر. والشهر الذي لا يُعرف حجم رصيده المشترك تظهر فيه شرطة. وتُخفى أعمدة «مشمول بالخطة» و«مدفوع إضافي» و«تاريخ النفاد» إذا لم يذكر الملف ما دُفع إضافيًا.',
  'The token columns show a dash when the file has no token columns.': 'تعرض أعمدة الرموز شرطة إذا لم يكن في الملف أعمدة رموز.',
  'Months without any usage rows are listed in a note under the table. A star after a pool size means it may be a lower bound.':
    'تُذكر الأشهر التي ليس فيها أي صفوف استخدام في ملاحظة أسفل الجدول. والنجمة بعد حجم الرصيد المشترك تعني أنه قد يكون حدًا أدنى.',
  'Click a row to chart that month. A month in progress or cut by the selected dates is understated.':
    'انقر على صف لعرض ذلك الشهر في المخطط. والشهر الجاري أو الذي تقطعه التواريخ المحددة تظهر أرقامه أقل من حقيقتها.',
  'A month with $9,000 of usage, all covered, in a pool of $9,600: Included credits used 94%, Included credits left $600 and Monthly cost $9,600.':
    'شهر استخدامه $9,000، كله مشمول بالخطة، ورصيده المشترك $9,600: نسبة استخدام الأرصدة المشمولة 94%، والأرصدة المشمولة المتبقية $600، والتكلفة الشهرية $9,600.',

  // Biggest cost drivers
  'The groups that account for the most usage, or for the most billed amount, as a ranked bar chart.':
    'المجموعات صاحبة أكبر استخدام، أو أكبر مبلغ مدفوع إضافيًا، في مخطط أعمدة مرتب.',
  'Bar = total of gross_amount (Usage) or net_amount (Billed) of the group':
    'العمود = مجموع gross_amount (الاستخدام) أو net_amount (المدفوع إضافيًا) للمجموعة',
  'Rank by Product, SKU, Model tier or Vendor, and measure Usage or Billed.':
    'رتّب حسب المنتج أو SKU أو فئة النموذج أو المزوّد، واختر المقياس: الاستخدام أو المدفوع إضافيًا.',
  'Groups with $0.005 or less of the chosen measure are left out. Up to 11 groups are listed as they are. With more, the 10 largest are listed and the rest are added up as "Other (n)", where n is how many groups were added.':
    'تُستبعد المجموعات التي لها $0.005 أو أقل من المقياس المختار. وتُعرض حتى 11 مجموعة كما هي. وإذا زادت، تُعرض أكبر 10 مجموعات وتُجمع البقية في «أخرى (n)»، حيث n عدد المجموعات المجمّعة.',
  'The tooltip shows the usage, covered and billed amounts of the group. Its percentage is the share of the total of the chosen measure over the whole period, not of the groups on the chart.':
    'يعرض التلميح مبالغ الاستخدام والمشمول بالخطة والمدفوع إضافيًا للمجموعة. ونسبته المئوية هي الحصة من إجمالي المقياس المختار في الفترة كلها، لا من المجموعات الظاهرة في المخطط.',
  'The sentence under the chart names the largest group and its share.': 'تذكر الجملة أسفل المخطط أكبر مجموعة وحصتها.',
  'A click on a bar keeps only that group, on top of any filter that is already set. "Other" cannot be clicked.':
    'النقر على عمود يُبقي تلك المجموعة فقط، إضافةً إلى أي عامل تصفية مضبوط مسبقًا. ولا يمكن النقر على «أخرى».',
  'The model tier comes from the price card or from a model override in Settings, and a model that is on neither is Unknown. The vendor comes from the same places. For a model that is not on the card, it is read from the model name, and "Other" is used when the name is not recognized.':
    'تأتي فئة النموذج من بطاقة الأسعار أو من تخصيص للنموذج في الإعدادات، والنموذج غير الموجود في أي منهما فئته «غير معروف». ويأتي المزوّد من المصدرين نفسيهما. أما النموذج غير الموجود في البطاقة فيُقرأ مزوّده من اسمه، ويُستخدم «أخرى» إذا لم يُتعرّف على الاسم.',
  'The Billed measure is hidden when the file does not say what was billed, and the tooltip then shows only the usage.':
    'يُخفى مقياس «المدفوع إضافيًا» إذا لم يذكر الملف ما دُفع إضافيًا، ولا يعرض التلميح حينها إلا الاستخدام.',
  '$10,000 of usage, of which Product A has $6,000 and Product B $4,000. The bars show 60% and 40%.':
    'استخدام قدره $10,000، منه $6,000 للمنتج A و$4,000 للمنتج B. يعرض العمودان 60% و40%.',

  // Usage by SKU
  'For each SKU, the AI credits used and their value, how much of it was covered or billed, its share of all usage and the number of people behind it.':
    'لكل SKU: أرصدة الذكاء الاصطناعي المستخدمة وقيمتها، وكم منها كان مشمولًا بالخطة أو مدفوعًا إضافيًا، وحصتها من كل الاستخدام، وعدد الأشخاص الذين يقفون وراءها.',
  'Share of usage = usage of the SKU ÷ total usage': 'الحصة من الاستخدام = استخدام SKU ÷ إجمالي الاستخدام',
  'Usage is the total of gross_amount for the SKU, and AI credits is the total of its quantity column. Covered and Billed are the totals of discount_amount and net_amount.':
    'الاستخدام هو مجموع gross_amount لوحدة SKU، وأرصدة الذكاء الاصطناعي هي مجموع عمود quantity لها. و«مشمول بالخطة» و«مدفوع إضافي» هما مجموعا discount_amount وnet_amount.',
  'The icon in front of a SKU and of each product is the GitHub icon of the product, when there is one.':
    'الأيقونة أمام كل SKU وكل منتج هي أيقونة GitHub الخاصة بالمنتج، إن وُجدت.',
  'Users counts the distinct usernames with at least one row under the SKU. Rows without a username are not counted.':
    '«المستخدمون» يعدّ أسماء المستخدمين المختلفة التي لها صف واحد على الأقل تحت SKU. ولا تُحتسب الصفوف التي ليس فيها اسم مستخدم.',
  'In the total row, Users counts every named user with at least one row in the period once, so it is not the sum of the rows.':
    'في صف الإجمالي، يعدّ «المستخدمون» كل مستخدم معروف بالاسم له صف واحد على الأقل في الفترة مرة واحدة، لذا فهو ليس مجموع الصفوف.',
  'A click on a row keeps only that SKU in the report. A SKU with no rows in the period is not listed.':
    'النقر على صف يُبقي وحدة SKU تلك فقط في التقرير. ولا تُعرض وحدة SKU التي ليس لها صفوف في الفترة.',
  'Covered and Billed are hidden when the file does not say what was billed.':
    'يُخفى «مشمول بالخطة» و«مدفوع إضافي» إذا لم يذكر الملف ما دُفع إضافيًا.',
  'A SKU with $2,000 of $10,000 of usage has a share of 20.0%. If 40 different users have a row under it, Users shows 40.':
    'وحدة SKU لها $2,000 من استخدام قدره $10,000 حصتها 20.0%. وإذا كان لـ 40 مستخدمًا مختلفًا صف تحتها، يعرض «المستخدمون» 40.',

  // Worked example from your data
  'Worked example from your data': 'مثال محسوب من بياناتك',
  'The pool, usage, covered and billed amounts of one month, written out in words under "How billing works here", so that you can check the explanation against your own numbers.':
    'مبالغ الرصيد المشترك والاستخدام والمشمول بالخطة والمدفوع إضافيًا لشهر واحد، مكتوبة بالكلمات تحت «كيف تعمل الفوترة هنا»، لتتمكن من مطابقة الشرح مع أرقامك.',
  'Unused credits = max(0, pool size − covered by included credits)':
    'الأرصدة غير المستخدمة = max(0، حجم الرصيد المشترك − المغطى من الأرصدة المشمولة)',
  'The month is the latest finished month with a known pool size. When there is none, it is the month in progress, and the text says "so far".':
    'الشهر هو آخر شهر منتهٍ حجم رصيده المشترك معروف. وإذا لم يوجد، فهو الشهر الجاري، ويقول النص «حتى الآن».',
  'Pool size, usage, covered and billed are the figures of that month (see their own entries).':
    'حجم الرصيد المشترك والاستخدام والمشمول بالخطة والمدفوع إضافيًا هي أرقام ذلك الشهر (انظر شرح كل منها).',
  'For a month in progress, the example adds how much of the pool is still unused. For a finished month with a billed amount, it explains in general terms how cutting usage or removing a seat changes cash. For a finished month without a billed amount, it adds the unused credits, which is also the most that removing seats could have saved.':
    'في الشهر الجاري، يضيف المثال كم بقي من الرصيد المشترك دون استخدام. وفي الشهر المنتهي الذي فيه مبلغ مدفوع إضافيًا، يشرح بعبارات عامة كيف يغيّر خفض الاستخدام أو إزالة ترخيص المبلغ المدفوع فعلًا. وفي الشهر المنتهي الذي ليس فيه مبلغ مدفوع إضافيًا، يضيف الأرصدة غير المستخدمة، وهي أيضًا أقصى ما كان يمكن توفيره بإزالة تراخيص.',
  'The example is left out in a filtered view, because the pool belongs to the whole organization, and when no month has a known pool size.':
    'لا يظهر المثال في العرض المُصفّى، لأن الرصيد المشترك يخص المؤسسة كلها، ولا يظهر عندما لا يكون حجم الرصيد المشترك معروفًا لأي شهر.',
  'When the pool is made up only of the seats in the file, the text says "the seats in this report held" instead of "the pool held", because other seats may share the pool.':
    'إذا كان الرصيد المشترك مكوّنًا من التراخيص الموجودة في الملف فقط، يقول النص «ضمّت التراخيص الواردة في هذا التقرير» بدل «ضمّ الرصيد المشترك»، لأن تراخيص أخرى قد تشترك في الرصيد نفسه.',
  'The savings sentences describe how the pool works. They are not a forecast.': 'جمل التوفير تصف طريقة عمل الرصيد المشترك، وليست توقعًا.',
  'A finished month with a pool of $9,600 and usage of $8,000 is written as: the pool held $9,600, usage was $8,000, $8,000 was covered and $0 was billed. $1,600 went unused, so cutting usage would not have saved cash.':
    'يُكتب شهر منتهٍ رصيده المشترك $9,600 واستخدامه $8,000 هكذا: ضمّ الرصيد المشترك $9,600، وبلغ الاستخدام $8,000، منه $8,000 مشمول بالخطة و$0 مدفوع إضافيًا. وبقي $1,600 دون استخدام، لذا لم يكن خفض الاستخدام ليوفّر مالًا.',

  // Usage per user in a month
  'Usage per user in a month': 'الاستخدام لكل مستخدم في الشهر',
  'The average usage of the people who used GitHub Copilot in a calendar month. Compare it with the credits of a seat.':
    'متوسط استخدام الأشخاص الذين استخدموا GitHub Copilot في شهر تقويمي. قارنه بأرصدة الترخيص.',
  'Usage per user = usage of the named users with usage in the month ÷ their number':
    'الاستخدام لكل مستخدم = استخدام المستخدمين المعروفين بالاسم الذين لهم استخدام في الشهر ÷ عددهم',
  'Take every named user whose gross_amount in the month is above $0. Add up their usage and divide by how many there are.':
    'خذ كل مستخدم معروف بالاسم يزيد gross_amount الخاص به في الشهر على $0. اجمع استخدامهم واقسمه على عددهم.',
  'Usage without a username is left out of both parts.': 'يُستبعد الاستخدام الذي ليس له اسم مستخدم من الطرفين.',
  'Usage per user × active users can be below the Usage column, because usage without a username is in the Usage column but not here.':
    'قد يكون الاستخدام لكل مستخدم × المستخدمين النشطين أقل من عمود «الاستخدام»، لأن الاستخدام الذي ليس له اسم مستخدم يدخل في عمود «الاستخدام» لا هنا.',
  'A Business seat brings $19 of credits a month and an Enterprise seat $39.':
    'يأتي ترخيص Business بأرصدة قيمتها $19 في الشهر، وترخيص Enterprise بأرصدة قيمتها $39.',
  'The total row has no figure. A month cut by the selected dates gives a lower figure than a full month.':
    'لا رقم في صف الإجمالي. والشهر الذي تقطعه التواريخ المحددة يعطي رقمًا أقل من الشهر الكامل.',
  '50 active users with $2,000 of usage between them is $40 each. If another $100 has no username, the Usage column shows $2,100.':
    '50 مستخدمًا نشطًا استخدموا معًا $2,000 يعني $40 لكل منهم. وإذا كان هناك $100 أخرى بلا اسم مستخدم، يعرض عمود «الاستخدام» $2,100.',

  // Who generates the overage
  'The users whose usage carries the billed amount on top of seats, ranked by that billed amount.':
    'المستخدمون الذين يحمل استخدامهم المبلغ المدفوع إضافيًا فوق التراخيص، مرتبين حسب هذا المبلغ.',
  'Bar = total of net_amount of the user': 'العمود = مجموع net_amount للمستخدم',
  'Add up net_amount for each user and keep those above $0.005. The top N are shown, where N is the Top N setting (at least 3). Rows without a username form one entry, "(unattributed / repo-level)", which is ranked together with the users.':
    'اجمع net_amount لكل مستخدم وأبقِ من يزيد على $0.005. يُعرض أعلى N، حيث N هو إعداد «أعلى N» (3 على الأقل). وتشكّل الصفوف التي ليس فيها اسم مستخدم مدخلًا واحدًا، «(غير منسوب / على مستوى المستودع)»، يُرتَّب مع المستخدمين.',
  'The color of a bar is the persona of the user, and the badges under the chart name the personas on it. The tooltip adds the persona, the usage and the covered part. When the seat size of the user is in the file, it also says how much more than the credits of their own seat the user used over the selected period, or that the user stayed within them.':
    'لون العمود هو نمط المستخدم، والشارات أسفل المخطط تذكر الأنماط الظاهرة فيه. ويضيف التلميح النمط والاستخدام والجزء المشمول بالخطة. وإذا كان حجم ترخيص المستخدم في الملف، يذكر أيضًا كم تجاوز المستخدم أرصدة ترخيصه خلال الفترة المحددة، أو أنه بقي ضمنها.',
  'The first line under the chart says how many users had usage billed on top of seats. When there are more than 3 people, it adds the share of the 3 largest named users in the total billed amount.':
    'يذكر السطر الأول أسفل المخطط عدد المستخدمين الذين دُفع استخدامهم إضافيًا فوق التراخيص. وإذا كانوا أكثر من 3 أشخاص، يضيف حصة أكبر 3 مستخدمين معروفين بالاسم من إجمالي المبلغ المدفوع إضافيًا.',
  'When some billed usage has no username, a second line says how much was billed for repo-level products that have no user.':
    'إذا كان بعض الاستخدام المدفوع إضافيًا بلا اسم مستخدم، يذكر سطر ثانٍ كم دُفع إضافيًا لمنتجات على مستوى المستودع ليس لها مستخدم.',
  'A click on a user opens that user. A click on the unattributed entry keeps only the rows without a username. The link under the chart opens the Users page with only the rows that have a billed amount.':
    'النقر على مستخدم يفتحه. والنقر على المدخل غير المنسوب يُبقي الصفوف التي ليس فيها اسم مستخدم فقط. والرابط أسفل المخطط يفتح صفحة المستخدمين مع الصفوف التي فيها مبلغ مدفوع إضافيًا فقط.',
  'The pool is shared across the organization, so this ranking can differ from Top users by usage.':
    'الرصيد المشترك يخص المؤسسة كلها، لذا قد يختلف هذا الترتيب عن «أعلى المستخدمين استخدامًا».',
  'The seat comparison in the tooltip is left out in a filtered view and for a user whose seat size is not in the file. When the file does not say what was billed, the card says so instead of showing a chart.':
    'لا تظهر مقارنة الترخيص في التلميح في العرض المُصفّى، ولا للمستخدم الذي لا يرد حجم ترخيصه في الملف. وإذا لم يذكر الملف ما دُفع إضافيًا، تقول البطاقة ذلك بدل عرض مخطط.',
  '8 users have a billed amount. The top 3 have $300, $200 and $100 of the $1,000 billed, so the top 3 account for 60%.':
    'لدى 8 مستخدمين مبلغ مدفوع إضافيًا. لأعلى 3 منهم $300 و$200 و$100 من أصل $1,000 مدفوعة إضافيًا، فحصة أعلى 3 هي 60%.',

  // Usage over time, with splits and unusual days
  'Usage over time, with splits and unusual days': 'الاستخدام عبر الزمن، مع التقسيمات والأيام غير المعتادة',
  'The value of the AI credits used in each day, week or month of the selected period, split by who pays, by what was used or by who used it, with the unusual days marked.':
    'قيمة أرصدة الذكاء الاصطناعي المستخدمة في كل يوم أو أسبوع أو شهر من الفترة المحددة، مقسّمة حسب من يدفع، أو ما استُخدم، أو من استخدمه، مع تمييز الأيام غير المعتادة.',
  'Bar height = total of gross_amount of the rows in the day, week or month':
    'ارتفاع العمود = مجموع gross_amount للصفوف في اليوم أو الأسبوع أو الشهر',
  'Group by Day, Week (Monday to Sunday) or Month. The first and last bar are shorter when the period does not start or end on a boundary. A period of more than 120 days opens by Week, and any other period opens by Day.':
    'جمّع حسب اليوم أو الأسبوع (من الاثنين إلى الأحد) أو الشهر. ويكون العمودان الأول والأخير أقصر إذا لم تبدأ الفترة أو تنتهِ عند حد كامل. والفترة التي تزيد على 120 يومًا تُفتح حسب الأسبوع، وأي فترة أخرى حسب اليوم.',
  'Stack by Covered vs billed (total of discount_amount and total of net_amount). A file that does not say what was billed has Total usage instead, which is one stack.':
    'كدّس حسب «المشمول مقابل المدفوع إضافيًا» (مجموع discount_amount ومجموع net_amount). والملف الذي لا يذكر ما دُفع إضافيًا فيه «إجمالي الاستخدام» بدلًا من ذلك، وهو طبقة واحدة.',
  'Stack by Product, SKU, Cost center or Organization: the 7 values with the most usage in the period, and the rest as Other.':
    'كدّس حسب المنتج أو SKU أو مركز التكلفة أو المؤسسة: القيم السبع الأعلى استخدامًا في الفترة، والبقية تحت «أخرى».',
  'Stack by Model tier or Vendor. The tier and the vendor come from the price card or from a model override in Settings. A model that is on neither is Unknown for the tier, and its vendor is read from the model name.':
    'كدّس حسب فئة النموذج أو المزوّد. تأتي الفئة والمزوّد من بطاقة الأسعار أو من تخصيص للنموذج في الإعدادات. والنموذج غير الموجود في أي منهما فئته «غير معروف»، ويُقرأ مزوّده من اسمه.',
  'Running total shows the total so far across the bars instead of one value per bar. It is hidden when the chart has a single bar.':
    '«المجموع التراكمي» يعرض الإجمالي المتراكم عبر الأعمدة بدل قيمة واحدة لكل عمود. ويُخفى إذا كان في المخطط عمود واحد.',
  'Mark unusual days puts a red pin on the bar that holds each unusual day (the rule is in Unusual days). The tooltip of that bar lists each unusual day with its usage, how many times the typical day it is, and the user and model with the most usage that day.':
    '«تمييز الأيام غير المعتادة» يضع دبوسًا أحمر على العمود الذي يضم كل يوم غير معتاد (القاعدة في «الأيام غير المعتادة»). ويعرض تلميح ذلك العمود كل يوم غير معتاد مع استخدامه، وكم ضعفًا هو من اليوم المعتاد، والمستخدم والنموذج الأعلى استخدامًا في ذلك اليوم.',
  'The chips under the chart show the unusual days in date order, up to 6, each as date · usage · N× the typical day.':
    'تعرض الشارات أسفل المخطط الأيام غير المعتادة بترتيب التاريخ، حتى 6 أيام، كل منها بصيغة التاريخ · الاستخدام · N× اليوم المعتاد.',
  'A click on a bar or a pin zooms the date range into that bar, which is not possible when the chart has a single bar. A click on a chip zooms into that day.':
    'النقر على عمود أو دبوس يقرّب نطاق التاريخ إلى ذلك العمود، وهذا غير ممكن إذا كان في المخطط عمود واحد. والنقر على شارة يقرّب إلى ذلك اليوم.',
  'In Covered vs billed a bar is as high as covered plus billed, which equals the usage unless the amounts of a row do not add up (the Data page counts those rows).':
    'في «المشمول مقابل المدفوع إضافيًا» يساوي ارتفاع العمود المشمول بالخطة زائد المدفوع إضافيًا، وهو يساوي الاستخدام إلا إذا لم تتطابق مبالغ صف ما (تعدّ صفحة «البيانات» هذه الصفوف).',
  'It follows the filters. Days are read as written in the file, with no time zone conversion. With Stack by Cost center, links to the GitHub pages about cost centers appear under the chart.':
    'يتبع عوامل التصفية. تُقرأ الأيام كما هي مكتوبة في الملف، دون تحويل للمنطقة الزمنية. ومع التكديس حسب مركز التكلفة، تظهر أسفل المخطط روابط إلى صفحات GitHub عن مراكز التكلفة.',
  'A week with $400 covered and $100 billed is one bar of $500. In Running total, a following week of $300 brings the line to $800.':
    'أسبوع فيه $400 مشمولة بالخطة و$100 مدفوعة إضافيًا هو عمود واحد قيمته $500. وفي «المجموع التراكمي»، يرفع أسبوع تالٍ قيمته $300 الخط إلى $800.',
};

export default arabic;
