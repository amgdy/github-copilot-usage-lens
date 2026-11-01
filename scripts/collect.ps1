#Requires -Version 5.1
<#
.SYNOPSIS
GitHub Copilot Usage Lens: data collector for Windows, macOS and Linux.

.DESCRIPTION
The AI usage report shows who used which model and what it cost. It does not show your seats and seat types, seat
changes, budgets, cost centers, members, or the activity that is not billed, such as code completions. This script
reads that data from GitHub with the GitHub CLI (gh) and saves it in one file. For an enterprise, the file holds the
AI usage report too, so you drop only this file on GitHub Copilot Usage Lens.

It reads and changes no settings on GitHub. When there is no recent AI usage report, it asks GitHub to make one, as
the billing page does. The file stays on this computer.

Needs Windows PowerShell 5.1 or PowerShell 7, and the GitHub CLI (https://cli.github.com).
scripts/collect.sh does the same with bash. Both scripts write the same file format.
Run with -Help to see every option.

.EXAMPLE
powershell -ExecutionPolicy Bypass -File scripts\collect.ps1

Asks what to collect. Use this in Windows PowerShell.

.EXAMPLE
powershell -ExecutionPolicy Bypass -Command "& ([scriptblock]::Create((irm https://raw.githubusercontent.com/amgdy/github-copilot-usage-lens/main/scripts/collect.ps1))) -Enterprise octocorp"

Runs the script straight from GitHub, with no download, and collects the enterprise octocorp.

.EXAMPLE
pwsh -File scripts/collect.ps1 -Enterprise octocorp

Collects the enterprise octocorp with PowerShell 7 on Windows, macOS or Linux.

.EXAMPLE
pwsh -File scripts/collect.ps1 -Org octo-org,octo-labs -Months 6 -Yes

Collects two organizations and six months of billing data, and asks nothing.
#>
[CmdletBinding(PositionalBinding = $false)]
param(
  [Alias('e')][string]$Enterprise = '',
  [Alias('o', 'Organization')][string[]]$Org = @(),
  [Alias('m')][string]$Months = '',
  [switch]$DailyMetrics,
  [switch]$Teams,
  [string]$Hostname = '',
  [string]$Output = '',
  [switch]$Plain,
  [string[]]$Skip = @(),
  [string[]]$Only = @(),
  [switch]$ListSources,
  [Alias('y')][switch]$Yes,
  [Alias('h')][switch]$Help,
  [switch]$Version,
  [Parameter(ValueFromRemainingArguments = $true, DontShow = $true)][string[]]$RemainingArguments = @()
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
Set-StrictMode -Version 2.0

# Which options were typed. -Teams and -DailyMetrics have three states: given, given as $false, or not given (ask).
$script:BoundNames = @($PSBoundParameters.Keys)
# The values of the options. The functions read them here: when the script runs straight from GitHub as a script
# block, the parameters are not in the script scope.
$script:OptionValues = @{
  Enterprise = $Enterprise; Org = $Org; Months = $Months; DailyMetrics = $DailyMetrics; Teams = $Teams
  Hostname = $Hostname; Output = $Output; Plain = $Plain; Skip = $Skip; Only = $Only; ListSources = $ListSources
  Yes = $Yes; Help = $Help; Version = $Version; RemainingArguments = $RemainingArguments
}

$script:CollectorVersion = '1.0.0'
$script:FormatName = 'github-copilot-usage-lens-data'
$script:FormatVersion = 1
$script:ApiVersionName = '2026-03-10'
$script:MinGhMajor = 2
$script:MinGhMinor = 40
# The usage metrics reports start on this day and keep one year of history.
$script:MetricsFirstDay = '2025-10-10'
$script:MaxMonths = 24
$script:MaxPages = 200
# Lines of the AI usage report in each record of the file.
$script:ReportChunkLines = 1000
$script:AllSources = @('usage-report', 'organizations', 'seats', 'seat-summary', 'members', 'teams', 'budgets',
  'cost-centers', 'ai-credit-usage', 'usage-summary', 'billing-usage', 'user-metrics', 'scope-metrics', 'user-teams',
  'audit-log')
$script:Invariant = [Globalization.CultureInfo]::InvariantCulture
$script:Utf8 = New-Object System.Text.UTF8Encoding($false)
$script:SpaceAndTab = [char[]]@(32, 9)
$script:OnWindows = [Environment]::OSVersion.Platform -eq [PlatformID]::Win32NT
$script:HasArgumentList = $null -ne [System.Diagnostics.ProcessStartInfo].GetProperty('ArgumentList')
$script:LensVariables = @('LENS_SCOPE', 'LENS_TARGET', 'LENS_MONTH', 'LENS_PARENT')

# Options after they are read and checked.
$script:EnterpriseSlug = ''
$script:OrganizationNames = New-Object 'System.Collections.Generic.List[string]'
$script:MonthText = ''
$script:MonthCount = 0
$script:GitHubHost = 'github.com'
$script:HostGiven = $false
$script:OutputPath = ''
$script:OutputFullPath = ''
$script:SkipSources = New-Object 'System.Collections.Generic.List[string]'
$script:OnlySources = New-Object 'System.Collections.Generic.List[string]'
$script:WithTeams = ''
$script:ReadDailyMetrics = ''
$script:PlainText = $false
$script:AssumeYes = $false
$script:ShowHelp = $false
$script:ShowSources = $false
$script:ShowVersion = $false
$script:Interactive = $false
$script:UseColor = $false
$script:RetrySeconds = 5
# How long to wait for GitHub to make the AI usage reports, and how often to ask. GitHub needs about three minutes.
$script:ReportWaitSeconds = 900
$script:ReportPollSeconds = 20

# What the run finds out and collects.
$script:WorkDir = ''
$script:RecordsPath = ''
$script:RecordsWriter = $null
$script:GhPath = ''
$script:CurlPath = ''
$script:ChmodPath = ''
$script:GhVersion = ''
$script:VersionArguments = @()
$script:UsedApiVersion = ''
$script:TokenScopes = @()
$script:ScopesKnown = $false
$script:Login = ''
$script:LastHttp = 0
$script:LastError = ''
$script:GhLines = New-Object 'System.Collections.Generic.List[string]'
$script:GhErrorText = ''
$script:OutLines = New-Object 'System.Collections.Generic.List[string]'
$script:ControlLines = New-Object 'System.Collections.Generic.List[string]'
$script:RecordsTotal = 0
$script:UsageReportRecords = 0
$script:UsageReportMonths = 0
$script:UsageReports = New-Object 'System.Collections.Generic.List[object]'
$script:UsageLater = New-Object 'System.Collections.Generic.List[string]'
$script:ReportRequestedAt = 0
$script:ContextScope = ''
$script:ContextTarget = ''
$script:ContextMonth = ''
$script:ContextParent = ''
$script:LatestReportDay = ''
$script:ReportFirstDay = ''
$script:ReportLastDay = ''
$script:MonthKeys = @()
$script:WindowStart = ''
$script:Today = ''
$script:TodayDate = [DateTime]::MinValue
$script:StartedAt = ''
$script:SelectedSources = @()
$script:StatusRows = New-Object 'System.Collections.Generic.List[object]'
$script:SourceLines = New-Object 'System.Collections.Generic.List[string]'
$script:StepRecords = 0
$script:StepOk = 0
$script:StepPartial = 0
$script:StepFailed = 0
$script:StepSkipped = 0
$script:StepHttp = 0
$script:StepError = ''
$script:StepNote = ''
# The step line moves while a step works, but only in a terminal (see the end of the script).
$script:ShowProgress = $false
$script:ProgressRoom = 0
$script:ProgressFrame = 0
$script:ProgressNote = ''
$script:StepActive = $false
$script:StepLabel = ''
$script:StepTotal = 0
$script:WatchRecords = 0
$script:PendingRecords = 0
$script:DownloadPath = ''
$script:SpinnerFrames = '|/-\'
$script:DownloadError = ''
$script:HttpClient = $null
$script:FoundEnterprises = @()
$script:FoundOrganizations = @()

# ---------------------------------------------------------------------------------------------------------------------
# What to keep from each source. The same jq filters as scripts/collect.sh, so both scripts write the same records.
# Seats and audit events keep only the fields the app needs: no names, emails or avatars.

# jq helper used by every filter: wraps a record with its kind and where it came from.
$script:JqWrap = @'
def wrap(kind): {kind: kind, scope: env.LENS_SCOPE, target: env.LENS_TARGET, record: .}
  + (if (env.LENS_MONTH // "") == "" then {} else {month: env.LENS_MONTH} end)
  + (if (env.LENS_PARENT // "") == "" then {} else {parent: env.LENS_PARENT} end);
'@

$script:SeatFilter = @'
((.seats // [])[] | {
    assignee: (.assignee | if type == "object" then ({login, type, slug} | with_entries(select(.value != null))) else null end),
    organization: (.organization | if type == "object" then {login} else null end),
    assigning_team: (.assigning_team | if type == "object" then {slug, name} else null end),
    plan_type, created_at, updated_at, pending_cancellation_date, last_activity_at, last_activity_editor,
    last_authenticated_at
  } | wrap("seat")), "#total \(.total_seats // "")"
'@

$script:SeatSummaryFilter = 'wrap("seat-summary")'

$script:OrganizationsQuery = @'
query($slug: String!, $endCursor: String) {
  enterprise(slug: $slug) {
    organizations(first: 100, after: $endCursor) {
      pageInfo { hasNextPage endCursor }
      nodes { login name }
    }
  }
}
'@
$script:OrganizationsFilter = '(.data.enterprise.organizations.nodes // [])[] | ({login, name} | wrap("organization")), "#org \(.login)"'

$script:EnterpriseMembersQuery = @'
query($slug: String!, $endCursor: String) {
  enterprise(slug: $slug) {
    members(first: 100, after: $endCursor) {
      pageInfo { hasNextPage endCursor }
      nodes {
        __typename
        ... on EnterpriseUserAccount { login user { login } }
        ... on User { login }
      }
    }
  }
}
'@
$script:EnterpriseMembersFilter = @'
(.data.enterprise.members.nodes // [])[] | {login: (.user.login // .login), type: .__typename}
  | select(.login != null) | wrap("member")
'@

$script:OrganizationMembersFilter = '.[] | {login, type} | wrap("member")'

$script:BudgetFilter = @'
((.budgets // [])[] | . as $budget | del(.budget_alerting) + {
      budget_alerting: {
        will_alert: ($budget.budget_alerting.will_alert // false),
        recipients: (($budget.budget_alerting.alert_recipients // []) | length)
      }
    } | wrap("budget")),
  ((.budgets // [])[] | select((.budget_scope // "") | startswith("multi_user")) | "#users \(.id)"),
  (if .has_next_page == true then "#more" else empty end)
'@

$script:BudgetUsersFilter = '((.user_states // [])[] | wrap("budget-user")), (if .has_next_page == true then "#more" else empty end)'

$script:CostCenterFilter = '(.costCenters // .cost_centers // [])[] | del(.azure_subscription) | wrap("cost-center")'

$script:AiCreditFilter = '(.usageItems // [])[] | wrap("ai-credit-usage")'

$script:UsageSummaryFilter = @'
(.usageItems // [])[]
  | select(((.product // "") + " " + (.sku // "")) | test("copilot|ai.?credit"; "i")) | wrap("usage-summary")
'@

$script:BillingUsageFilter = @'
(.usageItems // [])[]
  | select(((.product // "") + " " + (.sku // "")) | test("copilot|ai.?credit"; "i")) | wrap("billing-usage")
'@

$script:AuditFilter = @'
.[] | ((if (.data | type) == "object" then .data else {} end) + .) | {
    action, "@timestamp": .["@timestamp"], created_at, actor, actor_is_agent, user, org, business, team,
    operation_type, owner, owner_type, plan, old_plan, seat_assignment, reason, old_value, new_value, previous_value,
    target_login, target_amount, target_type, budget_limit_type, pricing_target_type, status
  } | with_entries(select(.value != null)) | wrap("audit-event")
'@

$script:TeamsFilter = '.[] | ({slug, name} | wrap("team")), "#team \(.slug)"'

# One line per AI usage report on the billing page: id, first day, last day, status and when GitHub made it.
$script:ReportListFilter = @'
(.usage_report_exports // [])[] | select(.report_type == "ai_credit")
  | "#report \(.id)\t\((.start_date // "")[0:10])\t\((.end_date // "")[0:10])\t\(.status // "")\t\(.created_at // "")"
'@

$script:ReportStatusFilter = '"#status \(.status // "")", ((.download_urls // [])[])'

$script:TeamMembersFilter = '.[] | {login: (.login // .user.login)} | select(.login != null) | wrap("team-member")'

# The links and days of a usage metrics report. On a day without data GitHub sends an empty text, not a report.
$script:ReportFilter = @'
if type == "object" then (.download_links // [])[],
    "#first \(.report_start_day // .report_day // "")", "#last \(.report_end_day // .report_day // "")"
  else "#none" end
'@

$script:AccountsQuery = @'
query { viewer {
      admin: enterprises(first: 100, membershipType: ADMIN) { nodes { slug } }
      billing: enterprises(first: 100, membershipType: BILLING_MANAGER) { nodes { slug } } } }
'@
$script:AccountsFilter = '[(.data.viewer.admin.nodes // [])[].slug, (.data.viewer.billing.nodes // [])[].slug] | unique | .[]'
$script:MembershipsFilter = '.[] | select(.state == "active" and (.role == "admin" or .role == "billing_manager")) | .organization.login'

# A copy of this file with Windows line ends must still send the same filters.
foreach ($filterName in @('JqWrap', 'SeatFilter', 'OrganizationsQuery', 'EnterpriseMembersQuery', 'EnterpriseMembersFilter',
    'BudgetFilter', 'UsageSummaryFilter', 'BillingUsageFilter', 'AuditFilter', 'ReportListFilter', 'AccountsQuery')) {
  $filterVariable = Get-Variable -Name $filterName -Scope Script
  $filterVariable.Value = ([string]$filterVariable.Value).Replace("`r", '')
}

# ---------------------------------------------------------------------------------------------------------------------
# Output. Messages go to the screen with Write-Host, errors go to stderr. Nothing is written to the pipeline.

function Write-Text {
  param([string]$Text, [string]$Color = '')
  if ($script:UseColor -and $Color) { Write-Host $Text -NoNewline -ForegroundColor $Color } else { Write-Host $Text -NoNewline }
}

function Write-Line {
  param([string]$Text = '', [string]$Color = '')
  if ($script:UseColor -and $Color) { Write-Host $Text -ForegroundColor $Color } else { Write-Host $Text }
}

function Stop-WithError {
  param([string]$Message)
  [Console]::Error.WriteLine('Error: ' + $Message)
  exit 1
}

function Show-Help {
  Write-Line @'
GitHub Copilot Usage Lens: data collector

Reads the GitHub data that the AI usage report does not have: GitHub Copilot seats and seat types, seat totals and
policies, members, budgets, cost centers, monthly billing, activity per user (including code completions) and seat
changes from the audit log. For an enterprise, it adds the AI usage report of each month too. Saves it all in one file
for GitHub Copilot Usage Lens. It changes no settings on GitHub. When there is no recent AI usage report, it asks
GitHub to make one, as the billing page does.

Usage:
  powershell -ExecutionPolicy Bypass -File scripts\collect.ps1 [options]     Windows PowerShell 5.1
  pwsh -File scripts/collect.ps1 [options]                                   PowerShell 7 on any system

To run it straight from GitHub, with no download, put the options before the last quote:
  powershell -ExecutionPolicy Bypass -Command "& ([scriptblock]::Create((irm https://raw.githubusercontent.com/amgdy/github-copilot-usage-lens/main/scripts/collect.ps1))) [options]"

-ExecutionPolicy Bypass lets Windows run this one script. It changes no settings.
With no options, the script asks what to collect.

Options:
  -Enterprise SLUG   Collect an enterprise. You must be an enterprise owner or billing manager.
  -Org NAMES         Collect one or more organizations. Separate the names with commas: -Org octo-org,octo-labs
                     With -Enterprise, only these organizations get their own details.
  -Months N          Months of billing data and audit events, counting this month (1 to 24, default 3).
  -DailyMetrics      Collect the activity of every day in those months, not only the last 28 days.
                     Older months are then exact, but it takes longer and the file is larger.
  -Teams             Also collect the members of every team. It sends one request per team.
  -Hostname HOST     Your GitHub host, for example octocorp.ghe.com. The default is github.com.
  -Output FILE       Where to save the file. The default is usage-lens-data-NAME-TIME.ndjson.gz here.
  -Plain             Save plain NDJSON text (.ndjson) instead of a compressed file.
  -Skip LIST         Sources to leave out, separated by commas. See -ListSources.
  -Only LIST         Collect only these sources, separated by commas.
  -ListSources       Show every source and the access it needs, then stop.
  -Yes               Ask nothing. Use the options as given.
  -Help              Show this help.
  -Version           Show the version of this script.

The option names of scripts/collect.sh, such as --enterprise and --daily-metrics, work too.

Examples:
  powershell -ExecutionPolicy Bypass -File scripts\collect.ps1 -Enterprise octocorp
  pwsh -File scripts/collect.ps1 -Org octo-org,octo-labs -Months 6
  pwsh -File scripts/collect.ps1 -Enterprise octocorp -Hostname octocorp.ghe.com -Yes

The file holds GitHub logins and activity. Keep it safe and delete it when you are done.
'@
}

$script:SourceTable = @(
  @('usage-report', 'The AI usage report (CSV) of each month, enterprises only', 'enterprise owner or billing manager (manage_billing:enterprise)'),
  @('organizations', 'Organizations in the enterprise', 'enterprise owner (read:enterprise)'),
  @('seats', 'GitHub Copilot seats: user, plan, start, last activity', 'owner or billing manager (manage_billing:copilot)'),
  @('seat-summary', 'Seat totals and GitHub Copilot policies per organization', 'organization owner (read:org)'),
  @('members', 'Members of each organization', 'organization member (read:org)'),
  @('teams', 'Members of each team, only with -Teams', 'organization member (read:org, read:enterprise)'),
  @('budgets', 'Budgets, their amounts and what is used', 'owner or billing manager (manage_billing:enterprise)'),
  @('cost-centers', 'Cost centers and who is in them', 'enterprise owner or billing manager (manage_billing:enterprise)'),
  @('ai-credit-usage', 'AI credits billed per month, by product, SKU and model', 'owner or billing manager (manage_billing:enterprise)'),
  @('usage-summary', 'Billing summary per month for every product', 'owner or billing manager (manage_billing:enterprise)'),
  @('billing-usage', 'Daily GitHub Copilot charges', 'owner or billing manager (manage_billing:enterprise)'),
  @('user-metrics', 'Activity per user and day, including code completions', 'owner or billing manager (manage_billing:copilot, read:org)'),
  @('scope-metrics', 'Activity totals per day', 'the same as user-metrics'),
  @('user-teams', 'Teams of each GitHub Copilot user', 'the same as user-metrics'),
  @('audit-log', 'Seat, plan, policy and budget changes', 'owner (read:audit_log)')
)

function Show-Sources {
  Write-Line ('Source'.PadRight(18) + 'What it reads'.PadRight(59) + 'Who can read it (token scope)')
  foreach ($row in $script:SourceTable) {
    Write-Line (([string]$row[0]).PadRight(18) + ([string]$row[1]).PadRight(59) + [string]$row[2])
  }
  Write-Line ''
  Write-Line 'For organizations, the billing sources need an organization owner or billing manager. The activity sources need the'
  Write-Line 'usage metrics policy for GitHub Copilot set to "Enabled everywhere".'
  Write-Line ''
  Write-Line 'usage-report uses a report from the last 31 days when it covers the month and GitHub made it after the month ended.'
  Write-Line 'Otherwise it asks GitHub to make one, which takes a few minutes and adds the report to the billing page. For the month'
  Write-Line 'the script runs in, it asks for a new one unless GitHub is still making one. GitHub makes one report at a time, so the'
  Write-Line 'script asks for the next month when the one before is ready. It changes no settings.'
}

# ---------------------------------------------------------------------------------------------------------------------
# Options

function Test-Bound {
  param([string]$Name)
  return ($script:BoundNames -contains $Name)
}

function Assert-Value {
  param([string]$Name, [string]$Value)
  if (-not $Value) { Stop-WithError ($Name + ' needs a value. Run with -Help to see the options.') }
}

# Names can be given with commas, as in -Org octo-org,octo-labs, because -File passes "a,b" as one text.
function Add-OrganizationNames {
  param([string]$Text)
  foreach ($name in ($Text -split '[,\s]+')) {
    if ($name -and -not $script:OrganizationNames.Contains($name)) { $script:OrganizationNames.Add($name) }
  }
}

function Add-SourceNames {
  param($List, [string]$Text)
  foreach ($name in ($Text -split '[,\s]+')) {
    if ($name) { $List.Add($name.ToLowerInvariant()) }
  }
}

function Set-ValueOption {
  param([string]$Target, [string]$Value)
  if ($Target -eq 'enterprise') { $script:EnterpriseSlug = $Value }
  elseif ($Target -eq 'org') { Add-OrganizationNames $Value }
  elseif ($Target -eq 'months') { $script:MonthText = $Value }
  elseif ($Target -eq 'hostname') { $script:GitHubHost = $Value; $script:HostGiven = $true }
  elseif ($Target -eq 'output') { $script:OutputPath = $Value }
  elseif ($Target -eq 'skip') { Add-SourceNames $script:SkipSources $Value }
  else { Add-SourceNames $script:OnlySources $Value }
}

function Set-SwitchOption {
  param([string]$Target)
  if ($Target -eq 'daily') { $script:ReadDailyMetrics = 'yes' }
  elseif ($Target -eq 'teams') { $script:WithTeams = 'yes' }
  elseif ($Target -eq 'plain') { $script:PlainText = $true }
  elseif ($Target -eq 'sources') { $script:ShowSources = $true }
  elseif ($Target -eq 'yes') { $script:AssumeYes = $true }
  elseif ($Target -eq 'help') { $script:ShowHelp = $true }
  else { $script:ShowVersion = $true }
}

# The options of collect.sh (--org NAME, --org=NAME, --daily-metrics) that PowerShell did not match itself.
function Read-ExtraArguments {
  param([string[]]$Arguments)
  $valueOptions = @{
    '--enterprise' = 'enterprise'; '-e' = 'enterprise'; '--org' = 'org'; '--organization' = 'org'; '-o' = 'org'
    '--months' = 'months'; '-m' = 'months'; '--hostname' = 'hostname'; '--output' = 'output'; '--skip' = 'skip'
    '--only' = 'only'
  }
  $switchOptions = @{
    '--daily-metrics' = 'daily'; '--teams' = 'teams'; '--plain' = 'plain'; '--list-sources' = 'sources'; '--yes' = 'yes'
    '-y' = 'yes'; '--help' = 'help'; '-h' = 'help'; '--version' = 'version'
  }
  $index = 0
  while ($index -lt $Arguments.Count) {
    $argument = [string]$Arguments[$index]
    $index++
    $optionName = $argument
    $optionValue = $null
    $equalsAt = $argument.IndexOf('=')
    if ($argument.StartsWith('--', [StringComparison]::Ordinal) -and $equalsAt -gt 2) {
      $optionName = $argument.Substring(0, $equalsAt)
      $optionValue = $argument.Substring($equalsAt + 1)
    }
    if ($null -eq $optionValue -and $switchOptions.ContainsKey($optionName)) {
      Set-SwitchOption $switchOptions[$optionName]
      continue
    }
    if (-not $valueOptions.ContainsKey($optionName)) {
      Stop-WithError ('Unknown option: ' + $argument + '. Run with -Help to see the options.')
    }
    if ($null -eq $optionValue) {
      if ($index -ge $Arguments.Count -or -not $Arguments[$index]) {
        Stop-WithError ($optionName + ' needs a value. Run with -Help to see the options.')
      }
      $optionValue = [string]$Arguments[$index]
      $index++
    }
    Set-ValueOption $valueOptions[$optionName] $optionValue
  }
}

function Read-Options {
  if ($env:GH_HOST) { $script:GitHubHost = [string]$env:GH_HOST }
  if (Test-Bound 'Enterprise') {
    Assert-Value '-Enterprise' $script:OptionValues.Enterprise
    $script:EnterpriseSlug = $script:OptionValues.Enterprise
  }
  if (Test-Bound 'Org') {
    foreach ($value in $script:OptionValues.Org) {
      Assert-Value '-Org' $value
      Add-OrganizationNames $value
    }
  }
  if (Test-Bound 'Months') {
    Assert-Value '-Months' $script:OptionValues.Months
    $script:MonthText = $script:OptionValues.Months
  }
  if (Test-Bound 'Hostname') {
    Assert-Value '-Hostname' $script:OptionValues.Hostname
    $script:GitHubHost = $script:OptionValues.Hostname
    $script:HostGiven = $true
  }
  if (Test-Bound 'Output') {
    Assert-Value '-Output' $script:OptionValues.Output
    $script:OutputPath = $script:OptionValues.Output
  }
  if (Test-Bound 'Skip') {
    foreach ($value in $script:OptionValues.Skip) {
      Assert-Value '-Skip' $value
      Add-SourceNames $script:SkipSources $value
    }
  }
  if (Test-Bound 'Only') {
    foreach ($value in $script:OptionValues.Only) {
      Assert-Value '-Only' $value
      Add-SourceNames $script:OnlySources $value
    }
  }
  if (Test-Bound 'DailyMetrics') {
    if ($script:OptionValues.DailyMetrics.IsPresent) { $script:ReadDailyMetrics = 'yes' } else { $script:ReadDailyMetrics = 'no' }
  }
  if (Test-Bound 'Teams') {
    if ($script:OptionValues.Teams.IsPresent) { $script:WithTeams = 'yes' } else { $script:WithTeams = 'no' }
  }
  $script:PlainText = $script:OptionValues.Plain.IsPresent
  $script:AssumeYes = $script:OptionValues.Yes.IsPresent
  $script:ShowHelp = $script:OptionValues.Help.IsPresent
  $script:ShowSources = $script:OptionValues.ListSources.IsPresent
  $script:ShowVersion = $script:OptionValues.Version.IsPresent
  Read-ExtraArguments $script:OptionValues.RemainingArguments
}

function Test-ValidName {
  param([string]$Name)
  return ($Name -cmatch '^[A-Za-z0-9_.][A-Za-z0-9_.-]*\z')
}

function Assert-Options {
  if ($script:EnterpriseSlug -and -not (Test-ValidName $script:EnterpriseSlug)) {
    Stop-WithError ('The enterprise slug "' + $script:EnterpriseSlug + '" is not valid. Use the name from the enterprise URL.')
  }
  foreach ($name in $script:OrganizationNames) {
    if (-not (Test-ValidName $name)) { Stop-WithError ('The organization name "' + $name + '" is not valid.') }
  }
  if ($script:MonthText) {
    $digits = $script:MonthText.TrimStart([char]'0')
    if ($script:MonthText -cnotmatch '^[0-9]+\z' -or $digits.Length -eq 0 -or $digits.Length -gt 2 -or
      [int]$digits -gt $script:MaxMonths) {
      Stop-WithError ('-Months needs a number from 1 to ' + $script:MaxMonths + '.')
    }
    $script:MonthCount = [int]$digits
  }
  $retryText = [string]$env:USAGE_LENS_RETRY_SECONDS
  if ($retryText -cmatch '^[0-9]{1,4}\z') { $script:RetrySeconds = [int]$retryText } else { $script:RetrySeconds = 5 }
  $waitText = [string]$env:USAGE_LENS_REPORT_WAIT_SECONDS
  if ($waitText -cmatch '^[0-9]{1,9}\z') { $script:ReportWaitSeconds = [int]$waitText } else { $script:ReportWaitSeconds = 900 }
  $pollText = [string]$env:USAGE_LENS_REPORT_POLL_SECONDS
  if ($pollText -cmatch '^[0-9]{1,9}\z') { $script:ReportPollSeconds = [int]$pollText } else { $script:ReportPollSeconds = 20 }
  foreach ($name in (@($script:SkipSources) + @($script:OnlySources))) {
    if ($script:AllSources -notcontains $name) {
      Stop-WithError ('Unknown source: ' + $name + '. Run with -ListSources to see them.')
    }
  }
  if ($script:OnlySources.Contains('teams')) { $script:WithTeams = 'yes' }
  $hostText = $script:GitHubHost.ToLowerInvariant()
  if ($hostText.StartsWith('http://', [StringComparison]::Ordinal)) { $hostText = $hostText.Substring(7) }
  if ($hostText.StartsWith('https://', [StringComparison]::Ordinal)) { $hostText = $hostText.Substring(8) }
  $slashAt = $hostText.IndexOf('/')
  if ($slashAt -ge 0) { $hostText = $hostText.Substring(0, $slashAt) }
  if ($hostText.StartsWith('api.', [StringComparison]::Ordinal)) { $hostText = $hostText.Substring(4) }
  if ($hostText -cnotmatch '^[a-z0-9.-]+\z') {
    Stop-WithError ('The host name "' + $hostText + '" is not valid. Use a name such as github.com or octocorp.ghe.com.')
  }
  $script:GitHubHost = $hostText
}

# Questions are asked only in a terminal, and not with -Yes or pwsh -NonInteractive.
function Test-Interactive {
  if ($script:AssumeYes) { return $false }
  if ([Console]::IsInputRedirected -or [Console]::IsOutputRedirected) { return $false }
  foreach ($argument in [Environment]::GetCommandLineArgs()) {
    if ($argument -match '^(-|--|/)noni') { return $false }
  }
  return $true
}

# ---------------------------------------------------------------------------------------------------------------------
# Small helpers. Dates are UTC and use the invariant culture, so the result does not depend on the computer settings.

function ConvertTo-JsonText {
  param([string]$Text)
  $value = [regex]::Replace($Text, '[\x00-\x1F]', ' ')
  return '"' + $value.Replace('\', '\\').Replace('"', '\"') + '"'
}

function ConvertTo-JsonList {
  param($Items)
  $parts = New-Object 'System.Collections.Generic.List[string]'
  foreach ($item in $Items) { $parts.Add((ConvertTo-JsonText ([string]$item))) }
  return '[' + ($parts -join ',') + ']'
}

function Get-CountText {
  param([int]$Count)
  if ($Count -eq 1) { return '1 item' }
  return ([string]$Count + ' items')
}

function Get-DayText {
  param([DateTime]$Date)
  return $Date.ToString('yyyy-MM-dd', $script:Invariant)
}

# The date that is Offset days after the YYYY-MM-DD date in Day. A day that cannot be read counts as today.
function Get-ShiftedDay {
  param([string]$Day, [int]$Offset)
  $date = $script:TodayDate
  $parsed = [DateTime]::MinValue
  if ([DateTime]::TryParseExact($Day, 'yyyy-MM-dd', $script:Invariant, [Globalization.DateTimeStyles]::None, [ref]$parsed)) {
    $date = $parsed
  }
  return (Get-DayText $date.AddDays($Offset))
}

# Sets MonthKeys (YYYY-MM, oldest first, ending with this month) and WindowStart (the first day of the oldest month).
function Set-MonthKeys {
  $firstOfMonth = [DateTime]::new($script:TodayDate.Year, $script:TodayDate.Month, 1)
  $keys = New-Object 'System.Collections.Generic.List[string]'
  for ($i = $script:MonthCount - 1; $i -ge 0; $i--) {
    $keys.Add($firstOfMonth.AddMonths(-$i).ToString('yyyy-MM', $script:Invariant))
  }
  $script:MonthKeys = $keys.ToArray()
  $script:WindowStart = $script:MonthKeys[0] + '-01'
}

# The first day with activity data in the chosen months. The reports start on MetricsFirstDay and keep one year.
function Get-MetricsStartDay {
  $first = $script:WindowStart
  $yearAgo = Get-DayText $script:TodayDate.AddYears(-1).AddDays(1)
  if ([string]::CompareOrdinal($first, $script:MetricsFirstDay) -lt 0) { $first = $script:MetricsFirstDay }
  if ([string]::CompareOrdinal($first, $yearAgo) -lt 0) { $first = $yearAgo }
  return $first
}

# ---------------------------------------------------------------------------------------------------------------------
# Progress and results

# Each request adds one row to the summary and one "source" line to the file (for the app).
function Add-Status {
  param([string]$SourceId, [string]$Status, [int]$Records, [int]$Http, [string]$Message, [string]$Endpoint)
  $Message = [regex]::Replace($Message, '[\t\r\n]', ' ')
  $script:StatusRows.Add([pscustomobject]@{
      Id = $SourceId; Status = $Status; Records = $Records; Http = $Http; Target = $script:ContextTarget
      Month = $script:ContextMonth; Message = $Message
    })
  $monthPart = ''
  if ($script:ContextMonth) { $monthPart = '"month":"' + $script:ContextMonth + '",' }
  $script:SourceLines.Add('{"kind":"source","id":"' + $SourceId + '","scope":"' + $script:ContextScope + '","target":"' +
    $script:ContextTarget + '",' + $monthPart + '"status":"' + $Status + '","records":' + $Records + ',"http":' + $Http +
    ',"message":' + (ConvertTo-JsonText $Message) + ',"endpoint":' + (ConvertTo-JsonText $Endpoint) + '}')
  $script:StepRecords += $Records
  if ($Status -eq 'ok') { $script:StepOk++ }
  elseif ($Status -eq 'partial') { $script:StepPartial++ }
  elseif ($Status -eq 'failed') { $script:StepFailed++ }
  else { $script:StepSkipped++ }
  if ($Status -eq 'skipped' -and -not $script:StepNote) { $script:StepNote = $Message }
  if (($Status -eq 'partial' -or $Status -eq 'failed') -and -not $script:StepError) {
    $script:StepHttp = $Http
    $script:StepError = $Message
  }
  Show-Progress
}

# The moving part of the step line: a turning sign, a bar when the number of requests is known, and the items read so
# far or what the step waits for. -Turn turns the sign, and shows how much of a download has arrived.
function Show-Progress {
  param([switch]$Turn)
  if (-not $script:ShowProgress -or -not $script:StepActive -or $script:ProgressRoom -lt 1) { return }
  if ($Turn) {
    $script:ProgressFrame = ($script:ProgressFrame + 1) % 4
    if ($script:DownloadPath -and [System.IO.File]::Exists($script:DownloadPath)) {
      $script:ProgressNote = 'downloading ' + (Get-SizeText $script:DownloadPath)
    }
  }
  $doneCount = $script:StepOk + $script:StepPartial + $script:StepFailed + $script:StepSkipped
  $items = $script:StepRecords + $script:PendingRecords + $script:WatchRecords
  $detail = ''
  if ($script:ProgressNote) { $detail = $script:ProgressNote }
  elseif ($items -eq 1) { $detail = '1 item' }
  elseif ($items -gt 1) { $detail = [string]$items + ' items' }
  if ($script:StepTotal -gt 0) {
    if ($doneCount -gt $script:StepTotal) { $doneCount = $script:StepTotal }
    $counts = [string]$doneCount + '/' + $script:StepTotal
    if ($detail) { $detail = $counts + ' ' + $detail } else { $detail = $counts }
    # The bar takes the room that is left, at most 10 marks.
    $barSize = [Math]::Min(10, $script:ProgressRoom - $detail.Length - 5)
    if ($barSize -ge 4) {
      $filled = [int][Math]::Floor($doneCount * $barSize / $script:StepTotal)
      $detail = '[' + ('#' * $filled) + ('-' * ($barSize - $filled)) + '] ' + $detail
    }
  }
  $text = $script:SpinnerFrames.Substring($script:ProgressFrame, 1)
  if ($detail) { $text += ' ' + $detail }
  if ($text.Length -gt $script:ProgressRoom) { $text = $text.Substring(0, $script:ProgressRoom) }
  Write-Text ("`r  " + $script:StepLabel.PadRight(38) + ' ')
  Write-Text $text.PadRight($script:ProgressRoom) 'DarkGray'
}

# Clears the moving part of the step line, so the result can follow the name of the step.
function Complete-Progress {
  if ($script:ShowProgress -and $script:StepActive -and $script:ProgressRoom -ge 1) {
    $start = "`r  " + $script:StepLabel.PadRight(38) + ' '
    Write-Text ($start + (' ' * $script:ProgressRoom) + $start)
  }
  $script:StepActive = $false
}

# Waits a number of seconds. In a terminal the step line keeps moving.
function Wait-WithProgress {
  param([int]$Seconds)
  if ($Seconds -le 0) { return }
  if (-not $script:ShowProgress -or -not $script:StepActive -or $script:ProgressRoom -lt 1) {
    Start-Sleep -Seconds $Seconds
    return
  }
  $until = [DateTime]::UtcNow.AddSeconds($Seconds)
  while ([DateTime]::UtcNow -lt $until) {
    Start-Sleep -Milliseconds 200
    Show-Progress -Turn
  }
}

# Start-Step LABEL [REQUESTS]: REQUESTS is how many requests the step makes, when that is known.
function Start-Step {
  param([string]$Label, [int]$Total = 0)
  $script:StepLabel = $Label
  $script:StepTotal = $Total
  $script:StepActive = $true
  $script:ProgressNote = ''
  $script:WatchRecords = 0
  $script:PendingRecords = 0
  if ($script:ShowProgress) {
    # The window can change size between steps. The line must not wrap, or it cannot be drawn again.
    $width = 80
    try { $width = [Console]::WindowWidth } catch { $width = 80 }
    if ($width -le 0) { $width = 80 }
    $script:ProgressRoom = [Math]::Min(50, $width - 42)
  }
  $script:StepRecords = 0
  $script:StepOk = 0
  $script:StepPartial = 0
  $script:StepFailed = 0
  $script:StepSkipped = 0
  $script:StepHttp = 0
  $script:StepError = ''
  $script:StepNote = ''
  Write-Text ('  ' + $Label.PadRight(38) + ' ')
  Show-Progress
}

function Get-FailureText {
  if ($script:StepHttp -ne 0) { return ('(HTTP ' + $script:StepHttp + ': ' + $script:StepError + ')') }
  if ($script:StepError) { return ('(' + $script:StepError + ')') }
  return '(unknown error)'
}

function Complete-Step {
  $calls = $script:StepOk + $script:StepPartial + $script:StepFailed
  Complete-Progress
  if ($calls -eq 0 -and $script:StepNote) {
    Write-Line ('none (' + $script:StepNote + ')') 'DarkGray'
  } elseif ($calls -eq 0) {
    Write-Line 'skipped' 'DarkGray'
  } elseif ($script:StepFailed -eq 0 -and $script:StepPartial -eq 0) {
    Write-Line (Get-CountText $script:StepRecords) 'Green'
  } elseif ($script:StepOk -eq 0 -and $script:StepPartial -eq 0) {
    Write-Text 'not available' 'Red'
    Write-Text ' '
    Write-Line (Get-FailureText) 'DarkGray'
  } else {
    $failedCalls = $script:StepFailed + $script:StepPartial
    Write-Text ((Get-CountText $script:StepRecords) + ', ' + $failedCalls + ' of ' + $calls + ' requests failed') 'Yellow'
    Write-Text ' '
    Write-Line (Get-FailureText) 'DarkGray'
  }
}

# True when every request of this step failed because of access, so the next months or days would fail too.
function Test-NoAccessYet {
  if ($script:StepOk -ne 0 -or $script:StepPartial -ne 0 -or $script:StepFailed -le 0) { return $false }
  return (@(401, 403, 404, 410) -contains $script:LastHttp)
}

# ---------------------------------------------------------------------------------------------------------------------
# Talking to GitHub. Every call goes through "gh api", so gh handles sign-in, the host and paging.

# The jq filters read where a record came from in these variables. An empty value removes the variable.
function Set-LensVariables {
  $values = @($script:ContextScope, $script:ContextTarget, $script:ContextMonth, $script:ContextParent)
  for ($i = 0; $i -lt $script:LensVariables.Count; $i++) {
    $value = [string]$values[$i]
    if ($value) { [Environment]::SetEnvironmentVariable($script:LensVariables[$i], $value) }
    else { [Environment]::SetEnvironmentVariable($script:LensVariables[$i], $null) }
  }
}

function Clear-LensVariables {
  foreach ($name in $script:LensVariables) { [Environment]::SetEnvironmentVariable($name, $null) }
}

# Quotes one argument for the Windows command line in the way that programs read it back.
function ConvertTo-ArgumentText {
  param([string]$Value)
  if ($Value.Length -gt 0 -and $Value -notmatch '[\s"]') { return $Value }
  $builder = New-Object System.Text.StringBuilder
  [void]$builder.Append('"')
  $slashCount = 0
  foreach ($character in $Value.ToCharArray()) {
    if ($character -ceq [char]92) {
      $slashCount++
    } elseif ($character -ceq [char]34) {
      [void]$builder.Append([char]92, 2 * $slashCount + 1)
      [void]$builder.Append($character)
      $slashCount = 0
    } else {
      if ($slashCount -gt 0) { [void]$builder.Append([char]92, $slashCount) }
      [void]$builder.Append($character)
      $slashCount = 0
    }
  }
  if ($slashCount -gt 0) { [void]$builder.Append([char]92, 2 * $slashCount) }
  [void]$builder.Append('"')
  return $builder.ToString()
}

# Runs a program and waits for it. Returns its exit code, the lines it printed and what it wrote to stderr.
# Its input is empty, so it never waits for an answer.
function Invoke-Program {
  param([string]$FilePath, [string[]]$Arguments)
  $startInfo = New-Object System.Diagnostics.ProcessStartInfo
  $startInfo.FileName = $FilePath
  if ($script:HasArgumentList) {
    foreach ($argument in $Arguments) { $startInfo.ArgumentList.Add($argument) }
  } else {
    $quoted = New-Object 'System.Collections.Generic.List[string]'
    foreach ($argument in $Arguments) { $quoted.Add((ConvertTo-ArgumentText $argument)) }
    $startInfo.Arguments = $quoted -join ' '
  }
  $startInfo.UseShellExecute = $false
  $startInfo.CreateNoWindow = $true
  $startInfo.RedirectStandardInput = $true
  $startInfo.RedirectStandardOutput = $true
  $startInfo.RedirectStandardError = $true
  $startInfo.StandardOutputEncoding = $script:Utf8
  $startInfo.StandardErrorEncoding = $script:Utf8
  $process = [System.Diagnostics.Process]::Start($startInfo)
  try {
    try { $process.StandardInput.Close() } catch { $null = $_ }
    $errorTask = $process.StandardError.ReadToEndAsync()
    $lines = New-Object 'System.Collections.Generic.List[string]'
    if ($script:ShowProgress -and $script:StepActive -and $script:ProgressRoom -ge 1) {
      # In a terminal the step line moves while the program works, and counts the records it has printed so far.
      $clock = [System.Diagnostics.Stopwatch]::StartNew()
      $script:WatchRecords = 0
      while ($true) {
        $lineTask = $process.StandardOutput.ReadLineAsync()
        while (-not $lineTask.Wait(200)) {
          Show-Progress -Turn
          $clock.Restart()
        }
        $line = $lineTask.Result
        if ($null -eq $line) { break }
        $lines.Add($line)
        if ($line.StartsWith('{"kind":"', [StringComparison]::Ordinal)) { $script:WatchRecords++ }
        if ($clock.ElapsedMilliseconds -ge 200) {
          Show-Progress -Turn
          $clock.Restart()
        }
      }
      $script:WatchRecords = 0
    } else {
      while ($null -ne ($line = $process.StandardOutput.ReadLine())) { $lines.Add($line) }
    }
    $process.WaitForExit()
    $errorText = $errorTask.GetAwaiter().GetResult()
    return [pscustomobject]@{ ExitCode = $process.ExitCode; Lines = $lines; ErrorText = [string]$errorText }
  } finally {
    $process.Dispose()
  }
}

# Runs "gh api" with the arguments and keeps what it prints in GhLines. Tries again when GitHub is busy.
# Sets LastHttp (200 when it worked, 0 when unknown) and LastError. Returns $true when it worked.
function Invoke-GhApi {
  param([string[]]$Arguments)
  Set-LensVariables
  $attempt = 1
  while ($true) {
    $allArguments = @('api', '--hostname', $script:GitHubHost) + @($script:VersionArguments) + @($Arguments)
    $result = Invoke-Program $script:GhPath $allArguments
    $script:GhLines = $result.Lines
    $script:GhErrorText = $result.ErrorText
    if ($result.ExitCode -eq 0) {
      $script:LastHttp = 200
      $script:LastError = ''
      return $true
    }
    $errorLines = @($script:GhErrorText -split "`n")
    $script:LastHttp = 0
    foreach ($errorLine in $errorLines) {
      if ($errorLine -cmatch '.*\(HTTP ([0-9]{3})\)') { $script:LastHttp = [int]$Matches[1] }
    }
    $message = $errorLines[0].Replace("`r", '') -creplace '^gh: ', '' -creplace ' \(HTTP [0-9]*\)$', ''
    if ($message.Length -gt 200) { $message = $message.Substring(0, 200) }
    if (-not $message) { $message = 'gh stopped with exit code ' + $result.ExitCode }
    $script:LastError = $message
    if ($attempt -ge 3) { return $false }
    $retry = $false
    if (@(429, 500, 502, 503, 504) -contains $script:LastHttp) {
      $retry = $true
    } elseif ($script:LastHttp -eq 403) {
      $retry = $script:GhErrorText -match 'rate limit'
    } elseif ($script:LastHttp -eq 0) {
      $retry = $script:GhErrorText -match 'timeout|timed out|connection reset|unexpected EOF|TLS handshake'
    }
    if (-not $retry) { return $false }
    $waitSeconds = $attempt * $attempt * $script:RetrySeconds
    if ($script:ShowProgress -and $script:StepActive) {
      $script:ProgressNote = 'busy, waiting ' + $waitSeconds + ' s'
    } else {
      Write-Text ('(busy, waiting ' + $waitSeconds + ' s)') 'DarkGray'
      Write-Text ' '
    }
    Wait-WithProgress $waitSeconds
    $script:ProgressNote = ''
    $attempt++
  }
}

# Moves the record lines that gh printed into the bundle. Returns their number.
function Save-Records {
  param($Lines)
  $count = 0
  foreach ($line in $Lines) {
    if ($line.StartsWith('{"kind":"', [StringComparison]::Ordinal)) {
      $script:RecordsWriter.Write($line + "`n")
      $count++
    }
  }
  $script:RecordsTotal += $count
  return $count
}

# The values of control lines such as "#org octo-org" that a filter printed next to the records.
function Get-ControlValues {
  param($Lines, [string]$Name)
  $prefix = '#' + $Name + ' '
  $values = New-Object 'System.Collections.Generic.List[string]'
  foreach ($line in $Lines) {
    if ($line.StartsWith($prefix, [StringComparison]::Ordinal)) { $values.Add($line.Substring($prefix.Length)) }
  }
  return $values.ToArray()
}

# Reads one endpoint (every page with --paginate) and keeps the records that the filter makes. When a later page
# fails, the records of the pages before it are kept and the source is marked "partial". OutLines keeps what gh printed.
function Invoke-Fetch {
  param([string]$SourceId, [string]$Endpoint, [string]$Filter, [string[]]$Extra = @())
  $worked = Invoke-GhApi (@($Endpoint, '--jq', ($script:JqWrap + ' ' + $Filter)) + @($Extra))
  $script:OutLines = $script:GhLines
  $kept = Save-Records $script:GhLines
  if ($worked) {
    Add-Status $SourceId 'ok' $kept 200 '' $Endpoint
    return $true
  }
  if ($kept -gt 0) {
    Add-Status $SourceId 'partial' $kept $script:LastHttp $script:LastError $Endpoint
  } else {
    Add-Status $SourceId 'failed' 0 $script:LastHttp $script:LastError $Endpoint
  }
  return $false
}

# For endpoints that page with ?page=N and has_next_page (budgets). The filter prints "#more" when there is a next page.
# Other control lines are kept in ControlLines.
function Invoke-FetchPages {
  param([string]$SourceId, [string]$Endpoint, [string]$Filter)
  $separator = '?'
  if ($Endpoint.Contains('?')) { $separator = '&' }
  $script:ControlLines = New-Object 'System.Collections.Generic.List[string]'
  $total = 0
  for ($page = 1; $page -le $script:MaxPages; $page++) {
    $pageEndpoint = $Endpoint + $separator + 'per_page=100&page=' + $page
    $script:PendingRecords = $total
    $worked = Invoke-GhApi @($pageEndpoint, '--jq', ($script:JqWrap + ' ' + $Filter))
    $script:PendingRecords = 0
    $total += (Save-Records $script:GhLines)
    if (-not $worked) {
      if ($total -gt 0) {
        Add-Status $SourceId 'partial' $total $script:LastHttp $script:LastError $Endpoint
      } else {
        Add-Status $SourceId 'failed' 0 $script:LastHttp $script:LastError $Endpoint
      }
      return $false
    }
    $more = $false
    foreach ($line in $script:GhLines) {
      if ($line -ceq '#more') { $more = $true }
      elseif ($line.StartsWith('#', [StringComparison]::Ordinal)) { $script:ControlLines.Add($line) }
    }
    if (-not $more) { break }
  }
  Add-Status $SourceId 'ok' $total 200 '' $Endpoint
  return $true
}

function Get-InnerMessage {
  param($Exception)
  while ($null -ne $Exception.InnerException) { $Exception = $Exception.InnerException }
  return $Exception.Message
}

# Downloads with .NET when curl is not there. Only https links are followed, also after a redirect.
function Save-DownloadWithDotNet {
  param([string]$Url, [string]$Path)
  try {
    if ($null -eq $script:HttpClient) {
      if ($PSVersionTable.PSVersion.Major -lt 6) {
        Add-Type -AssemblyName System.Net.Http
        [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor
          [Net.SecurityProtocolType]::Tls12
      }
      $handler = New-Object System.Net.Http.HttpClientHandler
      $handler.AllowAutoRedirect = $false
      $proxyText = [string]$env:HTTPS_PROXY
      if (-not $proxyText) { $proxyText = [string]$env:https_proxy }
      if ($proxyText) {
        $handler.Proxy = New-Object System.Net.WebProxy($proxyText)
        $handler.UseProxy = $true
      } elseif ($null -ne $handler.GetType().GetProperty('DefaultProxyCredentials')) {
        $handler.DefaultProxyCredentials = [Net.CredentialCache]::DefaultCredentials
      }
      $script:HttpClient = New-Object System.Net.Http.HttpClient($handler)
      $script:HttpClient.Timeout = [TimeSpan]::FromMinutes(10)
    }
    $address = $Url
    $redirects = 0
    $response = $null
    while ($true) {
      if (-not $address.StartsWith('https://', [StringComparison]::OrdinalIgnoreCase)) {
        $script:DownloadError = 'The report link does not use https.'
        return $false
      }
      $response = $script:HttpClient.GetAsync($address, [System.Net.Http.HttpCompletionOption]::ResponseHeadersRead).GetAwaiter().GetResult()
      $statusCode = [int]$response.StatusCode
      if ($statusCode -lt 300 -or $statusCode -ge 400 -or $null -eq $response.Headers.Location) { break }
      $redirects++
      $nextAddress = (New-Object System.Uri((New-Object System.Uri($address)), $response.Headers.Location)).AbsoluteUri
      $response.Dispose()
      if ($redirects -gt 5) {
        $script:DownloadError = 'The report link redirects too often.'
        return $false
      }
      $address = $nextAddress
    }
    try {
      if (-not $response.IsSuccessStatusCode) {
        $script:DownloadError = 'The server answered with HTTP ' + $statusCode + '.'
        return $false
      }
      $source = $response.Content.ReadAsStreamAsync().GetAwaiter().GetResult()
      try {
        $target = [System.IO.File]::Create($Path)
        try {
          $copyTask = $source.CopyToAsync($target)
          while (-not $copyTask.Wait(200)) { Show-Progress -Turn }
        } finally {
          $target.Dispose()
        }
      } finally {
        $source.Dispose()
      }
      return $true
    } finally {
      $response.Dispose()
    }
  } catch {
    $script:DownloadError = Get-InnerMessage $_.Exception
    return $false
  }
}

# Downloads a report file. Only https links are followed. The links are signed, so no token is sent with them.
function Save-Download {
  param([string]$Url, [string]$Path)
  $script:DownloadError = ''
  if (-not $Url.StartsWith('https://', [StringComparison]::Ordinal)) { return $false }
  $script:DownloadPath = $Path
  try {
    if (-not $script:CurlPath) { return (Save-DownloadWithDotNet $Url $Path) }
    $result = Invoke-Program $script:CurlPath @('--fail', '--silent', '--show-error', '--location', '--proto', '=https',
      '--proto-redir', '=https', '--retry', '2', '--connect-timeout', '30', '--output', $Path, $Url)
  } finally {
    $script:DownloadPath = ''
    $script:ProgressNote = ''
  }
  if ($result.ExitCode -eq 0) { return $true }
  $script:DownloadError = @($result.ErrorText -split "`n")[0].TrimEnd([char]13)
  return $false
}

function Test-GzipFile {
  param([string]$Path)
  $stream = [System.IO.File]::OpenRead($Path)
  try {
    $first = $stream.ReadByte()
    $second = $stream.ReadByte()
    return ($first -eq 0x1f -and $second -eq 0x8b)
  } finally {
    $stream.Dispose()
  }
}

function Expand-GzipFile {
  param([string]$Source, [string]$Target)
  try {
    $packed = [System.IO.File]::OpenRead($Source)
    try {
      $unpacked = New-Object System.IO.Compression.GZipStream($packed, [System.IO.Compression.CompressionMode]::Decompress)
      $output = [System.IO.File]::Create($Target)
      try { $unpacked.CopyTo($output) } finally { $output.Dispose(); $unpacked.Dispose() }
    } finally {
      $packed.Dispose()
    }
    return $true
  } catch {
    return $false
  }
}

# Adds every JSON line of a report file as one record. A file that is not one object per line becomes one record.
# Returns the number of records.
function Add-ReportLines {
  param([string]$Kind, [string]$Path)
  $prefix = '{"kind":"' + $Kind + '","scope":"' + $script:ContextScope + '","target":"' + $script:ContextTarget + '","record":'
  $count = 0
  $wholeFile = $false
  $reader = New-Object System.IO.StreamReader($Path, $script:Utf8, $true)
  try {
    $first = $null
    while ($null -ne ($line = $reader.ReadLine())) {
      if ($line.Trim($script:SpaceAndTab).Length -gt 0) {
        $first = $line
        break
      }
    }
    if ($null -ne $first) {
      $trimmed = $first.Trim($script:SpaceAndTab)
      if ($trimmed.Length -ge 2 -and $trimmed.StartsWith('{', [StringComparison]::Ordinal) -and
        $trimmed.EndsWith('}', [StringComparison]::Ordinal)) {
        $line = $first
        while ($null -ne $line) {
          if ($line.TrimStart($script:SpaceAndTab).StartsWith('{', [StringComparison]::Ordinal)) {
            $script:RecordsWriter.Write($prefix + $line + "}`n")
            $count++
          }
          $line = $reader.ReadLine()
        }
      } else {
        $wholeFile = $true
      }
    }
  } finally {
    $reader.Dispose()
  }
  if ($wholeFile) {
    $text = [System.IO.File]::ReadAllText($Path, $script:Utf8)
    $script:RecordsWriter.Write($prefix + $text.Replace("`r", ' ').Replace("`n", ' ') + "}`n")
    $count = 1
  }
  $script:RecordsTotal += $count
  return $count
}

# Asks for a usage metrics report and downloads its files. Sets ReportFirstDay and ReportLastDay when GitHub says which
# days the report covers. For a daily report, "not found" means there is no report for that day.
# Returns 'ok' when it worked, 'failed' when it failed and 'none' when GitHub sent no report, as it does for a day
# without data.
function Invoke-FetchReport {
  param([string]$SourceId, [string]$Kind, [string]$Endpoint, [switch]$Daily)
  $script:ReportFirstDay = ''
  $script:ReportLastDay = ''
  if (-not (Invoke-GhApi @($Endpoint, '--jq', $script:ReportFilter))) {
    if ($Daily -and $script:LastHttp -eq 404) {
      Add-Status $SourceId 'skipped' 0 404 'No report for this day.' $Endpoint
    } else {
      Add-Status $SourceId 'failed' 0 $script:LastHttp $script:LastError $Endpoint
    }
    return 'failed'
  }
  $reportLines = $script:GhLines
  if (@($reportLines | Where-Object { ([string]$_).TrimEnd("`r") -ceq '#none' }).Count -gt 0) {
    if ($Endpoint.Contains('day=')) {
      Add-Status $SourceId 'skipped' 0 200 'No report for this day.' $Endpoint
    } else {
      Add-Status $SourceId 'skipped' 0 200 'No report yet.' $Endpoint
    }
    return 'none'
  }
  $firstDays = @(Get-ControlValues $reportLines 'first')
  if ($firstDays.Count -gt 0) { $script:ReportFirstDay = $firstDays[0] }
  $lastDays = @(Get-ControlValues $reportLines 'last')
  if ($lastDays.Count -gt 0) { $script:ReportLastDay = $lastDays[0] }
  $links = New-Object 'System.Collections.Generic.List[string]'
  foreach ($line in $reportLines) {
    if ($line.StartsWith('https://', [StringComparison]::Ordinal)) { $links.Add($line) }
  }
  $downloadPath = [System.IO.Path]::Combine($script:WorkDir, 'download')
  $textPath = [System.IO.Path]::Combine($script:WorkDir, 'report.txt')
  $count = 0
  foreach ($link in $links) {
    [System.IO.File]::Delete($downloadPath)
    [System.IO.File]::Delete($textPath)
    if (-not (Save-Download $link $downloadPath)) {
      Add-Status $SourceId 'failed' $count 0 ('Could not download the report file: ' + $script:DownloadError) $Endpoint
      return 'failed'
    }
    if (Test-GzipFile $downloadPath) {
      if (-not (Expand-GzipFile $downloadPath $textPath)) {
        Add-Status $SourceId 'failed' $count 0 'Could not unpack the report file.' $Endpoint
        return 'failed'
      }
    } else {
      [System.IO.File]::Move($downloadPath, $textPath)
    }
    $count += (Add-ReportLines $Kind $textPath)
  }
  [System.IO.File]::Delete($downloadPath)
  [System.IO.File]::Delete($textPath)
  Add-Status $SourceId 'ok' $count 200 '' $Endpoint
  return 'ok'
}

# ---------------------------------------------------------------------------------------------------------------------
# Collecting

function Select-Sources {
  $list = New-Object 'System.Collections.Generic.List[string]'
  foreach ($name in $script:AllSources) {
    if ($script:OnlySources.Count -gt 0) {
      if (-not $script:OnlySources.Contains($name)) { continue }
    } else {
      if ($script:SkipSources.Contains($name)) { continue }
      if ($name -eq 'teams' -and $script:WithTeams -ne 'yes') { continue }
    }
    $list.Add($name)
  }
  $script:SelectedSources = $list.ToArray()
}

function Test-Wants {
  param([string]$Name)
  return ($script:SelectedSources -ccontains $Name)
}

function Test-WantsAny {
  param([string[]]$Names)
  foreach ($name in $Names) {
    if (Test-Wants $name) { return $true }
  }
  return $false
}

function Set-Context {
  param([string]$Scope, [string]$Target)
  $script:ContextScope = $Scope
  $script:ContextTarget = $Target
  $script:ContextMonth = ''
  $script:ContextParent = ''
}

function Add-SkippedSources {
  foreach ($name in $script:AllSources) {
    if (-not (Test-Wants $name)) {
      if ($name -eq 'teams') {
        Add-Status $name 'skipped' 0 0 'Not selected. Add --teams to read team members.' ''
      } else {
        Add-Status $name 'skipped' 0 0 'Not selected.' ''
      }
    } elseif (-not $script:EnterpriseSlug -and ($name -eq 'organizations' -or $name -eq 'cost-centers' -or
        $name -eq 'usage-report')) {
      Add-Status $name 'skipped' 0 0 'Only for enterprises.' ''
    }
  }
}

function Add-SeatTotal {
  $totals = @(Get-ControlValues $script:OutLines 'total')
  if ($totals.Count -eq 0) { return }
  $total = $totals[$totals.Count - 1]
  if ($total -cnotmatch '^[0-9]+\z') { return }
  $script:RecordsWriter.Write('{"kind":"seat-total","scope":"' + $script:ContextScope + '","target":"' +
    $script:ContextTarget + '","record":{"total_seats":' + $total + '}}' + "`n")
  $script:RecordsTotal++
}

function Read-Seats {
  param([string]$Endpoint)
  Start-Step 'GitHub Copilot seats'
  $null = Invoke-Fetch 'seats' $Endpoint $script:SeatFilter @('--paginate')
  Add-SeatTotal
  Complete-Step
}

function Read-Budgets {
  param([string]$Endpoint, [switch]$WithUsers)
  Start-Step 'Budgets'
  if ((Invoke-FetchPages 'budgets' $Endpoint $script:BudgetFilter) -and $WithUsers) {
    $budgetLines = $script:ControlLines.ToArray()
    $script:StepTotal = 1 + @($budgetLines | Where-Object { $_.StartsWith('#users ', [StringComparison]::Ordinal) }).Count
    foreach ($line in $budgetLines) {
      if (-not $line.StartsWith('#users ', [StringComparison]::Ordinal)) { continue }
      $budgetId = $line.Substring(7)
      if ($budgetId -cnotmatch '^[A-Za-z0-9_-]+\z') { continue }
      $script:ContextParent = $budgetId
      $null = Invoke-FetchPages 'budgets' ($Endpoint + '/' + $budgetId + '/user-states') $script:BudgetUsersFilter
      $script:ContextParent = ''
    }
  }
  Complete-Step
}

# AI credits, the billing summary and daily charges for every chosen month.
function Read-Billing {
  param([string]$Base)
  foreach ($sourceId in @('ai-credit-usage', 'usage-summary', 'billing-usage')) {
    if (-not (Test-Wants $sourceId)) { continue }
    if ($sourceId -eq 'ai-credit-usage') {
      $label = 'AI credits billed per month'
      $path = 'ai_credit/usage'
      $filter = $script:AiCreditFilter
    } elseif ($sourceId -eq 'usage-summary') {
      $label = 'Billing summary per month'
      $path = 'usage/summary'
      $filter = $script:UsageSummaryFilter
    } else {
      $label = 'Daily GitHub Copilot charges'
      $path = 'usage'
      $filter = $script:BillingUsageFilter
    }
    Start-Step $label @($script:MonthKeys).Count
    foreach ($month in $script:MonthKeys) {
      $script:ContextMonth = $month
      $year = $month.Substring(0, 4)
      $monthNumber = [int]$month.Substring(5, 2)
      $null = Invoke-Fetch $sourceId ($Base + '/' + $path + '?year=' + $year + '&month=' + $monthNumber) $filter
      if (Test-NoAccessYet) { break }
    }
    $script:ContextMonth = ''
    Complete-Step
  }
}

# Reads the latest 28-day activity report and, with -DailyMetrics, the daily report of every earlier day in the chosen
# months. It goes back one day at a time and stops after three failed days in a row, or after a week in a row of days
# without data.
function Read-Reports {
  param([string]$SourceId, [string]$Base, [string]$DailyName, [string]$LatestName, [string]$Label)
  Start-Step $Label
  $null = Invoke-FetchReport $SourceId $SourceId ($Base + '/' + $LatestName + '/latest')
  if (-not $script:LatestReportDay) { $script:LatestReportDay = $script:ReportLastDay }
  if ($script:ReadDailyMetrics -eq 'yes' -and -not (Test-NoAccessYet)) {
    $day = $script:ReportFirstDay
    if (-not $day) { $day = $script:Today }
    $day = Get-ShiftedDay $day -1
    $firstDay = Get-MetricsStartDay
    $script:StepTotal = ([DateTime]::ParseExact($day, 'yyyy-MM-dd', $script:Invariant) -
      [DateTime]::ParseExact($firstDay, 'yyyy-MM-dd', $script:Invariant)).Days + 2
    $failures = 0
    $emptyDays = 0
    while ([string]::CompareOrdinal($day, $firstDay) -ge 0) {
      $result = Invoke-FetchReport $SourceId $SourceId ($Base + '/' + $DailyName + '?day=' + $day) -Daily
      if ($result -ceq 'ok') {
        $failures = 0
        $emptyDays = 0
      } elseif ($result -ceq 'none') {
        $emptyDays++
        if ($emptyDays -ge 7) { break }
      } else {
        $failures++
        if ($failures -ge 3 -or (Test-NoAccessYet)) { break }
      }
      $day = Get-ShiftedDay $day -1
    }
  }
  Complete-Step
}

function Read-Metrics {
  param([string]$Base, [string]$Level)
  $script:LatestReportDay = ''
  if (Test-Wants 'user-metrics') {
    Read-Reports 'user-metrics' $Base 'users-1-day' 'users-28-day' 'Activity per user'
  }
  if (Test-Wants 'scope-metrics') {
    Read-Reports 'scope-metrics' $Base ($Level + '-1-day') ($Level + '-28-day') 'Activity totals'
  }
  if (Test-Wants 'user-teams') {
    Start-Step 'Teams of GitHub Copilot users'
    $day = $script:LatestReportDay
    if (-not $day) { $day = Get-ShiftedDay (Get-ShiftedDay $script:Today -1) -1 }
    # The latest day with a report, at most three days back.
    for ($attempt = 0; $attempt -lt 3; $attempt++) {
      if ((Invoke-FetchReport 'user-teams' 'user-teams' ($Base + '/user-teams-1-day?day=' + $day)) -cne 'none') { break }
      $day = Get-ShiftedDay $day -1
    }
    Complete-Step
  }
}

function Read-AuditLog {
  param([string]$Endpoint)
  Start-Step 'Audit log: seat and budget changes' 2
  foreach ($topic in @('copilot', 'billing')) {
    $phrase = 'phrase=action:' + $topic + ' created:>=' + $script:WindowStart
    $null = Invoke-Fetch 'audit-log' $Endpoint $script:AuditFilter @('--paginate', '--method', 'GET', '-f', $phrase)
    if (Test-NoAccessYet) { break }
  }
  Complete-Step
}

function Read-Teams {
  param([string]$Endpoint, [string]$MembersPath, [string]$Label)
  Start-Step $Label
  if (Invoke-Fetch 'teams' $Endpoint $script:TeamsFilter @('--paginate')) {
    $slugs = @(Get-ControlValues $script:OutLines 'team')
    $script:StepTotal = 1 + $slugs.Count
    foreach ($slug in $slugs) {
      if ($slug -cnotmatch '^[A-Za-z0-9_.:-]+\z') { continue }
      $script:ContextParent = $slug
      $null = Invoke-Fetch 'teams' ($Endpoint + '/' + $slug + '/' + $MembersPath) $script:TeamMembersFilter @('--paginate')
      $script:ContextParent = ''
    }
  }
  Complete-Step
}

# The organizations of the seats that were read, for an enterprise whose list of organizations could not be read.
function Get-SeatOrganizations {
  $script:RecordsWriter.Flush()
  $names = New-Object 'System.Collections.Generic.List[string]'
  $stream = New-Object System.IO.FileStream($script:RecordsPath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read,
    [System.IO.FileShare]::ReadWrite)
  $reader = New-Object System.IO.StreamReader($stream, $script:Utf8)
  try {
    while ($null -ne ($line = $reader.ReadLine())) {
      $found = [regex]::Match($line, '.*"organization":\{"login":"([^"]*)"\}')
      if ($found.Success -and -not $names.Contains($found.Groups[1].Value)) { $names.Add($found.Groups[1].Value) }
    }
  } finally {
    $reader.Dispose()
  }
  $names.Sort([StringComparer]::Ordinal)
  return $names.ToArray()
}

# Whole seconds since 1970, as date +%s prints them.
function Get-UnixSeconds {
  $epoch = [DateTime]::new(1970, 1, 1, 0, 0, 0, [DateTimeKind]::Utc)
  return [long][Math]::Floor(([DateTime]::UtcNow - $epoch).TotalSeconds)
}

# Splits Text, which ends with a line break, into JSON texts as scripts/collect.sh does with tr and awk: control
# characters become spaces, one CR at the end of each line goes, and backslash, quote, tab and CR are escaped. The last
# item is the empty text after the last line break.
function ConvertTo-UsageLines {
  param([string]$Text)
  $value = [regex]::Replace($Text.Replace("`r`n", "`n"), '[\x00-\x08\x0B\x0C\x0E-\x1F]', ' ')
  $value = $value.Replace('\', '\\').Replace('"', '\"').Replace("`t", '\t').Replace("`r", '\r')
  return , $value.Split([char]10)
}

# Adds the lines of one AI usage report file (CSV) to Writer, ReportChunkLines lines per record. Each line becomes a
# JSON text, so the app can put the file back together. Lines end at LF, as awk reads them, and a byte order mark is
# kept as it is. Returns the number of lines and of records.
function Add-UsageReportFile {
  param([string]$Month, [string]$ReportId, [int]$FileNumber, [string]$Path, $Writer)
  $prefix = '{"kind":"usage-report","scope":"' + $script:ContextScope + '","target":"' + $script:ContextTarget +
    '","month":"' + $Month + '","record":{"report":"' + $ReportId + '","file":' + $FileNumber + ',"part":'
  $chunkSize = $script:ReportChunkLines
  $pending = New-Object 'System.Collections.Generic.List[string]'
  $lineCount = 0
  $partCount = 0
  $carry = ''
  $buffer = New-Object 'char[]' 1048576
  $reader = New-Object System.IO.StreamReader($Path, $script:Utf8, $false)
  try {
    $atEnd = $false
    while (-not $atEnd) {
      $readCount = $reader.Read($buffer, 0, $buffer.Length)
      if ($readCount -gt 0) {
        $text = $carry + [string]::new($buffer, 0, $readCount)
        $lastBreak = $text.LastIndexOf([char]10)
        if ($lastBreak -lt 0) {
          $carry = $text
          continue
        }
        $carry = $text.Substring($lastBreak + 1)
        $text = $text.Substring(0, $lastBreak + 1)
      } else {
        # A last line without a line break counts too, as in awk.
        $atEnd = $true
        $text = ''
        if ($carry.Length -gt 0) { $text = $carry + "`n" }
      }
      if ($text.Length -gt 0) {
        $lines = ConvertTo-UsageLines $text
        $pending.AddRange($lines)
        $pending.RemoveAt($pending.Count - 1)
        $lineCount += $lines.Length - 1
      }
      $items = $pending.ToArray()
      $written = 0
      while ($items.Length - $written -ge $chunkSize -or ($atEnd -and $written -lt $items.Length)) {
        $size = [Math]::Min($chunkSize, $items.Length - $written)
        $partCount++
        $Writer.Write($prefix + $partCount + ',"lines":["' + [string]::Join('","', $items, $written, $size) + '"]}}' + "`n")
        $written += $size
      }
      $pending.RemoveRange(0, $written)
    }
  } finally {
    $reader.Dispose()
  }
  return [pscustomobject]@{ Lines = $lineCount; Parts = $partCount }
}

# The first day of a month, its last day so far and its last day.
function Get-MonthDays {
  param([string]$Month)
  $dayCount = [DateTime]::DaysInMonth([int]$Month.Substring(0, 4), [int]$Month.Substring(5, 2))
  $monthEnd = $Month + '-' + $dayCount.ToString('00', $script:Invariant)
  $last = $monthEnd
  if ([string]::CompareOrdinal($last, $script:Today) -gt 0) { $last = $script:Today }
  return [pscustomobject]@{ First = $Month + '-01'; Last = $last; End = $monthEnd }
}

# Asks GitHub to make the AI usage report of one month and adds it to the list. Returns 'asked' when GitHub makes it,
# 'busy' when GitHub is still making another report (it makes one at a time) and 'failed' when it failed.
function Request-UsageReport {
  param([string]$Base, [string]$Month, $List)
  $days = Get-MonthDays $Month
  $script:ContextMonth = $Month
  try {
    if (-not (Invoke-GhApi @($Base, '--method', 'POST', '-f', 'report_type=ai_credit', '-f', ('start_date=' + $days.First),
          '-f', ('end_date=' + $days.Last), '--jq', '.id // ""'))) {
      if ($script:LastHttp -eq 409) { return 'busy' }
      Add-Status 'usage-report' 'failed' 0 $script:LastHttp $script:LastError $Base
      return 'failed'
    }
    $reportId = ''
    if ($script:GhLines.Count -gt 0) { $reportId = ([string]$script:GhLines[0]).Replace("`r", '') }
    if ($reportId -cnotmatch '^[A-Za-z0-9-]+\z') {
      Add-Status 'usage-report' 'failed' 0 0 'GitHub did not say which report it makes.' $Base
      return 'failed'
    }
    $List.Add([pscustomobject]@{ Month = $Month; ReportId = $reportId })
    return 'asked'
  } finally {
    $script:ContextMonth = ''
  }
}

# Finds the AI usage report of every chosen month on the billing page (GitHub keeps them for 31 days), or asks GitHub
# to make one. GitHub makes them while the other data is read, and Read-UsageReports downloads them at the end.
# GitHub makes one report at a time, so the months it cannot take yet wait in UsageLater.
function Request-UsageReports {
  param([string]$Base)
  $script:UsageReports.Clear()
  $script:UsageLater.Clear()
  $script:ReportRequestedAt = Get-UnixSeconds
  $ready = 0
  $asked = 0
  $busy = $false
  Start-Step 'AI usage report: find or ask for'
  if (-not (Invoke-GhApi @($Base, '--jq', $script:ReportListFilter))) {
    Add-Status 'usage-report' 'failed' 0 $script:LastHttp $script:LastError $Base
    Complete-Step
    return
  }
  $listed = @(Get-ControlValues $script:GhLines 'report')
  foreach ($month in $script:MonthKeys) {
    $days = Get-MonthDays $month
    # It must cover the whole month and no other month. A finished report has all the usage only when GitHub made it
    # after the last day, so the newest of those is used. This month is not over, so its finished reports are never
    # used; one that GitHub is still making is, so a run that stopped waiting for it can be repeated.
    $found = ''
    $newest = ''
    $processingId = ''
    foreach ($entry in $listed) {
      $fields = $entry.Split([char]9)
      if ($fields.Count -lt 4) { continue }
      if ($fields[1] -cne $days.First -or [string]::CompareOrdinal($fields[2], $days.Last) -lt 0 -or
        [string]::CompareOrdinal($fields[2], $days.End) -gt 0) { continue }
      $madeAt = ''
      if ($fields.Count -gt 4) { $madeAt = $fields[4] }
      $madeDay = $madeAt
      if ($madeDay.Length -gt 10) { $madeDay = $madeDay.Substring(0, 10) }
      $madeAfter = [string]::CompareOrdinal($madeDay, $fields[2]) -gt 0
      if ($fields[3] -ceq 'completed' -and $madeAfter -and [string]::CompareOrdinal($madeAt, $newest) -gt 0) {
        $newest = $madeAt
        $found = $fields[0]
      }
      if ($fields[3] -ceq 'processing' -and ($madeAfter -or $days.Last -ceq $script:Today) -and -not $processingId) {
        $processingId = $fields[0]
      }
    }
    if (-not $found) { $found = $processingId }
    if ($found -cmatch '^[A-Za-z0-9-]+\z') {
      $script:UsageReports.Add([pscustomobject]@{ Month = $month; ReportId = $found })
      $ready++
      continue
    }
    if ($busy) {
      $script:UsageLater.Add($month)
      continue
    }
    $result = Request-UsageReport $Base $month $script:UsageReports
    if ($result -ceq 'asked') {
      $asked++
    } elseif ($result -ceq 'busy') {
      $busy = $true
      $script:UsageLater.Add($month)
    } elseif (Test-NoAccessYet) {
      break
    }
  }
  if ($script:UsageReports.Count -eq 0 -and $script:UsageLater.Count -eq 0) {
    Complete-Step
    return
  }
  Complete-Progress
  $summary = [string]$ready + ' found, ' + $asked + ' asked for'
  if ($script:UsageLater.Count -gt 0) { $summary += ', ' + $script:UsageLater.Count + ' to ask for later' }
  if ($script:StepFailed -gt 0) {
    Write-Text ($summary + ', ' + $script:StepFailed + ' failed') 'Yellow'
    Write-Text ' '
    Write-Line (Get-FailureText) 'DarkGray'
  } elseif ($script:UsageLater.Count -gt 0) {
    Write-Text $summary 'Green'
    Write-Text ' '
    Write-Line '(GitHub makes one at a time)' 'DarkGray'
  } else {
    Write-Text $summary 'Green'
    Write-Text ' '
    Write-Line '(read at the end)' 'DarkGray'
  }
}

# Downloads every file of one finished AI usage report. Nothing is kept unless every file worked.
function Save-UsageReport {
  param([string]$Month, [string]$ReportId, [string]$Endpoint, $StatusLines)
  $links = New-Object 'System.Collections.Generic.List[string]'
  foreach ($line in $StatusLines) {
    if ($line.StartsWith('https://', [StringComparison]::Ordinal)) { $links.Add($line) }
  }
  if ($links.Count -eq 0) {
    # GitHub makes no file for a finished report without usage, for example when the month has just started.
    Add-Status 'usage-report' 'ok' 0 200 'GitHub made the report, but it has no usage for these days.' $Endpoint
    $script:UsageReportMonths++
    return $true
  }
  $downloadPath = [System.IO.Path]::Combine($script:WorkDir, 'download')
  $textPath = [System.IO.Path]::Combine($script:WorkDir, 'report.txt')
  $chunksPath = [System.IO.Path]::Combine($script:WorkDir, 'usage-chunks')
  $rowCount = 0
  $chunkCount = 0
  $fileNumber = 0
  $chunkWriter = New-Object System.IO.StreamWriter($chunksPath, $false, $script:Utf8)
  try {
    foreach ($link in $links) {
      $fileNumber++
      [System.IO.File]::Delete($downloadPath)
      [System.IO.File]::Delete($textPath)
      if (-not (Save-Download $link $downloadPath)) {
        Add-Status 'usage-report' 'failed' 0 0 ('Could not download the report file: ' + $script:DownloadError) $Endpoint
        return $false
      }
      if (Test-GzipFile $downloadPath) {
        if (-not (Expand-GzipFile $downloadPath $textPath)) {
          Add-Status 'usage-report' 'failed' 0 0 'Could not unpack the report file.' $Endpoint
          return $false
        }
      } else {
        [System.IO.File]::Move($downloadPath, $textPath)
      }
      $counts = Add-UsageReportFile $Month $ReportId $fileNumber $textPath $chunkWriter
      # The first line of each file names the columns.
      if ($counts.Lines -gt 0) { $rowCount += $counts.Lines - 1 }
      $chunkCount += $counts.Parts
      $script:UsageReportRecords += $counts.Parts
    }
  } finally {
    $chunkWriter.Dispose()
  }
  [System.IO.File]::Delete($downloadPath)
  [System.IO.File]::Delete($textPath)
  $script:RecordsWriter.Flush()
  $chunks = [System.IO.File]::OpenRead($chunksPath)
  try { $chunks.CopyTo($script:RecordsWriter.BaseStream) } finally { $chunks.Dispose() }
  $script:RecordsTotal += $chunkCount
  Add-Status 'usage-report' 'ok' $rowCount 200 '' $Endpoint
  $script:UsageReportMonths++
  return $true
}

# Waits until GitHub has made the AI usage reports and downloads them. When they are done, it asks for the months that
# waited their turn. It waits at most ReportWaitSeconds after the last report was asked for. A report that is not
# ready by then is reported, and the next run uses it.
function Read-UsageReports {
  param([string]$Base)
  if ($script:UsageReports.Count -eq 0 -and $script:UsageLater.Count -eq 0) { return }
  $deadline = $script:ReportRequestedAt + $script:ReportWaitSeconds
  $pending = $script:UsageReports.ToArray()
  $waitShown = $false
  Start-Step 'AI usage report: download' ($script:UsageReports.Count + $script:UsageLater.Count)
  while ($true) {
    $waiting = New-Object 'System.Collections.Generic.List[object]'
    foreach ($report in $pending) {
      $script:ContextMonth = $report.Month
      $endpoint = $Base + '/' + $report.ReportId
      if (-not (Invoke-GhApi @($endpoint, '--jq', $script:ReportStatusFilter))) {
        Add-Status 'usage-report' 'failed' 0 $script:LastHttp $script:LastError $endpoint
        continue
      }
      $statusLines = $script:GhLines
      $states = @(Get-ControlValues $statusLines 'status')
      $state = ''
      if ($states.Count -gt 0) { $state = ([string]$states[0]).Replace("`r", '') }
      if ($state -ceq 'completed') {
        $null = Save-UsageReport $report.Month $report.ReportId $endpoint $statusLines
      } elseif ($state -ceq 'processing') {
        $waiting.Add($report)
      } else {
        Add-Status 'usage-report' 'failed' 0 0 'GitHub could not make the report. Run the script again.' $endpoint
      }
    }
    $script:ContextMonth = ''
    # GitHub makes one report at a time. When it has made the ones asked for, ask for the next month.
    if ($waiting.Count -eq 0 -and $script:UsageLater.Count -gt 0) {
      $result = Request-UsageReport $Base $script:UsageLater[0] $waiting
      if ($result -cne 'busy') { $script:UsageLater.RemoveAt(0) }
      if ($result -ceq 'asked') { $deadline = (Get-UnixSeconds) + $script:ReportWaitSeconds }
    }
    if ($waiting.Count -eq 0 -and $script:UsageLater.Count -eq 0) { break }
    if ((Get-UnixSeconds) -ge $deadline) {
      foreach ($report in $waiting) {
        $script:ContextMonth = $report.Month
        Add-Status 'usage-report' 'failed' 0 0 ('GitHub is still making the report. Run the script again in a few ' +
          'minutes. It uses the same report.') ($Base + '/' + $report.ReportId)
      }
      foreach ($month in $script:UsageLater) {
        $script:ContextMonth = $month
        Add-Status 'usage-report' 'failed' 0 0 ('GitHub makes one report at a time and had no time for this month. ' +
          'Run the script again in a few minutes.') $Base
      }
      $script:ContextMonth = ''
      break
    }
    if ($script:ShowProgress) {
      $script:ProgressNote = 'GitHub makes it, up to ' + [Math]::Floor(($deadline - (Get-UnixSeconds) + 59) / 60) + ' min'
    } else {
      if (-not $waitShown) {
        Write-Text '(GitHub is making it, this takes a few minutes for each month)' 'DarkGray'
        Write-Text ' '
        $waitShown = $true
      }
      Write-Text '.' 'DarkGray'
    }
    Wait-WithProgress $script:ReportPollSeconds
    $script:ProgressNote = ''
    $pending = $waiting.ToArray()
  }
  if ($waitShown) { Write-Text ' ' }
  Complete-Step
}

function Read-Enterprise {
  $slug = $script:EnterpriseSlug
  $foundNames = @()
  Set-Context 'enterprise' $slug
  Write-Line ''
  Write-Line ('Enterprise ' + $slug)
  if (Test-Wants 'usage-report') { Request-UsageReports ('/enterprises/' + $slug + '/settings/billing/reports') }
  if (Test-Wants 'organizations') {
    Start-Step 'Organizations'
    $null = Invoke-Fetch 'organizations' 'graphql' $script:OrganizationsFilter @('--paginate', '-f',
      ('query=' + $script:OrganizationsQuery), '-f', ('slug=' + $slug))
    $foundNames = @(Get-ControlValues $script:OutLines 'org')
    Complete-Step
  }
  if (Test-Wants 'seats') { Read-Seats ('/enterprises/' + $slug + '/copilot/billing/seats') }
  if (Test-Wants 'members') {
    Start-Step 'Enterprise members'
    $null = Invoke-Fetch 'members' 'graphql' $script:EnterpriseMembersFilter @('--paginate', '-f',
      ('query=' + $script:EnterpriseMembersQuery), '-f', ('slug=' + $slug))
    Complete-Step
  }
  if (Test-Wants 'budgets') { Read-Budgets ('/enterprises/' + $slug + '/settings/billing/budgets') -WithUsers }
  if (Test-Wants 'cost-centers') {
    Start-Step 'Cost centers'
    $null = Invoke-Fetch 'cost-centers' ('/enterprises/' + $slug + '/settings/billing/cost-centers') $script:CostCenterFilter
    Complete-Step
  }
  Read-Billing ('/enterprises/' + $slug + '/settings/billing')
  Read-Metrics ('/enterprises/' + $slug + '/copilot/metrics/reports') 'enterprise'
  if (Test-Wants 'audit-log') { Read-AuditLog ('/enterprises/' + $slug + '/audit-log') }
  if (Test-Wants 'teams') { Read-Teams ('/enterprises/' + $slug + '/teams') 'memberships' 'Enterprise teams' }
  if (Test-Wants 'usage-report') {
    Set-Context 'enterprise' $slug
    Read-UsageReports ('/enterprises/' + $slug + '/settings/billing/reports')
  }

  # Seat totals, policies and teams of each organization. Without -Org, every organization found above.
  $detailNames = @($script:OrganizationNames)
  if ($detailNames.Count -eq 0) { $detailNames = $foundNames }
  if ($detailNames.Count -eq 0) { $detailNames = @(Get-SeatOrganizations) }
  if ((Test-Wants 'seat-summary') -or (Test-Wants 'teams')) {
    foreach ($name in $detailNames) {
      if (-not (Test-ValidName $name)) { continue }
      Set-Context 'organization' $name
      Write-Line ('Organization ' + $name)
      if (Test-Wants 'seat-summary') {
        Start-Step 'Seat totals and policies'
        $null = Invoke-Fetch 'seat-summary' ('/orgs/' + $name + '/copilot/billing') $script:SeatSummaryFilter
        Complete-Step
      }
      if (Test-Wants 'teams') { Read-Teams ('/orgs/' + $name + '/teams') 'members' 'Teams' }
    }
  }
}

function Read-Organization {
  param([string]$Name)
  Set-Context 'organization' $Name
  Write-Line ''
  Write-Line ('Organization ' + $Name)
  if (Test-Wants 'seat-summary') {
    Start-Step 'Seat totals and policies'
    $null = Invoke-Fetch 'seat-summary' ('/orgs/' + $Name + '/copilot/billing') $script:SeatSummaryFilter
    Complete-Step
  }
  if (Test-Wants 'seats') { Read-Seats ('/orgs/' + $Name + '/copilot/billing/seats') }
  if (Test-Wants 'members') {
    Start-Step 'Members'
    $null = Invoke-Fetch 'members' ('/orgs/' + $Name + '/members') $script:OrganizationMembersFilter @('--paginate')
    Complete-Step
  }
  if (Test-Wants 'budgets') { Read-Budgets ('/organizations/' + $Name + '/settings/billing/budgets') }
  Read-Billing ('/organizations/' + $Name + '/settings/billing')
  Read-Metrics ('/orgs/' + $Name + '/copilot/metrics/reports') 'organization'
  if (Test-Wants 'audit-log') { Read-AuditLog ('/orgs/' + $Name + '/audit-log') }
  if (Test-Wants 'teams') { Read-Teams ('/orgs/' + $Name + '/teams') 'members' 'Teams' }
}

# ---------------------------------------------------------------------------------------------------------------------
# Setup and questions

function Find-Program {
  param([string]$Name)
  $command = Get-Command $Name -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($null -eq $command) { return '' }
  return [string]$command.Path
}

# Runs a program in this window, so it can ask questions and open the browser. Returns its exit code.
function Invoke-InConsole {
  param([string]$FilePath, [string[]]$Arguments)
  $startInfo = New-Object System.Diagnostics.ProcessStartInfo
  $startInfo.FileName = $FilePath
  $quoted = New-Object 'System.Collections.Generic.List[string]'
  foreach ($argument in $Arguments) { $quoted.Add((ConvertTo-ArgumentText $argument)) }
  $startInfo.Arguments = $quoted -join ' '
  $startInfo.UseShellExecute = $false
  $process = [System.Diagnostics.Process]::Start($startInfo)
  try {
    $process.WaitForExit()
    return $process.ExitCode
  } finally {
    $process.Dispose()
  }
}

function Test-GitHubCli {
  $script:GhPath = Find-Program 'gh'
  if (-not $script:GhPath) {
    Write-Text 'The GitHub CLI (gh) is not installed.' 'Red'
    Write-Line ' Install it, then run this script again:'
    Write-Line '  Windows:  winget install --id GitHub.cli    Then open a new PowerShell window.'
    Write-Line '  macOS:    brew install gh'
    Write-Line '  Linux:    https://github.com/cli/cli/blob/trunk/docs/install_linux.md'
    Write-Line '  More:     https://cli.github.com'
    exit 1
  }
  $result = Invoke-Program $script:GhPath @('--version')
  foreach ($line in $result.Lines) {
    if ($line -cmatch '^gh version ([0-9][0-9.]*)') {
      $script:GhVersion = $Matches[1]
      break
    }
  }
  $parts = $script:GhVersion.Split([char]'.')
  if ($parts.Count -lt 2 -or $parts[0] -cnotmatch '^[0-9]{1,6}\z' -or $parts[1] -cnotmatch '^[0-9]{1,6}\z') { return }
  $major = [int]$parts[0]
  $minor = [int]$parts[1]
  if ($major -lt $script:MinGhMajor -or ($major -eq $script:MinGhMajor -and $minor -lt $script:MinGhMinor)) {
    Write-Line ('Your GitHub CLI is version ' + $script:GhVersion + '. Please update to ' + $script:MinGhMajor + '.' +
      $script:MinGhMinor + ' or later: https://cli.github.com') 'Yellow'
  }
}

# The name of the variable that gh takes its token from, when one is set.
function Get-TokenVariable {
  if ($script:GitHubHost -eq 'github.com' -or $script:GitHubHost.EndsWith('.ghe.com', [StringComparison]::Ordinal)) {
    if ($env:GH_TOKEN) { return 'GH_TOKEN' }
    if ($env:GITHUB_TOKEN) { return 'GITHUB_TOKEN' }
  } else {
    if ($env:GH_ENTERPRISE_TOKEN) { return 'GH_ENTERPRISE_TOKEN' }
    if ($env:GITHUB_ENTERPRISE_TOKEN) { return 'GITHUB_ENTERPRISE_TOKEN' }
  }
  return ''
}

function Test-Login {
  $script:VersionArguments = @('-H', ('X-GitHub-Api-Version: ' + $script:ApiVersionName))
  $script:UsedApiVersion = $script:ApiVersionName
  Set-Context '' ''
  if (-not (Invoke-GhApi @('user', '--include'))) {
    if ($script:LastHttp -eq 400 -or $script:LastHttp -eq 410) {
      $script:VersionArguments = @()
      $script:UsedApiVersion = ''
      $null = Invoke-GhApi @('user', '--include')
    }
  }
  if ($script:LastHttp -ne 200) {
    if ($script:LastHttp -eq 401 -or $script:GhErrorText -match 'auth login|not logged|authenticat') {
      Write-Text ('You are not signed in to ' + $script:GitHubHost + ' with the GitHub CLI.') 'Red'
      Write-Line ' Sign in, then run this script again:'
      Write-Line ('  gh auth login --hostname ' + $script:GitHubHost)
      exit 1
    }
    Stop-WithError ('Could not reach ' + $script:GitHubHost + ': ' + $script:LastError)
  }
  $script:Login = ''
  foreach ($line in $script:GhLines) {
    if ($line -cmatch '.*"login"\s*:\s*"([^"]*)"') {
      $script:Login = $Matches[1]
      break
    }
  }
  $script:TokenScopes = @()
  $script:ScopesKnown = $false
  foreach ($line in $script:GhLines) {
    if ($line -match '^x-oauth-scopes:(.*)$') {
      $script:ScopesKnown = $true
      $script:TokenScopes = @($Matches[1].Trim() -split '[,\s]+' | Where-Object { $_ })
      break
    }
  }
}

function Test-Scope {
  param([string]$Scope)
  if ($script:TokenScopes -ccontains $Scope) { return $true }
  if ($Scope -eq 'read:org') {
    return (($script:TokenScopes -ccontains 'admin:org') -or ($script:TokenScopes -ccontains 'write:org'))
  }
  if ($Scope -eq 'read:enterprise' -or $Scope -eq 'manage_billing:enterprise') {
    return ($script:TokenScopes -ccontains 'admin:enterprise')
  }
  return $false
}

function Get-NeededScopes {
  $list = New-Object 'System.Collections.Generic.List[string]'
  if ($script:EnterpriseSlug) {
    if (Test-WantsAny @('organizations', 'members', 'teams', 'user-metrics', 'scope-metrics', 'user-teams')) {
      $list.Add('read:enterprise')
    }
    if (Test-Wants 'seats') { $list.Add('manage_billing:copilot') }
    if (Test-WantsAny @('usage-report', 'budgets', 'cost-centers', 'ai-credit-usage', 'usage-summary', 'billing-usage')) {
      $list.Add('manage_billing:enterprise')
    }
    if (Test-WantsAny @('seat-summary', 'teams')) { $list.Add('read:org') }
  } elseif (Test-WantsAny @('seat-summary', 'seats', 'members', 'teams', 'user-metrics', 'scope-metrics', 'user-teams')) {
    $list.Add('read:org')
  }
  if (Test-Wants 'audit-log') { $list.Add('read:audit_log') }
  return $list.ToArray()
}

function Get-MissingScopes {
  $missing = New-Object 'System.Collections.Generic.List[string]'
  foreach ($scope in @(Get-NeededScopes)) {
    if (-not (Test-Scope $scope)) { $missing.Add($scope) }
  }
  return $missing.ToArray()
}

function Read-Answer {
  param([string]$Prompt, [string]$DefaultAnswer)
  Write-Text ($Prompt + ' ')
  $reply = Read-Host
  if ($null -eq $reply) {
    Write-Line ''
    Write-Line 'Stopped. Nothing was saved.'
    exit 1
  }
  $reply = $reply.Trim()
  if (-not $reply) { return $DefaultAnswer }
  return $reply
}

function Read-YesNo {
  param([string]$Question, [bool]$DefaultYes)
  $hint = '[y/N]'
  $defaultAnswer = 'n'
  if ($DefaultYes) {
    $hint = '[Y/n]'
    $defaultAnswer = 'y'
  }
  while ($true) {
    $answer = Read-Answer ($Question + ' ' + $hint) $defaultAnswer
    if ($answer -match '^(y|yes)\z') { return $true }
    if ($answer -match '^(n|no)\z') { return $false }
    Write-Line 'Type y for yes or n for no.'
  }
}

function Find-Accounts {
  $script:FoundEnterprises = @()
  $script:FoundOrganizations = @()
  Set-Context '' ''
  if (Invoke-GhApi @('graphql', '-f', ('query=' + $script:AccountsQuery), '--jq', $script:AccountsFilter)) {
    $script:FoundEnterprises = @($script:GhLines | Where-Object { $_ })
  }
  if (Invoke-GhApi @('user/memberships/orgs', '--paginate', '--jq', $script:MembershipsFilter)) {
    $script:FoundOrganizations = @($script:GhLines | Where-Object { $_ })
  }
}

function Select-Target {
  $defaultKind = 'o'
  Write-Line ''
  Write-Line 'Looking for the accounts you manage...' 'DarkGray'
  Find-Accounts
  if ($script:FoundEnterprises.Count -gt 0) {
    Write-Line ('Enterprises: ' + ($script:FoundEnterprises -join ' '))
    $defaultKind = 'e'
  }
  if ($script:FoundOrganizations.Count -gt 0) {
    Write-Line ('Organizations you own or manage billing for: ' + ($script:FoundOrganizations -join ' '))
  }
  Write-Line 'Read data for an enterprise (e) or for one or more organizations (o)?'
  $answer = ''
  while ($answer -notmatch '^[eo]') {
    $answer = Read-Answer ('Type e or o [' + $defaultKind + ']:') $defaultKind
  }
  if ($answer -match '^e') {
    $suggestion = ''
    if ($script:FoundEnterprises.Count -gt 0) { $suggestion = [string]$script:FoundEnterprises[0] }
    $hint = ''
    if ($suggestion) { $hint = ' [' + $suggestion + ']' }
    while ($true) {
      $answer = Read-Answer ('Enterprise slug, the NAME in github.com/enterprises/NAME' + $hint + ':') $suggestion
      if (Test-ValidName $answer) {
        $script:EnterpriseSlug = $answer
        return
      }
      Write-Line 'Type the enterprise slug, for example octocorp.'
    }
  }
  $suggestion = $script:FoundOrganizations -join ','
  $hint = ''
  if ($suggestion) { $hint = ' [' + $suggestion + ']' }
  while ($true) {
    $answer = Read-Answer ('Organization names, separated by commas' + $hint + ':') $suggestion
    $script:OrganizationNames.Clear()
    Add-OrganizationNames $answer
    $valid = $true
    foreach ($name in $script:OrganizationNames) {
      if (-not (Test-ValidName $name)) { $valid = $false }
    }
    if ($script:OrganizationNames.Count -gt 0 -and $valid) { return }
    Write-Line 'Type one or more organization names, for example octo-org,octo-labs.'
  }
}

function Read-RunOptions {
  if ($script:EnterpriseSlug -and $script:OnlySources.Count -eq 0 -and -not $script:SkipSources.Contains('usage-report')) {
    Write-Line ''
    Write-Line 'This script can get the AI usage report too. Then this one file is all you need in the app.'
    Write-Line 'If there is no recent report, GitHub makes one, as the billing page does. This takes a few minutes for each month.' 'DarkGray'
    if (-not (Read-YesNo 'Get the AI usage report?' $true)) { $script:SkipSources.Add('usage-report') }
  }
  if ($script:MonthCount -eq 0) {
    while ($true) {
      $answer = Read-Answer ('How many months of billing data and changes, from 1 to ' + $script:MaxMonths + '? [3]:') '3'
      if ($answer -cmatch '^[0-9]{1,2}\z' -and [int]$answer -ge 1 -and [int]$answer -le $script:MaxMonths) {
        $script:MonthCount = [int]$answer
        break
      }
      Write-Line ('Type a number from 1 to ' + $script:MaxMonths + '.')
    }
  }
  if (-not $script:ReadDailyMetrics -and (Test-WantsAny @('user-metrics', 'scope-metrics'))) {
    $script:ReadDailyMetrics = 'no'
    if (Read-YesNo 'Read the activity of every day in those months, not only the last 28 days? It takes longer.' $false) {
      $script:ReadDailyMetrics = 'yes'
    }
  }
  if (-not $script:WithTeams -and $script:OnlySources.Count -eq 0 -and -not $script:SkipSources.Contains('teams')) {
    $script:WithTeams = 'no'
    if (Read-YesNo 'Also read the members of every team? It sends one request per team.' $false) {
      $script:WithTeams = 'yes'
    }
  }
}

function Test-Scopes {
  if (-not $script:ScopesKnown) {
    Write-Line 'Could not check what your token can read. If some data is missing, the summary says why.' 'DarkGray'
    return
  }
  $missing = @(Get-MissingScopes)
  if ($missing.Count -eq 0) { return }
  $scopeList = $missing -join ','
  Write-Line ''
  Write-Line ('Your sign-in is missing these scopes: ' + ($missing -join ' ')) 'Yellow'
  Write-Line 'Without them, some data cannot be read.'
  $variable = Get-TokenVariable
  if ($variable) {
    Write-Line ('gh uses the token in ' + $variable + '. Use a token with these scopes, or remove ' + $variable + ' and run:')
    Write-Line ('  gh auth login --hostname ' + $script:GitHubHost + ' --scopes ' + $scopeList)
  } elseif ($script:Interactive) {
    if (Read-YesNo 'Add them now? GitHub opens in your browser.' $true) {
      $exitCode = Invoke-InConsole $script:GhPath @('auth', 'refresh', '--hostname', $script:GitHubHost, '--scopes', $scopeList)
      if ($exitCode -eq 0) {
        Test-Login
        $missing = @(Get-MissingScopes)
        if ($missing.Count -eq 0) {
          Write-Line 'Your sign-in has every scope now.' 'Green'
          return
        }
        Write-Line ('Still missing: ' + ($missing -join ' ')) 'Yellow'
      }
    }
  } else {
    Write-Line 'To add them, run:'
    Write-Line ('  gh auth refresh --hostname ' + $script:GitHubHost + ' --scopes ' + $scopeList)
  }
  if ($script:Interactive -and -not (Read-YesNo 'Continue without that data?' $true)) {
    Write-Line 'Stopped. Nothing was saved.'
    exit 0
  }
}

function Set-PrivateMode {
  param([string]$Path, [string]$Mode)
  if ($script:OnWindows -or -not $script:ChmodPath) { return }
  $null = Invoke-Program $script:ChmodPath @($Mode, $Path)
}

function Initialize-Output {
  $extension = '.ndjson.gz'
  if ($script:PlainText) { $extension = '.ndjson' }
  if ($script:EnterpriseSlug) {
    $name = $script:EnterpriseSlug
  } elseif ($script:OrganizationNames.Count -gt 1) {
    $name = 'organizations'
  } else {
    $name = $script:OrganizationNames[0]
  }
  $stamp = [DateTime]::Now.ToString('yyyyMMdd-HHmmss', $script:Invariant)
  $fileName = 'usage-lens-data-' + $name + '-' + $stamp + $extension
  $path = $script:OutputPath
  if (-not $path) {
    $path = $fileName
  } elseif (Test-Path -LiteralPath $path -PathType Container) {
    $path = $path.TrimEnd([char[]]@([char]47, [char]92)) + [System.IO.Path]::DirectorySeparatorChar + $fileName
  }
  $script:OutputPath = $path
  $script:OutputFullPath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($path)
  $partPath = $script:OutputFullPath + '.part'
  try {
    [System.IO.File]::WriteAllBytes($partPath, [byte[]]@())
    [System.IO.File]::Delete($partPath)
  } catch {
    Stop-WithError ('Cannot write ' + $script:OutputPath + '. Choose another place with -Output.')
  }
}

function Confirm-Plan {
  $shown = New-Object 'System.Collections.Generic.List[string]'
  foreach ($name in $script:SelectedSources) {
    if (-not $script:EnterpriseSlug -and ($name -eq 'organizations' -or $name -eq 'cost-centers' -or
        $name -eq 'usage-report')) { continue }
    $shown.Add($name)
  }
  Write-Line ''
  Write-Line 'Ready to read'
  if ($script:EnterpriseSlug) {
    Write-Line ('  Account:  enterprise ' + $script:EnterpriseSlug + ' on ' + $script:GitHubHost)
  } else {
    Write-Line ('  Account:  organizations ' + ($script:OrganizationNames -join ' ') + ' on ' + $script:GitHubHost)
  }
  Write-Line ('  Months:   ' + $script:MonthKeys[0] + ' to ' + $script:MonthKeys[$script:MonthKeys.Count - 1])
  Write-Line ('  Sources:  ' + ($shown -join ' '))
  if ($script:EnterpriseSlug -and (Test-Wants 'usage-report')) {
    Write-Line '  Report:   the AI usage report of each month. GitHub makes it if there is no recent one.'
  }
  Write-Line ('  File:     ' + $script:OutputPath)
  if (-not (Read-YesNo 'Start?' $true)) {
    Write-Line 'Stopped. Nothing was saved.'
    exit 0
  }
}

# ---------------------------------------------------------------------------------------------------------------------
# The file and the summary

function Get-HeaderLine {
  $scopeName = 'organization'
  $enterpriseJson = 'null'
  $versionJson = 'null'
  $dailyJson = 'false'
  $teamsJson = 'false'
  if ($script:EnterpriseSlug) {
    $scopeName = 'enterprise'
    $enterpriseJson = ConvertTo-JsonText $script:EnterpriseSlug
  }
  if ($script:UsedApiVersion) { $versionJson = ConvertTo-JsonText $script:UsedApiVersion }
  if ($script:ReadDailyMetrics -eq 'yes') { $dailyJson = 'true' }
  if (Test-Wants 'teams') { $teamsJson = 'true' }
  return ('{"kind":"header","format":"' + $script:FormatName + '","version":' + $script:FormatVersion +
    ',"collector":"collect.ps1","collectorVersion":"' + $script:CollectorVersion + '","gh":' +
    (ConvertTo-JsonText $script:GhVersion) + ',"host":' + (ConvertTo-JsonText $script:GitHubHost) + ',"scope":"' +
    $scopeName + '","enterprise":' + $enterpriseJson + ',"organizations":' + (ConvertTo-JsonList $script:OrganizationNames) +
    ',"months":' + (ConvertTo-JsonList $script:MonthKeys) + ',"sources":' + (ConvertTo-JsonList $script:SelectedSources) +
    ',"dailyMetrics":' + $dailyJson + ',"teams":' + $teamsJson + ',"apiVersion":' + $versionJson + ',"startedAt":"' +
    $script:StartedAt + '"}')
}

# Writes the header, the records, the source lines and the end line to FILE.part, then renames it to FILE.
function Save-Bundle {
  $script:RecordsWriter.Dispose()
  $script:RecordsWriter = $null
  $header = Get-HeaderLine
  $partPath = $script:OutputFullPath + '.part'
  $fileStream = [System.IO.File]::Create($partPath)
  try {
    Set-PrivateMode $partPath '600'
    $target = $fileStream
    $packer = $null
    if (-not $script:PlainText) {
      $packer = New-Object System.IO.Compression.GZipStream($fileStream, [System.IO.Compression.CompressionLevel]::Optimal, $true)
      $target = $packer
    }
    try {
      $writer = New-Object System.IO.StreamWriter($target, $script:Utf8, 65536, $true)
      try {
        $writer.Write($header + "`n")
        $writer.Flush()
        $records = [System.IO.File]::OpenRead($script:RecordsPath)
        try { $records.CopyTo($target) } finally { $records.Dispose() }
        foreach ($line in $script:SourceLines) { $writer.Write($line + "`n") }
        $finishedAt = [DateTime]::UtcNow.ToString("yyyy-MM-dd'T'HH:mm:ss'Z'", $script:Invariant)
        $writer.Write('{"kind":"end","finishedAt":"' + $finishedAt + '","records":' + $script:RecordsTotal + '}' + "`n")
      } finally {
        $writer.Dispose()
      }
    } finally {
      if ($null -ne $packer) { $packer.Dispose() }
    }
  } finally {
    $fileStream.Dispose()
  }
  [System.IO.File]::Delete($script:OutputFullPath)
  [System.IO.File]::Move($partPath, $script:OutputFullPath)
}

function Get-SizeText {
  param([string]$Path)
  $bytes = (New-Object System.IO.FileInfo($Path)).Length
  if ($bytes -ge 1048576) { return (($bytes / 1048576).ToString('0.0', $script:Invariant) + ' MB') }
  if ($bytes -ge 1024) { return (($bytes / 1024).ToString('0', $script:Invariant) + ' KB') }
  return ([string]$bytes + ' bytes')
}

function Get-Hint {
  param([string]$SourceId, [int]$Code, [string]$Message)
  if ($Code -eq 401) { return ('Sign in again: gh auth login --hostname ' + $script:GitHubHost) }
  if ($SourceId -match 'metrics|user-teams' -and ($Code -eq 403 -or $Code -eq 404)) {
    return 'Needs an owner or billing manager, and the usage metrics policy for GitHub Copilot set to Enabled everywhere.'
  }
  if ($Code -eq 403) {
    return ('No access (' + $Message + '). You must be an owner or billing manager, and your token needs the scopes in ' +
      '-ListSources. With SAML single sign-on, authorize the token.')
  }
  if ($Code -eq 404) { return ('Not found or no access (' + $Message + ').') }
  if ($Code -eq 422) { return ('GitHub cannot return this data for this account (' + $Message + ').') }
  return $Message
}

function Show-Summary {
  param([bool]$Saved)
  Write-Line ''
  Write-Line 'Summary'
  Write-Line ('  ' + 'Source'.PadRight(16) + ' ' + 'Result'.PadRight(8) + ' ' + 'Items'.PadLeft(9) + '  Note')
  foreach ($sourceId in $script:AllSources) {
    $good = 0
    $partial = 0
    $failed = 0
    $records = 0
    $problem = $null
    $reason = $null
    $rowCount = 0
    foreach ($row in $script:StatusRows) {
      if ($row.Id -cne $sourceId) { continue }
      $rowCount++
      $records += $row.Records
      if ($row.Status -eq 'ok') { $good++ }
      elseif ($row.Status -eq 'partial') { $partial++ }
      elseif ($row.Status -eq 'failed') { $failed++ }
      if (($row.Status -eq 'failed' -or $row.Status -eq 'partial') -and $null -eq $problem) {
        $problem = Get-Hint $sourceId $row.Http $row.Message
      }
      if ($row.Status -eq 'skipped' -and $null -eq $reason) { $reason = $row.Message }
    }
    if ($rowCount -eq 0) { continue }
    $bad = $failed + $partial
    if ($good + $bad -eq 0) {
      $result = 'skipped'
      $text = [string]$reason
    } elseif ($bad -eq 0) {
      $result = 'ok'
      $text = ''
    } elseif ($good + $partial -eq 0) {
      $result = 'failed'
      $text = [string]$problem
    } else {
      $result = 'partly'
      $text = [string]$bad + ' of ' + ($good + $bad) + ' requests failed. ' + $problem
    }
    Write-Line ('  ' + $sourceId.PadRight(16) + ' ' + $result.PadRight(8) + ' ' + ([string]$records).PadLeft(9) + '  ' + $text)
  }
  if (-not $Saved) { return }
  Write-Line ''
  Write-Text 'Saved:' 'Green'
  Write-Line (' ' + $script:OutputPath + ' (' + (Get-SizeText $script:OutputFullPath) + ')')
  Write-Line ''
  Write-Line 'Next steps:'
  Write-Line '  1. Open GitHub Copilot Usage Lens: https://amgdy.github.io/github-copilot-usage-lens/'
  Write-Line '     or run npm run dev in the repository folder.'
  if ($script:UsageReportRecords -gt 0 -and $script:UsageReportMonths -lt $script:MonthCount) {
    Write-Line ('  2. Drop this file on the page. It has the AI usage report of ' + $script:UsageReportMonths + ' of ' +
      $script:MonthCount + ' months.')
    Write-Line '     For the other months, run this script again in a few minutes.'
    Write-Line '     It is read in your browser and never uploaded.'
  } elseif ($script:UsageReportRecords -gt 0) {
    Write-Line '  2. Drop this file on the page. It has your AI usage report too, so you need no other file.'
    Write-Line '     It is read in your browser and never uploaded.'
  } else {
    Write-Line '  2. Load your AI usage report, the CSV file from GitHub billing.'
    Write-Line '  3. Drop this file on the page. It is read in your browser and never uploaded.'
  }
  Write-Line 'The file holds GitHub logins and activity. Keep it safe and delete it when you are done.' 'DarkGray'
}

function Invoke-Main {
  Read-Options
  if ($script:ShowHelp) {
    Show-Help
    exit 0
  }
  if ($script:ShowSources) {
    Show-Sources
    exit 0
  }
  if ($script:ShowVersion) {
    Write-Line ('collect.ps1 ' + $script:CollectorVersion)
    exit 0
  }
  Assert-Options
  $script:Interactive = Test-Interactive
  if (-not $script:Interactive -and -not $script:EnterpriseSlug -and $script:OrganizationNames.Count -eq 0) {
    Stop-WithError 'Choose what to read with -Enterprise SLUG or -Org NAME. Run with -Help to see the options.'
  }
  if (-not $script:OnWindows) { $script:ChmodPath = Find-Program 'chmod' }
  if ($script:OnWindows) { $script:CurlPath = Find-Program 'curl.exe' } else { $script:CurlPath = Find-Program 'curl' }
  $script:WorkDir = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(),
    'usage-lens.' + [Guid]::NewGuid().ToString('N').Substring(0, 12))
  $null = [System.IO.Directory]::CreateDirectory($script:WorkDir)
  Set-PrivateMode $script:WorkDir '700'
  $script:RecordsPath = [System.IO.Path]::Combine($script:WorkDir, 'records.ndjson')
  $script:RecordsWriter = New-Object System.IO.StreamWriter($script:RecordsPath, $false, $script:Utf8)
  $now = [DateTime]::UtcNow
  $script:StartedAt = $now.ToString("yyyy-MM-dd'T'HH:mm:ss'Z'", $script:Invariant)
  $script:TodayDate = $now.Date
  $script:Today = Get-DayText $script:TodayDate

  Write-Text 'GitHub Copilot Usage Lens: data collector'
  Write-Line (' ' + $script:CollectorVersion) 'DarkGray'
  Write-Line 'It changes no settings on GitHub, and the file stays on this computer.' 'DarkGray'
  Test-GitHubCli
  Test-Login
  $shownLogin = $script:Login
  if (-not $shownLogin) { $shownLogin = 'unknown' }
  Write-Line ('Signed in to ' + $script:GitHubHost + ' as ' + $shownLogin + '.')
  if ($script:Interactive -and -not $script:EnterpriseSlug -and $script:OrganizationNames.Count -eq 0) { Select-Target }
  Select-Sources
  if ($script:Interactive) { Read-RunOptions }
  if ($script:MonthCount -eq 0) { $script:MonthCount = 3 }
  if (-not $script:ReadDailyMetrics) { $script:ReadDailyMetrics = 'no' }
  if (-not $script:WithTeams) { $script:WithTeams = 'no' }
  Select-Sources
  if ($script:SelectedSources.Count -eq 0) { Stop-WithError 'No sources are left to read. Check -Only and -Skip.' }
  Set-MonthKeys
  Initialize-Output
  Test-Scopes
  if ($script:Interactive) { Confirm-Plan }

  Add-SkippedSources
  if ($script:EnterpriseSlug) {
    Read-Enterprise
  } else {
    foreach ($organizationName in @($script:OrganizationNames)) { Read-Organization $organizationName }
  }
  if ($script:RecordsTotal -eq 0) {
    Show-Summary $false
    Write-Line ''
    Write-Text 'No data could be read, so no file was saved.' 'Red'
    Write-Line ' The notes above say why.'
    exit 1
  }
  Save-Bundle
  Show-Summary $true
}

$script:UseColor = -not [Console]::IsOutputRedirected -and -not $env:NO_COLOR -and $env:TERM -ne 'dumb'
$script:ShowProgress = -not [Console]::IsOutputRedirected -and $env:TERM -ne 'dumb'
try {
  Invoke-Main
} finally {
  if ($null -ne $script:RecordsWriter) { try { $script:RecordsWriter.Dispose() } catch { $null = $_ } }
  if ($null -ne $script:HttpClient) { try { $script:HttpClient.Dispose() } catch { $null = $_ } }
  if ($script:WorkDir -and [System.IO.Directory]::Exists($script:WorkDir)) {
    try { [System.IO.Directory]::Delete($script:WorkDir, $true) } catch { $null = $_ }
  }
  if ($script:OutputFullPath -and [System.IO.File]::Exists($script:OutputFullPath + '.part')) {
    try { [System.IO.File]::Delete($script:OutputFullPath + '.part') } catch { $null = $_ }
  }
  Clear-LensVariables
}
exit 0
