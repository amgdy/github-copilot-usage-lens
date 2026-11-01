import type { Dict } from '../core';

/** Arabic for the recommendation and simulator docs in `lib/metrics/docs/recommendations.ts`. */
const arabic: Dict = {
  // What-if simulator: usage reduction, usage after, cash saving
  'The share of the usage of the period that the six levers would avoid. It does not depend on the size of the pool, and the seat actions do not change it.':
    'حصة استخدام الفترة التي ستتجنبها الإجراءات الستة. وهي لا تتوقف على حجم الرصيد المشترك، ولا تغيّرها إجراءات التراخيص.',
  'Usage reduction = min(1, usage avoided by the levers ÷ usage in the period)': 'خفض الاستخدام = min(1, الاستخدام الذي تتجنبه الإجراءات ÷ الاستخدام في الفترة)',
  'Each lever starts from the saving it would give on everything it covers and takes the share set by its slider. The levers run one after the other, so each one works on the usage that the earlier ones left.':
    'يبدأ كل إجراء من التوفير الذي كان سيحققه على كل ما يشمله، ثم يأخذ الحصة التي يحددها منزلقه. وتعمل الإجراءات واحدًا بعد الآخر، فيعمل كل منها على الاستخدام الذي تركته الإجراءات السابقة.',
  'Usage avoided = the sum of the savings of the six levers. Usage in the period = the gross_amount of the selected dates and filters.':
    'الاستخدام المتجنَّب = مجموع وفورات الإجراءات الستة. الاستخدام في الفترة = gross_amount للتواريخ وعوامل التصفية المحددة.',
  'Usage reduction = usage avoided ÷ usage in the period. It never goes above 100%.': 'خفض الاستخدام = الاستخدام المتجنَّب ÷ الاستخدام في الفترة. ولا يتجاوز 100% أبدًا.',
  'The note under the tile shows usage per month before and after. With cash figures these are the averages of the monthly figures, where the month in progress is projected. Otherwise they are the usage of the period × 30.4375 ÷ days in the period, before and after the levers.':
    'تعرض الملاحظة تحت البطاقة الاستخدام شهريًا قبل التغيير وبعده. وعند توفر الأرقام النقدية تكون هذه متوسطات الأرقام الشهرية، مع إسقاط الشهر الجاري. وإلا فهي استخدام الفترة × 30.4375 ÷ عدد أيام الفترة، قبل الإجراءات وبعدها.',
  'It is shown for a filtered view and for a file without a billing split, where the cash figures are hidden.':
    'وهي معروضة في العرض المصفّى وفي الملف الذي لا يتضمن تقسيم الفوترة، حيث تُخفى الأرقام النقدية.',
  'It is usage that would not occur. How much of it reaches the bill depends on the pool, see Cash saving per month.':
    'هذا استخدام لن يحدث. ويتوقف مقدار ما يصل منه إلى الفاتورة على الرصيد المشترك، انظر «التوفير النقدي شهريًا».',
  'The sliders are assumptions about what the team achieves, so the number sizes an opportunity and is not a forecast.':
    'المنزلقات افتراضات حول ما يحققه الفريق، لذلك يقدّر الرقم حجم فرصة ولا يُعد توقعًا.',
  'A period has $6,000 of usage and the levers avoid $480 of it. Usage reduction = $480 ÷ $6,000 = 8.0%.':
    'في فترة ما استخدام قدره $6,000، وتتجنب الإجراءات $480 منه. خفض الاستخدام = $480 ÷ $6,000 = 8.0%.',
  'Usage per month once the levers are applied. The note under the number shows usage per month now.':
    'الاستخدام شهريًا بعد تطبيق الإجراءات. وتعرض الملاحظة تحت الرقم الاستخدام شهريًا الآن.',
  'Usage after = usage per month × (1 − usage reduction)': 'الاستخدام بعد التغيير = الاستخدام شهريًا × (1 − خفض الاستخدام)',
  'With cash figures, the usage of each calendar month is multiplied by (1 − usage reduction) and the months are averaged. The month in progress uses its projected usage.':
    'عند توفر الأرقام النقدية، يُضرب استخدام كل شهر تقويمي في (1 − خفض الاستخدام) ثم يُؤخذ متوسط الأشهر. ويستخدم الشهر الجاري استخدامه المُسقَط.',
  'Without cash figures, which is the case for a filtered view or a file without a billing split, usage after = (usage in the period − usage avoided) × 30.4375 ÷ days in the period.':
    'بدون أرقام نقدية، وهو ما يحدث في العرض المصفّى أو في الملف الذي بلا تقسيم للفوترة، يكون الاستخدام بعد التغيير = (الاستخدام في الفترة − الاستخدام المتجنَّب) × 30.4375 ÷ عدد أيام الفترة.',
  'Every month gets the same reduction in percent, so a month with more usage saves more dollars.':
    'يحصل كل شهر على النسبة المئوية نفسها من الخفض، لذلك يوفّر الشهر الأكثر استخدامًا دولارات أكثر.',
  'Seat actions do not change usage. They change the pool.': 'لا تغيّر إجراءات التراخيص الاستخدام. إنها تغيّر الرصيد المشترك.',
  'It shows what is left if the team reaches the shares of the sliders. It is not a forecast.': 'يعرض ما يتبقى إذا حقق الفريق حصص المنزلقات. وهو ليس توقعًا.',
  'A report has two months with $9,000 and $10,000 of usage, and the reduction is 8%. Usage after is $8,280 and $9,200, which averages $8,740 a month. The note reads "now $9,500 a month".':
    'في تقرير شهران باستخدام $9,000 و$10,000، ونسبة الخفض 8%. يصبح الاستخدام بعد التغيير $8,280 و$9,200، بمتوسط $8,740 شهريًا. وتقرأ الملاحظة «الآن $9,500 شهريًا».',
  'How much lower the bill would be each month with the levers and the seat actions that are switched on. A month costs the larger of the pool and the usage, so only part of a saving reaches the bill.':
    'كم ستنخفض الفاتورة كل شهر بالإجراءات وإجراءات التراخيص المفعَّلة. تكلفة الشهر هي الأكبر بين الرصيد المشترك والاستخدام، لذلك لا يصل إلى الفاتورة إلا جزء من التوفير.',
  'Cash saving per month = average over the months of max(pool, usage) − max(pool after seat actions, usage after levers)':
    'التوفير النقدي شهريًا = متوسط الأشهر لقيمة max(الرصيد المشترك, الاستخدام) − max(الرصيد المشترك بعد إجراءات التراخيص, الاستخدام بعد الإجراءات)',
  'For each month, cost before = max(pool, usage). The month in progress uses its projected usage.':
    'لكل شهر، التكلفة قبل التغيير = max(الرصيد المشترك, الاستخدام). ويستخدم الشهر الجاري استخدامه المُسقَط.',
  'New usage = usage × (1 − usage reduction). New pool = max(0, pool − seat value removed). Cost after = max(new pool, new usage).':
    'الاستخدام الجديد = الاستخدام × (1 − خفض الاستخدام). الرصيد المشترك الجديد = max(0, الرصيد المشترك − قيمة التراخيص المزالة). التكلفة بعد التغيير = max(الرصيد المشترك الجديد, الاستخدام الجديد).',
  'Saving of the month = cost before − cost after. The tile is the average over the months, and the note under it reads "average of N months".':
    'توفير الشهر = التكلفة قبل التغيير − التكلفة بعده. والبطاقة هي متوسط الأشهر، وتقرأ الملاحظة تحتها «متوسط الفترة: N أشهر».',
  'The pool size is not known when the included credits used are more than the seats in the file provide. A month that ran out of included credits then takes the credits it covered as its pool, and a month that did not run out takes at least its usage as its pool. Seat actions are not available in that case.':
    'يكون حجم الرصيد المشترك غير معروف عندما تزيد الأرصدة المشمولة المستخدمة عمّا توفره التراخيص في الملف. وحينئذ يعدّ الشهر الذي نفدت فيه الأرصدة المشمولة ما غطّته من أرصدة رصيده المشترك، ويعدّ الشهر الذي لم تنفد فيه استخدامه على الأقل رصيدًا مشتركًا له. ولا تتوفر إجراءات التراخيص في هذه الحالة.',
  'Using less saves cash only for the usage above the pool, because the seats are paid for anyway. Removing seats saves only up to the unused part of the pool.':
    'لا يوفّر خفض الاستخدام نقدًا إلا في الاستخدام الذي يتجاوز الرصيد المشترك، لأن التراخيص مدفوعة في كل الأحوال. وإزالة التراخيص توفّر فقط بقدر الجزء غير المستخدم من الرصيد المشترك.',
  'The tile is not shown for a filtered view, because the pool belongs to the whole organization, nor when the file does not say what was billed. The usage reduction is still shown.':
    'لا تُعرض هذه البطاقة في العرض المصفّى، لأن الرصيد المشترك يخص المؤسسة كلها، ولا عندما لا يذكر الملف ما حوسب عليه. ويظل خفض الاستخدام معروضًا.',
  'It assumes that a seat costs the value of its included credits. It is worked out from past months and is not a forecast.':
    'يفترض أن الترخيص يكلّف قيمة أرصدته المشمولة. ويُحسب من الأشهر السابقة وليس توقعًا.',
  'A month has a pool of $9,600 and usage of $10,000, so it costs $10,000. The levers avoid 8%, so usage falls to $9,200. Idle seats worth $190 shrink the pool to $9,410. Cost after = max($9,410, $9,200) = $9,410, and the saving is $590.':
    'في شهر ما رصيد مشترك قدره $9,600 واستخدام قدره $10,000، فتكلفته $10,000. وتتجنب الإجراءات 8%، فينخفض الاستخدام إلى $9,200. وتقلّص تراخيص خاملة قيمتها $190 الرصيد المشترك إلى $9,410. التكلفة بعد التغيير = max($9,410, $9,200) = $9,410، ويكون التوفير $590.',
  'The monthly cash saving carried over twelve months, to size the opportunity.': 'التوفير النقدي الشهري ممتدًا على اثني عشر شهرًا، لتقدير حجم الفرصة.',
  'Cash saving per year = 12 × cash saving per month': 'التوفير النقدي سنويًا = 12 × التوفير النقدي شهريًا',
  'Take the cash saving per month, which is an average over the months in the report.': 'خذ التوفير النقدي شهريًا، وهو متوسط أشهر التقرير.',
  'Multiply it by 12.': 'اضربه في 12.',
  'It assumes that the months of the report repeat. A team that grows or shrinks makes the real year different.':
    'يفترض أن أشهر التقرير تتكرر. وإذا نما الفريق أو انكمش فسيختلف العام الفعلي.',
  'It is the same estimate as the monthly saving, so it has the same limits. It is not a forecast of the invoice.':
    'هو التقدير نفسه للتوفير الشهري، لذلك له الحدود نفسها. وليس توقعًا للفاتورة.',
  'A cash saving of $590 a month is 12 × $590 = $7,080 a year.': 'توفير نقدي قدره $590 شهريًا يساوي 12 × $590 = $7,080 سنويًا.',

  // What-if simulator: billed on top of seats when the pool size is unknown
  'Usage above the pool, per month, after the levers. It is the most that using less can save while the number of seats stays the same. This tile replaces the pool tiles when the pool size is not known.':
    'الاستخدام فوق الرصيد المشترك شهريًا بعد الإجراءات. وهو أقصى ما يمكن أن يوفّره خفض الاستخدام مع بقاء عدد التراخيص كما هو. وتحل هذه البطاقة محل بطاقات الرصيد المشترك عندما يكون حجمه غير معروف.',
  'Billed on top of seats = average over the months of max(0, usage after levers − pool)':
    'المدفوع الإضافي فوق التراخيص = متوسط الأشهر لقيمة max(0, الاستخدام بعد الإجراءات − الرصيد المشترك)',
  'For each month, usage above the pool = max(0, usage − pool). The month in progress uses its projected usage.':
    'لكل شهر، الاستخدام فوق الرصيد المشترك = max(0, الاستخدام − الرصيد المشترك). ويستخدم الشهر الجاري استخدامه المُسقَط.',
  'After the levers, the usage is multiplied by (1 − usage reduction). The pool stays the same, because seat actions are unavailable when the pool size is not known.':
    'بعد الإجراءات يُضرب الاستخدام في (1 − خفض الاستخدام). ويبقى الرصيد المشترك كما هو، لأن إجراءات التراخيص غير متاحة عندما يكون حجمه غير معروف.',
  'The tile shows the average after the levers. The note under it shows the average now.': 'تعرض البطاقة المتوسط بعد الإجراءات. وتعرض الملاحظة تحتها المتوسط الآن.',
  'The pool size is not known when the included credits used are more than the seats in the file provide. A month that ran out of included credits then has its pool taken as the credits it covered. A month that did not run out is taken to have covered all its usage, so nothing is billed in it.':
    'يكون حجم الرصيد المشترك غير معروف عندما تزيد الأرصدة المشمولة المستخدمة عمّا توفره التراخيص في الملف. وحينئذ يُعدّ رصيد الشهر الذي نفدت فيه الأرصدة المشمولة هو ما غطّته من أرصدة. أما الشهر الذي لم تنفد فيه فيُعدّ أنه غطّى كل استخدامه، فلا يُدفع فيه شيء إضافي.',
  'It is calculated from usage and the pool of each month, not read from the billed amount in the file. The Billed on top of seats figure of the Overview is the reported one.':
    'يُحسب من استخدام كل شهر ورصيده المشترك، ولا يُقرأ من المبلغ المدفوع في الملف. أما رقم «المدفوع الإضافي فوق التراخيص» في صفحة نظرة عامة فهو الرقم المبلَّغ عنه.',
  'It is not the invoice. The seats come on top of it.': 'وهو ليس الفاتورة. فالتراخيص تُضاف إليه.',
  'The tile appears only when the pool size is not known. With a known pool the page shows New monthly cost and Unused included credits instead.':
    'تظهر هذه البطاقة فقط عندما يكون حجم الرصيد المشترك غير معروف. أما مع رصيد مشترك معروف فتعرض الصفحة «التكلفة الشهرية الجديدة» و«الأرصدة المشمولة غير المستخدمة» بدلًا منها.',
  'Two months have a pool of $9,600. Month 1 has usage of $10,600, so $1,000 is above the pool. Month 2 has usage of $9,000, so nothing is. The note reads "now $500 a month". With a reduction of 5%, month 1 has $10,070 of usage and $470 above the pool, and month 2 still has none, so the tile reads $235.':
    'لشهرين رصيد مشترك قدره $9,600. استخدام الشهر الأول $10,600، فيقع $1,000 فوق الرصيد المشترك. واستخدام الشهر الثاني $9,000، فلا يقع شيء فوقه. وتقرأ الملاحظة «الآن $500 شهريًا». وبخفض قدره 5% يصبح استخدام الشهر الأول $10,070 ويقع $470 فوق الرصيد المشترك، ولا يزال الشهر الثاني بلا شيء، فتعرض البطاقة $235.',

  // What-if simulator: cost, unused credits and seat value
  'What a month costs after the levers and the seat actions, with seats priced at the value of their included credits: the pool plus the usage above it. The note shows the cost now and how much lower the new cost is.':
    'ما يكلّفه الشهر بعد الإجراءات وإجراءات التراخيص، مع تسعير التراخيص بقيمة أرصدتها المشمولة: الرصيد المشترك زائد الاستخدام الذي يتجاوزه. وتعرض الملاحظة التكلفة الآن ومقدار انخفاض التكلفة الجديدة.',
  'New monthly cost = average over the months of max(pool after seat actions, usage after levers)':
    'التكلفة الشهرية الجديدة = متوسط الأشهر لقيمة max(الرصيد المشترك بعد إجراءات التراخيص, الاستخدام بعد الإجراءات)',
  'For each month, new pool = max(0, pool − seat value removed) and new usage = usage × (1 − usage reduction). The month in progress uses its projected usage.':
    'لكل شهر، الرصيد المشترك الجديد = max(0, الرصيد المشترك − قيمة التراخيص المزالة) والاستخدام الجديد = الاستخدام × (1 − خفض الاستخدام). ويستخدم الشهر الجاري استخدامه المُسقَط.',
  'Cost of the month = max(new pool, new usage). The tile is the average over the months.': 'تكلفة الشهر = max(الرصيد المشترك الجديد, الاستخدام الجديد). والبطاقة هي متوسط الأشهر.',
  'The cost now is the average of max(pool, usage). The note shows it with the change, 1 − new cost ÷ cost now, as a percent lower. Below 0.05% it reads "no change".':
    'التكلفة الآن هي متوسط max(الرصيد المشترك, الاستخدام). وتعرضها الملاحظة مع التغيّر، 1 − التكلفة الجديدة ÷ التكلفة الآن، كنسبة انخفاض مئوية. وتحت 0.05% تقرأ «بلا تغيير».',
  'It is shown only when the pool size is known.': 'تُعرض فقط عندما يكون حجم الرصيد المشترك معروفًا.',
  'It assumes that a seat costs what its included credits are worth. Check this against your contract.': 'يفترض أن الترخيص يكلّف ما تساويه أرصدته المشمولة. تحقق من ذلك في عقدك.',
  'Cash saving per month is the cost now minus this number.': 'التوفير النقدي شهريًا هو التكلفة الآن ناقص هذا الرقم.',
  'One month with a pool of $9,600 and usage of $10,000 costs $10,000 now. After an 8% reduction and $190 of seats removed it costs max($9,410, $9,200) = $9,410, which is 5.9% lower.':
    'شهر واحد برصيد مشترك قدره $9,600 واستخدام قدره $10,000 تكلفته الآن $10,000. وبعد خفض قدره 8% وإزالة تراخيص بقيمة $190 تصبح تكلفته max($9,410, $9,200) = $9,410، أي أقل بنسبة 5.9%.',
  'Included credits that are paid for and not used, per month, after the levers and the seat actions. The note shows the same figure now.':
    'الأرصدة المشمولة المدفوعة وغير المستخدمة شهريًا، بعد الإجراءات وإجراءات التراخيص. وتعرض الملاحظة الرقم نفسه الآن.',
  'Unused included credits after = average over the months of max(0, pool after seat actions − usage after levers)':
    'الأرصدة المشمولة غير المستخدمة بعد التغيير = متوسط الأشهر لقيمة max(0, الرصيد المشترك بعد إجراءات التراخيص − الاستخدام بعد الإجراءات)',
  'Unused credits of the month = max(0, new pool − new usage). The tile is the average over the months.':
    'الأرصدة غير المستخدمة في الشهر = max(0, الرصيد المشترك الجديد − الاستخدام الجديد). والبطاقة هي متوسط الأشهر.',
  'The figure now is the average of max(0, pool − usage).': 'الرقم الآن هو متوسط max(0, الرصيد المشترك − الاستخدام).',
  'Using less leaves more of the pool unused, which is why usage below the pool does not lower the bill.':
    'خفض الاستخدام يترك جزءًا أكبر من الرصيد المشترك دون استخدام، ولهذا لا يخفض الاستخدام الواقع دون الرصيد المشترك الفاتورة.',
  'Removing seats lowers the pool and so lowers the unused credits. That is where the cash saving of a seat action comes from.':
    'إزالة التراخيص تخفض الرصيد المشترك وبالتالي تخفض الأرصدة غير المستخدمة. ومن هنا يأتي التوفير النقدي لإجراء الترخيص.',
  'One month with a pool of $9,600 and usage of $9,000 has $600 unused now. After a 10% reduction and $600 of seats removed, usage is $8,100 and the pool is $9,000, so $900 is unused. The cost falls from $9,600 to $9,000, which is the $600 of seats.':
    'في شهر واحد برصيد مشترك قدره $9,600 واستخدام قدره $9,000 يبقى $600 دون استخدام الآن. وبعد خفض قدره 10% وإزالة تراخيص بقيمة $600 يصبح الاستخدام $8,100 والرصيد المشترك $9,000، فيبقى $900 دون استخدام. وتنخفض التكلفة من $9,600 إلى $9,000، أي بقدر قيمة التراخيص البالغة $600.',
  'The monthly price of the seats that the switched-on seat actions remove or move to Business. It lowers the pool, and it saves cash only where the pool had unused credits.':
    'السعر الشهري للتراخيص التي تزيلها إجراءات التراخيص المفعَّلة أو تنقلها إلى Business. وهو يخفض الرصيد المشترك، ولا يوفّر نقدًا إلا حيث كان في الرصيد المشترك أرصدة غير مستخدمة.',
  'Seat value removed = sum of the seat values of the seat actions that are on': 'قيمة التراخيص المزالة = مجموع قيم التراخيص في إجراءات التراخيص المفعَّلة',
  'Each seat action has a seat value: idle seats to reclaim, Enterprise seats to move to Business ($20 each) and roster seats that never appear.':
    'لكل إجراء ترخيص قيمة: التراخيص الخاملة المراد استردادها، وتراخيص Enterprise المراد نقلها إلى Business ($20 لكل ترخيص)، وتراخيص القائمة التي لا تظهر أبدًا.',
  'An action counts when its switch is on and it is available. The sum is the tile. The note shows the number of seats, or "no seat action is on".':
    'يُحتسب الإجراء عندما يكون مفتاحه مفعَّلًا ويكون متاحًا. والمجموع هو البطاقة. وتعرض الملاحظة عدد التراخيص، أو «لا يوجد إجراء تراخيص قيد التشغيل».',
  'The pool of every month falls by this amount, never below $0.': 'ينخفض الرصيد المشترك لكل شهر بهذا المبلغ، ولا يقل عن $0 أبدًا.',
  'A switch is not available in a filtered view, when no seat qualifies, or when the pool is larger than the seats in the file, because the savings cannot be sized.':
    'لا يتوفر المفتاح في العرض المصفّى، أو عندما لا يستوفي أي ترخيص الشروط، أو عندما يكون الرصيد المشترك أكبر من التراخيص الموجودة في الملف، لأن الوفورات لا يمكن تقديرها.',
  'The tile is shown only when the pool size is known.': 'تُعرض البطاقة فقط عندما يكون حجم الرصيد المشترك معروفًا.',
  'The seats are the lists on the Seats tab. Read the caveats there before you remove a seat.': 'التراخيص هي القوائم في تبويب التراخيص. اقرأ التنبيهات هناك قبل أن تزيل ترخيصًا.',
  'Seven idle seats at $19 are worth $133 and four Enterprise seats to move are worth 4 × $20 = $80. With both switches on, the tile reads $213 and the note reads "11 seats reclaimed or moved, per month".':
    'سبعة تراخيص خاملة بسعر $19 تساوي $133، وأربعة تراخيص Enterprise للنقل تساوي 4 × $20 = $80. وعند تفعيل المفتاحين تعرض البطاقة $213 وتقرأ الملاحظة «التراخيص المستردة أو المنقولة شهريًا: 11 ترخيصًا».',

  // What-if simulator: presets and how the levers combine
  'A preset sets the six sliders and the cap level in one step. Balanced holds the assumptions behind the savings plan that the other pages show.':
    'يضبط الإعداد المسبق المنزلقات الستة ومستوى الحد الأقصى في خطوة واحدة. ويحمل «متوازن» الافتراضات التي تقوم عليها خطة التوفير المعروضة في الصفحات الأخرى.',
  'Preset = a fixed set of six lever shares and one cap level': 'الإعداد المسبق = مجموعة ثابتة من ست حصص للإجراءات ومستوى واحد للحد الأقصى',
  'Conservative: right-size models 15%, Auto 25%, cache discipline 10%, leaner context 5%, long-context surcharges 15%, cap runaway users 25%, cap level 4×.':
    'متحفظ: اختيار النموذج المناسب 15%، Auto 25%، الاستفادة من الذاكرة المؤقتة 10%، سياق أخف 5%، رسوم السياق الطويل الإضافية 15%، وضع حد للمستخدمين المفرطين 25%، مستوى الحد الأقصى 4×.',
  'Balanced: 30%, 50%, 20%, 10%, 30%, 50%, cap level 3×. These are the default levers of the savings plan on the Overview and of the plan on the Recommendations tab.':
    'متوازن: 30%، 50%، 20%، 10%، 30%، 50%، مستوى الحد الأقصى 3×. وهذه هي الإجراءات الافتراضية لخطة التوفير في نظرة عامة وللخطة في تبويب التوصيات.',
  'Ambitious: 50%, 80%, 40%, 20%, 60%, 80%, cap level 2×.': 'طموح: 50%، 80%، 40%، 20%، 60%، 80%، مستوى الحد الأقصى 2×.',
  'A preset shows as selected while all seven numbers equal its values. When any slider differs, Custom is selected.':
    'يظهر الإعداد المسبق محدَّدًا ما دامت الأرقام السبعة كلها مساوية لقيمه. وعندما يختلف أي منزلق يُحدَّد «مخصص».',
  'Reset sets the Balanced values, puts the target model back to the mid-tier model of the same vendor and turns every seat action on.':
    'تضبط إعادة التعيين قيم «متوازن»، وتعيد النموذج المستهدف إلى نموذج الفئة المتوسطة من المزوّد نفسه، وتشغّل كل إجراءات التراخيص.',
  'Choosing a preset does not change the target model or the seat switches.': 'اختيار إعداد مسبق لا يغيّر النموذج المستهدف ولا مفاتيح التراخيص.',
  'The shares are assumptions about what the team will achieve. Nothing in the report measures them, so a preset sizes an opportunity and is not a forecast.':
    'الحصص افتراضات حول ما سيحققه الفريق. ولا شيء في التقرير يقيسها، لذلك يقدّر الإعداد المسبق حجم فرصة ولا يُعد توقعًا.',
  'A lever with nothing to work on saves $0 at any share. The note under its slider says so.': 'الإجراء الذي لا يجد ما يعمل عليه يوفّر $0 عند أي حصة. وتذكر الملاحظة تحت منزلقه ذلك.',
  'Choosing Ambitious moves the Right-size models slider to 50% and the Cap level to 2×. Moving the Cap level to 2.5× then shows Custom, and choosing Balanced brings it back to 3×.':
    'اختيار «طموح» ينقل منزلق «اختيار النموذج المناسب» إلى 50% ومستوى الحد الأقصى إلى 2×. ثم يؤدي نقل مستوى الحد الأقصى إلى 2.5× إلى ظهور «مخصص»، واختيار «متوازن» يعيده إلى 3×.',
  'How the levers combine': 'كيف تتحد الإجراءات',
  'Each slider is the share of a lever that the team achieves. The six levers run in a fixed order and each one works on the usage that the earlier ones left, so overlapping ideas are never counted twice.':
    'كل منزلق هو حصة الإجراء التي يحققها الفريق. وتعمل الإجراءات الستة بترتيب ثابت ويعمل كل منها على الاستخدام الذي تركته السابقة، لذلك لا تُحتسب الأفكار المتداخلة مرتين أبدًا.',
  'Saving of a lever = standalone saving × (usage left after the earlier levers ÷ usage in the period)':
    'توفير الإجراء = التوفير المنفرد × (الاستخدام المتبقي بعد الإجراءات السابقة ÷ الاستخدام في الفترة)',
  'Each lever has a standalone saving: what it would save on its own at the share of its slider, on the usage of the period. The explanation of each lever says how it is sized.':
    'لكل إجراء توفير منفرد: ما كان سيوفّره بمفرده عند حصة منزلقه، على استخدام الفترة. ويبيّن شرح كل إجراء كيف يُقدَّر.',

  // Simulator: the order of the levers and the target model
  'The levers run in this order: Right-size models, Use Auto model selection, Cache discipline, Leaner context, Avoid long-context surcharges, Cap runaway users. The usage left starts at the usage of the period.':
    'تعمل الإجراءات بهذا الترتيب: اختيار النموذج المناسب، واستخدام الاختيار التلقائي للنموذج (Auto)، والاستفادة من الذاكرة المؤقتة، وسياق أخف، وتجنب رسوم السياق الطويل الإضافية، ووضع حد للمستخدمين المفرطين. ويبدأ الاستخدام المتبقي من استخدام الفترة.',
  'Saving of a lever = its standalone saving × usage left ÷ usage in the period. It is never below $0. The usage left falls by that saving before the next lever runs.':
    'توفير الإجراء = توفيره المنفرد × الاستخدام المتبقي ÷ الاستخدام في الفترة. ولا يقل أبدًا عن $0. وينخفض الاستخدام المتبقي بمقدار هذا التوفير قبل أن يعمل الإجراء التالي.',
  'Usage avoided = the sum of the six savings. Usage reduction = usage avoided ÷ usage in the period, at most 100%.':
    'الاستخدام المتجنَّب = مجموع الوفورات الستة. خفض الاستخدام = الاستخدام المتجنَّب ÷ الاستخدام في الفترة، بحد أقصى 100%.',
  'Under a slider, "Saves about $X of usage a month on its own" is the standalone saving × 30.4375 ÷ days in the period. It shows when the slider is above 0 and the amount is at least $0.50. Below that the note says "No measurable effect in this data."':
    'تحت المنزلق، تساوي عبارة «يوفّر نحو $X من الاستخدام شهريًا بمفرده» التوفير المنفرد × 30.4375 ÷ عدد أيام الفترة. وتظهر عندما يكون المنزلق فوق 0 ويبلغ المبلغ $0.50 على الأقل. وتحت ذلك تقول الملاحظة «لا أثر قابلًا للقياس في هذه البيانات».',
  'The first lever counts in full and each later one is scaled down. Moving one slider therefore changes the savings of the levers after it. The order is fixed.':
    'يُحتسب الإجراء الأول كاملًا ويُخفَّض كل إجراء بعده. لذلك يغيّر تحريك أحد المنزلقات وفورات الإجراءات التي تليه. والترتيب ثابت.',
  'A lever with nothing to work on saves $0 at any share: no model names for Right-size models and Auto, no token columns for the cache and context levers, no long-context surcharges, or nobody above the cap level.':
    'الإجراء الذي لا يجد ما يعمل عليه يوفّر $0 عند أي حصة: لا أسماء نماذج لإجراءي «اختيار النموذج المناسب» و«Auto»، ولا أعمدة رموز لإجراءي الذاكرة المؤقتة والسياق، ولا رسوم إضافية للسياق الطويل، أو لا يوجد أحد فوق مستوى الحد الأقصى.',
  'The Leaner context slider stops at 50%. The other shares run to 100%.':
    'يتوقف منزلق «سياق أخف» عند 50%. وتصل الحصص الأخرى إلى 100%.',
  'The amounts are usage that would not occur, not cash. How much reaches the bill depends on the pool, see Cash saving per month.':
    'المبالغ استخدام لن يحدث، وليست نقدًا. ويتوقف ما يصل منها إلى الفاتورة على الرصيد المشترك، راجع التوفير النقدي شهريًا.',
  'A period has $10,000 of usage. Right-size models saves $500 on its own, so it saves $500 and $9,500 is left. Use Auto model selection saves $200 on its own, so it saves $200 × $9,500 ÷ $10,000 = $190.':
    'في فترة استخدامها $10,000. يوفّر «اختيار النموذج المناسب» $500 بمفرده، فيوفّر $500 ويتبقى $9,500. ويوفّر «استخدام الاختيار التلقائي للنموذج (Auto)» $200 بمفرده، فيوفّر $200 × $9,500 ÷ $10,000 = $190.',
  'The model that the Right-size models lever moves Powerful-tier usage to. The default is the mid-tier model of the same vendor. You can pick one Versatile model for all Powerful models instead.':
    'النموذج الذي ينقل إليه إجراء «اختيار النموذج المناسب» استخدام الفئة القوية. والافتراضي هو نموذج الفئة المتوسطة من المزوّد نفسه. ويمكنك بدلًا من ذلك اختيار نموذج واحد من فئة «متعدد الاستخدامات» لجميع النماذج القوية.',
  'Same work costs = cost of the tokens of the model on the target ÷ cost of the same tokens on the model, at standard rates':
    'تكلفة العمل نفسه = تكلفة رموز النموذج على النموذج الهدف ÷ تكلفة الرموز نفسها على النموذج، بالأسعار القياسية',
  'With the default, each Powerful model with a price moves to the mid-tier model of its vendor: OpenAI to GPT-5.6 Terra, Anthropic to Claude Sonnet 5.5, Google to Gemini 3.8 Flash, Microsoft to MAI-Code-1.1-Flash and xAI to Grok 4.7. Moonshot and other vendors move to Claude Sonnet 5.5.':
    'مع الإعداد الافتراضي، ينتقل كل نموذج «قوي» له سعر إلى نموذج الفئة المتوسطة لدى مزوّده: OpenAI إلى GPT-5.6 Terra، وAnthropic إلى Claude Sonnet 5.5، وGoogle إلى Gemini 3.8 Flash، وMicrosoft إلى MAI-Code-1.1-Flash، وxAI إلى Grok 4.7. أما Moonshot والمزوّدون الآخرون فينتقلون إلى Claude Sonnet 5.5.',
  'With a chosen model, every Powerful model moves to it.':
    'مع نموذج مختار، ينتقل كل نموذج «قوي» إليه.',
  'The tokens of the model (input, cache read, cache write, output) are priced on the model and on its target at the standard rates of the price card. Same work costs is the second cost divided by the first.':
    'تُسعَّر رموز النموذج (الإدخال، والقراءة من الذاكرة المؤقتة، والكتابة في الذاكرة المؤقتة، والإخراج) على النموذج وعلى هدفه بالأسعار القياسية في قائمة الأسعار. وتكلفة العمل نفسه هي التكلفة الثانية مقسومة على الأولى.',
  'When it is below 1, a full move saves the usage of the model × (1 − same work costs). A target that is not cheaper saves nothing.':
    'عندما تقل عن 1، يوفّر النقل الكامل استخدام النموذج × (1 − تكلفة العمل نفسه). والنموذج الهدف الذي ليس أرخص لا يوفّر شيئًا.',
  'A model is left out when it is its own target, when the target has no rates or when its tokens cost nothing at the standard rates.':
    'يُستبعد النموذج عندما يكون هو هدف نفسه، أو عندما لا تكون للهدف أسعار، أو عندما لا تكلّف رموزه شيئًا بالأسعار القياسية.',
  'The list of targets is the Versatile tier of the price card.':
    'قائمة النماذج الهدف هي فئة «متعدد الاستخدامات» في قائمة الأسعار.',
  'It changes only the Right-size models lever. The other levers do not use it.':
    'وهو يغيّر إجراء «اختيار النموذج المناسب» فقط. ولا تستخدمه الإجراءات الأخرى.',
  'It compares prices and does not say whether the target can do the work.':
    'وهو يقارن الأسعار ولا يبيّن ما إذا كان النموذج الهدف قادرًا على أداء العمل.',
  'A Powerful model has $1,000 of usage. On the target its tokens would cost 40% as much, so a full move saves $1,000 × (1 − 0.4) = $600. At a share of 30% the lever saves $180.':
    'نموذج «قوي» استخدامه $1,000. وعلى النموذج الهدف ستكلّف رموزه 40% من ذلك، فيوفّر النقل الكامل $1,000 × (1 − 0.4) = $600. وعند حصة 30% يوفّر الإجراء $180.',

  // Simulator: the cap level
  'The multiple of the included credits of a seat above which the usage of a user counts as runaway for the Cap runaway users lever. A lower multiple is a stricter limit.':
    'مضاعف الأرصدة المشمولة في الترخيص الذي يُعدّ استخدام المستخدم فوقه مفرطًا في إجراء «وضع حد للمستخدمين المفرطين». وكلما قلّ المضاعف كان الحد أكثر صرامة.',
  'Usage above the cap = sum over users of max(0, usage of the user − cap level × included credits of the user in dollars)':
    'الاستخدام فوق الحد = مجموع المستخدمين لقيمة max(0, استخدام المستخدم − مستوى الحد الأقصى × الأرصدة المشمولة للمستخدم بالدولار)',
  'The included credits of a user are the credits of the seat in each month with usage, added up and valued at $0.01 per credit. When the file gives none for the user, the most common seat size is used for each of those months.':
    'الأرصدة المشمولة للمستخدم هي أرصدة الترخيص في كل شهر فيه استخدام، مجموعة ومقيَّمة بـ $0.01 للرصيد الواحد. وعندما لا يتضمن الملف قيمة للمستخدم، يُستخدم حجم الترخيص الأكثر شيوعًا لكل شهر من تلك الأشهر.',
  'The line of a user is the cap level × those included credits in dollars.':
    'عتبة المستخدم هي مستوى الحد الأقصى × تلك الأرصدة المشمولة بالدولار.',
  'For each user above the line, the excess is the usage of the user − the line. Users without included credits and rows without a username are left out.':
    'لكل مستخدم فوق العتبة، الزيادة هي استخدام المستخدم − العتبة. ويُستبعد المستخدمون بلا أرصدة مشمولة والصفوف بلا اسم مستخدم.',
  'Add up the excesses and take the share of the Cap runaway users slider. The saving is chained like the other levers.':
    'تُجمع الزيادات وتؤخذ حصة منزلق «وضع حد للمستخدمين المفرطين». ويُحتسب التوفير بالتسلسل مثل الإجراءات الأخرى.',
  'The slider runs from 1× to 10× in steps of 0.5×. The default is 3×, which is the line of the savings plan.':
    'يمتد المنزلق من 1× إلى 10× بخطوات 0.5×. والافتراضي 3×، وهو عتبة خطة التوفير.',
  'It does not change the Settings tiers. The runaway tier of the recommendations starts at 3× by default and keeps its own setting.':
    'وهو لا يغيّر شرائح الإعدادات. وتبدأ شريحة الإفراط في التوصيات عند 3× افتراضيًا وتحتفظ بإعدادها الخاص.',
  'A lower cap level raises the usage above the line, so the lever saves more at the same share.':
    'يرفع خفضُ مستوى الحد الأقصى الاستخدام فوق العتبة، فيوفّر الإجراء أكثر عند الحصة نفسها.',
  'A user has 1,900 included credits, which is $19, and $100 of usage. At a cap level of 3× the line is $57 and the excess is $43. At 2× the line is $38 and the excess is $62. At a share of 50% the lever saves $21.50 or $31.':
    'لدى مستخدم 1,900 رصيد مشمول، أي $19، واستخدامه $100. عند مستوى حد أقصى 3× تكون العتبة $57 والزيادة $43. وعند 2× تكون العتبة $38 والزيادة $62. وعند حصة 50% يوفّر الإجراء $21.50 أو $31.',

  // Simulator: the usage chart
  'Usage per month from now to after the levers, with one row per lever in the order the levers run. A green bar marks the part of the usage that the lever removes.':
    'الاستخدام شهريًا من الآن إلى ما بعد الإجراءات، بصف لكل إجراء وفق ترتيب عمل الإجراءات. ويشير الشريط الأخضر إلى الجزء من الاستخدام الذي يزيله الإجراء.',
  'Usage after = usage now − sum of the savings of the six levers':
    'الاستخدام بعد التغيير = الاستخدام الآن − مجموع وفورات الإجراءات الستة',
  'Usage now = usage in the period × 30.4375 ÷ days in the period.':
    'الاستخدام الآن = الاستخدام في الفترة × 30.4375 ÷ عدد أيام الفترة.',
  'Each lever row shows its saving × 30.4375 ÷ days in the period. The saving of a lever = its standalone saving × usage left after the earlier levers ÷ usage in the period.':
    'يعرض كل صف إجراء توفيره × 30.4375 ÷ عدد أيام الفترة. وتوفير الإجراء = توفيره المنفرد × الاستخدام المتبقي بعد الإجراءات السابقة ÷ الاستخدام في الفترة.',
  'When the saving is below $0.50 a month the row reads "no effect" and a note says why, for example that the slider is at 0%.':
    'عندما يقل التوفير عن $0.50 شهريًا يظهر في الصف «بلا أثر» وتبيّن ملاحظة السبب، مثل أن المنزلق عند 0%.',
  'Under the saving, "$X on its own" shows what the lever would save if it ran alone. It appears when that is at least $0.50 and differs from the saving in the chain by at least $0.50. The difference is the overlap with the levers before it.':
    'تحت التوفير، تعرض عبارة «$X بمفرده» ما كان الإجراء سيوفّره لو عمل وحده. وتظهر عندما يبلغ ذلك $0.50 على الأقل ويختلف عن التوفير في السلسلة بمقدار $0.50 على الأقل. والفرق هو التداخل مع الإجراءات السابقة له.',
  'Usage after = max(0, usage in the period − usage avoided) × 30.4375 ÷ days in the period. The note shows the usage reduction.':
    'الاستخدام بعد التغيير = max(0, الاستخدام في الفترة − الاستخدام المتجنَّب) × 30.4375 ÷ عدد أيام الفترة. وتعرض الملاحظة خفض الاستخدام.',
  'The chart averages the whole period. The Month by month table projects the month in progress to its end, so its totals differ a little.':
    'يأخذ الرسم متوسط الفترة كلها. أما جدول «شهرًا بشهر» فيُسقِط الشهر الجاري حتى نهايته، لذلك تختلف إجمالياته قليلًا.',
  'Seat actions are not part of the chart. They change the pool and not the usage.':
    'إجراءات التراخيص ليست جزءًا من الرسم. فهي تغيّر الرصيد المشترك ولا تغيّر الاستخدام.',
  'The amounts are usage that would not occur, not cash.':
    'المبالغ استخدام لن يحدث، وليست نقدًا.',

  // Simulator: the Right-size models table and the month table
  'A period of 30.4375 days has $10,000 of usage. Right-size models saves $500. Use Auto model selection saves $200 on its own and $200 × $9,500 ÷ $10,000 = $190 in the chain. The other levers have no effect. Usage after is $10,000 − $690 = $9,310, which is −6.9%.':
    'فترة مدتها 30.4375 يومًا استخدامها $10,000. يوفّر «اختيار النموذج المناسب» $500. ويوفّر «استخدام الاختيار التلقائي للنموذج (Auto)» $200 بمفرده و$200 × $9,500 ÷ $10,000 = $190 في السلسلة. ولا أثر للإجراءات الأخرى. والاستخدام بعد التغيير = $10,000 − $690 = $9,310، أي −6.9%.',
  'The Powerful-tier models behind the Right-size models lever: where each one would move, what the same work would cost there and how much usage that would save at the share of the slider.':
    'نماذج الفئة القوية وراء إجراء «اختيار النموذج المناسب»: إلى أين سينتقل كل منها، وكم سيكلّف العمل نفسه هناك، وكم من الاستخدام سيوفّره ذلك عند حصة المنزلق.',
  'Saving at the share = usage per month of the model × (1 − same work costs) × share':
    'التوفير عند الحصة = استخدام النموذج شهريًا × (1 − تكلفة العمل نفسه) × الحصة',
  'Usage per month = usage of the model in the period × 30.4375 ÷ days in the period.':
    'الاستخدام شهريًا = استخدام النموذج في الفترة × 30.4375 ÷ عدد أيام الفترة.',
  'Same work costs = cost of the tokens of the model on the target ÷ cost of the same tokens on the model, at standard rates, for the same mix of input, cache and output tokens.':
    'تكلفة العمل نفسه = تكلفة رموز النموذج على النموذج الهدف ÷ تكلفة الرموز نفسها على النموذج، بالأسعار القياسية، لمزيج رموز الإدخال والذاكرة المؤقتة والإخراج نفسه.',
  'Saving at the share = usage per month × (1 − same work costs) × the share of the Right-size models slider. A model that would not cost less is not shown.':
    'التوفير عند الحصة = الاستخدام شهريًا × (1 − تكلفة العمل نفسه) × حصة منزلق «اختيار النموذج المناسب». ولا يظهر النموذج الذي لن يكلّف أقل.',
  'The table shows the five models with the largest saving. The line under it says how many models have a saving.':
    'يعرض الجدول النماذج الخمسة ذات أكبر توفير. ويذكر السطر تحته عدد النماذج التي لها توفير.',
  'The rows add up to the Right-size models row of the chart when all models are shown. It is the first lever, so its saving is not scaled down.':
    'يساوي مجموع الصفوف صف «اختيار النموذج المناسب» في الرسم عندما تظهر كل النماذج. وهو الإجراء الأول، لذلك لا يُخفَّض توفيره.',
  'The usage of a model includes the rows that ran through Auto on it and the rows without token counts. The ratio is measured on the tokens that are there.':
    'يشمل استخدام النموذج الصفوف التي عملت عبر Auto عليه والصفوف التي بلا أعداد رموز. وتُقاس النسبة على الرموز الموجودة.',
  'It compares prices at standard rates. It does not say whether the cheaper model can do the work.':
    'وهو يقارن الأسعار بالأسعار القياسية. ولا يبيّن ما إذا كان النموذج الأرخص قادرًا على أداء العمل.',
  'A model has $1,200 of usage over 30.4375 days, so $1,200 a month. The same work costs 40% on the target, so a full move saves $720. At a share of 30% the row shows −$216.':
    'نموذج استخدامه $1,200 خلال 30.4375 يومًا، أي $1,200 شهريًا. ويكلّف العمل نفسه 40% على النموذج الهدف، فيوفّر النقل الكامل $720. وعند حصة 30% يعرض الصف −$216.',
  'The scenario for each month of the report, before and after the levers and the seat actions. It is the table behind the cash saving.':
    'السيناريو لكل شهر من التقرير، قبل الإجراءات وإجراءات التراخيص وبعدها. وهو الجدول الذي يقوم عليه التوفير النقدي.',
  'Saving of a month = max(pool, usage) − max(pool after seat actions, usage after levers)':
    'توفير الشهر = max(الرصيد المشترك, الاستخدام) − max(الرصيد المشترك بعد إجراءات التراخيص, الاستخدام بعد الإجراءات)',
  'Usage is the gross_amount of the month. The month in progress is projected to its end from the recent daily rate and carries a "projected" badge.':
    'الاستخدام هو gross_amount للشهر. ويُسقَط الشهر الجاري حتى نهايته من المعدل اليومي الأخير ويحمل شارة «مُسقَط».',
  'New usage = usage × (1 − usage reduction). Pool = included credits of all seats in the month, which equal the seat prices. New pool = max(0, pool − seat value removed).':
    'الاستخدام الجديد = الاستخدام × (1 − خفض الاستخدام). الرصيد المشترك = الأرصدة المشمولة في جميع التراخيص في الشهر، وتساوي أسعار التراخيص. الرصيد المشترك الجديد = max(0, الرصيد المشترك − قيمة التراخيص المزالة).',
  'Cost = max(pool, usage). New cost = max(new pool, new usage). Saving = cost − new cost.':
    'التكلفة = max(الرصيد المشترك, الاستخدام). التكلفة الجديدة = max(الرصيد المشترك الجديد, الاستخدام الجديد). التوفير = التكلفة − التكلفة الجديدة.',
  'When the pool size is not known, the table shows Billed = max(0, usage − pool) and New billed = max(0, new usage − new pool) instead of the pool and cost columns. The Saving column stays.':
    'عندما لا يكون حجم الرصيد المشترك معروفًا، يعرض الجدول «مدفوع إضافي» = max(0, الاستخدام − الرصيد المشترك) و«المدفوع الإضافي الجديد» = max(0, الاستخدام الجديد − الرصيد المشترك الجديد) بدلًا من أعمدة الرصيد المشترك والتكلفة. ويبقى عمود «التوفير».',
  'When there are no cash figures, the table shows Usage and New usage only.':
    'عندما لا تتوفر أرقام نقدية، يعرض الجدول «الاستخدام» و«الاستخدام الجديد» فقط.',
  'With more than one month, the Total row adds the months and Average per month divides the total by the number of months.':
    'عند وجود أكثر من شهر، يجمع صف «الإجمالي» الأشهر ويقسم صف «المتوسط في الشهر» الإجمالي على عدد الأشهر.',
  'A star on Pool means that the pool counts only the seats that appear in the report. Add your roster in Settings for the real pool size.':
    'النجمة على «الرصيد المشترك» تعني أن الرصيد يحتسب التراخيص الظاهرة في التقرير فقط. أضف قائمة التراخيص في الإعدادات لمعرفة حجم الرصيد المشترك الفعلي.',
  'The Average per month of the Saving column is the Cash saving per month tile.':
    'قيمة «المتوسط في الشهر» في عمود «التوفير» هي نفسها قيمة بطاقة «التوفير النقدي شهريًا».',
  'A month has a pool of $9,600 and $10,000 of usage. The levers avoid 8% and idle seats worth $190 are removed. New usage is $9,200 and the new pool is $9,410. Cost is $10,000, new cost is $9,410 and the saving is $590.':
    'شهر رصيده المشترك $9,600 واستخدامه $10,000. وتتجنب الإجراءات 8% وتُزال تراخيص خاملة قيمتها $190. فيكون الاستخدام الجديد $9,200 والرصيد المشترك الجديد $9,410. والتكلفة $10,000 والتكلفة الجديدة $9,410 والتوفير $590.',

  // Seat economics: seats in the report and seat value
  'How many users have usage in the loaded files within the selected dates. Each of them holds a seat. The note under the number compares them with the seat roster in Settings.':
    'عدد المستخدمين الذين لهم استخدام في الملفات المحمّلة ضمن التواريخ المحددة. ويشغل كل منهم ترخيصًا. وتقارنهم الملاحظة تحت الرقم بقائمة التراخيص في الإعدادات.',
  'Seats in the report = number of usernames with at least one usage row in the selected dates':
    'التراخيص في التقرير = عدد أسماء المستخدمين التي لها صف استخدام واحد على الأقل ضمن التواريخ المحددة',
  'Count each username that has a row in the selected dates. Rows without a username are not counted.':
    'يُعدّ كل اسم مستخدم له صف ضمن التواريخ المحددة. ولا تُعدّ الصفوف بلا اسم مستخدم.',
  'The note under the number reads "plus N roster seats that never appear" when the roster in Settings has users who are not in the report. N is the number of seats in the third list on this tab. The note reads "every roster seat appears" when none is missing and "no seat roster loaded" when the roster is empty.':
    'تقول الملاحظة تحت الرقم «+ N تراخيص في القائمة، دون ظهور في التقرير» عندما تضم القائمة في الإعدادات مستخدمين ليسوا في التقرير. وN هو عدد التراخيص في القائمة الثالثة في هذا التبويب. وتقول الملاحظة «كل ترخيص في القائمة يظهر» عندما لا ينقص أحد، و«لم تُحمَّل قائمة تراخيص» عندما تكون القائمة فارغة.',
  'A seat whose user had no usage in the selected dates is not in the report, so the real number of seats can be higher. Add the roster in Settings to see those seats.':
    'الترخيص الذي لم يكن لمستخدمه استخدام ضمن التواريخ المحددة ليس في التقرير، لذلك قد يكون العدد الفعلي للتراخيص أعلى. أضف قائمة التراخيص في الإعدادات لرؤية تلك التراخيص.',
  'The number counts usernames, not licenses, and it changes with the selected dates.':
    'الرقم يعدّ أسماء المستخدمين لا التراخيص، ويتغير بتغير التواريخ المحددة.',
  'Code completions and next edit suggestions are not in the report, so a user who only uses them does not appear.':
    'إكمالات الكود واقتراحات التعديل التالي ليست في التقرير، لذلك لا يظهر المستخدم الذي لا يستخدم سواها.',
  'Rows exist for 412 usernames in the selected dates, and the roster has 9 more users with no rows. The tile reads 412 and the note reads "plus 9 roster seats that never appear".':
    'توجد صفوف لـ 412 اسم مستخدم ضمن التواريخ المحددة، وفي القائمة 9 مستخدمين آخرين بلا صفوف. فتعرض البطاقة 412 وتقول الملاحظة «+ 9 تراخيص في القائمة، دون ظهور في التقرير».',
  'What the seats cost in a month, taken as the value of the credits they include. One credit is $0.01, so a Business seat with 1,900 credits is $19 and an Enterprise seat with 3,900 credits is $39.':
    'ما تكلّفه التراخيص في الشهر، محسوبًا بقيمة الأرصدة التي تشملها. والرصيد الواحد $0.01، فترخيص Business بـ 1,900 رصيد قيمته $19 وترخيص Enterprise بـ 3,900 رصيد قيمته $39.',
  'Seat value per month = average over the months of the pool size':
    'قيمة التراخيص شهريًا = متوسط حجم الرصيد المشترك على الأشهر',
  'The pool size of a month is the sum of the included credits of all seats, in dollars. It counts the users who show a seat size in the file, the roster seats that do not appear that month and the extra seats from Settings.':
    'حجم الرصيد المشترك لشهر ما هو مجموع الأرصدة المشمولة في جميع التراخيص، بالدولار. ويحتسب المستخدمين الذين يظهر لهم حجم ترخيص في الملف، وتراخيص القائمة التي لا تظهر في ذلك الشهر، والتراخيص الإضافية من الإعدادات.',
  'The tile is the average of the months in the selected dates. The note under it reads "one month" or "average of N months".':
    'البطاقة هي متوسط الأشهر ضمن التواريخ المحددة. وتقول الملاحظة تحتها «شهر واحد» أو «متوسط الفترة: N أشهر».',
  'A star means that the pool counts only the seats the app can see, so the real value is higher.':
    'النجمة تعني أن الرصيد المشترك يحتسب التراخيص التي يراها التطبيق فقط، لذلك تكون القيمة الفعلية أعلى.',
  'It assumes that a seat costs what its credits are worth. Check this against your contract.':
    'ويفترض أن الترخيص يكلّف ما تساويه أرصدته. تحقق من ذلك في عقدك.',
  'It is the price of the seats, not what was billed. Usage above the pool is billed on top of it.':
    'وهو سعر التراخيص وليس المبلغ المدفوع الإضافي. ويُدفع الاستخدام الذي يتجاوز الرصيد المشترك إضافيًا فوق ذلك.',
  'The star appears when Settings has neither a roster nor extra seats, or when the covered credits are above what the seats in the file can fund.':
    'تظهر النجمة عندما لا تحتوي الإعدادات على قائمة تراخيص ولا على تراخيص إضافية، أو عندما تزيد الأرصدة المغطاة على ما تستطيع التراخيص في الملف تمويله.',
  'In each of 3 months there are 300 Business seats and 100 Enterprise seats. A month is 300 × $19 + 100 × $39 = $9,600, so the average is $9,600 a month.':
    'في كل شهر من 3 أشهر هناك 300 ترخيص Business و100 ترخيص Enterprise. والشهر = 300 × $19 + 100 × $39 = $9,600، فالمتوسط $9,600 شهريًا.',
  'How much of the included credits of all seats the usage consumes. The rest is paid for and not used.':
    'مقدار ما يستهلكه الاستخدام من الأرصدة المشمولة في جميع التراخيص. والباقي مدفوع الثمن وغير مستخدم.',

  // Seat economics: pool use, unused credits, the three seat lists
  'Share of the pool used = 1 − average unused included credits ÷ average pool size':
    'حصة الرصيد المشترك المستخدمة = 1 − متوسط الأرصدة المشمولة غير المستخدمة ÷ متوسط حجم الرصيد المشترك',
  'For each month, take the pool size and the usage of the month. The month in progress uses its projected usage.':
    'لكل شهر، يؤخذ حجم الرصيد المشترك واستخدام الشهر. ويستخدم الشهر الجاري استخدامه المُسقَط.',
  'Unused credits of a month = max(0, pool size − usage). A month with usage above the pool has none.':
    'الأرصدة غير المستخدمة في شهر = max(0, حجم الرصيد المشترك − الاستخدام). والشهر الذي يزيد استخدامه على الرصيد المشترك لا أرصدة غير مستخدمة فيه.',
  'Take the average of the unused credits and the average of the pool over the months. Share used = 1 − average unused ÷ average pool. The bar under the tiles shows the same number.':
    'يؤخذ متوسط الأرصدة غير المستخدمة ومتوسط الرصيد المشترك على الأشهر. الحصة المستخدمة = 1 − متوسط غير المستخدم ÷ متوسط الرصيد المشترك. ويعرض الشريط تحت البطاقات الرقم نفسه.',
  'The tile shows a dash when the pool size is unknown, for example when the file has no billing split or the covered credits are above what the seats in the file can fund.':
    'تعرض البطاقة شرطة عندما يكون حجم الرصيد المشترك غير معروف، مثلًا عندما لا يتضمن الملف تقسيمًا للفوترة أو عندما تزيد الأرصدة المغطاة على ما تستطيع التراخيص في الملف تمويله.',
  'It equals the sum over the months of min(pool, usage) ÷ the sum of the pools. The recommendations about included credits use the same number.':
    'وهي تساوي مجموع min(الرصيد المشترك, الاستخدام) على الأشهر ÷ مجموع الرصيد المشترك على الأشهر. وتستخدم التوصيات المتعلقة بالأرصدة المشمولة الرقم نفسه.',
  'It differs a little from Included credits used on the Overview, which divides the credits that covered usage by the pool and does not project the month in progress.':
    'وهي تختلف قليلًا عن «نسبة استخدام الأرصدة المشمولة» في «نظرة عامة»، التي تقسم الأرصدة التي غطّت الاستخدام على الرصيد المشترك ولا تُسقِط الشهر الجاري.',
  'The bar gets a warning style when usage above the pool averages $0.50 or more a month, and an informational style when less than 40% of the pool is used.':
    'يأخذ الشريط نمط التحذير عندما يبلغ متوسط الاستخدام فوق الرصيد المشترك $0.50 شهريًا أو أكثر، ونمط المعلومة عندما يُستخدم أقل من 40% من الرصيد المشترك.',
  'When the seat value has a star, the pool counts only the seats the app can see, so the real share is lower.':
    'عندما تحمل قيمة التراخيص نجمة، يحتسب الرصيد المشترك التراخيص التي يراها التطبيق فقط، لذلك تكون الحصة الفعلية أقل.',
  'Month 1 has a pool of $1,000 and usage of $600. Month 2 has a pool of $1,000 and usage of $1,300. Unused credits are $400 and $0, on average $200. Share used = 1 − $200 ÷ $1,000 = 80%.':
    'للشهر 1 رصيد مشترك $1,000 واستخدام $600. وللشهر 2 رصيد مشترك $1,000 واستخدام $1,300. والأرصدة غير المستخدمة $400 و$0، بمتوسط $200. الحصة المستخدمة = 1 − $200 ÷ $1,000 = 80%.',
  'Included credits that are paid for and not used, per month. It is the most that removing seats can save. Using less does not lower the bill while usage stays below the pool.':
    'الأرصدة المشمولة المدفوعة وغير المستخدمة، شهريًا. وهي أقصى ما يمكن أن توفّره إزالة التراخيص. ولا يخفض الاستخدام الأقل الفاتورة ما دام الاستخدام دون الرصيد المشترك.',
  'For each month, take the pool size and the usage. The month in progress uses its projected usage.':
    'لكل شهر، يؤخذ حجم الرصيد المشترك والاستخدام. ويستخدم الشهر الجاري استخدامه المُسقَط.',
  'The tile is the average over the months. The note under it shows the unused part of the pool, which is 1 − the share of the pool used.':
    'البطاقة هي المتوسط على الأشهر. وتعرض الملاحظة تحتها الجزء غير المستخدم من الرصيد المشترك، وهو 1 − حصة الرصيد المشترك المستخدمة.',
  'The tile shows a dash when the pool size is unknown.':
    'تعرض البطاقة شرطة عندما يكون حجم الرصيد المشترك غير معروف.',
  'The text under the bar compares two averages and counts each from $0.50 a month: the unused credits and the usage above the pool, which is max(0, usage − pool size).':
    'يقارن النص تحت الشريط بين متوسطين ويحتسب كلًّا منهما بدءًا من $0.50 شهريًا: الأرصدة غير المستخدمة والاستخدام فوق الرصيد المشترك، وهو max(0, الاستخدام − حجم الرصيد المشترك).',
  'With both, the text says that months differ and points to the month table in the simulator. With only unused credits, it says that removing seats can save up to that amount and that using less would not lower the bill. With only usage above the pool, it says that using less lowers the bill and that removing seats would not. With neither, it says that usage is almost exactly the size of the pool.':
    'مع وجود الاثنين معًا، يذكر النص أن الأشهر تختلف ويشير إلى جدول الأشهر في المحاكي. ومع الأرصدة غير المستخدمة فقط، يذكر أن إزالة التراخيص قد توفّر حتى ذلك المبلغ وأن الاستخدام الأقل لن يخفض الفاتورة. ومع الاستخدام فوق الرصيد المشترك فقط، يذكر أن الاستخدام الأقل يخفض الفاتورة وأن إزالة التراخيص لن تفعل ذلك. ومع غياب الاثنين، يذكر أن الاستخدام يساوي تقريبًا حجم الرصيد المشترك تمامًا.',
  'An average hides the differences between months, because a month with unused credits and a month with usage above the pool offset each other in it.':
    'يخفي المتوسط الفروق بين الأشهر، لأن الشهر الذي فيه أرصدة غير مستخدمة والشهر الذي يزيد استخدامه على الرصيد المشترك يعوّض أحدهما الآخر فيه.',
  'Month 1 has a pool of $9,600 and usage of $8,000. Month 2 has the same pool and usage of $10,500. Unused credits are $1,600 and $0, so the tile reads $800. Usage above the pool is $0 and $900, on average $450. Both are above $0.50, so the text says that months differ.':
    'للشهر 1 رصيد مشترك $9,600 واستخدام $8,000. وللشهر 2 الرصيد المشترك نفسه واستخدام $10,500. والأرصدة غير المستخدمة $1,600 و$0، فتعرض البطاقة $800. والاستخدام فوق الرصيد المشترك $0 و$900، بمتوسط $450. وكلاهما فوق $0.50، لذلك يذكر النص أن الأشهر تختلف.',
  'Value of the three seat lists together':
    'قيمة قوائم التراخيص الثلاث معًا',
  'The monthly seat value of every seat in the three lists below, and what taking all of them would save in cash today. The lists draw on the same unused included credits, so the cash together can be less than the sum of the three lines.':
    'القيمة الشهرية لكل ترخيص في القوائم الثلاث أدناه، وما سيوفّره اتخاذ الإجراء على جميعها نقدًا اليوم. وتعتمد القوائم على الأرصدة المشمولة غير المستخدمة نفسها، لذلك قد يقل النقد المجمّع عن مجموع الأسطر الثلاثة.',
  'Seat value together = idle seats + Enterprise seats to move + roster seats that never appear, in dollars a month':
    'قيمة التراخيص معًا = التراخيص الخاملة + تراخيص Enterprise التي تناسب Business + تراخيص القائمة التي لا تظهر أبدًا، بالدولار شهريًا',
  'Each list has a seat value: the sum of the monthly prices of its seats. A seat is in at most one list, so the three values can be added. The text appears when the total is $0.50 or more.':
    'لكل قائمة قيمة تراخيص: مجموع الأسعار الشهرية لتراخيصها. والترخيص في قائمة واحدة على الأكثر، لذلك يمكن جمع القيم الثلاث. ويظهر النص عندما يبلغ الإجمالي $0.50 أو أكثر.',
  'Cash today is worked out with the pool of every month reduced by the total seat value. Pool after = max(0, pool − seat value). Cost before = max(pool, usage) and cost after = max(pool after, usage). The month in progress uses its projected usage.':
    'يُحسب النقد اليوم بعد تخفيض الرصيد المشترك لكل شهر بإجمالي قيمة التراخيص. الرصيد المشترك بعد التغيير = max(0, الرصيد المشترك − قيمة التراخيص). والتكلفة قبل = max(الرصيد المشترك, الاستخدام) والتكلفة بعد = max(الرصيد المشترك بعد التغيير, الاستخدام). ويستخدم الشهر الجاري استخدامه المُسقَط.',
  'Cash = the average over the months of cost before − cost after. In a single month it is the smaller of the seat value and the unused credits of that month.':
    'النقد = متوسط (التكلفة قبل − التكلفة بعد) على الأشهر. وفي شهر واحد هو الأصغر بين قيمة التراخيص والأرصدة غير المستخدمة في ذلك الشهر.',
  'When the pool size is unknown the text says that cash savings need a known pool size.':
    'عندما يكون حجم الرصيد المشترك غير معروف يذكر النص أن التوفير النقدي يتطلب حجم رصيد مشترك معروفًا.',
  'Each list is measured against the same pool, so adding the cash lines of the three lists can give more than the cash of the three together.':
    'تُقاس كل قائمة على الرصيد المشترك نفسه، لذلك قد يتجاوز مجموع أسطر النقد للقوائم الثلاث النقد المحسوب لها معًا.',
  'It is an estimate from past months, not a forecast. It assumes that a seat costs the value of its included credits.':
    'وهو تقدير من الأشهر الماضية وليس توقعًا. ويفترض أن الترخيص يكلّف قيمة أرصدته المشمولة.',
  'Read the caveat under each list before you act on it. The report cannot see code completions.':
    'اقرأ التنبيه تحت كل قائمة قبل اتخاذ إجراء بشأنها. فالتقرير لا يرى إكمالات الكود.',
  'Idle seats are worth $190 a month, Enterprise seats to move $60 and roster seats $95, together $345. Month 1 has a pool of $9,600 and usage of $9,400, so $200 is unused and the saving is min($345, $200) = $200. Month 2 has usage above the pool and saves $0. The average is $100 a month.':
    'قيمة التراخيص الخاملة $190 شهريًا، وتراخيص Enterprise التي تناسب Business $60، وتراخيص القائمة $95، أي $345 معًا. وللشهر 1 رصيد مشترك $9,600 واستخدام $9,400، فيبقى $200 غير مستخدم ويكون التوفير min($345, $200) = $200. أما الشهر 2 فاستخدامه فوق الرصيد المشترك ويوفّر $0. والمتوسط $100 شهريًا.',

  // Seat economics: cash effect of one seat list
  'Cash effect of a seat list':
    'الأثر النقدي لقائمة التراخيص',
  'What the bill would fall by each month if every seat in the list were actioned and nothing else changed. A seat has a price, but the bill falls only by the unused part of the pool.':
    'المبلغ الذي ستنخفض به الفاتورة كل شهر لو اتُّخذ إجراء على كل ترخيص في القائمة ولم يتغير شيء آخر. وللترخيص سعر، لكن الفاتورة لا تنخفض إلا بالجزء غير المستخدم من الرصيد المشترك.',
  'Cash effect = average over the months of max(pool, usage) − max(pool − seat value, usage)':
    'الأثر النقدي = متوسط max(الرصيد المشترك, الاستخدام) − max(الرصيد المشترك − قيمة التراخيص, الاستخدام) على الأشهر',
  'Seat value of the list = the sum of the monthly prices of its seats. It is the amount in the subtitle of the list.':
    'قيمة تراخيص القائمة = مجموع الأسعار الشهرية لتراخيصها. وهي المبلغ في العنوان الفرعي للقائمة.',
  'For each month, pool after = max(0, pool − seat value). Cost before = max(pool, usage) and cost after = max(pool after, usage). The month in progress uses its projected usage.':
    'لكل شهر: الرصيد المشترك بعد التغيير = max(0, الرصيد المشترك − قيمة التراخيص). والتكلفة قبل = max(الرصيد المشترك, الاستخدام) والتكلفة بعد = max(الرصيد المشترك بعد التغيير, الاستخدام). ويستخدم الشهر الجاري استخدامه المُسقَط.',
  'Cash effect = the average over the months of cost before − cost after. In a single month it is the smaller of the seat value and the unused credits of that month.':
    'الأثر النقدي = متوسط (التكلفة قبل − التكلفة بعد) على الأشهر. وفي شهر واحد هو الأصغر بين قيمة التراخيص والأرصدة غير المستخدمة في ذلك الشهر.',
  'Below $0.50 a month the line says that the list would not lower the bill now. From $0.50 it says that the list lowers the bill by about that amount. It adds that only the unused part of the pool is saved when the amount is more than $0.50 below the seat value.':
    'دون $0.50 شهريًا يذكر السطر أن القائمة لن تخفض الفاتورة الآن. ومن $0.50 يذكر أنها تخفض الفاتورة بنحو ذلك المبلغ. ويضيف أن الجزء غير المستخدم من الرصيد المشترك وحده هو ما يُوفَّر عندما يقل المبلغ عن قيمة التراخيص بأكثر من $0.50.',
  'The line is not shown when the pool size is unknown.':
    'لا يظهر السطر عندما يكون حجم الرصيد المشترك غير معروف.',
  'Each list is measured on its own. The three lists share the same unused credits, so their cash effects overlap.':
    'تُقاس كل قائمة وحدها. وتشترك القوائم الثلاث في الأرصدة غير المستخدمة نفسها، لذلك تتداخل آثارها النقدية.',
  'It uses the months in the report and is not a forecast. It assumes that a seat costs the value of its included credits.':
    'وهو يستخدم أشهر التقرير وليس توقعًا. ويفترض أن الترخيص يكلّف قيمة أرصدته المشمولة.',
  'A list is worth $190 a month. Month 1 has $100 of unused credits, so it saves $100. Month 2 has $600 of unused credits, so it saves the full $190. The average is ($100 + $190) ÷ 2 = $145, which is more than $0.50 below $190, so the line adds the reason.':
    'قيمة قائمة $190 شهريًا. وفي الشهر 1 أرصدة غير مستخدمة $100، فتوفّر $100. وفي الشهر 2 أرصدة غير مستخدمة $600، فتوفّر $190 كاملة. والمتوسط ($100 + $190) ÷ 2 = $145، وهو أقل من $190 بأكثر من $0.50، لذلك يضيف السطر السبب.',

  // Seat table columns: last active, busiest month, share of the Business allotment
  'The most recent day on which the user has a usage row in the loaded files, within the selected dates.':
    'أحدث يوم للمستخدم فيه صف استخدام في الملفات المحمّلة، ضمن التواريخ المحددة.',
  'Last active = the latest date with at least one usage row of the user in the selected dates':
    'آخر نشاط = أحدث تاريخ له صف استخدام واحد على الأقل للمستخدم ضمن التواريخ المحددة',
  'Look at every row of the user in the selected dates.':
    'ينظر إلى كل صف للمستخدم ضمن التواريخ المحددة.',
  'Take the latest date. It is shown as year, month and day.':
    'يؤخذ أحدث تاريخ. ويظهر بصيغة السنة والشهر واليوم.',
  'Days since last use counts the days from this date to the end of the selected dates.':
    'تعدّ «الأيام منذ آخر استخدام» الأيام من هذا التاريخ إلى نهاية التواريخ المحددة.',
  'Code completions and next edit suggestions are not in the report, so the user can have been active in GitHub after this date.':
    'إكمالات الكود واقتراحات التعديل التالي ليست في التقرير، لذلك قد يكون المستخدم نشطًا في GitHub بعد هذا التاريخ.',
  'A license import in Settings adds the last activity in GitHub itself. The idle seat rule uses it.':
    'يضيف استيراد التراخيص في الإعدادات آخر نشاط في GitHub نفسه. وتستخدمه قاعدة الترخيص الخامل.',
  'The selected dates end on Sep 20, 2025 and the last row of the user is on Sep 3, 2025. Last active reads 2025-09-03 and Days since last use reads 17.':
    'تنتهي التواريخ المحددة في 20 سبتمبر 2025 وآخر صف للمستخدم في 3 سبتمبر 2025. فيعرض «آخر نشاط» 2025-09-03 ويعرض «الأيام منذ آخر استخدام» 17.',
  'The most usage the user had in a single calendar month of the selected dates. Included credits start again each month, so the busiest month decides whether a Business seat would have been enough.':
    'أكبر استخدام كان للمستخدم في شهر تقويمي واحد ضمن التواريخ المحددة. وتبدأ الأرصدة المشمولة من جديد كل شهر، لذلك يحدد الشهر الأكثر استخدامًا ما إذا كان ترخيص Business سيكفي.',
  'Busiest month = the largest monthly usage of the user among the calendar months of the selected dates':
    'الشهر الأكثر استخدامًا = أكبر استخدام شهري للمستخدم بين الأشهر التقويمية ضمن التواريخ المحددة',
  'Add up the gross_amount of the user for each calendar month in the selected dates.':
    'يُجمع gross_amount للمستخدم لكل شهر تقويمي ضمن التواريخ المحددة.',
  'Take the largest of those monthly totals.':
    'يؤخذ أكبر هذه الإجماليات الشهرية.',
  'A month that the selected dates cover only in part counts the days that are covered. A month in progress counts what was used so far, not a projection.':
    'الشهر الذي تغطي التواريخ المحددة جزءًا منه فقط يُحتسب بالأيام المغطاة. والشهر الجاري يُحتسب بما استُخدم حتى الآن، وليس بإسقاط.',
  'It is in dollars of usage, not credits. One credit is $0.01.':
    'وهو بدولارات الاستخدام، وليس بالأرصدة. والرصيد الواحد $0.01.',
  'The table starts with the lowest busiest month, because those users have the most room.':
    'يبدأ الجدول بأدنى شهر أكثر استخدامًا، لأن هؤلاء المستخدمين لديهم أكبر هامش.',
  'A user whose busiest month is the month in progress can still go higher before the month ends.':
    'المستخدم الذي يكون شهره الأكثر استخدامًا هو الشهر الجاري قد يرتفع استخدامه أكثر قبل انتهاء الشهر.',
  'A user had $6.40 of usage in July, $11.20 in August and $9.00 in September. The busiest month is August at $11.20.':
    'كان لمستخدم استخدام $6.40 في يوليو و$11.20 في أغسطس و$9.00 في سبتمبر. والشهر الأكثر استخدامًا هو أغسطس بقيمة $11.20.',
  'The busiest month of the user as a share of the $19 of included credits in a Business seat. It shows how much room a Business seat would have had.':
    'الشهر الأكثر استخدامًا للمستخدم كنسبة من $19 من الأرصدة المشمولة في ترخيص Business. وتبيّن مقدار الهامش الذي كان سيتوفر لترخيص Business.',
  'Share of Business allotment = busiest month ÷ $19':
    'النسبة من حصة Business = الشهر الأكثر استخدامًا ÷ $19',
  'Busiest month = the largest monthly usage of the user in the selected dates.':
    'الشهر الأكثر استخدامًا = أكبر استخدام شهري للمستخدم ضمن التواريخ المحددة.',
  'Business allotment = 1,900 credits × $0.01 = $19.':
    'حصة Business = 1,900 رصيد × $0.01 = $19.',
  'An Enterprise user is listed when the share is at most 80%, which is $15.20. A Business seat would then have at least 20% to spare.':
    'يُدرج مستخدم Enterprise عندما تكون النسبة 80% على الأكثر، أي $15.20. وعندها يتبقى في ترخيص Business 20% على الأقل.',
  'Each move saves the price difference: $39 − $19 = $20 a month.':
    'يوفّر كل نقل فرق السعر: $39 − $19 = $20 شهريًا.',
  'The 80% is fixed. No setting changes it.':
    'نسبة 80% ثابتة. ولا يغيّرها أي إعداد.',
  'Every user in the table is at or below 80%, so a share close to 80% leaves little room.':
    'كل مستخدم في الجدول عند 80% أو دونها، لذلك تترك النسبة القريبة من 80% هامشًا ضيقًا.',
  'It compares credits only. Check that nobody relies on a feature that only Enterprise has before you move a seat.':
    'وهي تقارن الأرصدة فقط. تحقق من أن أحدًا لا يعتمد على ميزة خاصة بـ Enterprise قبل نقل أي ترخيص.',
  'A busiest month of $11.20 is $11.20 ÷ $19 = 59% of the Business allotment. The user is listed because 59% is at most 80%. Moving the seat saves $20 a month.':
    'شهر أكثر استخدامًا قيمته $11.20 يساوي $11.20 ÷ $19 = 59% من حصة Business. ويُدرج المستخدم لأن 59% هي 80% على الأكثر. ويوفّر نقل الترخيص $20 شهريًا.',

  // Value shown on a recommendation
  'Value shown on a recommendation':
    'القيمة المعروضة على التوصية',
  'The dollar figure on the chip of a recommendation. It says what would change in a month if you acted on it: cash saved, the value of seats, or usage that goes away.':
    'الرقم بالدولار على شارة التوصية. ويبيّن ما الذي سيتغير في الشهر لو اتخذت الإجراء: النقد الموفَّر أو قيمة التراخيص أو الاستخدام الذي يزول.',
  'Cash saved per month = average over the months of (cost before − cost after), with cost = max(pool, usage)':
    'النقد الموفَّر شهريًا = متوسط (التكلفة قبل − التكلفة بعد) على الأشهر، حيث التكلفة = max(الرصيد المشترك, الاستخدام)',
  'Usage avoided per month = the share of usage that the action removes × the usage of a month. The month in progress uses its projected usage.':
    'الاستخدام المتجنَّب شهريًا = حصة الاستخدام التي يزيلها الإجراء × استخدام الشهر. ويستخدم الشهر الجاري استخدامه المُسقَط.',
  'Cash saved per month = the average over the months of max(pool, usage) − max(pool, usage after the action). Usage that stays inside the pool saves no cash, because the seats are paid for anyway.':
    'النقد الموفَّر شهريًا = متوسط max(الرصيد المشترك, الاستخدام) − max(الرصيد المشترك, الاستخدام بعد الإجراء) على الأشهر. والاستخدام الذي يبقى داخل الرصيد المشترك لا يوفّر نقدًا، لأن التراخيص مدفوعة على أي حال.',
  'When the pool size is unknown, or a filter is active, the pool cannot be split. Cash is then the smaller of the usage avoided and the billed overage, both per month. It is a lower bound, and the chip says "at least".':
    'عندما يكون حجم الرصيد المشترك غير معروف، أو يكون عامل تصفية نشطًا، لا يمكن تقسيم الرصيد المشترك. وعندها يكون النقد هو الأصغر بين الاستخدام المتجنَّب والمدفوع الإضافي، كلاهما شهريًا. وهو حد أدنى، وتتضمن الشارة عبارة «على الأقل».',
  'The chip shows the first of these that is above $0.50 a month: cash saved ("≈ $X/mo saved"), seat value ("≈ $X/mo of seat value") or usage avoided ("≈ $X/mo less usage"). When none is above $0.50 there is no chip.':
    'تعرض الشارة أول ما يزيد على $0.50 شهريًا من هذه الأرقام: النقد الموفَّر («توفير نحو $X شهريًا») أو قيمة التراخيص («نحو $X شهريًا من قيمة التراخيص») أو الاستخدام المتجنَّب («استخدام أقل بنحو $X شهريًا»). وإذا لم يزد أي منها على $0.50 فلا تظهر شارة.',
  'Seat value is the monthly price of the seats that an idle-seat or downgrade recommendation would remove or move to Business. It turns into cash only for the part of the pool that was not used.':
    'قيمة التراخيص هي السعر الشهري للتراخيص التي ستزيلها توصية الترخيص الخامل، أو تنقلها توصية الخفض إلى Business. ولا تتحول إلى نقد إلا في الجزء غير المستخدم من الرصيد المشترك.',
  'Each recommendation shows one figure. The figures overlap, so they are not added up. The combined value of the plan is worked out once, with every lever applied one after the other.':
    'تعرض كل توصية رقمًا واحدًا. وتتداخل الأرقام، لذلك لا تُجمع. وتُحسب القيمة المجمّعة للخطة مرة واحدة، بتطبيق كل إجراء بعد الآخر.',
  'Recommendations that describe a situation, such as billed overage, budgets or data notes, have no figure.':
    'التوصيات التي تصف حالة، مثل المدفوع الإضافي أو الميزانيات أو ملاحظات البيانات، لا رقم لها.',
  'The shares of usage that an action removes are the defaults of the simulator. The doc of each recommendation names the share it uses.':
    'حصص الاستخدام التي يزيلها الإجراء هي الإعدادات الافتراضية للمحاكي. ويذكر شرح كل توصية الحصة التي يستخدمها.',
  'In a filtered view the pool and the roster describe the whole organization, so seat figures are not shown there.':
    'في العرض المصفّى يصف الرصيد المشترك وقائمة التراخيص المؤسسة كلها، لذلك لا تظهر أرقام التراخيص فيه.',
  'The cost model assumes that a seat costs the value of its included credits: $19 for 1,900 credits and $39 for 3,900 credits. Check it against your contract before acting on the figures.':
    'تفترض طريقة حساب التكلفة أن الترخيص يكلّف قيمة أرصدته المشمولة: $19 مقابل 1,900 رصيد و$39 مقابل 3,900 رصيد. تحقق منها في عقدك قبل العمل بالأرقام.',

  // Cash saved vs usage avoided, confidence, severity and themes
  'Pool $9,600 and usage $10,000 in a month. An action removes 5% of usage, which is $500. Cost before = max($9,600, $10,000) = $10,000. Cost after = max($9,600, $9,500) = $9,600. Cash saved = $400. The other $100 was inside the pool: it is usage avoided, but not cash.':
    'رصيد مشترك $9,600 واستخدام $10,000 في شهر. ويزيل إجراء 5% من الاستخدام، أي $500. التكلفة قبل = max($9,600, $10,000) = $10,000. والتكلفة بعد = max($9,600, $9,500) = $9,600. فيكون النقد الموفَّر $400. أما مبلغ $100 المتبقي فكان داخل الرصيد المشترك: فهو استخدام متجنَّب لكنه ليس نقدًا.',
  'Confidence of a recommendation':
    'ثقة التوصية',
  'How much data stands behind a recommendation. It depends on the number of days in the selected period. It does not say whether the advice suits your organization.':
    'مقدار البيانات التي تقف وراء التوصية. ويعتمد على عدد الأيام في الفترة المحددة. ولا يبيّن ما إذا كانت النصيحة تناسب مؤسستك.',
  'Confidence = High at 21 days or more, Medium at 10 to 20 days, Low below 10 days':
    'مستوى الثقة = مرتفع عند 21 يومًا أو أكثر، ومتوسط عند 10 إلى 20 يومًا، ومنخفض دون 10 أيام',
  'Most recommendations use the rule above, with the number of days in the selected period.':
    'تستخدم معظم التوصيات القاعدة أعلاه، مع عدد الأيام في الفترة المحددة.',
  'Idle seats and Enterprise seats to move to Business are never High. They are Medium at 21 days or more and Low below that.':
    'لا يكون مستوى الثقة مرتفعًا أبدًا في توصيتي التراخيص الخاملة ونقل تراخيص Enterprise إلى Business. فهو متوسط عند 21 يومًا أو أكثر ومنخفض دون ذلك.',
  'The recommendation about a pool that is barely used is Low when the pool is only a lower bound. That is the case when the report has no seat roster and no extra seats are set, so the real utilization is lower than shown.':
    'توصية الرصيد المشترك شبه غير المستخدم مستوى الثقة فيها منخفض عندما يكون الرصيد المشترك حدًا أدنى فقط. وهذا يحدث عندما لا تتوفر للتقرير قائمة تراخيص ولا تراخيص إضافية معيّنة، فتكون نسبة الاستخدام الفعلية أقل مما تظهر.',
  'The two recommendations about the file itself, the missing columns and how to read the numbers, are always High.':
    'التوصيتان المتعلقتان بالملف نفسه، أي الأعمدة الناقصة وكيفية قراءة الأرقام، مستوى الثقة فيهما مرتفع دائمًا.',
  'Sort by confidence puts High first, then Medium, then Low. Recommendations with the same confidence keep their order by impact.':
    'يضع «الترتيب بحسب الثقة» المرتفع أولًا ثم المتوسط ثم المنخفض. وتحتفظ التوصيات ذات مستوى الثقة نفسه بترتيبها بحسب الأثر.',
  'It measures the length of the data, not the quality of the advice. A High recommendation can still be wrong for your teams, so read its caveat.':
    'وهو يقيس طول البيانات وليس جودة النصيحة. وقد تكون التوصية ذات الثقة المرتفعة غير مناسبة لفرقك، لذلك اقرأ تنبيهها.',
  'A short period makes projections and trends unreliable. The data notes say so when the period is shorter than 14 days.':
    'الفترة القصيرة تجعل الإسقاطات والاتجاهات غير موثوقة. وتذكر ملاحظات البيانات ذلك عندما تقل الفترة عن 14 يومًا.',
  'It is not a probability.':
    'وهو ليس احتمالًا.',
  'A period of 14 days gives Medium for most recommendations and Low for idle seats. A period of 30 days gives High, and Medium for idle seats. A period of 7 days gives Low for all of them, except the two about the file itself.':
    'فترة من 14 يومًا تعطي مستوى ثقة متوسطًا لمعظم التوصيات ومنخفضًا للتراخيص الخاملة. وفترة من 30 يومًا تعطي مرتفعًا، ومتوسطًا للتراخيص الخاملة. وفترة من 7 أيام تعطي منخفضًا لجميعها، عدا التوصيتين المتعلقتين بالملف نفسه.',
  'How many recommendations the report has for the current view, how urgent each one is, and how many of them ask someone to act.':
    'عدد التوصيات التي في التقرير للعرض الحالي، ومدى إلحاح كل منها، وعدد ما يطلب منها اتخاذ إجراء.',
  'Need action = all recommendations except Info and Good news':
    'التي تحتاج إلى إجراء = جميع التوصيات عدا «معلومة» و«خبر جيد»',
  'Every recommendation has one severity: Critical, High, Medium, Low, Info or Good news. Each rule sets its own limits, which are listed in the doc of the rule.':
    'لكل توصية خطورة واحدة: حرج أو مرتفع أو متوسط أو منخفض أو معلومة أو خبر جيد. وتحدد كل قاعدة حدودها الخاصة، وهي مذكورة في شرح القاعدة.',
  'Critical, High, Medium and Low are problems and savings, from the most urgent to the least. Info is background. Good news is something that works well.':
    'حرج ومرتفع ومتوسط ومنخفض هي مشكلات وفرص توفير، من الأكثر إلحاحًا إلى الأقل. والمعلومة خلفية للسياق. والخبر الجيد هو ما يعمل جيدًا.',
  'The count at the top is the number of recommendations that need action. The status banner uses the same rule: Needs attention for any Critical or High, Worth watching for any Medium, and Healthy otherwise.':
    'العدد في الأعلى هو عدد التوصيات التي تحتاج إلى إجراء. وتستخدم لافتة الحالة القاعدة نفسها: «يحتاج إلى اهتمام» عند وجود أي توصية حرجة أو مرتفعة، و«يستحق المتابعة» عند وجود أي توصية متوسطة، و«جيد» فيما عدا ذلك.',
  'The list is ordered by impact, the largest first. Impact is the figure on the chip: the cash saved when there is some, otherwise the usage or seat value avoided. Recommendations with the same figure go by severity.':
    'تُرتّب القائمة بحسب الأثر، الأكبر أولًا. والأثر هو الرقم على الشارة: النقد الموفَّر عندما يوجد، وإلا فالاستخدام المتجنَّب أو قيمة التراخيص. وتُرتَّب التوصيات التي لها الرقم نفسه بحسب الخطورة.',
  'Sort by impact is the default. Sort by severity puts Critical first and Good news last. Sort by confidence puts High first. Ties keep the order by impact.':
    'الترتيب بحسب الأثر هو الافتراضي. ويضع «الترتيب بحسب الخطورة» الحرج أولًا والخبر الجيد أخيرًا. ويضع «الترتيب بحسب الثقة» المرتفع أولًا. وعند التعادل يبقى الترتيب بحسب الأثر.',
  'In the whole-organization view, an efficiency recommendation that frees no cash today, because the pool already covers the usage, is lowered to Medium when it would be Critical or High. Low stays Low.':
    'في عرض المؤسسة كلها، تُخفَّض توصية الكفاءة التي لا تحرّر نقدًا اليوم، لأن الرصيد المشترك يغطي الاستخدام أصلًا، إلى متوسط عندما تكون حرجة أو مرتفعة. وتبقى المنخفضة منخفضة.',
  'The counts at the top cover every recommendation of the view. The numbers on the severity and theme chips cover the recommendations that pass all the other filters.':
    'تشمل الأعداد في الأعلى كل توصيات العرض. أما الأرقام على شارات الخطورة والموضوع فتشمل التوصيات التي تجتاز كل عوامل التصفية الأخرى.',
  'The filters are audience, theme, severity, "Hide positive findings" and a search. Every word of the search must appear in the title, summary, evidence or actions.':
    'عوامل التصفية هي الفئة المستهدفة والموضوع والخطورة و«إخفاء النتائج الإيجابية» والبحث. ويجب أن تظهر كل كلمة في البحث في العنوان أو الملخص أو الأدلة أو الإجراءات.',
  'Severity is a ranking aid, not a measure of money. A Medium recommendation can be worth more than a High one when the High one is about a risk.':
    'الخطورة أداة للترتيب وليست مقياسًا للمال. وقد تكون قيمة توصية متوسطة أكبر من قيمة توصية مرتفعة عندما تتعلق المرتفعة بمخاطرة.',
  'The same recommendation can have another severity in a filtered view, because its figures are worked out again for the filtered usage.':
    'قد تكون للتوصية نفسها خطورة مختلفة في العرض المصفّى، لأن أرقامها تُحسب من جديد للاستخدام المصفّى.',
  'Info and Good news never need action, and they are left out of the plan.':
    'لا تحتاج «معلومة» و«خبر جيد» إلى إجراء أبدًا، وتُستبعدان من الخطة.',
  'A view has 1 High, 3 Medium, 2 Low, 1 Info and 1 Good news recommendation. That is 8 recommendations, and 6 of them need action. The banner says Needs attention because of the High one.':
    'يضم عرض توصية مرتفعة واحدة، و3 توصيات متوسطة، وتوصيتين منخفضتين، وتوصية «معلومة» واحدة، وتوصية «خبر جيد» واحدة. فالمجموع 8 توصيات، منها 6 تحتاج إلى إجراء. وتقول اللافتة «يحتاج إلى اهتمام» بسبب التوصية المرتفعة.',
  'The group each recommendation belongs to. Every recommendation has exactly one theme, so the theme counts add up to the total.':
    'المجموعة التي تنتمي إليها كل توصية. ولكل توصية موضوع واحد بالضبط، لذلك يساوي مجموع أعداد المواضيع الإجمالي.',
  'Theme count = number of recommendations with that theme':
    'عدد الموضوع = عدد التوصيات ذات ذلك الموضوع',
  'Cost: billed overage, users far above their included credits, usage on a single day, accelerating usage and unusual days.':
    'التكلفة: المدفوع الإضافي، والمستخدمون الذين يتجاوزون أرصدتهم المشمولة بكثير، والاستخدام في يوم واحد، والاستخدام المتسارع، والأيام غير المعتادة.',
  'Included credits: the pool running out, a pool that is barely used, idle seats, Enterprise seats to move to Business, and the all-clear when the pool is well used and fully covered.':
    'الأرصدة المشمولة: نفاد الرصيد المشترك، ورصيد مشترك شبه غير مستخدم، والتراخيص الخاملة، وتراخيص Enterprise التي يمكن نقلها إلى Business، وإشعار الاطمئنان عندما يكون الرصيد المشترك مستخدمًا جيدًا ومغطًّى بالكامل.',
  'Efficiency: right-sizing models, Auto model selection, cache reuse, prompt context and long-context surcharges.':
    'الكفاءة: اختيار النموذج المناسب، والاختيار التلقائي للنموذج (Auto)، وإعادة استخدام الذاكرة المؤقتة، وسياق الطلبات، والرسوم الإضافية للسياق الطويل.',
  'Adoption: users who stopped, new users, champions and a sharp fall in usage.':
    'التبنّي: المستخدمون الذين توقفوا، والمستخدمون الجدد، والروّاد، والانخفاض الحاد في الاستخدام.',
  'Governance: concentration of usage, budgets, cost center coverage, usage without a user, users who bill to more than one organization, and unequal use between teams.':
    'الحوكمة: تركّز الاستخدام، والميزانيات، وتغطية مراكز التكلفة، والاستخدام بلا مستخدم، والمستخدمون الذين تُفوتَر استخداماتهم على أكثر من مؤسسة، وتفاوت الاستخدام بين الفرق.',
  'Data quality: missing columns and how to read the numbers.':
    'جودة البيانات: الأعمدة الناقصة وكيفية قراءة الأرقام.',
  'The theme chips filter the list. With no chip selected, every theme is shown.':
    'تصفّي شارات الموضوع القائمة. وعند عدم تحديد أي شارة تظهر جميع المواضيع.',
  'The audience, which is Management, Admins or Users, is shown next to the theme. It says who can act on the recommendation. A recommendation can have several audiences.':
    'تظهر الفئة المستهدفة، وهي الإدارة أو المشرفون أو المستخدمون، بجانب الموضوع. وتبيّن من يستطيع اتخاذ إجراء بشأن التوصية. وقد تكون للتوصية عدة فئات مستهدفة.',
  'The theme does not say how urgent a recommendation is. Severity does.':
    'الموضوع لا يبيّن مدى إلحاح التوصية. أما الخطورة فتبيّنه.',
  'The view has 2 Cost, 1 Included credits, 3 Efficiency, 1 Adoption, 1 Governance and 1 Data quality recommendation. The chips show those counts, and they add up to the 9 recommendations at the top.':
    'يضم العرض توصيتين في التكلفة، وتوصية واحدة في الأرصدة المشمولة، و3 توصيات في الكفاءة، وتوصية في التبنّي، وتوصية في الحوكمة، وتوصية في جودة البيانات. وتعرض الشارات هذه الأعداد، ومجموعها 9 توصيات كما في الأعلى.',
  'What the whole set of recommendations would be worth in a month if everything were done. It comes from one combined plan, not from the sum of the figures on the cards.':
    'ما ستساويه مجموعة التوصيات كلها في الشهر لو نُفّذ كل شيء. وتأتي من خطة واحدة مجمّعة، لا من مجموع الأرقام على البطاقات.',

  // Combined value of the plan, the 30-60-90 plan and the playbook
  'Saved per month = average over the months of (cost before − cost after the six levers and the three seat actions)':
    'الموفَّر شهريًا = متوسط (التكلفة قبل − التكلفة بعد الإجراءات الستة وإجراءات التراخيص الثلاثة) على الأشهر',
  'The plan applies the six usage levers one after the other, at their default shares: right-size models 30%, use Auto model selection 50%, cache discipline 20%, leaner context 10%, avoid long-context surcharges 30% and cap runaway users 50%. Each lever works on the usage that is left after the levers before it.':
    'تطبّق الخطة إجراءات الاستخدام الستة واحدًا بعد الآخر بحصصها الافتراضية: اختيار النموذج المناسب 30%، واستخدام الاختيار التلقائي للنموذج (Auto) 50%، والاستفادة من الذاكرة المؤقتة 20%، وسياق أخف 10%، وتجنب رسوم السياق الطويل الإضافية 30%، ووضع حد للمستخدمين المفرطين 50%. ويعمل كل إجراء على الاستخدام المتبقي بعد الإجراءات التي قبله.',
  'It also applies the three seat actions once: reclaim idle seats, move Enterprise seats to Business and reclaim roster seats that never appear in the report.':
    'وتطبّق أيضًا إجراءات التراخيص الثلاثة مرة واحدة: استرداد التراخيص الخاملة، ونقل تراخيص Enterprise إلى Business، واسترداد تراخيص القائمة التي لا تظهر أبدًا في التقرير.',
  'For each month: cost before = max(pool, usage). Cost after = max(pool − seat value, usage × (1 − usage reduction)). The month in progress uses its projected usage.':
    'لكل شهر: التكلفة قبل = max(الرصيد المشترك, الاستخدام). والتكلفة بعد = max(الرصيد المشترك − قيمة التراخيص, الاستخدام × (1 − خفض الاستخدام)). ويستخدم الشهر الجاري استخدامه المُسقَط.',
  'Saved per month is the average of the monthly differences. The yearly figure is 12 times that.':
    'الموفَّر شهريًا هو متوسط الفروق الشهرية. والرقم السنوي هو 12 ضعف ذلك.',
  'Usage avoided per month = usage saved by the levers in the period ÷ days in the period × 30.4375.':
    'الاستخدام المتجنَّب شهريًا = الاستخدام الذي توفّره الإجراءات في الفترة ÷ عدد أيام الفترة × 30.4375.',
  'The line shows "$X saved per month" when the saving is at least $0.50, and "No cash saving yet" when it is smaller. A dash means that it cannot be worked out from the data.':
    'يعرض السطر «توفير $X شهريًا» عندما يبلغ التوفير $0.50 على الأقل، و«لا توفير نقديًا بعد» عندما يكون أقل. وتعني الشرطة أنه لا يمكن حسابه من البيانات.',
  'When cash cannot be shown, the line shows "$X less usage per month" and gives the reason. This is the case in a filtered view, for a file without billing columns and when the report has no pool months.':
    'عندما يتعذر عرض النقد، يعرض السطر «استخدام أقل بمقدار $X شهريًا» ويذكر السبب. ويحدث هذا في العرض المصفّى، وفي الملف الذي بلا أعمدة فوترة، وعندما لا تتوفر في التقرير أشهر للرصيد المشترك.',
  'It is the same figure as Savings potential on the Overview.':
    'وهو الرقم نفسه الموجود في «التوفير المحتمل» في «نظرة عامة».',
  'The strip appears only when at least one recommendation needs action, because a value would contradict the status banner otherwise.':
    'يظهر الشريط فقط عندما تحتاج توصية واحدة على الأقل إلى إجراء، لأن عرض قيمة بخلاف ذلك سيناقض لافتة الحالة.',
  'Recommendations overlap, so the figure is smaller than the sum of the values on the cards.':
    'تتداخل التوصيات، لذلك يكون الرقم أصغر من مجموع القيم على البطاقات.',
  'Seat actions are left out when a filter is active or when the pool size is unknown.':
    'تُستبعد إجراءات التراخيص عندما يكون عامل تصفية نشطًا أو عندما يكون حجم الرصيد المشترك غير معروف.',
  'The cost model assumes that a seat costs the value of its included credits: $19 for 1,900 credits and $39 for 3,900 credits. Check it against your contract.':
    'تفترض طريقة حساب التكلفة أن الترخيص يكلّف قيمة أرصدته المشمولة: $19 مقابل 1,900 رصيد و$39 مقابل 3,900 رصيد. تحقق منها في عقدك.',
  'The levers remove 8% of usage and the seat actions are worth $190. Pool $9,600, usage $10,000. Cost before = $10,000. Cost after = max($9,600 − $190, $10,000 × 0.92) = max($9,410, $9,200) = $9,410. Saved = $590 per month, about $7,080 a year.':
    'تزيل الإجراءات 8% من الاستخدام وتبلغ قيمة إجراءات التراخيص $190. الرصيد المشترك $9,600 والاستخدام $10,000. التكلفة قبل = $10,000. والتكلفة بعد = max($9,600 − $190, $10,000 × 0.92) = max($9,410, $9,200) = $9,410. فيكون الموفَّر $590 شهريًا، أي نحو $7,080 سنويًا.',
  'A starting point for scheduling the recommendations that need action. It puts them in order and splits them over three phases. It is not a project plan.':
    'نقطة بداية لجدولة التوصيات التي تحتاج إلى إجراء. فهي ترتّبها وتوزعها على ثلاث مراحل. وهي ليست خطة مشروع.',
  'Plan = the first 9 recommendations that need action, largest impact first, 3 in each phase':
    'الخطة = أول 9 توصيات تحتاج إلى إجراء، الأكبر أثرًا أولًا، 3 في كل مرحلة',
  'Take every recommendation of the view that needs action and has at least one action. The filters of the list do not change the plan.':
    'تؤخذ كل توصية في العرض تحتاج إلى إجراء ولها إجراء واحد على الأقل. ولا تغيّر عوامل تصفية القائمة الخطة.',
  'Keep the order of the list: the largest impact first, which is the figure on the chip. Recommendations with the same figure go by severity.':
    'يُحفظ ترتيب القائمة: الأكبر أثرًا أولًا، وهو الرقم على الشارة. وتُرتَّب التوصيات التي لها الرقم نفسه بحسب الخطورة.',
  'The first 3 go in First 30 days, the next 3 in Days 31 to 60 and the next 3 in Days 61 to 90. A recommendation after the ninth is not scheduled. The text under the plan counts them.':
    'تدخل أول 3 في «أول 30 يومًا»، والـ 3 التالية في «الأيام من 31 إلى 60»، والـ 3 التي تليها في «الأيام من 61 إلى 90». ولا تُجدول التوصية بعد التاسعة. ويعدّها النص تحت الخطة.',
  'A phase with no recommendation is left out.':
    'تُستبعد المرحلة التي لا توصية فيها.',
  'Each entry shows who owns it, which is the audience of the recommendation, then its value chip or "No dollar value", and "First step", which is the first action of the recommendation.':
    'يعرض كل بند من يملكه، وهو الفئة المستهدفة للتوصية، ثم شارة قيمته أو «بلا قيمة بالدولار»، ثم «الخطوة الأولى» وهي أول إجراء في التوصية.',
  'The order follows impact and severity only. It does not know about effort, dependencies or the capacity of your team, so change it to fit.':
    'يتبع الترتيب الأثر والخطورة فقط. وهو لا يعرف الجهد أو الاعتماديات أو طاقة فريقك، لذلك غيّره بما يناسبك.',
  'The values overlap, so they are not added up. The combined value is under Combined value of the plan.':
    'تتداخل القيم، لذلك لا تُجمع. وتوجد القيمة المجمّعة تحت «القيمة المجمَّعة للخطة».',
  'The plan has no dates. The phases are a way to space out the work.':
    'ليست للخطة تواريخ. والمراحل وسيلة لتوزيع العمل على فترات.',
  'Eight recommendations need action. The plan puts 3 in the first 30 days, 3 in days 31 to 60 and 2 in days 61 to 90. With eleven, the last two are counted in the text under the plan and are not scheduled.':
    'ثماني توصيات تحتاج إلى إجراء. تضع الخطة 3 في أول 30 يومًا، و3 في الأيام من 31 إلى 60، و2 في الأيام من 61 إلى 90. ومع إحدى عشرة توصية، تُحتسب آخر اثنتين في النص تحت الخطة ولا تُجدولان.',
  'Saving of a habit in the playbook':
    'توفير عادة في دليل العمل',
  'The usage that a habit of the playbook would avoid each month in this report. Each habit belongs to one of the six usage levers, and the figure is what that lever saves on its own.':
    'الاستخدام الذي ستتجنبه عادة من دليل العمل كل شهر في هذا التقرير. وتنتمي كل عادة إلى أحد إجراءات الاستخدام الستة، والرقم هو ما يوفّره ذلك الإجراء بمفرده.',
  'Saving = what the lever of the habit saves on its own × 30.4375 ÷ days in the period':
    'التوفير = ما يوفّره إجراء العادة بمفرده × 30.4375 ÷ عدد أيام الفترة',
  'Find the lever of the habit, for example Use Auto model selection or Cache discipline.':
    'يُحدَّد إجراء العادة، مثل «استخدام الاختيار التلقائي للنموذج (Auto)» أو «الاستفادة من الذاكرة المؤقتة».',
  'Take what the lever saves on its own, at its default share, over the period. On its own means before the levers ahead of it take their part.':
    'يؤخذ ما يوفّره الإجراء بمفرده، بحصته الافتراضية، على مدى الفترة. و«بمفرده» تعني قبل أن تأخذ الإجراءات التي تسبقه نصيبها.',
  'Scale the period to a month: × 30.4375 ÷ the number of days in the period.':
    'تُحوَّل الفترة إلى شهر: × 30.4375 ÷ عدد أيام الفترة.',
  'The badge shows "≈ $X/mo less usage" when the figure is at least $0.50. Otherwise the card says that no saving was found for the habit and gives the reason.':
    'تعرض الشارة «استخدام أقل بنحو $X شهريًا» عندما يبلغ الرقم $0.50 على الأقل. وإلا فتذكر البطاقة أنه لم يُعثر على توفير لهذه العادة وتبيّن السبب.',
  'Habits are grouped by audience, admins and users, with the largest saving first. A habit without a lever has no figure.':
    'تُجمَّع العادات بحسب الفئة المستهدفة، المشرفون والمستخدمون، والأكبر توفيرًا أولًا. والعادة التي بلا إجراء لا رقم لها.',
  'Several habits can share one lever. The card says so, and the figures are not added up.':
    'قد تشترك عدة عادات في إجراء واحد. وتذكر البطاقة ذلك، ولا تُجمع الأرقام.',
  'It is usage, not cash. Whether it lowers the bill depends on the pool.':
    'وهو استخدام وليس نقدًا. ويتوقف خفضه للفاتورة على الرصيد المشترك.',
  'It uses the default shares of the levers, not the ones set in the simulator.':
    'وهو يستخدم الحصص الافتراضية للإجراءات، لا الحصص المضبوطة في المحاكي.',
  'The Cache discipline lever saves $600 on its own over a period of 61 days. Saving = $600 × 30.4375 ÷ 61 = $299 per month.':
    'يوفّر إجراء «الاستفادة من الذاكرة المؤقتة» $600 بمفرده على مدى فترة 61 يومًا. التوفير = $600 × 30.4375 ÷ 61 = $299 شهريًا.',

  // Rules: billed overage
  'Appears when part of the usage was billed on top of the seats, which happens once the pooled included credits run out. It names the users whose rows carry most of the billed amount.':
    'تظهر عندما يُدفع جزء من الاستخدام إضافيًا فوق التراخيص، وهو ما يحدث بعد نفاد الأرصدة المشمولة المجمّعة. وتذكر المستخدمين الذين تحمل صفوفهم معظم المبلغ المدفوع الإضافي.',
  'Billed share = billed amount ÷ usage':
    'نسبة المدفوع إضافيًا = المبلغ المدفوع الإضافي ÷ الاستخدام',
  'It appears when the billed amount (net_amount) of the selected period is above $0.005.':
    'تظهر عندما يزيد المبلغ المدفوع الإضافي (net_amount) في الفترة المحددة على $0.005.',

  // Rules: billed overage and pool running out
  'The title shows the billed amount. The summary shows the billed share, which is the billed amount ÷ usage (gross_amount), as a whole percent.':
    'يعرض العنوان المبلغ المدفوع الإضافي. ويعرض الملخص نسبة المدفوع إضافيًا، وهي المبلغ المدفوع الإضافي ÷ الاستخدام (gross_amount)، كنسبة مئوية صحيحة.',
  'The first evidence line shows three amounts: usage, the part covered by the pool (discount_amount) and the part billed.':
    'يعرض أول سطر من الأدلة ثلاثة مبالغ: الاستخدام، والجزء الذي غطّاه الرصيد المشترك (discount_amount)، والجزء المدفوع إضافيًا.',
  'Up to three users follow, the ones with the largest billed amount. Each line shows the billed amount of the user, the share of all billed overage (billed amount of the user ÷ total billed amount) and the usage of the user as a percent of their own included credits.':
    'يلي ذلك حتى ثلاثة مستخدمين، هم الأكبر في المبلغ المدفوع الإضافي. ويعرض كل سطر المبلغ المدفوع الإضافي للمستخدم، ونصيبه من إجمالي المدفوع الإضافي (المبلغ المدفوع الإضافي للمستخدم ÷ إجمالي المبلغ المدفوع الإضافي)، واستخدام المستخدم كنسبة مئوية من أرصدته المشمولة الخاصة.',
  'Severity is Critical when a monthly budget is set, the latest month is still in progress and its projected billed amount is above the budget. Otherwise it is High when the billed share is 25% or more or the billed amount is $100 or more, and Medium in all other cases.':
    'تكون الخطورة «حرج» عندما تكون الميزانية الشهرية محددة وآخر شهر لا يزال جاريًا ويتجاوز المبلغ المدفوع الإضافي المُسقَط فيه الميزانية. وإلا فتكون «مرتفع» عندما تبلغ نسبة المدفوع إضافيًا 25% أو أكثر أو يبلغ المبلغ المدفوع الإضافي $100 أو أكثر، و«متوسط» فيما عدا ذلك.',
  'The count of affected users is the number of users with a billed amount above zero. The card shows no dollar value.':
    'عدد المستخدمين المتأثرين هو عدد المستخدمين الذين لهم مبلغ مدفوع إضافي أكبر من صفر. ولا تعرض البطاقة قيمة بالدولار.',
  'The pool is shared. The file bills the rows that come after the pool ran out, so the users named are the ones whose rows carry the billed amount, not always the users who used the most.':
    'يتشارك الجميع الرصيد المشترك. ويُسجَّل المدفوع الإضافي في الصفوف التي تأتي بعد نفاد الرصيد المشترك، لذلك فالمستخدمون المذكورون هم أصحاب الصفوف التي تحمل المبلغ المدفوع الإضافي، وليسوا دائمًا الأكثر استخدامًا.',
  'A user can have a billed amount and still be below 100% of their own included credits, because the overage comes from the whole pool running out.':
    'قد يكون للمستخدم مبلغ مدفوع إضافي ويظل مع ذلك دون 100% من أرصدته المشمولة الخاصة، لأن التجاوز ناتج عن نفاد الرصيد المشترك كله.',
  'It does not say whether the overage was avoidable. The usage levers and the simulator estimate that.':
    'ولا تذكر ما إذا كان التجاوز قابلًا للتجنب. وتقدّر ذلك إجراءات الاستخدام والمحاكي.',
  'In a filtered view every amount is that of the selected rows only.':
    'في العرض المصفّى يخص كل مبلغ الصفوف المحددة فقط.',
  'Usage is $10,500. The pool covered $9,600 and $900 was billed, which is 9% of usage. The billed amount is $100 or more, so severity is High. The top user has $600 of usage, which is 1,538% of their $39 allotment, and $540 billed, which is 60% of all overage.':
    'الاستخدام $10,500. غطّى الرصيد المشترك $9,600 ودُفع $900 إضافيًا، أي 9% من الاستخدام. والمبلغ المدفوع الإضافي $100 أو أكثر، فتكون الخطورة «مرتفع». ولدى المستخدم الأول استخدام قدره $600، وهو 1,538% من حصته البالغة $39، ومدفوع إضافي قدره $540، وهو 60% من كل التجاوز.',
  'Pool running out': 'نفاد الرصيد المشترك',
  'Appears when the shared pool of included credits ran out in a month of the report, or is on pace to run out in the month in progress. It lists the dates, the projected overage and the state of the budget.':
    'تظهر عندما نفد الرصيد المشترك للأرصدة المشمولة في شهر من التقرير، أو عندما يسير نحو النفاد في الشهر الجاري. وتذكر التواريخ والتجاوز المُسقَط وحالة الميزانية.',
  'Run-out day = last day with data + ceil((pool size − usage so far) ÷ daily rate)':
    'يوم النفاد = آخر يوم فيه بيانات + ceil((حجم الرصيد المشترك − الاستخدام حتى الآن) ÷ المعدل اليومي)',
  'It needs the pool size of every month. It does not appear in a filtered view or when the pool size is unknown.':
    'تحتاج إلى حجم الرصيد المشترك في كل شهر. ولا تظهر في العرض المصفّى ولا عندما يكون حجم الرصيد المشترك غير معروف.',
  'For each month in which the pool ran out, a line gives the day and its place in the month, for example "pool used up on 18 May (day 18 of 31)". The day is the first one with a billed amount above zero.':
    'لكل شهر نفد فيه الرصيد المشترك، يذكر سطر اليوم وموقعه في الشهر، مثل «نفد الرصيد المشترك في 18 مايو (اليوم 18 من 31)». واليوم هو أول يوم فيه مبلغ مدفوع إضافي أكبر من صفر.',
  'For the month in progress, when the pool has not run out yet, a line gives the expected run-out day from the formula above. It is shown only when that day falls inside the month. The daily rate is the average of the rate since the month began and the rate of the last 7 days.':
    'للشهر الجاري، إذا لم ينفد الرصيد المشترك بعد، يذكر سطر يوم النفاد المتوقع بحسب الصيغة أعلاه. ويظهر فقط عندما يقع ذلك اليوم داخل الشهر. والمعدل اليومي هو متوسط المعدل منذ بداية الشهر ومعدل آخر 7 أيام.',
  'For the month in progress, when the projected billed amount is above $0.005, a line gives it with a range. The range runs from the projection at the smaller of the two rates to the projection at the larger.':
    'للشهر الجاري، عندما يزيد المبلغ المدفوع الإضافي المُسقَط على $0.005، يذكره سطر مع نطاق. ويمتد النطاق من الإسقاط بالمعدل الأصغر من المعدلين إلى الإسقاط بالمعدل الأكبر.',
  'When a monthly budget is set, a last line gives the budget, the share used so far (billed so far ÷ budget), the share projected (projected billed amount ÷ budget) and the day on which the limit is reached, when that day falls inside the month.':
    'عندما تكون الميزانية الشهرية محددة، يذكر السطر الأخير الميزانية، والنسبة المستخدمة حتى الآن (المدفوع إضافيًا حتى الآن ÷ الميزانية)، والنسبة المُسقَطة (المبلغ المدفوع الإضافي المُسقَط ÷ الميزانية)، واليوم الذي يُبلَغ فيه الحد عندما يقع ذلك اليوم داخل الشهر.',
  'The recommendation appears when at least one of these lines exists.':
    'تظهر التوصية عندما يوجد سطر واحد على الأقل من هذه الأسطر.',
  'Severity is Critical when the projected billed amount reaches the monthly budget. Otherwise it is High when anything was billed or a projected overage exists, and Medium in all other cases.':
    'تكون الخطورة «حرج» عندما يبلغ المبلغ المدفوع الإضافي المُسقَط الميزانية الشهرية. وإلا فتكون «مرتفع» عندما دُفع أي مبلغ إضافي أو وُجد تجاوز مُسقَط، و«متوسط» فيما عدا ذلك.',
  'The title says "The shared pool runs out before month end" when the pool ran out in at least one month, and "The shared pool is on track to run out" when it did not.':
    'يقول العنوان «ينفد الرصيد المشترك قبل نهاية الشهر» عندما نفد الرصيد المشترك في شهر واحد على الأقل، و«الرصيد المشترك في طريقه إلى النفاد» عندما لم ينفد.',
  'Included credits are pooled across all seats and reset on the first of the month (UTC). Unused credits do not carry over.':
    'تُجمَّع الأرصدة المشمولة عبر كل التراخيص ويُعاد ضبطها في الأول من كل شهر (UTC). ولا تُرحَّل الأرصدة غير المستخدمة.',
  'It is a projection from two rates, not a forecast of what users will do. A new team or a runaway session can change it quickly.':
    'هي إسقاط من معدلين، وليست توقعًا لما سيفعله المستخدمون. ويمكن أن يغيّرها فريق جديد أو جلسة مفرطة بسرعة.',
  'A month that is complete has no projection, only the day the pool ran out.':
    'الشهر المكتمل لا إسقاط له، بل يوم نفاد الرصيد المشترك فقط.',
  'It does not say who caused the overage. Billed overage names the users.':
    'ولا تذكر من تسبب في التجاوز. وتذكر «التجاوز المدفوع» المستخدمين.',
  'The card has no dollar value. It reports a pace, not a saving.':
    'ليست للبطاقة قيمة بالدولار. فهي تُبلغ عن وتيرة، لا عن توفير.',
  'Data ends on 10 June and usage so far is $3,000. The daily rate is $350 and the pool is $9,600. Run-out day = 10 June + ceil(($9,600 − $3,000) ÷ $350) = 10 June + 19 days = 29 June. Projected usage = $3,000 + 20 × $350 = $10,000, so the projected billed overage is $400.':
    'تنتهي البيانات في 10 يونيو والاستخدام حتى الآن $3,000. والمعدل اليومي $350 والرصيد المشترك $9,600. يوم النفاد = 10 يونيو + ceil(($9,600 − $3,000) ÷ $350) = 10 يونيو + 19 يومًا = 29 يونيو. والاستخدام المُسقَط = $3,000 + 20 × $350 = $10,000، فيكون التجاوز المدفوع المُسقَط $400.',

  // Rules: included credits barely used
  'Included credits barely used': 'الأرصدة المشمولة غير مستخدمة تقريبًا',
  'Appears when less than 60% of the included credits of the pool were used. The seats are paid for in full, so the part that is not used is paid for and not used.':
    'تظهر عندما يُستخدم أقل من 60% من الأرصدة المشمولة في الرصيد المشترك. فالتراخيص مدفوعة بالكامل، لذلك فالجزء غير المستخدم مدفوع الثمن ولا يُستفاد منه.',
  'Pool use = Σ min(pool, usage) ÷ Σ pool, over the months in the report':
    'استخدام الرصيد المشترك = Σ min(الرصيد المشترك, الاستخدام) ÷ Σ الرصيد المشترك، على أشهر التقرير',
  'For each month, pool = the included credits of the seats that month, in dollars, and usage = the usage of the month. The month in progress uses its projected usage. Seats from the roster and the extra seats of Settings add to the pool.':
    'لكل شهر: الرصيد المشترك = الأرصدة المشمولة للتراخيص في ذلك الشهر بالدولار، والاستخدام = استخدام الشهر. ويستخدم الشهر الجاري استخدامه المُسقَط. وتُضاف إلى الرصيد المشترك تراخيص قائمة التراخيص والتراخيص الإضافية من الإعدادات.',
  'Pool use = the sum over the months of min(pool, usage) ÷ the sum of the pools. The recommendation appears when it is below 60%.':
    'استخدام الرصيد المشترك = مجموع min(الرصيد المشترك, الاستخدام) على الأشهر ÷ مجموع الأرصدة المشتركة. وتظهر التوصية عندما يكون أقل من 60%.',
  'Unused per month = (the sum of the pools − the sum of min(pool, usage)) ÷ the number of months. The summary shows it as "About $X of seat value per month goes unused".':
    'غير المستخدم شهريًا = (مجموع الأرصدة المشتركة − مجموع min(الرصيد المشترك, الاستخدام)) ÷ عدد الأشهر. ويعرضه الملخص بصيغة «نحو $X شهريًا من قيمة التراخيص بلا استخدام».',
  'The first evidence line shows the pool per month and the part of usage inside the pool per month, both averaged over the months.':
    'يعرض أول سطر من الأدلة الرصيد المشترك شهريًا والجزء من الاستخدام الواقع داخل الرصيد المشترك شهريًا، وكلاهما بمتوسط الأشهر.',
  'Severity is Medium below 30% and Low from 30% up to 60%.':
    'تكون الخطورة «متوسط» دون 30%، و«منخفض» من 30% إلى 60%.',
  'When the pool is only a lower bound, the title reads "Included credits are at most X% used" and confidence is Low. That is the case when the report has no seat roster and no extra seats are set in Settings, because the pool then counts only the users who appear in the report.':
    'عندما يكون الرصيد المشترك حدًا أدنى فقط، يكون العنوان «استُخدم X% على الأكثر من الأرصدة المشمولة» ويكون مستوى الثقة «منخفض». ويحدث هذا عندما لا يتضمن التقرير قائمة تراخيص ولا تُحدد تراخيص إضافية في الإعدادات، لأن الرصيد المشترك يحتسب حينئذ المستخدمين الظاهرين في التقرير فقط.',
  'The card has no dollar value of its own. The seat recommendations put a value on what can be reclaimed.':
    'ليست للبطاقة قيمة بالدولار خاصة بها. وتضع توصيات التراخيص قيمة لما يمكن استرداده.',
  'It does not tell you why the credits are unused.':
    'ولا تخبرك بسبب عدم استخدام الأرصدة.',
  'A seat costs the value of its included credits in the cost model: $19 for 1,900 credits and $39 for 3,900 credits. Check it against your contract.':
    'يكلّف الترخيص في طريقة حساب التكلفة قيمة أرصدته المشمولة: $19 مقابل 1,900 رصيد و$39 مقابل 3,900 رصيد. تحقق منها في عقدك.',
  'Two months with a pool of $5,000 each and usage of $2,000 and $2,200. Pool use = ($2,000 + $2,200) ÷ $10,000 = 42%, which is below 60%, so the recommendation appears with Low severity. Unused per month = ($10,000 − $4,200) ÷ 2 = $2,900.':
    'شهران، الرصيد المشترك في كل منهما $5,000 والاستخدام $2,000 و$2,200. استخدام الرصيد المشترك = ($2,000 + $2,200) ÷ $10,000 = 42%، وهو أقل من 60%، فتظهر التوصية بخطورة «منخفض». وغير المستخدم شهريًا = ($10,000 − $4,200) ÷ 2 = $2,900.',

  // Rules: idle seats and the bill, Enterprise users who fit Business, concentrated usage
  'Idle seats and the bill': 'التراخيص الخاملة والفاتورة',
  'Appears when there are idle seats, or roster seats that never appear in the report. It says what removing them is worth in seat value and how much of that value would lower the bill.':
    'تظهر عند وجود تراخيص خاملة، أو تراخيص في القائمة لا تظهر أبدًا في التقرير. وتذكر قيمة إزالتها من قيمة التراخيص، ومقدار ما سيخفض الفاتورة من تلك القيمة.',
  'Cash saved = average over the months of (max(pool, usage) − max(pool − seat value, usage))':
    'المبلغ النقدي الموفَّر = متوسط (max(الرصيد المشترك, الاستخدام) − max(الرصيد المشترك − قيمة التراخيص, الاستخدام)) على الأشهر',
  'It needs the pool size of every month and at least one seat with a value. It does not appear in a filtered view or when the pool size is unknown.':
    'تحتاج إلى حجم الرصيد المشترك في كل شهر وإلى ترخيص واحد على الأقل له قيمة. ولا تظهر في العرض المصفّى ولا عندما يكون حجم الرصيد المشترك غير معروف.',
  'The seats are the users listed under Idle seats to reclaim plus the roster seats listed under Roster seats that never appear in the report. Seat value = the monthly prices of those seats added up. The cost model prices a seat at the value of its included credits.':
    'التراخيص هي المستخدمون المدرجون في «تراخيص خاملة يمكن استردادها» إضافة إلى تراخيص القائمة المدرجة في «تراخيص القائمة التي لم تظهر في التقرير قط». قيمة التراخيص = مجموع الأسعار الشهرية لتلك التراخيص. وتسعّر طريقة حساب التكلفة الترخيص بقيمة أرصدته المشمولة.',
  'For each month, cost before = max(pool, usage). Cost after = max(pool − seat value, usage), with the pool held at $0 or more. The month in progress uses its projected usage. Cash saved is the average of the differences.':
    'لكل شهر: التكلفة قبل = max(الرصيد المشترك, الاستخدام). والتكلفة بعد = max(الرصيد المشترك − قيمة التراخيص, الاستخدام)، مع إبقاء الرصيد المشترك عند $0 أو أكثر. ويستخدم الشهر الجاري استخدامه المُسقَط. والمبلغ النقدي الموفَّر هو متوسط الفروق.',
  'Recoverable share = cash saved ÷ seat value.':
    'النسبة القابلة للاسترداد = المبلغ النقدي الموفَّر ÷ قيمة التراخيص.',
  'The title reads "Reclaim N idle seats to save about $X/month" when the recoverable share is 50% or more. It reads "N idle seats, but only $X/month is recoverable" when the share is below 50% and cash saved is above $0.50. It reads "N idle seats currently fund the pool for heavier users" when cash saved is $0.50 or less.':
    'يكون العنوان «استرجاع التراخيص (N تراخيص غير مستخدمة) يوفّر نحو $X شهريًا» عندما تبلغ النسبة القابلة للاسترداد 50% أو أكثر. ويكون «N تراخيص غير مستخدمة، لكن يمكن استرداد $X شهريًا فقط» عندما تقل النسبة عن 50% ويزيد المبلغ النقدي الموفَّر على $0.50. ويكون «N تراخيص غير مستخدمة تموّل حاليًا الرصيد المشترك للمستخدمين الأكثر استخدامًا» عندما يبلغ المبلغ النقدي الموفَّر $0.50 أو أقل.',
  'Severity is Medium when the recoverable share is 50% or more and cash saved is $50 or more. In all other cases it is Low.':
    'تكون الخطورة «متوسط» عندما تبلغ النسبة القابلة للاسترداد 50% أو أكثر ويبلغ المبلغ النقدي الموفَّر $50 أو أكثر. وفي كل الحالات الأخرى تكون «منخفض».',
  'The evidence names the idle users in the report with their seat value and the roster seats that never appear, up to 5 names each. The affected users are the idle users who appear in the report.':
    'تذكر الأدلة المستخدمين الخاملين في التقرير مع قيمة ترخيص كل منهم، وتراخيص القائمة التي لا تظهر أبدًا، حتى 5 أسماء لكل منهما. والمستخدمون المتأثرون هم المستخدمون الخاملون الظاهرون في التقرير.',
  'Seat value is not cash. The pool is shared, so a smaller pool saves money only for the part that was not used. That is why the title can say that only part of the value is recoverable.':
    'قيمة التراخيص ليست نقدًا. فالرصيد المشترك يتشاركه الجميع، لذلك لا يوفّر الرصيد الأصغر مالًا إلا عن الجزء غير المستخدم. ولهذا يمكن أن يقول العنوان إن جزءًا فقط من القيمة قابل للاسترداد.',
  'Code completions and next edit suggestions are not billed in credits and do not appear in the report. A seat that looks idle here can be in daily use, so check the license usage before removing a seat.':
    'إكمالات الكود واقتراحات التعديل التالي لا تُحتسب بالأرصدة ولا تظهر في التقرير. وقد يكون الترخيص الذي يبدو خاملًا هنا قيد الاستخدام اليومي، لذلك تحقق من استخدام الترخيص قبل إزالته.',
  'The classification of the seats is under Idle seats to reclaim and Roster seats that never appear in the report. This card only prices it.':
    'تصنيف التراخيص موجود في «تراخيص خاملة يمكن استردادها» و«تراخيص القائمة التي لم تظهر في التقرير قط». وهذه البطاقة تسعّره فقط.',
  'Ten Business seats are idle, so the seat value is 10 × $19 = $190. The pool is $10,000 and usage is $9,900. Cost before = max($10,000, $9,900) = $10,000. Cost after = max($9,810, $9,900) = $9,900. Cash saved = $100 per month, which is 53% of the seat value. The title reads "Reclaim 10 idle seats to save about $100/month" and severity is Medium.':
    'عشرة تراخيص Business خاملة، فتكون قيمة التراخيص 10 × $19 = $190. والرصيد المشترك $10,000 والاستخدام $9,900. التكلفة قبل = max($10,000, $9,900) = $10,000. والتكلفة بعد = max($9,810, $9,900) = $9,900. فيكون المبلغ النقدي الموفَّر $100 شهريًا، أي 53% من قيمة التراخيص. ويكون العنوان «استرجاع التراخيص (10 تراخيص غير مستخدمة) يوفّر نحو $100 شهريًا» وتكون الخطورة «متوسط».',
  'Enterprise users who fit Business': 'مستخدمو Enterprise الذين تناسبهم Business',
  'Appears when Enterprise users never needed more than the Business allotment. It says what moving them to Business is worth in seat value and how much of that value would lower the bill.':
    'تظهر عندما لا يحتاج مستخدمو Enterprise قط إلى أكثر من حصة Business. وتذكر قيمة نقلهم إلى Business من قيمة التراخيص، ومقدار ما سيخفض الفاتورة من تلك القيمة.',
  'Cash saved = average over the months of (max(pool, usage) − max(pool − $20 × users, usage))':
    'المبلغ النقدي الموفَّر = متوسط (max(الرصيد المشترك, الاستخدام) − max(الرصيد المشترك − $20 × عدد المستخدمين, الاستخدام)) على الأشهر',
  'It needs the pool size of every month and at least one user to move. It does not appear in a filtered view or when the pool size is unknown.':
    'تحتاج إلى حجم الرصيد المشترك في كل شهر وإلى مستخدم واحد على الأقل للنقل. ولا تظهر في العرض المصفّى ولا عندما يكون حجم الرصيد المشترك غير معروف.',
  'The users are the ones listed under Enterprise seats to move to Business. Their highest month stayed at or below 80% of the $19 Business allotment, which is $15.20.':
    'المستخدمون هم المدرجون في «تراخيص Enterprise يمكن نقلها إلى Business». وبقي أعلى شهر لديهم عند 80% أو أقل من حصة Business البالغة $19، أي $15.20.',
  'Seat value = $20 per seat per month ($39 for Enterprise − $19 for Business) × the number of users. The summary shows it as "$X in total".':
    'قيمة التراخيص = $20 لكل ترخيص شهريًا ($39 لترخيص Enterprise − $19 لترخيص Business) × عدد المستخدمين. ويعرضها الملخص بصيغة «$X إجمالًا».',
  'For each month, cost before = max(pool, usage). Cost after = max(pool − seat value, usage), with the pool held at $0 or more. The month in progress uses its projected usage. Cash saved is the average of the differences, shown as "Cash impact after pool slack".':
    'لكل شهر: التكلفة قبل = max(الرصيد المشترك, الاستخدام). والتكلفة بعد = max(الرصيد المشترك − قيمة التراخيص, الاستخدام)، مع إبقاء الرصيد المشترك عند $0 أو أكثر. ويستخدم الشهر الجاري استخدامه المُسقَط. والمبلغ النقدي الموفَّر هو متوسط الفروق، ويُعرض باسم «الأثر النقدي بعد احتساب الفائض في الرصيد المشترك».',
  'Severity is Medium when cash saved is $40 or more, and Low below that.':
    'تكون الخطورة «متوسط» عندما يبلغ المبلغ النقدي الموفَّر $40 أو أكثر، و«منخفض» دون ذلك.',
  'The evidence names the users, up to 5 names. The affected users are all of them.':
    'تذكر الأدلة المستخدمين، حتى 5 أسماء. والمستخدمون المتأثرون هم جميعهم.',
  'Seat value is not cash. A smaller pool saves money only for the part of the pool that was not used.':
    'قيمة التراخيص ليست نقدًا. ولا يوفّر الرصيد المشترك الأصغر مالًا إلا عن الجزء غير المستخدم منه.',
  'The report shows AI credits only. It cannot show whether a user relies on features that only Enterprise has, so check before you switch a seat.':
    'يعرض التقرير أرصدة الذكاء الاصطناعي فقط. ولا يستطيع أن يبيّن هل يعتمد مستخدم على ميزات تقتصر على Enterprise، لذلك تحقق قبل أن تبدّل ترخيصًا.',
  'The cost model prices a seat at the value of its included credits. Check it against your contract.':
    'تسعّر طريقة حساب التكلفة الترخيص بقيمة أرصدته المشمولة. تحقق منها في عقدك.',
  'The classification is under Enterprise seats to move to Business. This card only prices it.':
    'التصنيف موجود في «تراخيص Enterprise يمكن نقلها إلى Business». وهذه البطاقة تسعّره فقط.',
  'Five Enterprise users peaked at $12 a month, which is below $15.20. Seat value = 5 × $20 = $100. The pool is $10,000 and usage is $9,940, so $60 of the pool was unused. Cost before = $10,000. Cost after = max($9,900, $9,940) = $9,940. Cash saved = $60 per month, so severity is Medium.':
    'بلغ أعلى استخدام لخمسة مستخدمي Enterprise $12 في الشهر، وهو أقل من $15.20. قيمة التراخيص = 5 × $20 = $100. والرصيد المشترك $10,000 والاستخدام $9,940، فبقي $60 من الرصيد المشترك دون استخدام. التكلفة قبل = $10,000. والتكلفة بعد = max($9,900, $9,940) = $9,940. فيكون المبلغ النقدي الموفَّر $60 شهريًا، وبذلك تكون الخطورة «متوسط».',
  'Usage concentrated in a few users': 'الاستخدام متركز في قلة من المستخدمين',
  'Appears when one user or three users account for a large part of all attributed usage. The summary counts the users who together make up the first part of the usage.':
    'تظهر عندما يستحوذ مستخدم واحد أو ثلاثة مستخدمين على جزء كبير من كل الاستخدام المنسوب إلى مستخدمين. ويعدّ الملخص المستخدمين الذين يشكّلون معًا الجزء الأول من الاستخدام.',
  'Top three share = usage of the three largest users ÷ usage of all users':
    'نسبة الثلاثة الأوائل = استخدام أكبر ثلاثة مستخدمين ÷ استخدام كل المستخدمين',
  'It needs at least 5 users. Usage without a username belongs to nobody and is left out of both parts of the ratio.':
    'تحتاج إلى 5 مستخدمين على الأقل. والاستخدام الذي بلا اسم مستخدم لا يخص أحدًا ويُستبعد من طرفي النسبة.',
  'Rank the users by usage (gross_amount), largest first. Top user share = usage of the first user ÷ usage of all users. Top three share = usage of the first three users ÷ usage of all users.':
    'يُرتَّب المستخدمون بحسب الاستخدام (gross_amount) من الأكبر. نسبة المستخدم الأول = استخدام المستخدم الأول ÷ استخدام كل المستخدمين. ونسبة الثلاثة الأوائل = استخدام أول ثلاثة مستخدمين ÷ استخدام كل المستخدمين.',
  'The recommendation appears when the top user share is 25% or more, or the top three share is 50% or more.':
    'تظهر التوصية عندما تبلغ نسبة المستخدم الأول 25% أو أكثر، أو تبلغ نسبة الثلاثة الأوائل 50% أو أكثر.',
  'The title shows the top three share. The summary counts the users in Pareto class A, which is the fewest users who together reach the first limit (80% by default, set in Settings), out of all users.':
    'يعرض العنوان نسبة الثلاثة الأوائل. ويعدّ الملخص المستخدمين في فئة باريتو A، وهم أقل عدد من المستخدمين يبلغون معًا الحد الأول (80% افتراضيًا، ويُضبط في الإعدادات)، من بين كل المستخدمين.',
  'The evidence shows the top user with their share and usage, then the top three with their combined share.':
    'تعرض الأدلة المستخدم الأول مع نسبته واستخدامه، ثم الثلاثة الأوائل مع نسبتهم المجمّعة.',
  'Severity is High when the top user share is 40% or more, and Medium otherwise.':
    'تكون الخطورة «مرتفع» عندما تبلغ نسبة المستخدم الأول 40% أو أكثر، و«متوسط» فيما عدا ذلك.',
  'The count of affected users is the number of users in class A. The card names the top three.':
    'عدد المستخدمين المتأثرين هو عدد المستخدمين في الفئة A. وتذكر البطاقة الثلاثة الأوائل.',
  'It shows concentration, not waste. The heaviest users are often the most productive ones, so the card suggests coaching and a per-user limit, not a blanket restriction.':
    'تُظهر التركّز، لا الهدر. فالمستخدمون الأكثر استخدامًا غالبًا هم الأكثر إنتاجية، لذلك تقترح البطاقة التدريب وحدًّا لكل مستخدم، لا تقييدًا شاملًا.',
  'The limits of 25%, 40% and 50% are fixed. Only the limit of class A comes from Settings.':
    'الحدود 25% و40% و50% ثابتة. والحد الوحيد الآتي من الإعدادات هو حد الفئة A.',

  // Rules: concentration examples, runaway users, Powerful models, hand-picked usage
  'With 5 users the top three always hold at least 60% of the usage, so the recommendation always appears. Read it together with the number of users.':
    'مع 5 مستخدمين يحوز الثلاثة الأوائل دائمًا 60% على الأقل من الاستخدام، لذلك تظهر التوصية دائمًا. فاقرأها مع عدد المستخدمين.',
  'Ten users used $100 in all. The largest used $45 and the next two used $10 and $8. The top user share is 45%, which is above 40%, so severity is High. The top three share is $63 ÷ $100 = 63%.':
    'استخدم عشرة مستخدمين $100 إجمالًا. استخدم الأكبر $45 واستخدم التاليان $10 و$8. نسبة المستخدم الأول 45%، وهي أعلى من 40%، فتكون الخطورة «مرتفع». ونسبة الثلاثة الأوائل = $63 ÷ $100 = 63%.',
  'Users far above their included credits': 'مستخدمون يفوقون أرصدتهم المشمولة بكثير',
  'Appears when at least one user used many times the credits included in their own seat. It shows how much they took from the shared pool and what a cap on their usage would avoid.':
    'تظهر عندما يستخدم مستخدم واحد على الأقل أضعاف الأرصدة المشمولة في ترخيصه. وتبيّن مقدار ما أخذوه من الرصيد المشترك وما سيتجنبه وضع حد لاستخدامهم.',
  'Taken from the pool = Σ over runaway users of max(0, usage − included credits of the seat)':
    'المأخوذ من الرصيد المشترك = Σ على المستخدمين المفرطين لـ max(0, الاستخدام − الأرصدة المشمولة في الترخيص)',
  'A runaway user is a user in the Runaway tier: usage ÷ included credits of the seat is at or above the limit of that tier. The limit is 300% by default and is one of the tier limits in Settings.':
    'المستخدم المفرط هو مستخدم في المستوى المفرط: أي أن الاستخدام ÷ الأرصدة المشمولة في الترخيص يساوي حد ذلك المستوى أو يزيد عليه. والحد 300% افتراضيًا، وهو أحد حدود المستويات في الإعدادات.',
  'The title counts those users and shows the limit in use as a multiple, for example 3×. The summary shows the amount they took from the pool.':
    'يعدّ العنوان هؤلاء المستخدمين ويعرض الحد المستخدم كمضاعف، مثل 3×. ويعرض الملخص المبلغ الذي أخذوه من الرصيد المشترك.',
  'Up to five users follow. Each line shows their usage, their usage as a percent of their own included credits, their most used model and their Auto share.':
    'يلي ذلك حتى خمسة مستخدمين. ويعرض كل سطر استخدامهم، واستخدامهم كنسبة مئوية من أرصدتهم المشمولة الخاصة، والنموذج الأكثر استخدامًا لديهم، وحصة Auto لديهم.',
  'The last evidence line shows the usage above 3 × the included credits, which is Σ max(0, usage − 3 × included credits), then the share of 50% that the plan assumes can be avoided, and what the Cap runaway users lever saves over the period. That saving is smaller when the levers ahead of it already removed some usage.':
    'يعرض آخر سطر من الأدلة الاستخدام الذي يزيد على 3 × الأرصدة المشمولة، وهو Σ max(0, الاستخدام − 3 × الأرصدة المشمولة)، ثم نسبة 50% التي تفترض الخطة إمكان تجنبها، وما يوفّره إجراء «وضع حد للمستخدمين المفرطين» على مدى الفترة. ويقل هذا التوفير عندما تكون الإجراءات التي تسبقه قد أزالت بعض الاستخدام.',
  'The value on the card is what that lever saves: the usage avoided per month and the cash saved per month, worked out as described under Value shown on a recommendation.':
    'القيمة على البطاقة هي ما يوفّره ذلك الإجراء: الاستخدام المتجنَّب شهريًا والمبلغ النقدي الموفَّر شهريًا، محسوبين كما هو موضح في «القيمة المعروضة على التوصية».',
  'Severity is High when anything was billed in the period, and Medium when nothing was billed.':
    'تكون الخطورة «مرتفع» عندما دُفع أي مبلغ إضافي في الفترة، و«متوسط» عندما لم يُدفع شيء.',
  'The affected users are all runaway users. The card names up to 12.':
    'المستخدمون المتأثرون هم كل المستخدمين المفرطين. وتذكر البطاقة حتى 12 منهم.',
  'The limit of the tier comes from Settings. The line of 3× and the share of 50% belong to the lever and are set in the simulator, so changing the tier limit changes who is listed, not the avoidable amount.':
    'حد المستوى يأتي من الإعدادات. أما العتبة 3× ونسبة 50% فتخصان الإجراء وتُضبطان في المحاكي، لذلك فتغيير حد المستوى يغيّر من يُدرج لا المبلغ القابل للتجنب.',
  'A user above their own credits costs extra only when the whole pool runs out. Until then they use credits that other seats did not.':
    'المستخدم الذي يتجاوز أرصدته الخاصة لا يكلّف مبلغًا إضافيًا إلا عندما ينفد الرصيد المشترك كله. وإلى ذلك الحين يستخدم أرصدة لم تستخدمها التراخيص الأخرى.',
  'Heavy use can be valuable work. The recommendation does not say that the usage was wasteful.':
    'قد يكون الاستخدام الكثيف عملًا قيّمًا. ولا تقول التوصية إن الاستخدام كان هدرًا.',
  'The included credits of a seat count in full for every month in which the user has usage, so a period that cuts a month short makes the percentages look lower.':
    'تُحتسب الأرصدة المشمولة للترخيص كاملة في كل شهر يكون للمستخدم فيه استخدام، لذلك فالفترة التي تقتطع جزءًا من شهر تجعل النسب تبدو أقل.',
  'One user has $60 of usage on a $19 seat. That is 316% of their included credits, above the limit of 300%. They took $60 − $19 = $41 from the pool. Usage above 3× their credits is $60 − 3 × $19 = $3, and the plan assumes 50% of it, $1.50, can be avoided before the other levers take their part.':
    'لدى مستخدم استخدام قدره $60 على ترخيص بقيمة $19. وهذا 316% من أرصدته المشمولة، أي فوق حد 300%. وقد أخذ $60 − $19 = $41 من الرصيد المشترك. والاستخدام الذي يزيد على 3× أرصدته هو $60 − 3 × $19 = $3، وتفترض الخطة إمكان تجنب 50% منه، أي $1.50، قبل أن تأخذ الإجراءات الأخرى نصيبها.',
  'Usage on Powerful models': 'الاستخدام على النماذج القوية',
  'Appears when a large part of the usage runs on Powerful models and the same tokens would cost less on a mid-tier model. It shows the usage that moving a share of that work would avoid.':
    'تظهر عندما يجري جزء كبير من الاستخدام على النماذج القوية وكانت الرموز نفسها ستكلّف أقل على نموذج من الفئة المتوسطة. وتبيّن الاستخدام الذي سيتجنبه نقل جزء من ذلك العمل.',
  'Powerful share = usage on Powerful models ÷ usage':
    'حصة النماذج القوية = الاستخدام على النماذج القوية ÷ الاستخدام',
  'It appears when the Right-size models lever finds a saving above $0 and the Powerful share is 20% or more. Powerful models are the ones in the Powerful tier of Usage by model tier.':
    'تظهر عندما يجد إجراء «اختيار النموذج المناسب» توفيرًا يزيد على $0 وتبلغ حصة النماذج القوية 20% أو أكثر. والنماذج القوية هي التي في الفئة القوية ضمن «الاستخدام حسب فئة النموذج».',
  'The title shows the Powerful share. Severity is High at 70% or more, Medium at 40% or more and Low below that.':
    'يعرض العنوان حصة النماذج القوية. وتكون الخطورة «مرتفع» عند 70% أو أكثر، و«متوسط» عند 40% أو أكثر، و«منخفض» دون ذلك.',
  'When the pool is known and the cash saved is $0, High becomes Medium. The saving is worth doing, but it frees no cash today. Low stays Low.':
    'عندما يكون الرصيد المشترك معروفًا ويكون المبلغ النقدي الموفَّر $0، تصبح «مرتفع» «متوسط». فالتوفير يستحق العمل، لكنه لا يحرّر نقدًا اليوم. وتبقى «منخفض» كما هي.',
  'The evidence lists up to three Powerful models with the largest saving, each with its mid-tier target. It shows the usage of the model and what the same tokens cost on the target as a percent of what they cost on the model, at price card rates. Models whose target is not cheaper are left out.':
    'تسرد الأدلة حتى ثلاثة نماذج قوية هي الأكبر توفيرًا، لكل منها نموذجه المستهدف من الفئة المتوسطة. وتعرض استخدام النموذج وتكلفة الرموز نفسها على النموذج المستهدف كنسبة مئوية من تكلفتها على النموذج، بأسعار قائمة الأسعار. وتُستبعد النماذج التي لا يكون هدفها أرخص.',
  'The last evidence line shows what moving 30% of the Powerful-tier usage to mid-tier models would do: the usage avoided per month and the cash saved per month. It is the Right-size models lever at its default share.':
    'يعرض آخر سطر من الأدلة ما سيحدثه نقل 30% من استخدام الفئة القوية إلى نماذج الفئة المتوسطة: الاستخدام المتجنَّب شهريًا والمبلغ النقدي الموفَّر شهريًا. وهو إجراء «اختيار النموذج المناسب» بحصته الافتراضية.',
  'The affected users are the ones with the Frontier-heavy usage profile, which means at least 70% of their usage on Powerful models by default. The count is all of them and the card names up to 12.':
    'المستخدمون المتأثرون هم أصحاب ملف الاستخدام «يعتمد على النماذج القوية»، أي 70% على الأقل من استخدامهم على النماذج القوية افتراضيًا. والعدد يشملهم جميعًا وتذكر البطاقة حتى 12 منهم.',
  'It cannot tell whether a mid-tier model can do the work. The share of 30% is a default for how much Powerful usage is routine.':
    'ولا تستطيع أن تبيّن هل يستطيع نموذج من الفئة المتوسطة أداء العمل. ونسبة 30% افتراض لمقدار ما هو روتيني من استخدام النماذج القوية.',
  'The saving uses the price card ratio of the same tokens, so it needs model names and token counts.':
    'يستخدم التوفير نسبة الأسعار في قائمة الأسعار للرموز نفسها، لذلك يحتاج إلى أسماء النماذج وأعداد الرموز.',
  'It overlaps with Use Auto model selection. The plan applies the levers one after the other so that the overlap is not counted twice. The figure on this card is the lever on its own.':
    'يتداخل مع «استخدام الاختيار التلقائي للنموذج (Auto)». وتطبّق الخطة الإجراءات واحدًا بعد الآخر حتى لا يُحتسب التداخل مرتين. والرقم على هذه البطاقة هو الإجراء بمفرده.',
  'The amount is usage. The cash figure is what remains after the pool is taken into account.':
    'المبلغ استخدام. أما الرقم النقدي فهو ما يبقى بعد احتساب الرصيد المشترك.',
  'Usage is $10,000 and $4,000 of it runs on Powerful models, which is 40%, so severity is Medium. One Powerful model has $1,000 of usage, and its tokens cost 40% as much on the target. A full move saves $1,000 × (1 − 0.4) = $600, and 30% of that is $180.':
    'الاستخدام $10,000، منه $4,000 على النماذج القوية، أي 40%، فتكون الخطورة «متوسط». ولدى نموذج قوي واحد استخدام قدره $1,000، وتكلّف رموزه 40% فقط على النموذج المستهدف. والنقل الكامل يوفّر $1,000 × (1 − 0.4) = $600، و30% من ذلك هي $180.',
  'Hand-picked usage that Auto could take': 'الاستخدام المختار يدويًا الذي يمكن أن يتولاه Auto',
  'Appears when less than 70% of the usage goes through Auto model selection. It shows the hand-picked usage and the discount that part of it would earn if it went through Auto.':
    'تظهر عندما يمرّ أقل من 70% من الاستخدام عبر الاختيار التلقائي للنموذج. وتعرض الاستخدام المختار يدويًا والخصم الذي سيناله جزء منه لو مرّ عبر Auto.',
  'Discount missed = Σ over users of (hand-picked usage × Auto discount rate of the plan of the user)':
    'الخصم الفائت = Σ على المستخدمين لـ (الاستخدام المختار يدويًا × معدل خصم Auto في خطة المستخدم)',
  'Auto share = usage billed through Auto ÷ all usage. Hand-picked usage = all usage − usage through Auto. The recommendation appears when the Auto share is below 70% and the Use Auto model selection lever finds a saving above $0.':
    'حصة Auto = الاستخدام المحتسب عبر Auto ÷ كل الاستخدام. والاستخدام المختار يدويًا = كل الاستخدام − الاستخدام عبر Auto. وتظهر التوصية عندما تقل حصة Auto عن 70% ويجد إجراء «استخدام الاختيار التلقائي للنموذج (Auto)» توفيرًا يزيد على $0.',
  'The title shows the Auto share. The first evidence line shows the hand-picked usage and all usage.':
    'يعرض العنوان حصة Auto. ويعرض أول سطر من الأدلة الاستخدام المختار يدويًا وكل الاستخدام.',
  'The second evidence line names the users who used Auto for less than 10% of their usage, which is the default of the setting "Rarely uses Auto below". Only users with at least $5 of usage count. When there is none, the line says that no user is below the limit.':
    'يذكر السطر الثاني من الأدلة المستخدمين الذين استخدموا Auto لأقل من 10% من استخدامهم، وهي القيمة الافتراضية للإعداد «نادرًا ما يستخدم Auto تحت». ولا يُحتسب إلا المستخدمون الذين لديهم $5 على الأقل من الاستخدام. وإذا لم يوجد أحد، يذكر السطر أنه لا مستخدم دون الحد.',
  'The last evidence line shows what 50% of the hand-picked usage going through Auto would avoid per month. It is the lever at its default share, applied to the discount missed on hand-picked usage.':
    'يعرض آخر سطر من الأدلة ما سيتجنبه مرور 50% من الاستخدام المختار يدويًا عبر Auto شهريًا. وهو الإجراء بحصته الافتراضية، مطبّقًا على الخصم الفائت في الاستخدام المختار يدويًا.',
  'The summary depends on what the report shows. When at least one plan has Auto usage that could be priced from token counts, it says that Auto usage received a discount of x% off its original price and that y% of it was priced from token counts. Otherwise it says that the report has no measured Auto discount and that the estimate uses the assumed rate from Settings.':
    'يتوقف الملخص على ما يعرضه التقرير. فعندما تكون لخطة واحدة على الأقل استخدام Auto يمكن تسعيره من أعداد الرموز، يذكر أن استخدام Auto نال خصمًا بنسبة x% عن سعره الأصلي وأن y% منه سُعِّر من أعداد الرموز. وإلا يذكر أن التقرير لا يتضمن خصم Auto مقيسًا وأن التقدير يستخدم المعدل المفترض من الإعدادات.',
  'The caveat lists the rate of each plan. A plan rate is measured when the plan has at least $1 of Auto usage that could be priced from token counts. Other plans use the setting "Auto model discount", which is 10% by default, and the caveat labels that rate as assumed.':
    'يسرد التنبيه معدل كل خطة. ويكون معدل الخطة مقيسًا عندما يكون للخطة $1 على الأقل من استخدام Auto يمكن تسعيره من أعداد الرموز. وتستخدم الخطط الأخرى الإعداد «خصم نموذج Auto»، وهو 10% افتراضيًا، ويصف التنبيه ذلك المعدل بأنه مفترض.',

  // Rules: Auto details, cache reuse, prompt context, long-context surcharges
  'Severity is Medium when the usage avoided per month is at least 3% of the usage of a month and the pool is known. In all other cases it is Low.':
    'تكون الخطورة «متوسط» عندما يبلغ الاستخدام المتجنَّب شهريًا 3% على الأقل من استخدام الشهر ويكون الرصيد المشترك معروفًا. وفي كل الحالات الأخرى تكون «منخفض».',
  'The affected users are the ones below the limit of "Rarely uses Auto below".':
    'المستخدمون المتأثرون هم من دون حد «نادرًا ما يستخدم Auto تحت».',
  'It counts the discount only. Auto can choose a different model than the one picked by hand, and the report cannot show what the same requests would have cost on that model.':
    'تحتسب الخصم فقط. فقد يختار Auto نموذجًا غير الذي اختير يدويًا، ولا يستطيع التقرير أن يبيّن كم كانت ستكلّف الطلبات نفسها على ذلك النموذج.',
  'The report does not say why plans earn different rates, so none is assumed. A plan with a rate of 0% adds nothing.':
    'لا يذكر التقرير سبب اختلاف معدلات الخطط، لذلك لا يُفترض سبب. والخطة التي معدلها 0% لا تضيف شيئًا.',
  'Rows without a username are left out of the hand-picked usage, because they have no seat and no model to pick.':
    'تُستبعد الصفوف التي بلا اسم مستخدم من الاستخدام المختار يدويًا، لأنه لا ترخيص لها ولا نموذج يُختار.',
  'Hand-picked usage is $2,000 on a plan with a measured Auto discount of 10%. The discount missed is $2,000 × 10% = $200. At the default share of 50% the lever saves $100 on its own. Right-size models already removed $500 of $10,000, so the saving is $100 × $9,500 ÷ $10,000 = $95.':
    'الاستخدام المختار يدويًا $2,000 على خطة خصم Auto المقيس فيها 10%. فيكون الخصم الفائت $2,000 × 10% = $200. وبالحصة الافتراضية 50% يوفّر الإجراء $100 بمفرده. وقد أزال «اختيار النموذج المناسب» بالفعل $500 من $10,000، فيكون التوفير $100 × $9,500 ÷ $10,000 = $95.',
  'Appears when prompts are often sent again at full price instead of being read from the cache. It shows the cache hit rate, what cache writes cost and the usage that more reuse would avoid.':
    'تظهر عندما تُرسل الطلبات كثيرًا من جديد بالسعر الكامل بدل أن تُقرأ من الذاكرة المؤقتة. وتعرض نسبة القراءة من الذاكرة المؤقتة، وتكلفة الكتابة في الذاكرة المؤقتة، والاستخدام الذي سيتجنبه مزيد من إعادة الاستخدام.',
  'Cache hit rate = cache read tokens ÷ (input + cache read + cache write tokens)':
    'نسبة القراءة من الذاكرة المؤقتة = رموز القراءة من الذاكرة المؤقتة ÷ (رموز الإدخال + رموز القراءة من الذاكرة المؤقتة + رموز الكتابة في الذاكرة المؤقتة)',
  'It needs token counts and models with prices, and the Cache discipline lever must find a saving above $0.':
    'تحتاج إلى أعداد الرموز ونماذج لها أسعار، ويجب أن يجد إجراء «الاستفادة من الذاكرة المؤقتة» توفيرًا يزيد على $0.',
  'The hit rate is the one of the whole period. See Cache hit rate.':
    'نسبة القراءة هي نسبة الفترة كلها. راجع «نسبة القراءة من الذاكرة المؤقتة».',
  'It appears when the hit rate is below 80%, or when at least one user is below the limit of the setting "Low cache reuse below", which is 50% by default. A user counts only with at least $5 of usage and at least half of that usage priced from token counts.':
    'تظهر عندما تقل نسبة القراءة عن 80%، أو عندما يكون مستخدم واحد على الأقل دون حد الإعداد «استفادة قليلة من الذاكرة المؤقتة تحت»، وهو 50% افتراضيًا. ولا يُحتسب المستخدم إلا إذا كان لديه $5 على الأقل من الاستخدام وسُعِّر نصف ذلك الاستخدام على الأقل من أعداد الرموز.',
  'The title shows the hit rate when it is below 80%. Otherwise it counts the users below the limit.':
    'يعرض العنوان نسبة القراءة عندما تقل عن 80%. وإلا فيعدّ المستخدمين دون الحد.',
  'The second evidence line shows what cache writes and cache reads cost as shares of the priced usage: the estimated cost of cache write tokens ÷ the estimated cost of all priced tokens, and the same for cache read tokens.':
    'يعرض السطر الثاني من الأدلة تكلفة الكتابة في الذاكرة المؤقتة والقراءة منها كحصص من الاستخدام المسعَّر: التكلفة المقدَّرة لرموز الكتابة في الذاكرة المؤقتة ÷ التكلفة المقدَّرة لكل الرموز المسعَّرة، والأمر نفسه لرموز القراءة من الذاكرة المؤقتة.',
  'The last evidence line shows what turning 20% of cache writes into reads would avoid per month. It is the Cache discipline lever at its default share.':
    'يعرض آخر سطر من الأدلة ما سيتجنبه تحويل 20% من عمليات الكتابة في الذاكرة المؤقتة إلى قراءات شهريًا. وهو إجراء «الاستفادة من الذاكرة المؤقتة» بحصته الافتراضية.',
  'Severity is Low when the hit rate is 80% or more. Below that it is Medium when the lever saves at least 2% of the usage of the period, and Low otherwise.':
    'تكون الخطورة «منخفض» عندما تبلغ نسبة القراءة 80% أو أكثر. ودون ذلك تكون «متوسط» عندما يوفّر الإجراء 2% على الأقل من استخدام الفترة، و«منخفض» فيما عدا ذلك.',
  'The affected users are the ones below the limit of the setting. The count is all of them.':
    'المستخدمون المتأثرون هم من دون حد الإعداد. والعدد يشملهم جميعًا.',
  'Some cache writes cannot be avoided, because a prompt is written the first time it is sent. The share of 20% is a default for how many can be.':
    'بعض عمليات الكتابة في الذاكرة المؤقتة لا يمكن تجنبها، لأن الطلب يُكتب أول مرة يُرسل فيها. ونسبة 20% افتراض لمقدار ما يمكن تجنبه.',
  'It does not say which sessions or habits cause a low hit rate.':
    'ولا تذكر أي الجلسات أو العادات تسبب انخفاض نسبة القراءة.',
  'The cost shares use the estimated cost from token counts at standard rates, so they cover only the usage that could be priced. See Token coverage.':
    'تستخدم حصص التكلفة التكلفة المقدَّرة من أعداد الرموز بالأسعار القياسية، لذلك تغطي فقط الاستخدام الذي أمكن تسعيره. راجع «تغطية الرموز».',
  'The period has 6 million input, 3 million cache write and 9 million cache read tokens. Hit rate = 9 ÷ (6 + 9 + 3) = 50%, so the title reads "Only 50% of prompt tokens are cache hits". The lever saves $300 of $10,000 of usage, which is 3% and above 2%, so severity is Medium.':
    'في الفترة 6 ملايين رمز إدخال و3 ملايين رمز كتابة في الذاكرة المؤقتة و9 ملايين رمز قراءة منها. نسبة القراءة = 9 ÷ (6 + 9 + 3) = 50%، فيكون العنوان «50% فقط من رموز الطلب تُقرأ من الذاكرة المؤقتة». ويوفّر الإجراء $300 من $10,000 من الاستخدام، أي 3% وهي أعلى من 2%، فتكون الخطورة «متوسط».',
  'Prompt context share': 'حصة سياق الطلب',
  'Appears when at least half of the priced usage is the prompt that is sent with every request: the conversation, open files, instructions and tool descriptions. It shows what a smaller prompt would avoid.':
    'تظهر عندما يكون نصف الاستخدام المسعَّر على الأقل هو المحتوى الذي يُرسل مع كل طلب: المحادثة والملفات المفتوحة والتعليمات وأوصاف الأدوات. وتبيّن ما سيتجنبه تصغير هذا المحتوى.',
  'Prompt side share = (cost of input + cache read + cache write tokens) ÷ cost of all priced tokens':
    'حصة جانب الإدخال = (تكلفة رموز الإدخال + القراءة من الذاكرة المؤقتة + الكتابة في الذاكرة المؤقتة) ÷ تكلفة كل الرموز المسعَّرة',
  'It needs token counts and models with prices, and the Leaner context lever must find a saving above $0.':
    'تحتاج إلى أعداد الرموز ونماذج لها أسعار، ويجب أن يجد إجراء «سياق أخف» توفيرًا يزيد على $0.',
  'The costs are the estimated costs by token type at standard rates. See Cost by token type.':
    'التكاليف هي التكاليف المقدَّرة حسب نوع الرمز بالأسعار القياسية. راجع «التكلفة حسب نوع الرمز».',
  'It appears when the prompt side share is 50% or more. The title shows the share.':
    'تظهر عندما تبلغ حصة جانب الإدخال 50% أو أكثر. ويعرض العنوان الحصة.',
  'The evidence line shows what trimming the prompt-side tokens by 10% would avoid per month. It is the Leaner context lever at its default share.':
    'يعرض سطر الأدلة ما سيتجنبه تقليص رموز جانب الإدخال بنسبة 10% شهريًا. وهو إجراء «سياق أخف» بحصته الافتراضية.',
  'Severity is always Low.': 'الخطورة دائمًا «منخفض».',
  'A share of 50% or more means that the prompt side costs at least as much as the output. It is a reason to look at context habits, not a sign of a problem.':
    'تعني حصة 50% أو أكثر أن جانب الإدخال يكلّف على الأقل بقدر ما يكلّفه الإخراج. وهي سبب للنظر في عادات السياق، لا علامة على مشكلة.',
  'It does not say which conversations, instruction files or tools carry the extra context.':
    'ولا تذكر أي المحادثات أو ملفات التعليمات أو الأدوات تحمل السياق الإضافي.',
  'It covers only the usage that could be priced from token counts. With a low token coverage the share and the lever are understated.':
    'تغطي فقط الاستخدام الذي أمكن تسعيره من أعداد الرموز. ومع تغطية رموز منخفضة تكون الحصة والإجراء أقل من الواقع.',
  'The cost by token type shows $4,000 for input, $3,000 for cache read, $1,000 for cache write and $2,000 for output tokens. The prompt side is $8,000 of $10,000, which is 80%. Trimming it by 10% avoids $800 on its own.':
    'تعرض التكلفة حسب نوع الرمز $4,000 لرموز الإدخال و$3,000 للقراءة من الذاكرة المؤقتة و$1,000 للكتابة فيها و$2,000 لرموز الإخراج. وجانب الإدخال $8,000 من $10,000، أي 80%. وتقليصه بنسبة 10% يتجنب $800 بمفرده.',
  'Appears when some requests sent prompts so long that the model charged its higher long-context rates. It shows the surcharge, the models and the users involved, and what avoiding part of it would save.':
    'تظهر عندما أرسلت بعض الطلبات سياقًا طويلًا إلى حد أن النموذج احتسب أسعار السياق الطويل الأعلى. وتعرض الرسم الإضافي والنماذج والمستخدمين المعنيين، وما سيوفّره تجنب جزء منه.',
  'Surcharge share = long-context premium ÷ usage':
    'حصة الرسم الإضافي = علاوة السياق الطويل ÷ الاستخدام',
  'It appears when the long-context premium is above $0.005 and the Avoid long-context surcharges lever finds a saving above $0. The premium is worked out as described under Long-context premium.':
    'تظهر عندما تزيد علاوة السياق الطويل على $0.005 ويجد إجراء «تجنب رسوم السياق الطويل الإضافية» توفيرًا يزيد على $0. وتُحسب العلاوة كما هو موضح في «علاوة السياق الطويل».',
  'The title shows the premium of the period. It says "at least" because the premium is a lower bound.':
    'يعرض العنوان علاوة الفترة. ويقول «على الأقل» لأن العلاوة حد أدنى.',
  'The summary shows the surcharge share. Severity is Medium when the share is 5% or more and Low below that.':
    'يعرض الملخص حصة الرسم الإضافي. وتكون الخطورة «متوسط» عندما تبلغ الحصة 5% أو أكثر، و«منخفض» دون ذلك.',
  'The first evidence line counts the usage lines, which the file calls rows, that were charged above their standard price. The second names up to 3 models with the largest premium, each with its premium. The third names up to 4 users with the largest premium.':
    'يعدّ أول سطر من الأدلة أسطر الاستخدام، وهي ما يسميه الملف صفوفًا، التي حُوسبت بأعلى من سعرها القياسي. ويذكر الثاني حتى 3 نماذج هي الأكبر علاوة، مع علاوة كل منها. ويذكر الثالث حتى 4 مستخدمين هم الأكبر علاوة.',
  'The value on the card is what the lever saves at its default share of 30% of the premium: the usage avoided per month and the cash saved per month, worked out as described under Value shown on a recommendation.':
    'القيمة على البطاقة هي ما يوفّره الإجراء بحصته الافتراضية 30% من العلاوة: الاستخدام المتجنَّب شهريًا والمبلغ النقدي الموفَّر شهريًا، محسوبين كما هو موضح في «القيمة المعروضة على التوصية».',
  'The affected users are the ones with the trait Long-context surcharges: usage of at least the Minimum usage for traits, and a surcharge of at least 10% of their usage by default (the setting "Long-context surcharges from"). The count is all of them and the card names up to 12.':
    'المستخدمون المتأثرون هم أصحاب السمة «رسوم إضافية للسياق الطويل»: استخدام يبلغ «أدنى استخدام للسمات» على الأقل، ورسم إضافي لا يقل عن 10% من استخدامهم افتراضيًا (الإعداد «رسوم إضافية للسياق الطويل ابتداءً من»). والعدد يشملهم جميعًا وتذكر البطاقة حتى 12 منهم.',

  // Rules: long-context details, budgets, cost center coverage, unattributed usage
  'The report does not mark long-context requests. The app counts only the rows that the price card can confirm, so the premium and the saving are lower bounds.':
    'لا يميّز التقرير طلبات السياق الطويل. ولا يحتسب التطبيق إلا الصفوف التي تستطيع قائمة الأسعار تأكيدها، لذلك تكون العلاوة والتوفير حدّين أدنيين.',
  'It does not say what made the prompts long or which of them can be shortened without losing the work.':
    'ولا تذكر ما الذي جعل الطلبات طويلة ولا أيها يمكن اختصاره دون خسارة العمل.',
  'The setting "Long-context surcharges from" only decides who is named as affected. It does not change the value on the card.':
    'الإعداد «رسوم إضافية للسياق الطويل ابتداءً من» يحدد فقط من يُذكر بوصفه متأثرًا. ولا يغيّر القيمة على البطاقة.',
  'Usage is $10,000 and the long-context premium is $600, so the surcharge share is 6% and severity is Medium. The title reads "Long-context surcharges cost at least $600". At 30% the lever saves $180 on its own, before the levers ahead of it take their part.':
    'الاستخدام $10,000 وعلاوة السياق الطويل $600، فتكون حصة الرسم الإضافي 6% وتكون الخطورة «متوسط». ويكون العنوان «تكلف رسوم السياق الطويل الإضافية $600 على الأقل». وبحصة 30% يوفّر الإجراء $180 بمفرده، قبل أن تأخذ الإجراءات التي تسبقه نصيبها.',
  'Budgets to put in place': 'ميزانيات يجب وضعها',
  'Appears when the report shows billed overage, a user far above their credits, or a pool that runs out, and no Monthly budget is set in Settings. It suggests a per-user limit and an enterprise budget worked out from the loaded data.':
    'تظهر عندما يُظهر التقرير مدفوعًا إضافيًا أو مستخدمًا يفوق أرصدته بكثير أو رصيدًا مشتركًا ينفد، ولا تكون «الميزانية الشهرية» محددة في الإعدادات. وتقترح حدًّا لكل مستخدم وميزانية Enterprise محسوبين من البيانات المحمّلة.',
  'Per-user limit = 90th percentile of the monthly usage of a user, rounded up to the next $5':
    'الحد لكل مستخدم = المئين التسعون للاستخدام الشهري للمستخدم، مقرَّبًا إلى أعلى حتى أقرب $5',
  'Take the usage of every user in every month in which the user has usage. A month still in progress is scaled to its projected total, by at most 8 times.':
    'يؤخذ استخدام كل مستخدم في كل شهر يكون له فيه استخدام. ويُكبَّر الشهر الجاري إلى إجماليه المُسقَط، بما لا يزيد على 8 أضعاف.',
  'It needs at least 5 of these user-months.':
    'تحتاج إلى 5 على الأقل من أشهر استخدام المستخدمين هذه.',
  'It appears when something is at risk: billed overage above $0.005, at least one runaway user, or, in the whole-organization view with a known pool, a month in which the pool ran out or is projected to bill overage. It does not appear once a Monthly budget is set in Settings.':
    'تظهر عندما يوجد خطر: مدفوع إضافي يزيد على $0.005، أو مستخدم مفرط واحد على الأقل، أو، في عرض المؤسسة كاملة مع رصيد مشترك معروف، شهر نفد فيه الرصيد المشترك أو يُتوقع أن يُدفع فيه مبلغ إضافي. ولا تظهر متى حُددت «الميزانية الشهرية» في الإعدادات.',
  'The per-user limit is the 90th percentile of those monthly amounts, rounded up to the next multiple of $5, with a minimum of $5.':
    'الحد لكل مستخدم هو المئين التسعون لتلك المبالغ الشهرية، مقرَّبًا إلى أعلى حتى أقرب مضاعف لـ $5، وبحد أدنى $5.',
  'The first evidence line says how many user-months were above that limit, out of all user-months, and how much usage above it would have been held back: Σ max(0, monthly usage − limit).':
    'يذكر أول سطر من الأدلة كم شهر استخدام لمستخدم تجاوز ذلك الحد من بين كل أشهر استخدام المستخدمين، وكم من الاستخدام فوق الحد كان سيُحجب: Σ max(0, الاستخدام الشهري − الحد).',
  'The enterprise budget starts from the billed overage per month: the average over the months, using the projected amount for a month still in progress. When it is above $0.50, the second line suggests 1.25 × that amount, rounded up to the next multiple of $5. Otherwise it suggests starting at $100 as an early warning.':
    'تبدأ ميزانية Enterprise من المدفوع الإضافي شهريًا: المتوسط على الأشهر، مع استخدام المبلغ المُسقَط للشهر الجاري. وعندما يزيد على $0.50 يقترح السطر الثاني 1.25 × ذلك المبلغ، مقرَّبًا إلى أعلى حتى أقرب مضاعف لـ $5. وإلا فيقترح البدء بـ $100 كإنذار مبكر.',
  'Severity is High when anything was billed in the period, and Medium otherwise.':
    'تكون الخطورة «مرتفع» عندما دُفع أي مبلغ إضافي في الفترة، و«متوسط» فيما عدا ذلك.',
  'The figures are starting points taken from the loaded data. Review them with team leads before enforcing a hard stop.':
    'الأرقام نقاط انطلاق مأخوذة من البيانات المحمّلة. راجعها مع قادة الفرق قبل فرض إيقاف صارم.',
  'The 90th percentile means that about one user-month in ten would reach the limit. The choice of the percentile belongs to the app, not to GitHub.':
    'يعني المئين التسعون أن نحو شهر استخدام واحد من كل عشرة سيبلغ الحد. واختيار المئين يعود إلى التطبيق، لا إلى GitHub.',
  'Usage held back is usage above the limit, counted as if all of it stopped. People may move to other work or ask for an exception, so it is not a forecast of savings.':
    'الاستخدام المحجوب هو الاستخدام فوق الحد، محسوبًا كما لو توقف كله. وقد ينتقل الأشخاص إلى عمل آخر أو يطلبون استثناءً، لذلك فهو ليس توقعًا للتوفير.',
  'The enterprise budget limits the billed overage. Seat fees come on top of it.':
    'تحدّ ميزانية Enterprise من المدفوع الإضافي. وتُضاف رسوم التراخيص فوقها.',
  'The 90th percentile of the monthly usage of users is $41.30, so the limit is $45. Of 40 user-months, 3 were above $45, by $10, $4 and $2, so $16 of usage would have been held back. The projected billed overage averages $120 per month, so the suggested enterprise budget is 1.25 × $120 = $150.':
    'المئين التسعون للاستخدام الشهري للمستخدمين $41.30، فيكون الحد $45. ومن أصل 40 من أشهر استخدام المستخدمين، تجاوزت 3 منها $45، بمقدار $10 و$4 و$2، فكان سيُحجب $16 من الاستخدام. ويبلغ متوسط المدفوع الإضافي المُسقَط $120 شهريًا، فتكون ميزانية Enterprise المقترحة 1.25 × $120 = $150.',
  'Cost center coverage': 'تغطية مراكز التكلفة',
  'Appears when the report has cost centers but some users have none, so their usage cannot be charged back or budgeted by team.':
    'تظهر عندما يتضمن التقرير مراكز تكلفة لكن بعض المستخدمين بلا مركز، فلا يمكن توزيع تكلفة استخدامهم ولا وضع ميزانية له بحسب الفريق.',
  'Share without a cost center = usage of the users without a cost center ÷ usage':
    'النسبة بلا مركز تكلفة = استخدام المستخدمين بلا مركز تكلفة ÷ الاستخدام',
  'It needs at least one cost center somewhere in the report and at least one user with none. A user has none when no row of the user names a cost center.':
    'تحتاج إلى مركز تكلفة واحد على الأقل في أي مكان من التقرير ومستخدم واحد على الأقل بلا مركز. ويكون المستخدم بلا مركز عندما لا يذكر أي صف من صفوفه مركز تكلفة.',
  'The title counts those users. The summary shows their usage and its share of all usage.':
    'يعدّ العنوان هؤلاء المستخدمين. ويعرض الملخص استخدامهم ونسبته من كل الاستخدام.',
  'Severity is Medium when that share is 20% or more and Low below that.':
    'تكون الخطورة «متوسط» عندما تبلغ تلك النسبة 20% أو أكثر، و«منخفض» دون ذلك.',
  'The evidence names up to 5 of the users and the card names up to 12. The count is all of them.':
    'تذكر الأدلة حتى 5 من المستخدمين وتذكر البطاقة حتى 12. والعدد يشملهم جميعًا.',
  'The list of Users without a cost center on the Organization page holds the same users.':
    'تضم قائمة «مستخدمون بلا مركز تكلفة» في صفحة المؤسسة المستخدمين أنفسهم.',
  'It does not say whether a user should have a cost center, only that the file names none.':
    'ولا تذكر هل ينبغي أن يكون لمستخدم مركز تكلفة، بل فقط أن الملف لا يذكر أيًّا منها.',
  'Without any cost center in the file the recommendation does not appear.':
    'ولا تظهر التوصية إذا لم يكن في الملف أي مركز تكلفة.',
  'Ten users used $10,000 in all. Three of them have no cost center and used $2,500. The title reads "3 users are not assigned to a cost center" and the summary shows $2,500 and 25% of usage. A share of 25% is above 20%, so severity is Medium.':
    'استخدم عشرة مستخدمين $10,000 إجمالًا. ثلاثة منهم بلا مركز تكلفة واستخدموا $2,500. ويكون العنوان «3 مستخدمين غير مسندين إلى مركز تكلفة» ويعرض الملخص $2,500 و25% من الاستخدام. والنسبة 25% أعلى من 20%، فتكون الخطورة «متوسط».',
  'Appears when at least $1, and at least 1% of all usage, sits on rows that have no username. A budget set per user cannot control it.':
    'تظهر عندما يقع $1 على الأقل، و1% على الأقل من كل الاستخدام، على صفوف بلا اسم مستخدم. ولا تستطيع ميزانية تُحدَّد لكل مستخدم التحكم فيه.',
  'Share not tied to a user = usage of rows with no username ÷ usage':
    'النسبة غير المرتبطة بمستخدم = استخدام الصفوف بلا اسم مستخدم ÷ الاستخدام',
  'Add up gross_amount for the rows with an empty username, within the selected dates and filters.':
    'يُجمع gross_amount للصفوف التي اسم المستخدم فيها فارغ، ضمن التواريخ وعوامل التصفية المحددة.',
  'It appears when that sum is at least $1 and at least 1% of all usage. The title shows the amount.':
    'تظهر عندما يبلغ ذلك المجموع $1 على الأقل و1% على الأقل من كل الاستخدام. ويعرض العنوان المبلغ.',
  'Severity is Medium when the share is 15% or more and Low below that.':
    'تكون الخطورة «متوسط» عندما تبلغ النسبة 15% أو أكثر، و«منخفض» دون ذلك.',
  'The evidence lists up to 3 products and up to 3 repositories with the most of that usage, each with its amount.':
    'تسرد الأدلة حتى 3 منتجات وحتى 3 مستودعات هي الأكثر في ذلك الاستخدام، مع مبلغ كل منها.',
  'The summary names repository-level products, such as code quality and security scanning, as the usual source. The report shows only the product and repository names in the evidence, so check them.':
    'يذكر الملخص منتجات مستوى المستودع، مثل جودة الكود والفحص الأمني، بوصفها المصدر المعتاد. ولا يعرض التقرير سوى أسماء المنتجات والمستودعات في الأدلة، لذلك تحقق منها.',
  'It does not say whether the usage is needed.':
    'ولا تذكر هل الاستخدام مطلوب.',
  'Unattributed usage on the Organization page is counted by organization, cost center or repository, so its figure can differ.':
    'يُحسب «الاستخدام غير المنسوب» في صفحة المؤسسة بحسب المؤسسة أو مركز التكلفة أو المستودع، لذلك قد يختلف رقمه.',
  'Usage is $10,000 and the rows with no username add up to $1,800, which is 18%. The title reads "$1,800 is not tied to a user". Severity is Medium because 18% is above 15%.':
    'الاستخدام $10,000 ومجموع الصفوف بلا اسم مستخدم $1,800، أي 18%. ويكون العنوان «$1,800 غير مرتبط بمستخدم». وتكون الخطورة «متوسط» لأن 18% أعلى من 15%.',

  // Rules: several organizations, lapsed users, new users, champions
  'Users billed to several organizations': 'مستخدمون يُحاسَبون عبر عدة مؤسسات',
  'Appears when some users have rows under more than one organization, so organization budgets can apply in ways that are hard to predict.':
    'تظهر عندما يكون لبعض المستخدمين صفوف تحت أكثر من مؤسسة واحدة، فقد تنطبق ميزانيات المؤسسات بطرق يصعب التنبؤ بها.',
  'Listed users = users whose rows name more than one organization':
    'المستخدمون المدرجون = المستخدمون الذين تذكر صفوفهم أكثر من مؤسسة واحدة',
  'For each user, collect the organization values of their rows within the selected dates and filters. Empty values are ignored.':
    'لكل مستخدم، تُجمع قيم المؤسسة في صفوفه ضمن التواريخ وعوامل التصفية المحددة. وتُتجاهل القيم الفارغة.',
  'The user is listed when more than one different organization is left.':
    'يُدرج المستخدم عندما تبقى أكثر من مؤسسة واحدة مختلفة.',
  'The title counts the users. The evidence names up to 5 and the card names up to 12.':
    'يعدّ العنوان المستخدمين. وتذكر الأدلة حتى 5 منهم وتذكر البطاقة حتى 12.',
  'Severity is always Low. The recommendation is meant for admins.':
    'الخطورة دائمًا «منخفض». والتوصية موجهة إلى المشرفين.',
  'It cannot tell a user with licenses from several organizations from a user who moved from one organization to another during the period.':
    'ولا تستطيع التمييز بين مستخدم لديه تراخيص من عدة مؤسسات ومستخدم انتقل من مؤسسة إلى أخرى خلال الفترة.',
  'The file does not show which organization pays for the seat.':
    'ولا يبيّن الملف أي مؤسسة تدفع ثمن الترخيص.',
  'A user has $120 under the organization acme and $30 under the organization acme-labs. Two different organizations are named, so the user is listed.':
    'لمستخدم $120 تحت المؤسسة acme و$30 تحت المؤسسة acme-labs. وتُذكر مؤسستان مختلفتان، لذلك يُدرج المستخدم.',
  'Users who stopped using credits': 'مستخدمون توقفوا عن استخدام الأرصدة',
  'Appears when users who were active earlier in the period have had no usage for several days before its end.':
    'تظهر عندما لا يكون لمستخدمين كانوا نشطين في وقت سابق من الفترة أي استخدام لعدة أيام قبل نهايتها.',
  'Lapsed = days since the last usage ≥ Lapsed after, for users who are not new':
    'متوقف = الأيام منذ آخر استخدام ≥ «متوقف بعد»، للمستخدمين غير الجدد',
  'It needs a selected period of at least 14 days. With a shorter one the recommendation does not appear.':
    'تحتاج إلى فترة محددة لا تقل عن 14 يومًا. ومع فترة أقصر لا تظهر التوصية.',
  'Days since = the end of the period − the date of the last row of the user. A user is lapsed when that is at least the setting "Lapsed after" (7 days by default) and the user is not new. A new user is one first seen in the last days of the period, as described under Newly started users.':
    'الأيام منذ آخر استخدام = نهاية الفترة − تاريخ آخر صف للمستخدم. ويكون المستخدم متوقفًا عندما يبلغ ذلك على الأقل قيمة الإعداد «متوقف بعد» (7 أيام افتراضيًا) ولا يكون جديدًا. والمستخدم الجديد هو من ظهر أول مرة في الأيام الأخيرة من الفترة، كما هو موضح في «مستخدمون بدؤوا حديثًا».',
  'The title counts the lapsed users and the summary repeats the number of days.':
    'يعدّ العنوان المستخدمين المتوقفين ويكرر الملخص عدد الأيام.',
  'The evidence adds up the usage that the lapsed users generated earlier in the period and names up to 5 of them. The card names up to 12.':
    'تجمع الأدلة الاستخدام الذي ولّده المستخدمون المتوقفون في وقت سابق من الفترة وتذكر حتى 5 منهم. وتذكر البطاقة حتى 12.',
  'Severity is always Low. The recommendation is meant for management and admins.':
    'الخطورة دائمًا «منخفض». والتوصية موجهة إلى الإدارة والمشرفين.',
  'The report cannot say why a user stopped. Leave, a change of tools, a missing seat and a budget limit all look the same.':
    'لا يستطيع التقرير تحديد سبب توقف المستخدم. فالإجازة وتغيّر الأدوات وغياب الترخيص وحد الميزانية تبدو كلها متشابهة.',
  'The end of the period is the end date you chose, not today.':
    'نهاية الفترة هي تاريخ النهاية الذي اخترته، وليست اليوم.',
  'It follows the filters. A model or product filter can make a user look lapsed who still uses something else.':
    'وهي تتبع عوامل التصفية. فقد يجعل عامل تصفية النموذج أو المنتج مستخدمًا يبدو متوقفًا وهو ما زال يستخدم شيئًا آخر.',
  'The period ends on June 30 and "Lapsed after" is 7 days. A user whose last row is June 20 has 10 days since and is listed. A user whose last row is June 26 has 4 days since and is not.':
    'تنتهي الفترة في 30 يونيو و«متوقف بعد» 7 أيام. مستخدم آخر صف له في 20 يونيو مضى عليه 10 أيام ويُدرج. ومستخدم آخر صف له في 26 يونيو مضى عليه 4 أيام ولا يُدرج.',
  'Newly started users': 'مستخدمون بدؤوا حديثًا',
  'Appears when users started using GitHub Copilot in the last days of the period. It is good news, with advice to share working habits early.':
    'تظهر عندما بدأ مستخدمون استخدام GitHub Copilot في الأيام الأخيرة من الفترة. وهي خبر جيد، مع نصيحة بمشاركة عادات العمل مبكرًا.',
  'New user = first usage in the report within the last New user window days of the period':
    'المستخدم الجديد = أول استخدام في التقرير يقع ضمن آخر «فترة المستخدم الجديد» من أيام الفترة',
  'It needs a selected period of at least 14 days.':
    'تحتاج إلى فترة محددة لا تقل عن 14 يومًا.',
  'A user is new when the first usage of the user anywhere in the report is within the last days of the period, counted by the setting "New user window" (14 days by default), and at least that many days after the first day of the report. A user who appears in the first days of the report may have been there before, so is never counted as new.':
    'يكون المستخدم جديدًا عندما يقع أول استخدام له في أي مكان من التقرير ضمن الأيام الأخيرة من الفترة، بحسب الإعداد «فترة المستخدم الجديد» (14 يومًا افتراضيًا)، وبعد أول يوم في التقرير بهذا العدد من الأيام على الأقل. أما المستخدم الذي يظهر في الأيام الأولى من التقرير فربما كان موجودًا قبل ذلك، لذلك لا يُحسب جديدًا أبدًا.',
  'The title counts the new users and shows the window. The summary adds up the usage that they generated so far.':
    'يعدّ العنوان المستخدمين الجدد ويعرض الفترة. ويجمع الملخص الاستخدام الذي ولّدوه حتى الآن.',
  'The evidence names up to 5 of them. The card names up to 12.':
    'تذكر الأدلة حتى 5 منهم وتذكر البطاقة حتى 12.',
  'Severity is Good news. The recommendation is meant for management and admins.':
    'الخطورة «خبر جيد». والتوصية موجهة إلى الإدارة والمشرفين.',
  'A user is new only compared with the first date in the loaded files. Loading an earlier file can show that a user started before.':
    'يكون المستخدم جديدًا بالمقارنة مع أول تاريخ في الملفات المحمّلة فقط. وقد يُظهر تحميل ملف أقدم أن المستخدم بدأ قبل ذلك.',
  'The group is the New users group of Who the users are (groups). The New users chart on the Patterns page counts users by the week or month of their first date, so its numbers differ.':
    'المجموعة هي مجموعة «مستخدمون جدد» في «من هم المستخدمون» (المجموعات). ويعدّ مخطط «مستخدمون جدد» في صفحة «أنماط الاستخدام» المستخدمين بحسب أسبوع أو شهر أول تاريخ لهم، لذلك تختلف أرقامه.',
  'The report starts on June 1, the period ends on June 30 and the New user window is 14 days. A user first seen on June 20 is new: June 20 is within the last 14 days of the period and more than 14 days after June 1. A user first seen on June 10 is not.':
    'يبدأ التقرير في 1 يونيو وتنتهي الفترة في 30 يونيو و«فترة المستخدم الجديد» 14 يومًا. مستخدم ظهر أول مرة في 20 يونيو هو مستخدم جديد: فـ 20 يونيو ضمن آخر 14 يومًا من الفترة وبعد 1 يونيو بأكثر من 14 يومًا. ومستخدم ظهر أول مرة في 10 يونيو ليس جديدًا.',
  'Champions to learn from': 'روّاد يُتعلَّم منهم',
  'Appears when some users are active often and use a good part of their included credits. It is good news, with advice to learn from their habits.':
    'تظهر عندما يكون بعض المستخدمين نشطين كثيرًا ويستخدمون جزءًا جيدًا من أرصدتهم المشمولة. وهي خبر جيد، مع نصيحة بالتعلّم من عاداتهم.',
  'Share of usage = usage of the champions ÷ usage of all users':
    'نسبة الاستخدام = استخدام الروّاد ÷ استخدام كل المستخدمين',
  'Every user is placed in one group, as described under Who the users are (groups). A champion is active on at least 30% of working days (the setting Engagement, Regular) and has used at least 40% of the included credits of the seat (the Light tier limit in Settings). A runaway, new or lapsed user is never a champion.':
    'يوضع كل مستخدم في مجموعة واحدة، كما هو موضح في «من هم المستخدمون» (المجموعات). والرائد نشط في 30% على الأقل من أيام العمل (الإعداد «التفاعل»، الحد «منتظم») واستخدم 40% على الأقل من الأرصدة المشمولة في ترخيصه («حد شريحة خفيف» في الإعدادات). ولا يكون المستخدم المفرط أو الجديد أو المتوقف رائدًا أبدًا.',
  'The title counts the champions. The summary shows their usage as a share of the usage of all users with a username.':
    'يعدّ العنوان الروّاد. ويعرض الملخص استخدامهم بوصفه نسبة من استخدام كل المستخدمين الذين لهم اسم مستخدم.',
  'Severity is Good news. The recommendation is meant for management.':
    'الخطورة «خبر جيد». والتوصية موجهة إلى الإدارة.',
  'A champion is chosen by how often and how much a user uses credits. It does not say how well the user works with GitHub Copilot. The card suggests looking at their model mix and cache hit rate.':
    'يُختار الرائد بحسب مدى تكرار استخدام المستخدم للأرصدة ومقدار استخدامه لها. ولا يدل ذلك على مدى إتقان المستخدم للعمل مع GitHub Copilot. وتقترح البطاقة النظر في مزيج نماذجه ونسبة القراءة من الذاكرة المؤقتة.',

  // Rules: single-day usage, accelerating usage, falling usage
  'A user above the Runaway tier limit is a runaway user, even with high activity.':
    'المستخدم الذي يتجاوز حد المستوى المفرط مستخدم مفرط، حتى مع النشاط المرتفع.',
  'The numbers in the rules are the defaults. The live values from Settings are listed under Settings that change it.':
    'الأرقام الواردة في القواعد هي القيم الافتراضية. وتُدرج القيم الحالية من الإعدادات تحت «الإعدادات التي تغيّره».',
  'A user is active on 12 of 20 working days, which is 60%, and used 150% of the included credits of their seat. Both are above the limits, so the user is a champion. If the champions used $3,000 of the $10,000 that all users used, the summary shows 30%.':
    'مستخدم نشط في 12 من 20 يوم عمل، أي 60%، واستخدم 150% من الأرصدة المشمولة في ترخيصه. وكلاهما فوق الحدّين، فيكون المستخدم رائدًا. وإذا استخدم الروّاد $3,000 من أصل $10,000 استخدمها كل المستخدمين، فيعرض الملخص 30%.',
  'Usage on a single day': 'الاستخدام في يوم واحد',
  'Appears when some users did a large share of their usage on one single day.':
    'تظهر عندما أنجز بعض المستخدمين نسبة كبيرة من استخدامهم في يوم واحد فقط.',
  'Peak share = usage of the busiest day of the user ÷ usage of the user':
    'نسبة الذروة = استخدام أكثر أيام المستخدم استخدامًا ÷ استخدام المستخدم',
  'For each user, find the day with the most usage and divide it by the usage of the user in the period.':
    'لكل مستخدم، يُحدَّد اليوم الأكثر استخدامًا ويُقسَم استخدامه على استخدام المستخدم في الفترة.',
  'A user has the trait Spiky usage when their usage reaches the Minimum usage for traits ($5 by default), they have at least 3 active days, and the peak share is at least the setting "Spiky usage from" (40% by default). An active day is a day with usage of at least the Active-day threshold.':
    'تكون للمستخدم السمة «قفزات في الاستخدام» عندما يبلغ استخدامه «أدنى استخدام للسمات» ($5 افتراضيًا)، ويكون لديه 3 أيام نشاط على الأقل، وتبلغ نسبة الذروة على الأقل قيمة الإعداد «قفزات في الاستخدام ابتداءً من» (40% افتراضيًا). ويوم النشاط هو يوم يبلغ استخدامه على الأقل «حد يوم النشاط».',
  'The title counts those users and the summary repeats the limit.':
    'يعدّ العنوان هؤلاء المستخدمين ويكرر الملخص الحد.',
  'The evidence shows up to 4 users, each with the peak share, their usage and the date of the busiest day.':
    'تعرض الأدلة حتى 4 مستخدمين، لكل منهم نسبة الذروة واستخدامه وتاريخ أكثر الأيام استخدامًا.',
  'Severity is always Low. The recommendation is meant for users and admins. The card names up to 12 users.':
    'الخطورة دائمًا «منخفض». والتوصية موجهة إلى المستخدمين والمشرفين. وتذكر البطاقة حتى 12 مستخدمًا.',
  'It does not say what ran on that day. The Users page and the Patterns page show the models and the other users of the day.':
    'ولا تذكر ما الذي جرى في ذلك اليوم. وتعرض صفحتا «المستخدمون» و«أنماط الاستخدام» النماذج والمستخدمين الآخرين في ذلك اليوم.',
  'A short period, or few active days, makes the limit easier to reach.':
    'الفترة القصيرة، أو قلة أيام النشاط، تجعل بلوغ الحد أسهل.',
  'The date is the day as written in the file, with no time-zone conversion.':
    'التاريخ هو اليوم كما كُتب في الملف، دون تحويل بين المناطق الزمنية.',
  'A user used $50 in the period, on 5 active days. The busiest day had $30, so the peak share is 60%. That is above 40%, so the evidence line reads "name: 60% of $50 on Sep 3."':
    'استخدم مستخدم $50 في الفترة، على مدى 5 أيام نشاط. وكان لأكثر الأيام استخدامًا $30، فتكون نسبة الذروة 60%. وهي أعلى من 40%، لذلك يكون سطر الأدلة «الاسم: 60% من $50 في 3 سبتمبر.»',
  'Usage accelerating': 'تسارع الاستخدام',
  'Appears when the usage of the last 7 days is at least 50% above the 7 days before. It shows both amounts and the users that grew the fastest.':
    'تظهر عندما يزيد استخدام آخر 7 أيام بنسبة 50% على الأقل عن الأيام السبعة السابقة. وتعرض المبلغين والمستخدمين الذين نموا أسرع من غيرهم.',
  'It needs a selected period of at least 14 days and some usage in the 7 days before the last 7 days. The change is worked out as under Last 7 days vs before.':
    'تحتاج إلى فترة محددة لا تقل عن 14 يومًا وإلى بعض الاستخدام في الأيام السبعة التي تسبق آخر 7 أيام. ويُحسب التغيّر كما في «آخر 7 أيام مقارنة بما قبلها».',
  'The weeks must also carry weight: the larger of the two amounts must be at least $5 and at least 5% of the usage of the period. Otherwise the recommendation does not appear.':
    'ويجب أن يكون للأسبوعين وزن كذلك: فيجب أن يبلغ المبلغ الأكبر من المبلغين $5 على الأقل و5% على الأقل من استخدام الفترة. وإلا فلا تظهر التوصية.',
  'It appears when the change is +50% or more. The title shows the change as a percent. At +200% or more it shows a multiple instead: the usage of the last 7 days ÷ the usage of the 7 days before.':
    'تظهر عندما يبلغ التغيّر +50% أو أكثر. ويعرض العنوان التغيّر بنسبة مئوية. وعند +200% أو أكثر يعرض مضاعفًا بدلًا منها: استخدام آخر 7 أيام ÷ استخدام الأيام السبعة السابقة.',
  'The first evidence line shows both amounts. The second names up to 3 users that grew the fastest, each with the usage before and after.':
    'يعرض أول سطر من الأدلة المبلغين. ويذكر الثاني حتى 3 مستخدمين نموا أسرع من غيرهم، لكل منهم الاستخدام قبل التغيّر وبعده.',
  'A user is accelerating when the usage of their last 7 days is at least the Minimum usage for traits and at least 1.5 times the usage of their 7 days before. A user with nothing in the 7 days before counts too, unless the user is new.':
    'يكون المستخدم متسارعًا عندما يبلغ استخدامه في آخر 7 أيام على الأقل «أدنى استخدام للسمات» و1.5 ضعف استخدامه في الأيام السبعة السابقة على الأقل. ويُحسب كذلك المستخدم الذي لم يكن له شيء في الأيام السبعة السابقة، إلا إذا كان جديدًا.',
  'Severity is High when the change is +100% or more, or when anything was billed in the period. Otherwise it is Medium.':
    'تكون الخطورة «مرتفع» عندما يبلغ التغيّر +100% أو أكثر، أو عندما دُفع أي مبلغ إضافي في الفترة. وفيما عدا ذلك تكون «متوسط».',
  'The affected users are the accelerating ones, the fastest first. The count is all of them and the card names up to 12.':
    'المستخدمون المتأثرون هم المتسارعون، الأسرع أولًا. والعدد يشملهم جميعًا وتذكر البطاقة حتى 12.',
  'The last 7 days end at the end of the selected period, which is not always the end of the report.':
    'تنتهي آخر 7 أيام بنهاية الفترة المحددة، وهي ليست دائمًا نهاية التقرير.',
  'The report cannot say what changed.': 'ولا يستطيع التقرير تحديد ما الذي تغيّر.',
  'Two weeks are a small sample, so one large day in the last week can drive the change.':
    'أسبوعان عيّنة صغيرة، لذلك قد يتسبب يوم واحد كبير في الأسبوع الأخير في هذا التغيّر.',
  'The summary describes what happens if the pace continues. It is not a forecast: the projected month is on the Overview page.':
    'يصف الملخص ما يحدث إذا استمر هذا المعدل. وهو ليس توقعًا: فالشهر المُسقَط موجود في صفحة «نظرة عامة».',
  'The last 7 days used $900 and the 7 days before used $300. Change = 900 ÷ 300 − 1 = +200%, so the title reads "Usage is accelerating: 3.0× the week before". Severity is High because the change is above +100%.':
    'استُخدم $900 في آخر 7 أيام و$300 في الأيام السبعة السابقة. التغيّر = 900 ÷ 300 − 1 = +200%، فيكون العنوان «الاستخدام يتسارع: 3.0× ما كان عليه في الأسبوع السابق». وتكون الخطورة «مرتفع» لأن التغيّر فوق +100%.',
  'Usage falling': 'انخفاض الاستخدام',
  'Appears when the usage of the last 7 days is at least 40% below the 7 days before.':
    'تظهر عندما ينخفض استخدام آخر 7 أيام بنسبة 40% على الأقل عن الأيام السبعة السابقة.',
  'It uses the same change, the same minimum period of 14 days and the same weight rule as Usage accelerating.':
    'وتستخدم التغيّر نفسه وأدنى فترة نفسها وهي 14 يومًا وقاعدة الوزن نفسها المستخدمة في «تسارع الاستخدام».',
  'It appears when the change is −40% or lower. The title shows the drop as a percent.':
    'تظهر عندما يبلغ التغيّر −40% أو أقل. ويعرض العنوان الانخفاض بنسبة مئوية.',
  'The evidence shows both amounts.': 'تعرض الأدلة المبلغين.',
  'Severity is Info and the recommendation is meant for management. It asks you to check that budgets are not blocking people.':
    'الخطورة «معلومة» والتوصية موجهة إلى الإدارة. وهي تطلب منك التحقق من أن الميزانيات لا تمنع الأشخاص.',
  'The report cannot tell why usage fell. A holiday, a freeze, a project that ended and a budget limit that blocks users all look the same.':
    'لا يستطيع التقرير تحديد سبب انخفاض الاستخدام. فالعطلة والتجميد وانتهاء مشروع وحد ميزانية يمنع المستخدمين تبدو كلها متشابهة.',
  'Info never needs action by itself.': 'ولا يتطلب مستوى «معلومة» أي إجراء بحد ذاته.',
  'The last 7 days used $300 and the 7 days before used $900. Change = 300 ÷ 900 − 1 = −67%, so the title reads "Usage dropped 67% week over week".':
    'استُخدم $300 في آخر 7 أيام و$900 في الأيام السبعة السابقة. التغيّر = 300 ÷ 900 − 1 = −67%، فيكون العنوان «انخفض الاستخدام بنسبة 67% مقارنة بالأسبوع السابق».',
  'Days with unusually high usage': 'أيام باستخدام مرتفع على غير المعتاد',
  'Appears when some days had far more usage than a typical day. It shows the biggest ones with the user and the model that had the most usage on each.':
    'تظهر عندما كان لبعض الأيام استخدام يفوق اليوم المعتاد بكثير. وتعرض أكبرها مع المستخدم والنموذج الأكثر استخدامًا في كل منها.',

  // Rules: unusual days, teams lending and drawing credits, well-used pool, missing columns
  'Multiple of a typical day = usage of the day ÷ usage of the typical day':
    'مضاعف اليوم المعتاد = استخدام اليوم ÷ استخدام اليوم المعتاد',
  'The days are the ones listed under Unusual days. At least 10 days with usage are needed, and a day is unusual when its usage is at least 1.5 times the typical day and its z-score is at least 3.5.':
    'الأيام هي تلك المدرجة تحت «الأيام غير المعتادة». ويلزم 10 أيام على الأقل فيها استخدام، ويكون اليوم غير معتاد عندما يبلغ استخدامه 1.5 ضعف اليوم المعتاد على الأقل وتبلغ درجته المعيارية z ما لا يقل عن 3.5.',
  'The title counts the unusual days. The summary names the biggest one and how many times a typical day it reached.':
    'يعدّ العنوان الأيام غير المعتادة. ويذكر الملخص أكبرها وكم ضعفًا من اليوم المعتاد بلغ.',
  'The evidence lists up to 4 days, the biggest first. Each line shows the date, the usage, the multiple of a typical day, the user with the most usage that day and the model with the most usage that day.':
    'تسرد الأدلة حتى 4 أيام، الأكبر أولًا. ويعرض كل سطر التاريخ والاستخدام ومضاعف اليوم المعتاد والمستخدم الأكثر استخدامًا في ذلك اليوم والنموذج الأكثر استخدامًا فيه.',
  'Severity is Medium when the biggest day holds 10% or more of the usage of the period, and Low otherwise.':
    'تكون الخطورة «متوسط» عندما يضم أكبر الأيام 10% أو أكثر من استخدام الفترة، و«منخفض» فيما عدا ذلك.',
  'The button opens the Patterns page with the date range set to the biggest day.':
    'يفتح الزر صفحة «أنماط الاستخدام» مع ضبط نطاق التاريخ على أكبر الأيام.',
  'An unusual day is not a problem by itself. The report shows who and which model drove it, not why.':
    'اليوم غير المعتاد ليس مشكلة في حد ذاته. ويعرض التقرير من تسبب فيه وأي نموذج، لا لماذا.',
  'The typical day is $100. One day reached $2,400, which is 24× the typical day, and holds 12% of the $20,000 of the period. The summary reads "The biggest, Sep 3, 2025, reached 24× a typical day." and severity is Medium.':
    'اليوم المعتاد $100. وبلغ يوم واحد $2,400، أي 24× اليوم المعتاد، ويضم 12% من $20,000 هي استخدام الفترة. ويكون الملخص «أكبرها في 3 سبتمبر 2025، وبلغ 24× اليوم المعتاد.» وتكون الخطورة «متوسط».',
  'Teams lending and drawing credits': 'فرق تقرض الأرصدة وفرق تسحب منها',
  'Appears when some organizations or cost centers use far more than the credits their own seats include, or far less. The shared pool hides the difference.':
    'تظهر عندما تستخدم بعض المؤسسات أو مراكز التكلفة أكثر بكثير من الأرصدة التي تشملها تراخيصها، أو أقل بكثير. ويخفي الرصيد المشترك هذا الفرق.',
  'Use of licensed credits = usage of the group ÷ value of the included credits of the seats of its users':
    'استخدام الأرصدة المرخَّصة = استخدام المجموعة ÷ قيمة الأرصدة المشمولة في تراخيص مستخدميها',
  'Organizations and cost centers are checked separately. Each needs at least 2 named groups. A user counts in the organization or cost center named on their rows, and in the first one when there are several. Users with none are left out.':
    'تُفحص المؤسسات ومراكز التكلفة كل على حدة. ويحتاج كل منها إلى مجموعتين مسمّاتين على الأقل. ويُحسب المستخدم في المؤسسة أو مركز التكلفة المذكور في صفوفه، وفي أولها عند وجود عدة منها. ويُستبعد المستخدمون الذين لا يذكرون أيًّا منهما.',
  'For each group, add up the usage of its users and the allotment of its users. The allotment of a user is the included credits of their seat in dollars, added up over the months in which the user has usage. When the file gives no seat size, the most common seat size of the report is used.':
    'لكل مجموعة، يُجمع استخدام مستخدميها وحصص مستخدميها. وحصة المستخدم هي الأرصدة المشمولة في ترخيصه بالدولار، مجموعةً على الأشهر التي يكون له فيها استخدام. وعندما لا يذكر الملف حجم الترخيص، يُستخدم حجم الترخيص الأكثر شيوعًا في التقرير.',
  'A group is listed as drawing from the pool when it used at least 150% of its allotment, its usage is at least $20 above the allotment and it has at least 2 users. The 3 groups with the most usage above their allotment are shown.':
    'تُدرج المجموعة بوصفها تسحب من الرصيد المشترك عندما تستخدم 150% على الأقل من حصتها، ويزيد استخدامها على الحصة بـ $20 على الأقل، ويكون لها مستخدمان على الأقل. وتُعرض المجموعات الثلاث الأكثر استخدامًا فوق حصتها.',
  'A group is listed as using little when it used less than 25% of its allotment and it has at least 3 users. The 2 groups with the lowest use are shown.':
    'تُدرج المجموعة بوصفها قليلة الاستخدام عندما تستخدم أقل من 25% من حصتها ويكون لها 3 مستخدمين على الأقل. وتُعرض المجموعتان الأقل استخدامًا.',
  'Each line shows the group, its use, its usage against its allotment and, for a group that draws, the amount drawn from the pool: usage − allotment.':
    'يعرض كل سطر المجموعة ونسبة استخدامها واستخدامها مقابل حصتها، وللمجموعة التي تسحب من الرصيد المشترك المبلغ المسحوب منه: الاستخدام − الحصة.',
  'The limits of 150%, $20, 25% and the user counts are fixed. No setting changes them.':
    'الحدود 150% و$20 و25% وأعداد المستخدمين ثابتة. ولا يغيّرها أي إعداد.',
  'A group that draws from the pool costs extra only when the whole pool runs out. Until then it uses credits that other seats did not.':
    'المجموعة التي تسحب من الرصيد المشترك لا تكلّف مبلغًا إضافيًا إلا عندما ينفد الرصيد المشترك كله. وإلى ذلك الحين تستخدم أرصدة لم تستخدمها التراخيص الأخرى.',
  'It does not say why a group uses little or a lot.':
    'ولا تذكر سبب قلة استخدام مجموعة أو كثرته.',
  'Rows without an organization or a cost center are left out of the groups.':
    'تُستبعد الصفوف التي بلا مؤسسة أو مركز تكلفة من المجموعات.',
  'Organization A has 4 users with $19 seats, so its allotment is $76, and it used $190. Use = 190 ÷ 76 = 250% and it draws $114 from the pool, so it is listed. Organization B has 5 users, a $95 allotment and $20 of usage, which is 21.1%, so it is listed as using little.':
    'للمؤسسة A أربعة مستخدمين بتراخيص قيمتها $19 لكل منها، فتكون حصتها $76، واستخدمت $190. نسبة الاستخدام = 190 ÷ 76 = 250% وهي تسحب $114 من الرصيد المشترك، لذلك تُدرج. وللمؤسسة B خمسة مستخدمين وحصة $95 واستخدام $20، أي 21.1%، لذلك تُدرج بوصفها قليلة الاستخدام.',
  'Pool well used and fully covered': 'رصيد مشترك مستخدم جيدًا ومغطى بالكامل',
  'The all-clear. It appears when the included credits are well used, no overage was billed and no other recommendation is Critical or High.':
    'إشارة الاطمئنان. تظهر عندما تُستخدم الأرصدة المشمولة جيدًا، ولا يُدفع أي مبلغ إضافي، ولا توجد توصية أخرى «حرج» أو «مرتفع».',
  'It needs the pool size of every month, so it does not appear in a filtered view or when the pool size is unknown.':
    'تحتاج إلى حجم الرصيد المشترك لكل شهر، لذلك لا تظهر في العرض المصفّى ولا عندما يكون حجم الرصيد المشترك مجهولًا.',
  'Pool use is worked out as described under Included credits barely used. The month in progress uses its projected usage.':
    'يُحسب استخدام الرصيد المشترك كما هو موضح في «الأرصدة المشمولة غير مستخدمة تقريبًا». ويستخدم الشهر الجاري استخدامه المُسقَط.',
  'It appears when pool use is 60% or more, billed overage is $0 for the period, and no recommendation before it is Critical or High.':
    'تظهر عندما يبلغ استخدام الرصيد المشترك 60% أو أكثر، ويكون المدفوع الإضافي $0 في الفترة، ولا توجد قبلها توصية «حرج» أو «مرتفع».',
  'The summary shows pool use. The evidence shows the usage of the period against the included credits of all months added up.':
    'يعرض الملخص استخدام الرصيد المشترك. وتعرض الأدلة استخدام الفترة مقابل مجموع الأرصدة المشمولة في كل الأشهر.',
  'Severity is Good news and the recommendation is meant for management. When the pool is only a lower bound, the card adds a caveat.':
    'الخطورة «خبر جيد» والتوصية موجهة إلى الإدارة. وعندما يكون الرصيد المشترك حدًّا أدنى فقط، تضيف البطاقة تنبيهًا.',
  'When the report has no seat roster and no extra seats are set, the pool counts only the users who appear in the report. The real pool is larger, so the real use is lower than shown.':
    'عندما لا تكون للتقرير قائمة تراخيص ولا تُحدَّد تراخيص إضافية، لا يحتسب الرصيد المشترك إلا المستخدمين الظاهرين في التقرير. والرصيد المشترك الفعلي أكبر، لذلك يكون الاستخدام الفعلي أقل مما يظهر.',
  'It says that nothing needs urgent action. It does not say that the seats are the right ones.':
    'تذكر أنه لا شيء يحتاج إلى إجراء عاجل. ولا تذكر أن التراخيص هي الصحيحة.',
  'It is not shown while any recommendation is Critical or High, even when the pool is well used.':
    'ولا تُعرض ما دامت أي توصية «حرج» أو «مرتفع»، حتى عندما يُستخدم الرصيد المشترك جيدًا.',
  'Three months with a pool of $5,000 each and usage of $4,000, $4,500 and $4,800. Pool use = $13,300 ÷ $15,000 = 89%. Nothing was billed and nothing is High, so the summary reads "Utilization is about 89% with no billed overage."':
    'ثلاثة أشهر بحجم رصيد مشترك $5,000 لكل منها واستخدام $4,000 و$4,500 و$4,800. استخدام الرصيد المشترك = $13,300 ÷ $15,000 = 89%. ولم يُدفع أي مبلغ إضافي ولا توجد توصية «مرتفع»، فيكون الملخص «نسبة الاستخدام نحو 89% دون تجاوز مدفوع.»',
  'Missing columns in the file': 'أعمدة مفقودة في الملف',
  'Appears when the loaded files lack a column that the billing, seat or user figures depend on. It lists what is missing and what that hides.':
    'تظهر عندما تفتقر الملفات المحمّلة إلى عمود تعتمد عليه أرقام الفوترة أو التراخيص أو المستخدمين. وتسرد ما هو مفقود وما يخفيه ذلك.',
  'Issues = the checks that fail among the billing split, the seat sizes and the usernames':
    'المشكلات = الفحوص التي تفشل من بين تقسيم الفوترة وأحجام التراخيص وأسماء المستخدمين',
  'The app runs three checks on the loaded files. The billing split needs a discount_amount or a net_amount column. The seat sizes need total_monthly_quota with values above 0. The usernames need a username column.':
    'يجري التطبيق ثلاثة فحوص على الملفات المحمّلة. فتقسيم الفوترة يحتاج إلى عمود discount_amount أو net_amount. وأحجام التراخيص تحتاج إلى total_monthly_quota بقيم أكبر من 0. وأسماء المستخدمين تحتاج إلى عمود username.',
  'The recommendation appears when at least one check fails. With one failing check the title is the title of that check, for example "The file has no seat sizes". With several it reads "The file is missing columns the analysis relies on".':
    'تظهر التوصية عندما يفشل فحص واحد على الأقل. وعند فشل فحص واحد يكون العنوان هو عنوان ذلك الفحص، مثل «الملف لا يحتوي على أحجام التراخيص». وعند فشل عدة فحوص يكون «الملف ينقصه أعمدة يعتمد عليها التحليل».',
  'The evidence has one line for each failing check: its title and what it hides.':
    'في الأدلة سطر لكل فحص فاشل: عنوانه وما يخفيه.',
  'Severity is Medium, confidence is High and the recommendation is meant for admins.':
    'الخطورة «متوسط» ومستوى الثقة «مرتفع» والتوصية موجهة إلى المشرفين.',
  'Missing model names and missing token columns are listed under How to read these numbers, not here.':
    'تُدرج أسماء النماذج المفقودة وأعمدة الرموز المفقودة تحت «كيف تقرأ هذه الأرقام»، لا هنا.',

  // Rules: missing columns (end) and notes about the files and the period
  'The checks look at what the files contain. They do not check whether the values are right.':
    'تفحص الفحوص ما تحتويه الملفات. ولا تتحقق من صحة القيم.',
  'A seat roster in Settings gives a better pool size when the file has no seat sizes.':
    'تعطي قائمة التراخيص في الإعدادات حجمًا أفضل للرصيد المشترك عندما لا يحتوي الملف على أحجام التراخيص.',
  'The Data page lists every column and what it enables.':
    'تسرد صفحة «البيانات» كل عمود وما يتيحه.',
  'A file has only the columns date, username and gross_amount. It has no discount_amount or net_amount and no total_monthly_quota. Two checks fail, so the title reads "The file is missing columns the analysis relies on" and the evidence has two lines.':
    'ملف فيه الأعمدة date وusername وgross_amount فقط. ليس فيه discount_amount ولا net_amount ولا total_monthly_quota. يفشل فحصان، فيكون العنوان «الملف ينقصه أعمدة يعتمد عليها التحليل» وفي الأدلة سطران.',
  'Notes about the files and the period behind the other recommendations. The card is always shown, and each line appears only when it applies.':
    'ملاحظات عن الملفات والفترة التي تقف وراء التوصيات الأخرى. تُعرض البطاقة دائمًا، ولا يظهر كل سطر إلا عندما ينطبق.',
  'Notes = the checks that apply to the loaded files and to the selected period':
    'الملاحظات = الفحوص التي تنطبق على الملفات المحمّلة وعلى الفترة المحددة',
  'Pool: when the covered credits are above what the seats in the file can fund, or the pool size cannot be told, a note says that pool size, utilization and seat recommendations are not shown. When the pool counts only the users who appear in the report, a note says so and points to the seat roster in Settings. Neither note appears in a filtered view.':
    'الرصيد المشترك: عندما تزيد الأرصدة المغطاة على ما تستطيع التراخيص في الملف تمويله، أو يتعذر تحديد حجم الرصيد المشترك، تذكر ملاحظة أن حجم الرصيد المشترك ونسبة استخدامه وتوصيات التراخيص غير معروضة. وعندما لا يحتسب الرصيد المشترك إلا المستخدمين الظاهرين في التقرير، تذكر ملاحظة ذلك وتشير إلى قائمة التراخيص في الإعدادات. ولا تظهر أي من الملاحظتين في العرض المصفّى.',
  'Days: when the period has fewer than 14 days, a note says that projections and trends are indicative.':
    'الأيام: عندما تقل الفترة عن 14 يومًا، تذكر ملاحظة أن التوقعات والاتجاهات استرشادية.',
  'Pricing: with token counts in the file, usage that has no price card estimate is split in two. One part is on models that are not in the built-in price card. The other is on lines without token counts or a model name. Each part is listed when it is above $0.005, and what-if savings exclude both.':
    'الأسعار: عند وجود أعداد الرموز في الملف، ينقسم الاستخدام الذي لا يملك تقديرًا من قائمة الأسعار إلى جزأين. جزء على نماذج غير موجودة في قائمة الأسعار المدمجة. والجزء الآخر على أسطر بلا أعداد رموز أو اسم نموذج. ويُدرج كل جزء عندما يزيد على $0.005، وتستثنيهما وفورات «ماذا لو».',
  'Columns: every failing check of the file columns is listed with its detail, which includes the ones about model names and token counts.':
    'الأعمدة: يُدرج كل فحص فاشل لأعمدة الملف مع تفاصيله، وتشمل الفحوص الخاصة بأسماء النماذج وأعداد الرموز.',
  'Scope: a note says that the report covers AI-credit usage only, so code completions and next edit suggestions are not included. It is always there.':
    'النطاق: تذكر ملاحظة أن التقرير يغطي استخدام أرصدة الذكاء الاصطناعي فقط، فلا تُشمل إكمالات الكود واقتراحات التعديل التالي. وهي موجودة دائمًا.',
  'Quality: the number of duplicate rows dropped while merging files, and the number of rows or cells that failed validation, when above 0.':
    'الجودة: عدد الصفوف المكررة التي أُسقطت أثناء دمج الملفات، وعدد الصفوف أو الخلايا التي فشل التحقق منها، عندما يزيد أي منهما على 0.',
  'Severity is Info and confidence is High. The card has no actions and is meant for admins.':
    'الخطورة «معلومة» ومستوى الثقة «مرتفع». ولا إجراءات في البطاقة وهي موجهة إلى المشرفين.',
  'The notes describe the files and the period, not your teams.':
    'تصف الملاحظات الملفات والفترة، لا فرقك.',
  'The card has no figure of its own.': 'وليس للبطاقة رقم خاص بها.',
  'The Data page shows the checks in full.': 'تعرض صفحة «البيانات» الفحوص كاملة.',
  'A report of 9 days has $120 of usage on a model that is not in the price card. The notes read "Only 9 days of data: projections and trends are indicative.", "$120 is on models that are not in the built-in price card. What-if savings exclude them; add overrides in Settings." and the line about AI-credit usage only.':
    'تقرير مدته 9 أيام فيه $120 من الاستخدام على نموذج غير موجود في قائمة الأسعار. وتكون الملاحظات «9 أيام فقط من البيانات: التوقعات والاتجاهات استرشادية.» و«$120 على نماذج غير موجودة في قائمة الأسعار المدمجة. تستثنيها وفورات "ماذا لو"؛ أضف تعديلات الأسعار في الإعدادات.» والسطر الخاص باستخدام أرصدة الذكاء الاصطناعي فقط.',

  // Recommendations that need the GitHub data file: a budget that only sends alerts
  'A budget that only sends alerts': 'ميزانية ترسل تنبيهات فقط',
  'Appears when the GitHub data file shows that the AI credit budget of the enterprise or organization does not stop usage, and that budget is used up, nearly used up or on track to run out. GitHub then keeps billing after the limit.':
    'تظهر عندما يبيّن ملف بيانات GitHub أن ميزانية أرصدة الذكاء الاصطناعي لـ Enterprise أو المؤسسة لا توقف الاستخدام، وأن هذه الميزانية نفدت أو كادت تنفد أو في طريقها إلى النفاد. عندها يواصل GitHub الفوترة بعد الحد.',
  'Share used = amount used ÷ budget, as GitHub showed it on the day the data was collected': 'الحصة المستخدمة = المبلغ المستخدم ÷ الميزانية، كما أظهرها GitHub يوم جمع البيانات',
  'It needs a GitHub data file from the collector scripts and the whole-organization view. The budget is the AI credit budget of the same enterprise, or of the one organization in an organization file. When several apply, the smallest one is used.':
    'تحتاج إلى ملف بيانات GitHub من سكربتات جمع البيانات وإلى عرض المؤسسة كاملة. والميزانية هي ميزانية أرصدة الذكاء الاصطناعي لـ Enterprise نفسها، أو للمؤسسة الوحيدة في ملف المؤسسة. وإذا انطبقت عدة ميزانيات، تُستخدم أصغرها.',
  'It reads the amount used from GitHub on the day the data was collected. When the Monthly budget of the analysis has the same amount, it also uses the latest month of the report: the share used so far, the projected share and the day the budget runs out.':
    'تقرأ المبلغ المستخدم من GitHub يوم جمع البيانات. وعندما تكون للميزانية الشهرية في التحليل القيمة نفسها، تستخدم أيضًا آخر شهر في التقرير: الحصة المستخدمة حتى الآن، والحصة المتوقعة، واليوم الذي تنفد فيه الميزانية.',
  'It appears when the budget does not stop usage and the budget is at least 80% used, at GitHub or in the report, or the report projects that it runs out.':
    'تظهر عندما لا توقف الميزانية الاستخدام ويكون 80% منها على الأقل مستخدمًا، في GitHub أو في التقرير، أو عندما يتوقع التقرير نفادها.',
  'Severity is High when the budget is used up or projected to run out, and Medium when it is only 80% used or more.':
    'تكون الخطورة «مرتفع» عندما تنفد الميزانية أو يُتوقع نفادها، و«متوسط» عندما يكون المستخدم منها 80% أو أكثر فقط.',
  'The evidence says whether budget alerts are on. Confidence is High.': 'تذكر الأدلة هل تنبيهات الميزانية مفعّلة. ومستوى الثقة «مرتفع».',
  'Without the option "Stop usage when budget limit is reached", a budget only sends alerts at 75%, 90% and 100%. GitHub keeps billing after that.':
    'دون الخيار «Stop usage when budget limit is reached» ترسل الميزانية تنبيهات فقط عند 75% و90% و100%. ويواصل GitHub الفوترة بعد ذلك.',
  'The budget counts billed usage only. Included credits are used first and do not count against it.': 'تحتسب الميزانية الاستخدام المدفوع إضافيًا فقط. تُستخدم الأرصدة المشمولة أولًا ولا تُحتسب منها.',
  'The amount used is from the day the data was collected. Usage keeps growing until the end of the month.': 'المبلغ المستخدم هو قيمته يوم جمع البيانات. ويستمر الاستخدام في الزيادة حتى نهاية الشهر.',
  'A budget for all of GitHub Copilot is not used here, because it may cover more than AI credits.': 'لا تُستخدم هنا ميزانية GitHub Copilot كله، لأنها قد تشمل أكثر من أرصدة الذكاء الاصطناعي.',
  'The enterprise has a $500 budget for AI credits that only sends alerts. On October 20 GitHub showed $450 used, which is 90%. The title reads "The $500 budget only sends alerts, so the bill can go past it" and severity is Medium. When the report projects 130% for the month, severity is High.':
    'لدى Enterprise ميزانية قدرها $500 لأرصدة الذكاء الاصطناعي ترسل تنبيهات فقط. في 20 أكتوبر أظهر GitHub استخدام $450، أي 90%. ويكون العنوان «ميزانية $500 ترسل تنبيهات فقط، لذا قد تتجاوزها الفاتورة» والخطورة «متوسط». وعندما يتوقع التقرير 130% للشهر، تكون الخطورة «مرتفع».',

  // A budget that stops usage is running out
  'A budget that stops usage is running out': 'ميزانية توقف الاستخدام توشك على النفاد',
  'Appears when the GitHub data file shows that the AI credit budget of the enterprise or organization stops usage, and that budget is used up or on track to run out. People then cannot use features that cost AI credits until the next billing cycle or until the budget is raised.':
    'تظهر عندما يبيّن ملف بيانات GitHub أن ميزانية أرصدة الذكاء الاصطناعي لـ Enterprise أو المؤسسة توقف الاستخدام، وأن هذه الميزانية نفدت أو في طريقها إلى النفاد. عندها لا يستطيع الناس استخدام الميزات التي تكلّف أرصدة الذكاء الاصطناعي حتى دورة الفوترة التالية أو حتى رفع الميزانية.',
  'It uses the same budget and the same figures as A budget that only sends alerts.': 'تستخدم الميزانية نفسها والأرقام نفسها التي تستخدمها «ميزانية ترسل تنبيهات فقط».',
  'It appears when the budget stops usage and is used up, at GitHub or in the latest month of the report, or the report projects that it runs out.':
    'تظهر عندما توقف الميزانية الاستخدام وتكون قد نفدت، في GitHub أو في آخر شهر من التقرير، أو عندما يتوقع التقرير نفادها.',
  'Severity is High and confidence is High.': 'الخطورة «مرتفع» ومستوى الثقة «مرتفع».',
  'The amount used is from the day the data was collected. The projection comes from the latest month of the report.': 'المبلغ المستخدم هو قيمته يوم جمع البيانات. ويأتي التوقع من آخر شهر في التقرير.',
  'Raising the budget lets people work again right away. Otherwise usage comes back at the start of the next billing cycle.':
    'رفع الميزانية يتيح للناس العمل من جديد على الفور. وإلا فيعود الاستخدام في بداية دورة الفوترة التالية.',
  'The organization has a $200 budget for AI credits that stops usage. On October 25 GitHub showed $200 used. The title reads "Usage that costs AI credits stops when the $200 budget runs out" and severity is High.':
    'لدى المؤسسة ميزانية قدرها $200 لأرصدة الذكاء الاصطناعي توقف الاستخدام. في 25 أكتوبر أظهر GitHub استخدام $200. ويكون العنوان «يتوقف الاستخدام الذي يكلّف أرصدة الذكاء الاصطناعي عند نفاد ميزانية $200» والخطورة «مرتفع».',

  // Users who reached their budget
  'Users who reached their budget': 'مستخدمون بلغوا ميزانيتهم',
  'Appears when the GitHub data file shows people who used up a budget for users. Budgets for users always stop usage, so these people cannot use features that cost AI credits until the next billing cycle or until their budget is raised.':
    'تظهر عندما يبيّن ملف بيانات GitHub أشخاصًا استنفدوا ميزانية للمستخدمين. وميزانيات المستخدمين توقف الاستخدام دائمًا، لذا لا يستطيع هؤلاء استخدام الميزات التي تكلّف أرصدة الذكاء الاصطناعي حتى دورة الفوترة التالية أو حتى رفع ميزانيتهم.',
  'Reached = amount used ≥ budget of the user, as GitHub showed it on the day the data was collected': 'بلغ الميزانية = المبلغ المستخدم ≥ ميزانية المستخدم، كما أظهرها GitHub يوم جمع البيانات',
  'It reads the GitHub Copilot budgets for users in the GitHub data file: budgets for one user, and the amount of each user in a budget that applies to each user.':
    'تقرأ ميزانيات GitHub Copilot للمستخدمين في ملف بيانات GitHub: الميزانيات الخاصة بمستخدم واحد، ومبلغ كل مستخدم في ميزانية تنطبق على كل مستخدم.',
  'A user is listed when the amount used is at least their budget. A user with several budgets is listed once, with the budget that is the most used.':
    'يُدرج المستخدم عندما يبلغ المبلغ المستخدم ميزانيته على الأقل. ويُدرج المستخدم الذي له عدة ميزانيات مرة واحدة، مع الميزانية الأكثر استخدامًا.',
  'In a filtered view only users who are in that view are listed.': 'في العرض المصفّى يُدرج فقط المستخدمون الموجودون في ذلك العرض.',
  'The evidence shows up to 5 users, the most used first. The card names up to 12 users who are in the report, and the count includes all of them.':
    'تعرض الأدلة 5 مستخدمين على الأكثر، بدءًا بالأكثر استخدامًا. وتذكر البطاقة 12 مستخدمًا على الأكثر من الموجودين في التقرير، ويشمل العدد جميعهم.',
  'Severity is Medium and confidence is High.': 'الخطورة «متوسط» ومستوى الثقة «مرتفع».',
  'The amounts are from the day the data was collected. Budgets start again at the start of each billing cycle.': 'المبالغ هي قيمها يوم جمع البيانات. وتبدأ الميزانيات من جديد في بداية كل دورة فوترة.',
  'Budgets for users count all usage of AI credits, including usage covered by included credits.': 'تحتسب ميزانيات المستخدمين كل استخدام لأرصدة الذكاء الاصطناعي، بما فيه الاستخدام المغطى من الأرصدة المشمولة.',
  'People who have no row in the usage report are counted but cannot be opened on the Users page.': 'يُحتسب الأشخاص الذين ليس لهم صف في تقرير الاستخدام، لكن لا يمكن فتحهم في صفحة المستخدمين.',
  'A budget of $20 applies to each user. On October 20 GitHub showed that one person used $21 and another used $20. The title reads "2 users reached their budget and cannot use AI credits".':
    'تنطبق ميزانية قدرها $20 على كل مستخدم. في 20 أكتوبر أظهر GitHub أن شخصًا استخدم $21 وآخر استخدم $20. ويكون العنوان «مستخدمان بلغا ميزانيتهما ولا يمكنهما استخدام أرصدة الذكاء الاصطناعي».',

  // Usage report and GitHub billing do not match
  'Usage report and GitHub billing do not match': 'تقرير الاستخدام وفوترة GitHub غير متطابقين',
  'Appears when a full month of the usage report has a different usage or billed amount than the AI credit billing of GitHub in the GitHub data file. Figures from the report may then be off.':
    'تظهر عندما يختلف الاستخدام أو المبلغ المدفوع إضافيًا في شهر كامل من تقرير الاستخدام عن فوترة GitHub لأرصدة الذكاء الاصطناعي في ملف بيانات GitHub. عندها قد تكون أرقام التقرير غير دقيقة.',
  'Gap = amount at GitHub − amount in the report, for each full month': 'الفرق = المبلغ في GitHub − المبلغ في التقرير، لكل شهر كامل',
  'The AI credit billing of a month is the AI credit usage report of GitHub billing, or else the AI credit lines of the billing usage summary.':
    'فوترة أرصدة الذكاء الاصطناعي في شهر ما هي تقرير استخدام أرصدة الذكاء الاصطناعي في فوترة GitHub، وإلا فبنود أرصدة الذكاء الاصطناعي في ملخص استخدام الفوترة.',
  'An organization file is compared with the report rows of its organizations only. If none match, it is not compared with every row. An enterprise file is compared with every row.':
    'يُقارن ملف المؤسسة بصفوف التقرير الخاصة بمؤسساته فقط. وإذا لم تطابق أي مؤسسة، فلا يُقارن بكل الصفوف. ويُقارن ملف Enterprise بكل الصفوف.',
  'Months that were not over when the data was collected, months the report covers only in part and months the report does not cover are left out. A report may miss up to 3 days at the start or end of a month and still count as covering it.':
    'تُستبعد الأشهر التي لم تنتهِ عند جمع البيانات، والأشهر التي يغطيها التقرير جزئيًا فقط، والأشهر التي لا يغطيها التقرير. ويمكن أن تنقص التقرير 3 أيام على الأكثر في بداية الشهر أو نهايته ويُعد مع ذلك مغطيًا له.',
  'Usage is compared first, then the billed amount. Amounts within 2%, or within $1, count as the same.': 'يُقارن الاستخدام أولًا، ثم المبلغ المدفوع إضافيًا. وتُعد المبالغ التي لا يتجاوز فرقها 2%، أو $1، متساوية.',
  'Each month that differs gets an evidence line. Severity is Medium when the report has less than GitHub in any month, and Low when it only has more.':
    'لكل شهر مختلف سطر في الأدلة. وتكون الخطورة «متوسط» عندما يكون في التقرير أقل مما في GitHub في أي شهر، و«منخفض» عندما يكون فيه أكثر فقط.',
  'A report with less than GitHub often misses files or days. A report with more often covers more organizations than the GitHub data file.':
    'التقرير الذي فيه أقل مما في GitHub تنقصه غالبًا ملفات أو أيام. والتقرير الذي فيه أكثر يغطي غالبًا مؤسسات أكثر من ملف بيانات GitHub.',
  'GitHub billing is what you pay.': 'فوترة GitHub هي ما تدفعه.',
  'The Data page shows the check of every month.': 'تعرض صفحة البيانات نتيجة المقارنة لكل شهر.',
  'For September the report shows $9,000 of usage and GitHub billing shows $10,000. The gap of $1,000 is more than 2%, so the report has less and severity is Medium.':
    'في سبتمبر يُظهر التقرير استخدامًا قدره $9,000 وتُظهر فوترة GitHub مبلغ $10,000. والفرق البالغ $1,000 أكبر من 2%، فيكون في التقرير أقل والخطورة «متوسط».',

  // Seats for every member
  'Seats for every member': 'تراخيص لكل الأعضاء',
  'Appears when the GitHub data file shows organizations that give a GitHub Copilot seat to all members, and some of those seats had no activity in this billing cycle.':
    'تظهر عندما يبيّن ملف بيانات GitHub مؤسسات تمنح ترخيص GitHub Copilot لكل الأعضاء، وبعض هذه التراخيص بلا أي نشاط في دورة الفوترة هذه.',
  'Inactive seats = seats with no GitHub Copilot activity in this billing cycle, as GitHub counts them': 'التراخيص غير النشطة = التراخيص التي لا نشاط لها في GitHub Copilot خلال دورة الفوترة هذه، كما يعدّها GitHub',
  'It reads the seat summary of each organization in the GitHub data file: how seats are given, all seats and the seats with no activity in this billing cycle.':
    'تقرأ ملخص التراخيص لكل مؤسسة في ملف بيانات GitHub: طريقة منح التراخيص، وكل التراخيص، والتراخيص التي لا نشاط لها في دورة الفوترة هذه.',
  'An organization is listed when it gives seats to all members and has at least one inactive seat.': 'تُدرج المؤسسة عندما تمنح التراخيص لكل الأعضاء ويكون لديها ترخيص واحد غير نشط على الأقل.',
  'It needs data collected on day 15 of the month or later, because early in the billing cycle many seats have no activity yet.':
    'تحتاج إلى بيانات جُمعت في اليوم 15 من الشهر أو بعده، لأن كثيرًا من التراخيص لا يكون لها نشاط بعد في أول دورة الفوترة.',
  'Severity is Medium when at least 5 seats, and at least 20% of the seats of those organizations, are inactive. Otherwise it is Low.':
    'تكون الخطورة «متوسط» عندما تكون 5 تراخيص على الأقل، و20% على الأقل من تراخيص تلك المؤسسات، غير نشطة. وإلا فتكون «منخفض».',
  'It has no saving of its own, because it overlaps with idle seats.': 'ليس لها توفير خاص بها، لأنها تتداخل مع التراخيص الخاملة.',
  'GitHub counts any activity, including code completions, which are not in the usage report.': 'يحتسب GitHub أي نشاط، بما فيه إكمال الكود، وهو غير موجود في تقرير الاستخدام.',
  'The billing cycle is taken to start on the 1st of the month.': 'يُفترض أن دورة الفوترة تبدأ في اليوم الأول من الشهر.',
  'Billing starts when a seat is given, not at first use.': 'تبدأ الفوترة عند منح الترخيص، لا عند أول استخدام.',
  'On October 20 an organization gives seats to all 40 members, and 10 of those seats had no activity in this billing cycle. That is 25% and at least 5 seats, so severity is Medium.':
    'في 20 أكتوبر تمنح مؤسسة تراخيص لكل أعضائها الأربعين، و10 من هذه التراخيص بلا أي نشاط في دورة الفوترة هذه. وهذا 25% و5 تراخيص على الأقل، فتكون الخطورة «متوسط».',
};

export default arabic;
