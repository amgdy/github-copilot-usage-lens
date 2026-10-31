#!/usr/bin/env bash
#
# GitHub Copilot Usage Lens: data collector for macOS and Linux.
#
# The AI usage report shows who used which model and what it cost. It does not show your seats and seat types, seat
# changes, budgets, cost centers, members, or the activity that is not billed, such as code completions. This script
# reads that data from GitHub with the GitHub CLI (gh) and saves it in one file. For an enterprise, the file holds the
# AI usage report too, so you drop only this file on GitHub Copilot Usage Lens.
#
# It reads and changes no settings on GitHub. When there is no recent AI usage report, it asks GitHub to make one, as
# the billing page does. The file stays on this computer.
#
#   bash scripts/collect.sh            asks what to collect
#   bash scripts/collect.sh --help     shows every option
#
# Or run it straight from GitHub, with no download:
#
#   curl -fsSL https://raw.githubusercontent.com/amgdy/github-copilot-usage-lens/main/scripts/collect.sh | bash
#
# Needs bash 3.2 or later (the macOS default) and the GitHub CLI (https://cli.github.com).
# On Windows, use scripts/collect.ps1. Both scripts write the same file format.

if [ -z "${BASH_VERSION:-}" ]; then
  echo "Run this script with bash: bash scripts/collect.sh" >&2
  exit 2
fi

COLLECTOR_VERSION="1.0.0"
FORMAT_NAME="github-copilot-usage-lens-data"
FORMAT_VERSION=1
API_VERSION="2026-03-10"
MIN_GH_MAJOR=2
MIN_GH_MINOR=40
# The usage metrics reports start on this day and keep one year of history.
METRICS_FIRST_DAY="2025-10-10"
MAX_MONTHS=24
MAX_PAGES=200
# Seconds to wait before trying a busy request again: this, then four times this.
RETRY_SECONDS="${USAGE_LENS_RETRY_SECONDS:-5}"
# How long to wait for GitHub to make the AI usage reports, and how often to ask. GitHub needs about three minutes.
REPORT_WAIT_SECONDS="${USAGE_LENS_REPORT_WAIT_SECONDS:-900}"
REPORT_POLL_SECONDS="${USAGE_LENS_REPORT_POLL_SECONDS:-20}"
# Lines of the AI usage report in each record of the file.
REPORT_CHUNK_LINES=1000
ALL_SOURCES="usage-report organizations seats seat-summary members teams budgets cost-centers ai-credit-usage usage-summary billing-usage user-metrics scope-metrics user-teams audit-log"
ENTERPRISE_SCOPES="read:enterprise manage_billing:copilot manage_billing:enterprise read:org read:audit_log"
ORGANIZATION_SCOPES="read:org manage_billing:copilot read:audit_log"

host="${GH_HOST:-github.com}"
enterprise=""
organizations=""
months=""
output=""
skip_sources=""
only_sources=""
with_teams=""
daily_metrics=""
plain="no"
assume_yes="no"
interactive="no"

work=""
bundle=""
gh_version=""
version_args=()
token_scopes=""
scopes_known="no"
last_http=0
records_total=0
usage_report_records=0
usage_report_months=0
context_scope=""
context_target=""
context_month=""
context_parent=""
report_day=""
month_keys=""
window_start=""

if [ -t 1 ] && [ -z "${NO_COLOR:-}" ] && [ "${TERM:-}" != "dumb" ]; then
  bold=$'\033[1m'
  dim=$'\033[2m'
  red=$'\033[31m'
  green=$'\033[32m'
  yellow=$'\033[33m'
  reset=$'\033[0m'
else
  bold=""
  dim=""
  red=""
  green=""
  yellow=""
  reset=""
fi

say() { printf '%s\n' "$*"; }
note() { printf '%s%s%s\n' "$dim" "$*" "$reset"; }
warn() { printf '%s%s%s\n' "$yellow" "$*" "$reset"; }
fail() {
  printf '%sError:%s %s\n' "$red" "$reset" "$*" >&2
  exit 1
}

show_help() {
  cat <<'EOF'
GitHub Copilot Usage Lens: data collector

Reads the GitHub data that the AI usage report does not have: GitHub Copilot seats and seat types, seat totals and
policies, members, budgets, cost centers, monthly billing, activity per user (including code completions) and seat
changes from the audit log. For an enterprise, it adds the AI usage report of each month too. Saves it all in one file
for GitHub Copilot Usage Lens. It changes no settings on GitHub. When there is no recent AI usage report, it asks
GitHub to make one, as the billing page does.

Usage:
  bash scripts/collect.sh [options]

To run it straight from GitHub, with no download, put the options after "bash -s --":
  curl -fsSL https://raw.githubusercontent.com/amgdy/github-copilot-usage-lens/main/scripts/collect.sh | bash -s -- [options]

With no options, the script asks what to collect.

Options:
  -e, --enterprise SLUG   Collect an enterprise. You must be an enterprise owner or billing manager.
  -o, --org NAME          Collect an organization. Repeat it, or separate names with commas, for more than one.
                          With --enterprise, only these organizations get their own details.
  -m, --months N          Months of billing data and audit events, counting this month (1 to 24, default 3).
      --daily-metrics     Collect the activity of every day in those months, not only the last 28 days.
                          Older months are then exact, but it takes longer and the file is larger.
      --teams             Also collect the members of every team. It sends one request per team.
      --hostname HOST     Your GitHub host, for example octocorp.ghe.com. The default is github.com.
      --output FILE       Where to save the file. The default is usage-lens-data-NAME-TIME.ndjson.gz here.
      --plain             Save plain NDJSON text (.ndjson) instead of a compressed file.
      --skip LIST         Sources to leave out, separated by commas. See --list-sources.
      --only LIST         Collect only these sources, separated by commas.
      --list-sources      Show every source and the access it needs, then stop.
  -y, --yes               Ask nothing. Use the options as given.
  -h, --help              Show this help.
      --version           Show the version of this script.

Examples:
  bash scripts/collect.sh --enterprise octocorp
  bash scripts/collect.sh --org octo-org --org octo-labs --months 6
  bash scripts/collect.sh --enterprise octocorp --hostname octocorp.ghe.com --yes

The file holds GitHub logins and activity. Keep it safe and delete it when you are done.
EOF
}

show_sources() {
  cat <<'EOF'
Source            What it reads                                              Who can read it (token scope)
usage-report      The AI usage report (CSV) of each month, enterprises only  enterprise owner or billing manager (manage_billing:enterprise)
organizations     Organizations in the enterprise                            enterprise owner (read:enterprise)
seats             GitHub Copilot seats: user, plan, start, last activity     owner or billing manager (manage_billing:copilot)
seat-summary      Seat totals and GitHub Copilot policies per organization   organization owner (read:org)
members           Members of each organization                               organization member (read:org)
teams             Members of each team, only with --teams                    organization member (read:org, read:enterprise)
budgets           Budgets, their amounts and what is used                    owner or billing manager (manage_billing:enterprise)
cost-centers      Cost centers and who is in them                            enterprise owner or billing manager (manage_billing:enterprise)
ai-credit-usage   AI credits billed per month, by product, SKU and model     owner or billing manager (manage_billing:enterprise)
usage-summary     Billing summary per month for every product                owner or billing manager (manage_billing:enterprise)
billing-usage     Daily GitHub Copilot charges                               owner or billing manager (manage_billing:enterprise)
user-metrics      Activity per user and day, including code completions      owner or billing manager (manage_billing:copilot, read:org)
scope-metrics     Activity totals per day                                    the same as user-metrics
user-teams        Teams of each GitHub Copilot user                          the same as user-metrics
audit-log         Seat, plan, policy and budget changes                      owner (read:audit_log)

For organizations, the billing sources need an organization owner or billing manager. The activity sources need the
usage metrics policy for GitHub Copilot set to "Enabled everywhere".

usage-report uses a report from the last 31 days when one covers the month. Otherwise it asks GitHub to make one,
which takes a few minutes and adds the report to the billing page. It changes no settings.
EOF
}

# ---------------------------------------------------------------------------------------------------------------------
# Options

add_organizations() {
  local name
  set -f
  for name in $(printf '%s' "$1" | tr ',' ' '); do
    case " $organizations " in
      *" $name "*) ;;
      *) organizations="${organizations:+$organizations }$name" ;;
    esac
  done
  set +f
}

as_words() {
  printf ' %s' "$(printf '%s' "$1" | tr ',' ' ')"
}

need_value() {
  if [ "$#" -lt 2 ] || [ -z "$2" ]; then
    fail "$1 needs a value. Run with --help to see the options."
  fi
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    -e | --enterprise) need_value "$@"; enterprise="$2"; shift 2 ;;
    --enterprise=*) enterprise="${1#*=}"; shift ;;
    -o | --org | --organization) need_value "$@"; add_organizations "$2"; shift 2 ;;
    --org=* | --organization=*) add_organizations "${1#*=}"; shift ;;
    -m | --months) need_value "$@"; months="$2"; shift 2 ;;
    --months=*) months="${1#*=}"; shift ;;
    --daily-metrics) daily_metrics="yes"; shift ;;
    --teams) with_teams="yes"; shift ;;
    --hostname) need_value "$@"; host="$2"; shift 2 ;;
    --hostname=*) host="${1#*=}"; shift ;;
    --output) need_value "$@"; output="$2"; shift 2 ;;
    --output=*) output="${1#*=}"; shift ;;
    --plain) plain="yes"; shift ;;
    --skip) need_value "$@"; skip_sources="$skip_sources$(as_words "$2")"; shift 2 ;;
    --skip=*) skip_sources="$skip_sources$(as_words "${1#*=}")"; shift ;;
    --only) need_value "$@"; only_sources="$only_sources$(as_words "$2")"; shift 2 ;;
    --only=*) only_sources="$only_sources$(as_words "${1#*=}")"; shift ;;
    --list-sources) show_sources; exit 0 ;;
    -y | --yes) assume_yes="yes"; shift ;;
    -h | --help) show_help; exit 0 ;;
    --version) say "collect.sh $COLLECTOR_VERSION"; exit 0 ;;
    *) fail "Unknown option: $1. Run with --help to see the options." ;;
  esac
done

valid_name() {
  case "$1" in
    "" | -* | *[!A-Za-z0-9_.-]*) return 1 ;;
  esac
  return 0
}

check_source_names() {
  local name
  set -f
  for name in $1; do
    case " $ALL_SOURCES " in
      *" $name "*) ;;
      *) set +f; fail "Unknown source: $name. Run with --list-sources to see them." ;;
    esac
  done
  set +f
}

check_options() {
  local name
  if [ -n "$enterprise" ] && ! valid_name "$enterprise"; then
    fail "The enterprise slug \"$enterprise\" is not valid. Use the name from the enterprise URL."
  fi
  for name in $organizations; do
    valid_name "$name" || fail "The organization name \"$name\" is not valid."
  done
  if [ -n "$months" ]; then
    case "$months" in
      *[!0-9]*) fail "--months needs a number from 1 to $MAX_MONTHS." ;;
    esac
    months=$((10#$months))
    if [ "$months" -lt 1 ] || [ "$months" -gt "$MAX_MONTHS" ]; then
      fail "--months needs a number from 1 to $MAX_MONTHS."
    fi
  fi
  case "$RETRY_SECONDS" in
    "" | *[!0-9]*) RETRY_SECONDS=5 ;;
  esac
  case "$REPORT_WAIT_SECONDS" in
    "" | *[!0-9]*) REPORT_WAIT_SECONDS=900 ;;
  esac
  case "$REPORT_POLL_SECONDS" in
    "" | *[!0-9]*) REPORT_POLL_SECONDS=20 ;;
  esac
  check_source_names "$skip_sources"
  check_source_names "$only_sources"
  case " $only_sources " in
    *" teams "*) with_teams="yes" ;;
  esac
  host=$(printf '%s' "$host" | tr '[:upper:]' '[:lower:]')
  host="${host#http://}"
  host="${host#https://}"
  host="${host%%/*}"
  host="${host#api.}"
  case "$host" in
    "" | *[!a-z0-9.-]*) fail "The host name \"$host\" is not valid. Use a name such as github.com or octocorp.ghe.com." ;;
  esac
}

# ---------------------------------------------------------------------------------------------------------------------
# Small helpers. Dates use plain arithmetic, so the script works the same with the GNU, BSD and BusyBox tools.

json_text() {
  local value
  value=$(printf '%s' "$1" | tr '\000-\037' ' ')
  value=${value//\\/\\\\}
  value=${value//\"/\\\"}
  printf '"%s"' "$value"
}

json_list() {
  local item list=""
  set -f
  for item in $1; do
    list="${list:+$list,}$(json_text "$item")"
  done
  set +f
  printf '[%s]' "$list"
}

count_text() {
  if [ "$1" -eq 1 ]; then
    printf '1 item'
  else
    printf '%s items' "$1"
  fi
}

days_in_month() {
  local year="$1" month=$((10#$2))
  case "$month" in
    2)
      if [ $((year % 4)) -eq 0 ] && { [ $((year % 100)) -ne 0 ] || [ $((year % 400)) -eq 0 ]; }; then
        printf '29'
      else
        printf '28'
      fi
      ;;
    4 | 6 | 9 | 11) printf '30' ;;
    *) printf '31' ;;
  esac
}

# Prints the date that is $2 days (1 or -1) after the YYYY-MM-DD date in $1.
shift_day() {
  local year=$((10#${1%%-*})) rest="${1#*-}" month day
  month=$((10#${rest%%-*}))
  day=$((10#${rest#*-} + $2))
  if [ "$day" -lt 1 ]; then
    month=$((month - 1))
    if [ "$month" -lt 1 ]; then
      month=12
      year=$((year - 1))
    fi
    day=$(days_in_month "$year" "$month")
  elif [ "$day" -gt "$(days_in_month "$year" "$month")" ]; then
    day=1
    month=$((month + 1))
    if [ "$month" -gt 12 ]; then
      month=1
      year=$((year + 1))
    fi
  fi
  printf '%04d-%02d-%02d' "$year" "$month" "$day"
}

# Sets month_keys (YYYY-MM, oldest first, ending with this month) and window_start (the first day of the oldest month).
build_months() {
  local year=$((10#${today%%-*})) rest="${today#*-}" month count=0 list=""
  month=$((10#${rest%%-*}))
  while [ "$count" -lt "$months" ]; do
    list="$(printf '%04d-%02d' "$year" "$month")${list:+ $list}"
    month=$((month - 1))
    if [ "$month" -lt 1 ]; then
      month=12
      year=$((year - 1))
    fi
    count=$((count + 1))
  done
  month_keys="$list"
  window_start="${list%% *}-01"
}

# The first day with activity data in the chosen months. The reports start on METRICS_FIRST_DAY and keep one year.
metrics_start_day() {
  local first="$window_start" year_ago
  year_ago=$(shift_day "$((10#${today%%-*} - 1))-${today#*-}" 1)
  if [[ "$first" < "$METRICS_FIRST_DAY" ]]; then
    first="$METRICS_FIRST_DAY"
  fi
  if [[ "$first" < "$year_ago" ]]; then
    first="$year_ago"
  fi
  printf '%s' "$first"
}

# ---------------------------------------------------------------------------------------------------------------------
# Progress and results

# Each request adds one line to status.tsv (for the summary) and one "source" line to the file (for the app).
add_status() {
  local source_id="$1" status="$2" records="$3" http="${4:-0}" message="$5" endpoint="$6" month_part=""
  message=$(printf '%s' "$message" | tr '\t\r\n' '   ')
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "$source_id" "$status" "$records" "$http" "$context_target" \
    "$context_month" "$message" >>"$work/status.tsv"
  if [ -n "$context_month" ]; then
    month_part="\"month\":\"$context_month\","
  fi
  printf '{"kind":"source","id":"%s","scope":"%s","target":"%s",%s"status":"%s","records":%s,"http":%s,"message":%s,"endpoint":%s}\n' \
    "$source_id" "$context_scope" "$context_target" "$month_part" "$status" "$records" "$http" \
    "$(json_text "$message")" "$(json_text "$endpoint")" >>"$work/sources.ndjson"
  step_records=$((step_records + records))
  case "$status" in
    ok) step_ok=$((step_ok + 1)) ;;
    partial) step_partial=$((step_partial + 1)) ;;
    failed) step_failed=$((step_failed + 1)) ;;
    *) step_skipped=$((step_skipped + 1)) ;;
  esac
  if [ "$status" = partial ] || [ "$status" = failed ]; then
    if [ -z "$step_error" ]; then
      step_http="$http"
      step_error="$message"
    fi
  fi
}

begin_step() {
  step_records=0
  step_ok=0
  step_partial=0
  step_failed=0
  step_skipped=0
  step_http=""
  step_error=""
  printf '  %-38s ' "$1"
}

failure_text() {
  if [ -n "$step_http" ] && [ "$step_http" != 0 ]; then
    printf '(HTTP %s: %s)' "$step_http" "$step_error"
  else
    printf '(%s)' "${step_error:-unknown error}"
  fi
}

end_step() {
  local calls=$((step_ok + step_partial + step_failed))
  if [ "$calls" -eq 0 ]; then
    say "${dim}skipped${reset}"
  elif [ "$step_failed" -eq 0 ] && [ "$step_partial" -eq 0 ]; then
    say "${green}$(count_text "$step_records")${reset}"
  elif [ "$step_ok" -eq 0 ] && [ "$step_partial" -eq 0 ]; then
    say "${red}not available${reset} ${dim}$(failure_text)${reset}"
  else
    say "${yellow}$(count_text "$step_records"), $((step_failed + step_partial)) of $calls requests failed${reset} ${dim}$(failure_text)${reset}"
  fi
}

# True when every request of this step failed because of access, so the next months or days would fail too.
no_access_yet() {
  [ "$step_ok" -eq 0 ] && [ "$step_partial" -eq 0 ] && [ "$step_failed" -gt 0 ] || return 1
  case "$last_http" in
    401 | 403 | 404 | 410) return 0 ;;
  esac
  return 1
}

# ---------------------------------------------------------------------------------------------------------------------
# Talking to GitHub. Every call goes through "gh api", so gh handles sign-in, the host and paging.

# jq helper used by every filter: wraps a record with its kind and where it came from.
JQ_WRAP='def wrap(kind): {kind: kind, scope: env.LENS_SCOPE, target: env.LENS_TARGET, record: .}
  + (if (env.LENS_MONTH // "") == "" then {} else {month: env.LENS_MONTH} end)
  + (if (env.LENS_PARENT // "") == "" then {} else {parent: env.LENS_PARENT} end);'

# Runs "gh api" with the other arguments and writes what it prints to the file in $1. Tries again when GitHub is busy.
# Sets last_http (200 when it worked, 0 when unknown) and last_error.
run_gh() {
  local output_file="$1" attempt=1 exit_code wait_seconds
  shift
  while :; do
    LENS_SCOPE="$context_scope" LENS_TARGET="$context_target" LENS_MONTH="$context_month" \
      LENS_PARENT="$context_parent" gh api --hostname "$host" "${version_args[@]}" "$@" \
      >"$output_file" 2>"$work/stderr" </dev/null
    exit_code=$?
    if [ "$exit_code" -eq 0 ]; then
      last_http=200
      last_error=""
      return 0
    fi
    last_http=$(sed -n 's/.*(HTTP \([0-9][0-9][0-9]\)).*/\1/p' "$work/stderr" | tail -n 1)
    if [ -z "$last_http" ]; then
      last_http=0
    fi
    last_error=$(head -n 1 "$work/stderr" | tr -d '\r' | sed -e 's/^gh: //' -e 's/ (HTTP [0-9]*)$//' | cut -c 1-200)
    if [ -z "$last_error" ]; then
      last_error="gh stopped with exit code $exit_code"
    fi
    if [ "$attempt" -ge 3 ]; then
      return 1
    fi
    case "$last_http" in
      429 | 500 | 502 | 503 | 504) ;;
      403) grep -qi 'rate limit' "$work/stderr" || return 1 ;;
      0) grep -qiE 'timeout|timed out|connection reset|unexpected EOF|TLS handshake' "$work/stderr" || return 1 ;;
      *) return 1 ;;
    esac
    wait_seconds=$((attempt * attempt * RETRY_SECONDS))
    printf '%s(busy, waiting %s s)%s ' "$dim" "$wait_seconds" "$reset"
    sleep "$wait_seconds"
    attempt=$((attempt + 1))
  done
}

# Moves the record lines of a gh output file into the bundle. Sets kept to their number.
keep_records() {
  kept=$(grep -c '^[{]"kind":"' "$1" 2>/dev/null)
  kept=${kept:-0}
  if [ "$kept" -gt 0 ]; then
    grep '^[{]"kind":"' "$1" >>"$work/records.ndjson"
    records_total=$((records_total + kept))
  fi
}

# Prints the values of control lines such as "#org octo-org" that a filter printed next to the records.
control_lines() {
  sed -n "s/^#$2 //p" "$1"
}

# fetch SOURCE ENDPOINT FILTER [more gh options]
# Reads one endpoint (every page with --paginate) and keeps the records that the filter makes. When a later page
# fails, the records of the pages before it are kept and the source is marked "partial".
fetch() {
  local source_id="$1" endpoint="$2" filter="$3"
  shift 3
  if run_gh "$work/out" "$endpoint" --jq "$JQ_WRAP $filter" "$@"; then
    keep_records "$work/out"
    add_status "$source_id" ok "$kept" 200 "" "$endpoint"
    return 0
  fi
  keep_records "$work/out"
  if [ "$kept" -gt 0 ]; then
    add_status "$source_id" partial "$kept" "$last_http" "$last_error" "$endpoint"
  else
    add_status "$source_id" failed 0 "$last_http" "$last_error" "$endpoint"
  fi
  return 1
}

# fetch_pages SOURCE ENDPOINT FILTER
# For endpoints that page with ?page=N and has_next_page (budgets). The filter prints "#more" when there is a next page.
# Other control lines are saved in $work/control.
fetch_pages() {
  local source_id="$1" endpoint="$2" filter="$3" page=1 total=0 separator="?"
  case "$endpoint" in
    *\?*) separator="&" ;;
  esac
  : >"$work/control"
  while [ "$page" -le "$MAX_PAGES" ]; do
    if ! run_gh "$work/out" "$endpoint${separator}per_page=100&page=$page" --jq "$JQ_WRAP $filter"; then
      keep_records "$work/out"
      total=$((total + kept))
      if [ "$total" -gt 0 ]; then
        add_status "$source_id" partial "$total" "$last_http" "$last_error" "$endpoint"
      else
        add_status "$source_id" failed 0 "$last_http" "$last_error" "$endpoint"
      fi
      return 1
    fi
    keep_records "$work/out"
    total=$((total + kept))
    grep '^#' "$work/out" | grep -v '^#more$' >>"$work/control"
    grep -q '^#more$' "$work/out" || break
    page=$((page + 1))
  done
  add_status "$source_id" ok "$total" 200 "" "$endpoint"
  return 0
}

# Downloads a report file. Only https links are followed. The links are signed, so no token is sent with them.
download() {
  case "$1" in
    https://*) ;;
    *) return 1 ;;
  esac
  if command -v curl >/dev/null 2>&1; then
    curl --fail --silent --show-error --location --proto '=https' --proto-redir '=https' --retry 2 \
      --connect-timeout 30 --output "$2" "$1" 2>"$work/download-error"
  elif command -v wget >/dev/null 2>&1; then
    wget -q -O "$2" "$1" 2>"$work/download-error"
  else
    printf 'Install curl or wget to download the activity reports.' >"$work/download-error"
    return 1
  fi
}

# Adds every JSON line of a report file as one record. A file that is not one object per line becomes one record.
wrap_report_lines() {
  local kind="$1" file="$2" first
  first=$(awk '{ sub(/\r$/, "") } NF { sub(/^[ \t]+/, ""); sub(/[ \t]+$/, ""); print; exit }' "$file")
  wrapped=0
  case "$first" in
    "") return 0 ;;
    "{"*"}")
      awk -v kind="$kind" -v scope="$context_scope" -v target="$context_target" -v counter="$work/count" '
        { sub(/\r$/, "") }
        /^[ \t]*[{]/ {
          printf "{\"kind\":\"%s\",\"scope\":\"%s\",\"target\":\"%s\",\"record\":%s}\n", kind, scope, target, $0
          lines++
        }
        END { print lines + 0 > counter }
      ' "$file" >>"$work/records.ndjson"
      wrapped=$(cat "$work/count")
      ;;
    *)
      {
        printf '{"kind":"%s","scope":"%s","target":"%s","record":' "$kind" "$context_scope" "$context_target"
        tr '\r\n' '  ' <"$file"
        printf '}\n'
      } >>"$work/records.ndjson"
      wrapped=1
      ;;
  esac
  records_total=$((records_total + wrapped))
}

# fetch_report SOURCE KIND ENDPOINT [daily]
# Asks for a usage metrics report and downloads its files. Sets report_first_day and report_last_day when GitHub
# says which days the report covers. For a daily report, "not found" means there is no report for that day.
fetch_report() {
  local source_id="$1" kind="$2" endpoint="$3" link magic count=0
  report_first_day=""
  report_last_day=""
  if ! run_gh "$work/report" "$endpoint" \
    --jq '(.download_links // [])[], "#first \(.report_start_day // .report_day // "")", "#last \(.report_end_day // .report_day // "")"'; then
    if [ "${4:-}" = daily ] && [ "$last_http" = 404 ]; then
      add_status "$source_id" skipped 0 404 "No report for this day." "$endpoint"
    else
      add_status "$source_id" failed 0 "$last_http" "$last_error" "$endpoint"
    fi
    return 1
  fi
  report_first_day=$(control_lines "$work/report" first | head -n 1)
  report_last_day=$(control_lines "$work/report" last | head -n 1)
  grep '^https://' "$work/report" >"$work/links"
  while IFS= read -r link <&3; do
    rm -f "$work/download" "$work/report.txt"
    if ! download "$link" "$work/download"; then
      add_status "$source_id" failed "$count" 0 \
        "Could not download the report file: $(head -n 1 "$work/download-error" 2>/dev/null)" "$endpoint"
      return 1
    fi
    magic=$(head -c 2 "$work/download" | od -An -tx1 | tr -d ' \n')
    if [ "$magic" = "1f8b" ]; then
      if ! gzip -dc "$work/download" >"$work/report.txt"; then
        add_status "$source_id" failed "$count" 0 "Could not unpack the report file." "$endpoint"
        return 1
      fi
    else
      mv "$work/download" "$work/report.txt"
    fi
    wrap_report_lines "$kind" "$work/report.txt"
    count=$((count + wrapped))
  done 3<"$work/links"
  rm -f "$work/download" "$work/report.txt"
  add_status "$source_id" ok "$count" 200 "" "$endpoint"
  return 0
}

# ---------------------------------------------------------------------------------------------------------------------
# What to keep from each source. Seats and audit events keep only the fields the app needs: no names, emails or avatars.

SEAT_FILTER='((.seats // [])[] | {
    assignee: (.assignee | if type == "object" then ({login, type, slug} | with_entries(select(.value != null))) else null end),
    organization: (.organization | if type == "object" then {login} else null end),
    assigning_team: (.assigning_team | if type == "object" then {slug, name} else null end),
    plan_type, created_at, updated_at, pending_cancellation_date, last_activity_at, last_activity_editor,
    last_authenticated_at
  } | wrap("seat")), "#total \(.total_seats // "")"'

SEAT_SUMMARY_FILTER='wrap("seat-summary")'

ORGANIZATIONS_QUERY='query($slug: String!, $endCursor: String) {
  enterprise(slug: $slug) {
    organizations(first: 100, after: $endCursor) {
      pageInfo { hasNextPage endCursor }
      nodes { login name }
    }
  }
}'
ORGANIZATIONS_FILTER='(.data.enterprise.organizations.nodes // [])[] | ({login, name} | wrap("organization")), "#org \(.login)"'

ENTERPRISE_MEMBERS_QUERY='query($slug: String!, $endCursor: String) {
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
}'
ENTERPRISE_MEMBERS_FILTER='(.data.enterprise.members.nodes // [])[] | {login: (.user.login // .login), type: .__typename}
  | select(.login != null) | wrap("member")'

ORGANIZATION_MEMBERS_FILTER='.[] | {login, type} | wrap("member")'

BUDGET_FILTER='((.budgets // [])[] | . as $budget | del(.budget_alerting) + {
      budget_alerting: {
        will_alert: ($budget.budget_alerting.will_alert // false),
        recipients: (($budget.budget_alerting.alert_recipients // []) | length)
      }
    } | wrap("budget")),
  ((.budgets // [])[] | select((.budget_scope // "") | startswith("multi_user")) | "#users \(.id)"),
  (if .has_next_page == true then "#more" else empty end)'

BUDGET_USERS_FILTER='((.user_states // [])[] | wrap("budget-user")), (if .has_next_page == true then "#more" else empty end)'

COST_CENTER_FILTER='(.costCenters // .cost_centers // [])[] | del(.azure_subscription) | wrap("cost-center")'

AI_CREDIT_FILTER='(.usageItems // [])[] | wrap("ai-credit-usage")'

USAGE_SUMMARY_FILTER='(.usageItems // [])[]
  | select(((.product // "") + " " + (.sku // "")) | test("copilot|ai.?credit"; "i")) | wrap("usage-summary")'

BILLING_USAGE_FILTER='(.usageItems // [])[]
  | select(((.product // "") + " " + (.sku // "")) | test("copilot|ai.?credit"; "i")) | wrap("billing-usage")'

AUDIT_FILTER='.[] | ((if (.data | type) == "object" then .data else {} end) + .) | {
    action, "@timestamp": .["@timestamp"], created_at, actor, actor_is_agent, user, org, business, team,
    operation_type, owner, owner_type, plan, old_plan, seat_assignment, reason, old_value, new_value, previous_value,
    target_login, target_amount, target_type, budget_limit_type, pricing_target_type, status
  } | with_entries(select(.value != null)) | wrap("audit-event")'

TEAMS_FILTER='.[] | ({slug, name} | wrap("team")), "#team \(.slug)"'

# One line per AI usage report on the billing page: id, first day, last day and status.
REPORT_LIST_FILTER='(.usage_report_exports // [])[] | select(.report_type == "ai_credit")
  | "#report \(.id)\t\((.start_date // "")[0:10])\t\((.end_date // "")[0:10])\t\(.status // "")"'

REPORT_STATUS_FILTER='"#status \(.status // "")", ((.download_urls // [])[])'

TEAM_MEMBERS_FILTER='.[] | {login: (.login // .user.login)} | select(.login != null) | wrap("team-member")'

# ---------------------------------------------------------------------------------------------------------------------
# Collecting

select_sources() {
  local name list=""
  for name in $ALL_SOURCES; do
    if [ -n "$only_sources" ]; then
      case " $only_sources " in
        *" $name "*) ;;
        *) continue ;;
      esac
    else
      case " $skip_sources " in
        *" $name "*) continue ;;
      esac
      if [ "$name" = teams ] && [ "$with_teams" != yes ]; then
        continue
      fi
    fi
    list="${list:+$list }$name"
  done
  selected_sources="$list"
}

wants() {
  case " $selected_sources " in
    *" $1 "*) return 0 ;;
  esac
  return 1
}

set_context() {
  context_scope="$1"
  context_target="$2"
  context_month=""
  context_parent=""
}

mark_skipped_sources() {
  local name
  for name in $ALL_SOURCES; do
    if ! wants "$name"; then
      if [ "$name" = teams ]; then
        add_status "$name" skipped 0 0 "Not selected. Add --teams to read team members." ""
      else
        add_status "$name" skipped 0 0 "Not selected." ""
      fi
    elif [ -z "$enterprise" ] && { [ "$name" = organizations ] || [ "$name" = cost-centers ] || [ "$name" = usage-report ]; }; then
      add_status "$name" skipped 0 0 "Only for enterprises." ""
    fi
  done
}

add_seat_total() {
  local total
  total=$(control_lines "$work/out" total | tail -n 1)
  case "$total" in
    "" | *[!0-9]*) return 0 ;;
  esac
  printf '{"kind":"seat-total","scope":"%s","target":"%s","record":{"total_seats":%s}}\n' \
    "$context_scope" "$context_target" "$total" >>"$work/records.ndjson"
  records_total=$((records_total + 1))
}

collect_seats() {
  begin_step "GitHub Copilot seats"
  fetch seats "$1" "$SEAT_FILTER" --paginate
  add_seat_total
  end_step
}

collect_budgets() {
  local endpoint="$1" with_users="$2" line budget_id
  begin_step "Budgets"
  if fetch_pages budgets "$endpoint" "$BUDGET_FILTER" && [ "$with_users" = yes ]; then
    cp "$work/control" "$work/budget-ids"
    while IFS= read -r line <&3; do
      budget_id="${line#\#users }"
      case "$budget_id" in
        "$line" | "" | *[!A-Za-z0-9_-]*) continue ;;
      esac
      context_parent="$budget_id"
      fetch_pages budgets "$endpoint/$budget_id/user-states" "$BUDGET_USERS_FILTER"
      context_parent=""
    done 3<"$work/budget-ids"
  fi
  end_step
}

# collect_billing BASE: AI credits, the billing summary and daily charges for every chosen month.
collect_billing() {
  local base="$1" source_id label path filter month year month_number
  for source_id in ai-credit-usage usage-summary billing-usage; do
    wants "$source_id" || continue
    case "$source_id" in
      ai-credit-usage) label="AI credits billed per month"; path="ai_credit/usage"; filter="$AI_CREDIT_FILTER" ;;
      usage-summary) label="Billing summary per month"; path="usage/summary"; filter="$USAGE_SUMMARY_FILTER" ;;
      *) label="Daily GitHub Copilot charges"; path="usage"; filter="$BILLING_USAGE_FILTER" ;;
    esac
    begin_step "$label"
    for month in $month_keys; do
      context_month="$month"
      year="${month%-*}"
      month_number=$((10#${month#*-}))
      fetch "$source_id" "$base/$path?year=$year&month=$month_number" "$filter"
      if no_access_yet; then
        break
      fi
    done
    context_month=""
    end_step
  done
}

# Reads the latest 28-day activity report and, with --daily-metrics, the daily report of every earlier day in the
# chosen months. It goes back one day at a time and stops after three days in a row without a report.
collect_reports() {
  local source_id="$1" base="$2" daily_name="$3" latest_name="$4" label="$5" day first_day failures=0
  begin_step "$label"
  fetch_report "$source_id" "$source_id" "$base/$latest_name/latest"
  if [ -z "$latest_report_day" ]; then
    latest_report_day="$report_last_day"
  fi
  if [ "$daily_metrics" = yes ] && ! no_access_yet; then
    day="$report_first_day"
    if [ -z "$day" ]; then
      day="$today"
    fi
    day=$(shift_day "$day" -1)
    first_day=$(metrics_start_day)
    while ! [[ "$day" < "$first_day" ]]; do
      if fetch_report "$source_id" "$source_id" "$base/$daily_name?day=$day" daily; then
        failures=0
      else
        failures=$((failures + 1))
        if [ "$failures" -ge 3 ] || no_access_yet; then
          break
        fi
      fi
      day=$(shift_day "$day" -1)
    done
  fi
  end_step
}

collect_metrics() {
  local base="$1" level="$2" day
  latest_report_day=""
  if wants user-metrics; then
    collect_reports user-metrics "$base" users-1-day users-28-day "Activity per user"
  fi
  if wants scope-metrics; then
    collect_reports scope-metrics "$base" "$level-1-day" "$level-28-day" "Activity totals"
  fi
  if wants user-teams; then
    begin_step "Teams of GitHub Copilot users"
    day="$latest_report_day"
    if [ -z "$day" ]; then
      day=$(shift_day "$(shift_day "$today" -1)" -1)
    fi
    fetch_report user-teams user-teams "$base/user-teams-1-day?day=$day"
    end_step
  fi
}

collect_audit() {
  local endpoint="$1" topic
  begin_step "Audit log: seat and budget changes"
  for topic in copilot billing; do
    fetch audit-log "$endpoint" "$AUDIT_FILTER" --paginate --method GET \
      -f phrase="action:$topic created:>=$window_start"
    if no_access_yet; then
      break
    fi
  done
  end_step
}

# collect_teams TEAMS_ENDPOINT MEMBERS_PATH LABEL
collect_teams() {
  local endpoint="$1" members_path="$2" slug
  begin_step "$3"
  if fetch teams "$endpoint" "$TEAMS_FILTER" --paginate; then
    control_lines "$work/out" team >"$work/teams"
    while IFS= read -r slug <&3; do
      case "$slug" in
        "" | *[!A-Za-z0-9_.:-]*) continue ;;
      esac
      context_parent="$slug"
      fetch teams "$endpoint/$slug/$members_path" "$TEAM_MEMBERS_FILTER" --paginate
      context_parent=""
    done 3<"$work/teams"
  fi
  end_step
}

# Adds the lines of one AI usage report file (CSV) to $work/usage-chunks, REPORT_CHUNK_LINES lines per record. Each
# line becomes a JSON text, so the app can put the file back together. Sets usage_lines and usage_parts.
wrap_usage_report() {
  local month="$1" report_id="$2" file_number="$3" file="$4"
  tr '\000-\010\013\014\016-\037' ' ' <"$file" | awk -v scope="$context_scope" -v target="$context_target" \
    -v month="$month" -v report="$report_id" -v file_number="$file_number" -v size="$REPORT_CHUNK_LINES" \
    -v counter="$work/count" '
    function flush() {
      if (count == 0) return
      part++
      printf "{\"kind\":\"usage-report\",\"scope\":\"%s\",\"target\":\"%s\",\"month\":\"%s\",\"record\":{\"report\":\"%s\",\"file\":%d,\"part\":%d,\"lines\":[%s]}}\n", scope, target, month, report, file_number, part, body
      body = ""
      count = 0
    }
    {
      sub(/\r$/, "")
      gsub(/\\/, "&&")
      gsub(/"/, "\\\"")
      gsub(/\t/, "\\t")
      gsub(/\r/, "\\r")
      body = body (count > 0 ? "," : "") "\"" $0 "\""
      count++
      lines++
      if (count >= size) flush()
    }
    END {
      flush()
      print lines + 0, part + 0 > counter
    }
  ' >>"$work/usage-chunks"
  read -r usage_lines usage_parts <"$work/count"
}

# Finds the AI usage report of every chosen month on the billing page (GitHub keeps them for 31 days), or asks GitHub
# to make one. GitHub makes them while the other data is read, and read_usage_reports downloads them at the end.
request_usage_reports() {
  local base="$1" month first last month_end found report_id summary ready=0 asked=0
  : >"$work/usage-reports"
  report_requested_at=$(date +%s)
  begin_step "AI usage report"
  if ! run_gh "$work/report-list" "$base" --jq "$REPORT_LIST_FILTER"; then
    add_status usage-report failed 0 "$last_http" "$last_error" "$base"
    end_step
    return 1
  fi
  control_lines "$work/report-list" report >"$work/report-list.tsv"
  for month in $month_keys; do
    first="$month-01"
    month_end="$month-$(days_in_month "${month%-*}" "${month#*-}")"
    last="$month_end"
    if [[ "$last" > "$today" ]]; then
      last="$today"
    fi
    # A finished report first, then one GitHub is still making. It must cover the whole month and no other month.
    found=$(awk -F '\t' -v first="$first" -v last="$last" -v month_end="$month_end" '
      $2 == first && ($3 "") >= last && ($3 "") <= month_end {
        if ($4 == "completed") { print $1; done = 1; exit }
        if ($4 == "processing" && pick == "") pick = $1
      }
      END { if (!done && pick != "") print pick }
    ' "$work/report-list.tsv")
    case "$found" in
      "" | *[!A-Za-z0-9-]*) ;;
      *)
        printf '%s\t%s\n' "$month" "$found" >>"$work/usage-reports"
        ready=$((ready + 1))
        continue
        ;;
    esac
    context_month="$month"
    if run_gh "$work/created" "$base" --method POST -f report_type=ai_credit -f start_date="$first" \
      -f end_date="$last" --jq '.id // ""'; then
      report_id=$(head -n 1 "$work/created" | tr -d '\r')
      case "$report_id" in
        "" | *[!A-Za-z0-9-]*)
          add_status usage-report failed 0 0 "GitHub did not say which report it makes." "$base"
          ;;
        *)
          printf '%s\t%s\n' "$month" "$report_id" >>"$work/usage-reports"
          asked=$((asked + 1))
          ;;
      esac
    else
      add_status usage-report failed 0 "$last_http" "$last_error" "$base"
      if no_access_yet; then
        context_month=""
        break
      fi
    fi
    context_month=""
  done
  if [ ! -s "$work/usage-reports" ]; then
    end_step
    return 1
  fi
  summary="$ready found, $asked asked for"
  if [ "$step_failed" -gt 0 ]; then
    say "${yellow}$summary, $step_failed failed${reset} ${dim}$(failure_text)${reset}"
  else
    say "${green}$summary${reset} ${dim}(read at the end)${reset}"
  fi
  return 0
}

# Downloads every file of one finished AI usage report. Sets usage_rows. Nothing is kept unless every file worked.
download_usage_report() {
  local month="$1" report_id="$2" endpoint="$3" link magic file_number=0
  usage_rows=0
  : >"$work/usage-chunks"
  grep '^https://' "$work/report" >"$work/links"
  if [ ! -s "$work/links" ]; then
    add_status usage-report failed 0 0 "GitHub gave no file for this report." "$endpoint"
    return 1
  fi
  while IFS= read -r link <&3; do
    file_number=$((file_number + 1))
    rm -f "$work/download" "$work/report.txt"
    if ! download "$link" "$work/download"; then
      add_status usage-report failed 0 0 \
        "Could not download the report file: $(head -n 1 "$work/download-error" 2>/dev/null)" "$endpoint"
      return 1
    fi
    magic=$(head -c 2 "$work/download" | od -An -tx1 | tr -d ' \n')
    if [ "$magic" = "1f8b" ]; then
      if ! gzip -dc "$work/download" >"$work/report.txt"; then
        add_status usage-report failed 0 0 "Could not unpack the report file." "$endpoint"
        return 1
      fi
    else
      mv "$work/download" "$work/report.txt"
    fi
    wrap_usage_report "$month" "$report_id" "$file_number" "$work/report.txt"
    # The first line of each file names the columns.
    if [ "$usage_lines" -gt 0 ]; then
      usage_rows=$((usage_rows + usage_lines - 1))
    fi
    usage_report_records=$((usage_report_records + usage_parts))
  done 3<"$work/links"
  rm -f "$work/download" "$work/report.txt"
  cat "$work/usage-chunks" >>"$work/records.ndjson"
  records_total=$((records_total + $(grep -c '' "$work/usage-chunks")))
  add_status usage-report ok "$usage_rows" 200 "" "$endpoint"
  usage_report_months=$((usage_report_months + 1))
  return 0
}

# Waits until GitHub has made the AI usage reports, at most REPORT_WAIT_SECONDS after they were asked for, and
# downloads them. A report that is not ready by then is reported, and the next run uses it.
read_usage_reports() {
  local base="$1" month report_id state deadline waiting=no
  if [ ! -s "$work/usage-reports" ]; then
    return 0
  fi
  deadline=$((report_requested_at + REPORT_WAIT_SECONDS))
  cp "$work/usage-reports" "$work/usage-pending"
  begin_step "AI usage report"
  while :; do
    : >"$work/usage-waiting"
    while IFS="$(printf '\t')" read -r month report_id <&3; do
      context_month="$month"
      if ! run_gh "$work/report" "$base/$report_id" --jq "$REPORT_STATUS_FILTER"; then
        add_status usage-report failed 0 "$last_http" "$last_error" "$base/$report_id"
        continue
      fi
      state=$(control_lines "$work/report" status | head -n 1 | tr -d '\r')
      case "$state" in
        completed) download_usage_report "$month" "$report_id" "$base/$report_id" ;;
        processing) printf '%s\t%s\n' "$month" "$report_id" >>"$work/usage-waiting" ;;
        *) add_status usage-report failed 0 0 "GitHub could not make the report. Run the script again." "$base/$report_id" ;;
      esac
    done 3<"$work/usage-pending"
    context_month=""
    if [ ! -s "$work/usage-waiting" ]; then
      break
    fi
    if [ "$(date +%s)" -ge "$deadline" ]; then
      while IFS="$(printf '\t')" read -r month report_id <&3; do
        context_month="$month"
        add_status usage-report failed 0 0 \
          "GitHub is still making the report. Run the script again in a few minutes. It uses the same report." \
          "$base/$report_id"
      done 3<"$work/usage-waiting"
      context_month=""
      break
    fi
    if [ "$waiting" = no ]; then
      printf '%s(GitHub is making it, this takes a few minutes)%s ' "$dim" "$reset"
      waiting="yes"
    fi
    printf '%s.%s' "$dim" "$reset"
    sleep "$REPORT_POLL_SECONDS"
    mv -f "$work/usage-waiting" "$work/usage-pending"
  done
  if [ "$waiting" = yes ]; then
    printf ' '
  fi
  end_step
}

collect_enterprise() {
  local slug="$enterprise" found_organizations="" detail_organizations name
  set_context enterprise "$slug"
  say ""
  say "${bold}Enterprise $slug${reset}"
  if wants usage-report; then
    request_usage_reports "/enterprises/$slug/settings/billing/reports"
  fi
  if wants organizations; then
    begin_step "Organizations"
    fetch organizations graphql "$ORGANIZATIONS_FILTER" --paginate \
      -f query="$ORGANIZATIONS_QUERY" -f slug="$slug"
    found_organizations=$(control_lines "$work/out" org | tr '\n' ' ')
    end_step
  fi
  if wants seats; then
    collect_seats "/enterprises/$slug/copilot/billing/seats"
  fi
  if wants members; then
    begin_step "Enterprise members"
    fetch members graphql "$ENTERPRISE_MEMBERS_FILTER" --paginate \
      -f query="$ENTERPRISE_MEMBERS_QUERY" -f slug="$slug"
    end_step
  fi
  if wants budgets; then
    collect_budgets "/enterprises/$slug/settings/billing/budgets" yes
  fi
  if wants cost-centers; then
    begin_step "Cost centers"
    fetch cost-centers "/enterprises/$slug/settings/billing/cost-centers" "$COST_CENTER_FILTER"
    end_step
  fi
  collect_billing "/enterprises/$slug/settings/billing"
  collect_metrics "/enterprises/$slug/copilot/metrics/reports" enterprise
  if wants audit-log; then
    collect_audit "/enterprises/$slug/audit-log"
  fi
  if wants teams; then
    collect_teams "/enterprises/$slug/teams" memberships "Enterprise teams"
  fi
  if wants usage-report; then
    set_context enterprise "$slug"
    read_usage_reports "/enterprises/$slug/settings/billing/reports"
  fi

  # Seat totals, policies and teams of each organization. Without --org, every organization found above.
  detail_organizations="$organizations"
  if [ -z "$detail_organizations" ]; then
    detail_organizations="$found_organizations"
  fi
  if [ -z "$detail_organizations" ]; then
    detail_organizations=$(sed -n 's/.*"organization":{"login":"\([^"]*\)"}.*/\1/p' "$work/records.ndjson" | sort -u | tr '\n' ' ')
  fi
  if wants seat-summary || wants teams; then
    for name in $detail_organizations; do
      valid_name "$name" || continue
      set_context organization "$name"
      say "${bold}Organization $name${reset}"
      if wants seat-summary; then
        begin_step "Seat totals and policies"
        fetch seat-summary "/orgs/$name/copilot/billing" "$SEAT_SUMMARY_FILTER"
        end_step
      fi
      if wants teams; then
        collect_teams "/orgs/$name/teams" members "Teams"
      fi
    done
  fi
}

collect_organization() {
  local name="$1"
  set_context organization "$name"
  say ""
  say "${bold}Organization $name${reset}"
  if wants seat-summary; then
    begin_step "Seat totals and policies"
    fetch seat-summary "/orgs/$name/copilot/billing" "$SEAT_SUMMARY_FILTER"
    end_step
  fi
  if wants seats; then
    collect_seats "/orgs/$name/copilot/billing/seats"
  fi
  if wants members; then
    begin_step "Members"
    fetch members "/orgs/$name/members" "$ORGANIZATION_MEMBERS_FILTER" --paginate
    end_step
  fi
  if wants budgets; then
    collect_budgets "/organizations/$name/settings/billing/budgets" no
  fi
  collect_billing "/organizations/$name/settings/billing"
  collect_metrics "/orgs/$name/copilot/metrics/reports" organization
  if wants audit-log; then
    collect_audit "/orgs/$name/audit-log"
  fi
  if wants teams; then
    collect_teams "/orgs/$name/teams" members "Teams"
  fi
}

# ---------------------------------------------------------------------------------------------------------------------
# Setup and questions

ask() {
  local reply
  printf '%s ' "$1"
  if ! IFS= read -r reply; then
    say ""
    say "Stopped. Nothing was saved."
    exit 1
  fi
  answer="${reply:-$2}"
}

ask_yes_no() {
  local hint="[y/N]"
  if [ "$2" = y ]; then
    hint="[Y/n]"
  fi
  while :; do
    ask "$1 $hint" "$2"
    case "$answer" in
      [Yy] | [Yy][Ee][Ss]) return 0 ;;
      [Nn] | [Nn][Oo]) return 1 ;;
    esac
    say "Type y for yes or n for no."
  done
}

check_gh() {
  local major minor
  if ! command -v gh >/dev/null 2>&1; then
    say "${red}The GitHub CLI (gh) is not installed.${reset} Install it, then run this script again:"
    say "  macOS:  brew install gh"
    say "  Linux:  https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
    say "  More:   https://cli.github.com"
    exit 1
  fi
  gh_version=$(gh --version 2>/dev/null | sed -n 's/^gh version \([0-9][0-9.]*\).*/\1/p' | head -n 1)
  major="${gh_version%%.*}"
  minor="${gh_version#*.}"
  minor="${minor%%.*}"
  case "$major$minor" in
    "" | *[!0-9]*) return 0 ;;
  esac
  if [ "$major" -lt "$MIN_GH_MAJOR" ] || { [ "$major" -eq "$MIN_GH_MAJOR" ] && [ "$minor" -lt "$MIN_GH_MINOR" ]; }; then
    warn "Your GitHub CLI is version $gh_version. Please update to $MIN_GH_MAJOR.$MIN_GH_MINOR or later: https://cli.github.com"
  fi
}

# Prints the name of the variable that gh takes its token from, when one is set.
token_variable() {
  case "$host" in
    github.com | *.ghe.com)
      if [ -n "${GH_TOKEN:-}" ]; then
        printf 'GH_TOKEN'
      elif [ -n "${GITHUB_TOKEN:-}" ]; then
        printf 'GITHUB_TOKEN'
      fi
      ;;
    *)
      if [ -n "${GH_ENTERPRISE_TOKEN:-}" ]; then
        printf 'GH_ENTERPRISE_TOKEN'
      elif [ -n "${GITHUB_ENTERPRISE_TOKEN:-}" ]; then
        printf 'GITHUB_ENTERPRISE_TOKEN'
      fi
      ;;
  esac
}

check_login() {
  version_args=(-H "X-GitHub-Api-Version: $API_VERSION")
  api_version="$API_VERSION"
  set_context "" ""
  if ! run_gh "$work/user" user --include; then
    if [ "$last_http" = 400 ] || [ "$last_http" = 410 ]; then
      version_args=()
      api_version=""
      run_gh "$work/user" user --include
    fi
  fi
  if [ "$last_http" != 200 ]; then
    if [ "$last_http" = 401 ] || grep -qiE 'auth login|not logged|authenticat' "$work/stderr"; then
      say "${red}You are not signed in to $host with the GitHub CLI.${reset} Sign in, then run this script again:"
      say "  gh auth login --hostname $host"
      exit 1
    fi
    fail "Could not reach $host: $last_error"
  fi
  login=$(sed -n 's/.*"login"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$work/user" | head -n 1)
  token_scopes=""
  scopes_known="no"
  if grep -qi '^x-oauth-scopes:' "$work/user"; then
    scopes_known="yes"
    token_scopes=" $(grep -i '^x-oauth-scopes:' "$work/user" | head -n 1 | sed 's/^[^:]*:[[:space:]]*//' | tr -d '\r' | tr ',' ' ') "
  fi
}

find_accounts() {
  found_enterprises=""
  found_organizations=""
  set_context "" ""
  if run_gh "$work/accounts" graphql -f query='query { viewer {
      admin: enterprises(first: 100, membershipType: ADMIN) { nodes { slug } }
      billing: enterprises(first: 100, membershipType: BILLING_MANAGER) { nodes { slug } } } }' \
    --jq '[(.data.viewer.admin.nodes // [])[].slug, (.data.viewer.billing.nodes // [])[].slug] | unique | .[]'; then
    found_enterprises=$(tr '\n' ' ' <"$work/accounts")
  fi
  if run_gh "$work/accounts" user/memberships/orgs --paginate \
    --jq '.[] | select(.state == "active" and (.role == "admin" or .role == "billing_manager")) | .organization.login'; then
    found_organizations=$(tr '\n' ' ' <"$work/accounts")
  fi
}

choose_target() {
  local default_kind="o" suggestion hint name valid
  say ""
  note "Looking for the accounts you manage..."
  find_accounts
  if [ -n "$found_enterprises" ]; then
    say "Enterprises: ${found_enterprises% }"
    default_kind="e"
  fi
  if [ -n "$found_organizations" ]; then
    say "Organizations you own or manage billing for: ${found_organizations% }"
  fi
  say "Read data for an enterprise (e) or for one or more organizations (o)?"
  while :; do
    ask "Type e or o [$default_kind]:" "$default_kind"
    case "$answer" in
      [Ee]*) break ;;
      [Oo]*) break ;;
    esac
  done
  case "$answer" in
    [Ee]*)
      suggestion="${found_enterprises%% *}"
      hint=""
      if [ -n "$suggestion" ]; then
        hint=" [$suggestion]"
      fi
      while :; do
        ask "Enterprise slug, the NAME in github.com/enterprises/NAME$hint:" "$suggestion"
        if valid_name "$answer"; then
          enterprise="$answer"
          return 0
        fi
        say "Type the enterprise slug, for example octocorp."
      done
      ;;
  esac
  suggestion=$(printf '%s' "${found_organizations% }" | tr ' ' ',')
  hint=""
  if [ -n "$suggestion" ]; then
    hint=" [$suggestion]"
  fi
  while :; do
    ask "Organization names, separated by commas$hint:" "$suggestion"
    organizations=""
    add_organizations "$answer"
    valid="yes"
    for name in $organizations; do
      valid_name "$name" || valid="no"
    done
    if [ -n "$organizations" ] && [ "$valid" = yes ]; then
      return 0
    fi
    say "Type one or more organization names, for example octo-org,octo-labs."
  done
}

ask_options() {
  if [ -n "$enterprise" ] && [ -z "$only_sources" ]; then
    case " $skip_sources " in
      *" usage-report "*) ;;
      *)
        say ""
        say "This script can get the AI usage report too. Then this one file is all you need in the app."
        note "If there is no recent report, GitHub makes one, as the billing page does. This takes a few minutes."
        if ! ask_yes_no "Get the AI usage report?" y; then
          skip_sources="$skip_sources usage-report"
        fi
        ;;
    esac
  fi
  if [ -z "$months" ]; then
    while :; do
      ask "How many months of billing data and changes, from 1 to $MAX_MONTHS? [3]:" 3
      case "$answer" in
        *[!0-9]*) ;;
        *)
          if [ "${#answer}" -le 2 ] && [ $((10#$answer)) -ge 1 ] && [ $((10#$answer)) -le "$MAX_MONTHS" ]; then
            months=$((10#$answer))
            break
          fi
          ;;
      esac
      say "Type a number from 1 to $MAX_MONTHS."
    done
  fi
  if [ -z "$daily_metrics" ] && { wants user-metrics || wants scope-metrics; }; then
    daily_metrics="no"
    if ask_yes_no "Read the activity of every day in those months, not only the last 28 days? It takes longer." n; then
      daily_metrics="yes"
    fi
  fi
  if [ -z "$with_teams" ] && [ -z "$only_sources" ]; then
    case " $skip_sources " in
      *" teams "*) ;;
      *)
        with_teams="no"
        if ask_yes_no "Also read the members of every team? It sends one request per team." n; then
          with_teams="yes"
        fi
        ;;
    esac
  fi
}

needed_scopes() {
  local list=""
  if [ -n "$enterprise" ]; then
    if wants organizations || wants members || wants teams || wants user-metrics || wants scope-metrics || wants user-teams; then
      list="$list read:enterprise"
    fi
    if wants seats; then
      list="$list manage_billing:copilot"
    fi
    if wants usage-report || wants budgets || wants cost-centers || wants ai-credit-usage || wants usage-summary || wants billing-usage; then
      list="$list manage_billing:enterprise"
    fi
    if wants seat-summary || wants teams; then
      list="$list read:org"
    fi
  elif wants seat-summary || wants seats || wants members || wants teams || wants user-metrics || wants scope-metrics || wants user-teams; then
    list="$list read:org"
  fi
  if wants audit-log; then
    list="$list read:audit_log"
  fi
  printf '%s' "${list# }"
}

has_scope() {
  case "$token_scopes" in
    *" $1 "*) return 0 ;;
  esac
  case "$1" in
    read:org)
      case "$token_scopes" in
        *" admin:org "* | *" write:org "*) return 0 ;;
      esac
      ;;
    read:enterprise | manage_billing:enterprise)
      case "$token_scopes" in
        *" admin:enterprise "*) return 0 ;;
      esac
      ;;
  esac
  return 1
}

missing_scopes() {
  local scope list=""
  for scope in $(needed_scopes); do
    has_scope "$scope" || list="${list:+$list }$scope"
  done
  printf '%s' "$list"
}

check_scopes() {
  local missing variable scope_list
  if [ "$scopes_known" != yes ]; then
    note "Could not check what your token can read. If some data is missing, the summary says why."
    return 0
  fi
  missing=$(missing_scopes)
  if [ -z "$missing" ]; then
    return 0
  fi
  scope_list=$(printf '%s' "$missing" | tr ' ' ',')
  say ""
  warn "Your sign-in is missing these scopes: $missing"
  say "Without them, some data cannot be read."
  variable=$(token_variable)
  if [ -n "$variable" ]; then
    say "gh uses the token in $variable. Use a token with these scopes, or remove $variable and run:"
    say "  gh auth login --hostname $host --scopes $scope_list"
  elif [ "$interactive" = yes ]; then
    if ask_yes_no "Add them now? GitHub opens in your browser." y; then
      if gh auth refresh --hostname "$host" --scopes "$scope_list"; then
        check_login
        missing=$(missing_scopes)
        if [ -z "$missing" ]; then
          say "${green}Your sign-in has every scope now.${reset}"
          return 0
        fi
        warn "Still missing: $missing"
      fi
    fi
  else
    say "To add them, run:"
    say "  gh auth refresh --hostname $host --scopes $scope_list"
  fi
  if [ "$interactive" = yes ] && ! ask_yes_no "Continue without that data?" y; then
    say "Stopped. Nothing was saved."
    exit 0
  fi
}

prepare_output() {
  local name stamp extension=".ndjson.gz"
  if [ "$plain" != yes ] && ! command -v gzip >/dev/null 2>&1; then
    warn "gzip is not installed, so the file is saved as plain text."
    plain="yes"
    output="${output%.gz}"
  fi
  if [ "$plain" = yes ]; then
    extension=".ndjson"
  fi
  if [ -n "$enterprise" ]; then
    name="$enterprise"
  else
    case "$organizations" in
      *" "*) name="organizations" ;;
      *) name="$organizations" ;;
    esac
  fi
  stamp=$(date +%Y%m%d-%H%M%S)
  if [ -z "$output" ]; then
    output="usage-lens-data-$name-$stamp$extension"
  elif [ -d "$output" ]; then
    output="${output%/}/usage-lens-data-$name-$stamp$extension"
  fi
  if ! : >"$output.part" 2>/dev/null; then
    fail "Cannot write $output. Choose another place with --output."
  fi
  rm -f "$output.part"
}

confirm_plan() {
  local name shown=""
  for name in $selected_sources; do
    if [ -z "$enterprise" ] && { [ "$name" = organizations ] || [ "$name" = cost-centers ] || [ "$name" = usage-report ]; }; then
      continue
    fi
    shown="${shown:+$shown }$name"
  done
  say ""
  say "${bold}Ready to read${reset}"
  if [ -n "$enterprise" ]; then
    say "  Account:  enterprise $enterprise on $host"
  else
    say "  Account:  organizations $organizations on $host"
  fi
  say "  Months:   ${month_keys%% *} to ${month_keys##* }"
  say "  Sources:  $shown"
  if [ -n "$enterprise" ] && wants usage-report; then
    say "  Report:   the AI usage report of each month. GitHub makes it if there is no recent one."
  fi
  say "  File:     $output"
  if ! ask_yes_no "Start?" y; then
    say "Stopped. Nothing was saved."
    exit 0
  fi
}

# ---------------------------------------------------------------------------------------------------------------------
# The file and the summary

write_bundle() {
  local scope_name="organization" enterprise_json="null" version_json="null" daily_json="false" teams_json="false"
  if [ -n "$enterprise" ]; then
    scope_name="enterprise"
    enterprise_json=$(json_text "$enterprise")
  fi
  if [ -n "$api_version" ]; then
    version_json=$(json_text "$api_version")
  fi
  if [ "$daily_metrics" = yes ]; then
    daily_json="true"
  fi
  if wants teams; then
    teams_json="true"
  fi
  printf '{"kind":"header","format":"%s","version":%s,"collector":"collect.sh","collectorVersion":"%s","gh":%s,"host":%s,"scope":"%s","enterprise":%s,"organizations":%s,"months":%s,"sources":%s,"dailyMetrics":%s,"teams":%s,"apiVersion":%s,"startedAt":"%s"}\n' \
    "$FORMAT_NAME" "$FORMAT_VERSION" "$COLLECTOR_VERSION" "$(json_text "$gh_version")" "$(json_text "$host")" \
    "$scope_name" "$enterprise_json" "$(json_list "$organizations")" "$(json_list "$month_keys")" \
    "$(json_list "$selected_sources")" "$daily_json" "$teams_json" "$version_json" "$started_at"
  cat "$work/records.ndjson" "$work/sources.ndjson"
  printf '{"kind":"end","finishedAt":"%s","records":%s}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$records_total"
}

save_bundle() {
  if [ "$plain" = yes ]; then
    write_bundle >"$output.part" || fail "Could not write $output."
  else
    write_bundle | gzip -c >"$output.part" || fail "Could not write $output."
  fi
  mv -f "$output.part" "$output" || fail "Could not save $output."
}

size_text() {
  local bytes
  bytes=$(wc -c <"$1" | tr -d ' ')
  awk -v bytes="$bytes" 'BEGIN {
    if (bytes >= 1048576) printf "%.1f MB", bytes / 1048576
    else if (bytes >= 1024) printf "%.0f KB", bytes / 1024
    else printf "%d bytes", bytes
  }'
}

print_summary() {
  say ""
  say "${bold}Summary${reset}"
  awk -F '\t' -v order="$ALL_SOURCES" -v host="$host" '
    function hint(source, code, message) {
      if (code == 401) return "Sign in again: gh auth login --hostname " host
      if (source ~ /metrics|user-teams/ && (code == 403 || code == 404))
        return "Needs an owner or billing manager, and the usage metrics policy for GitHub Copilot set to Enabled everywhere."
      if (code == 403)
        return "No access (" message "). You must be an owner or billing manager, and your token needs the scopes in --list-sources. With SAML single sign-on, authorize the token."
      if (code == 404) return "Not found or no access (" message ")."
      if (code == 422) return "GitHub cannot return this data for this account (" message ")."
      return message
    }
    {
      calls[$1]++
      count[$1, $2]++
      records[$1] += $3
      if (($2 == "failed" || $2 == "partial") && !($1 in problem)) problem[$1] = hint($1, $4 + 0, $7)
      if ($2 == "skipped" && !($1 in reason)) reason[$1] = $7
    }
    END {
      printf "  %-16s %-8s %9s  %s\n", "Source", "Result", "Items", "Note"
      total = split(order, ids, " ")
      for (i = 1; i <= total; i++) {
        id = ids[i]
        if (!(id in calls)) continue
        good = count[id, "ok"] + 0
        bad = count[id, "failed"] + count[id, "partial"]
        if (good + bad == 0) { result = "skipped"; text = reason[id] }
        else if (bad == 0) { result = "ok"; text = "" }
        else if (good + count[id, "partial"] == 0) { result = "failed"; text = problem[id] }
        else { result = "partly"; text = bad " of " (good + bad) " requests failed. " problem[id] }
        printf "  %-16s %-8s %9d  %s\n", id, result, records[id], text
      }
    }' "$work/status.tsv"
  if [ "$1" != yes ]; then
    return 0
  fi
  say ""
  say "${green}Saved:${reset} $output ($(size_text "$output"))"
  say ""
  say "Next steps:"
  say "  1. Open GitHub Copilot Usage Lens: https://amgdy.github.io/github-copilot-usage-lens/"
  say "     or run npm run dev in the repository folder."
  if [ "$usage_report_records" -gt 0 ] && [ "$usage_report_months" -lt "$months" ]; then
    say "  2. Drop this file on the page. It has the AI usage report of $usage_report_months of $months months."
    say "     For the other months, run this script again in a few minutes."
    say "     It is read in your browser and never uploaded."
  elif [ "$usage_report_records" -gt 0 ]; then
    say "  2. Drop this file on the page. It has your AI usage report too, so you need no other file."
    say "     It is read in your browser and never uploaded."
  else
    say "  2. Load your AI usage report, the CSV file from GitHub billing."
    say "  3. Drop this file on the page. It is read in your browser and never uploaded."
  fi
  note "The file holds GitHub logins and activity. Keep it safe and delete it when you are done."
}

cleanup() {
  if [ -n "$work" ] && [ -d "$work" ]; then
    rm -rf "$work"
  fi
  if [ -n "$output" ] && [ -f "$output.part" ]; then
    rm -f "$output.part"
  fi
}

# With curl ... | bash, bash reads this script from its input, so the answers must come from the terminal. When main
# runs, the whole script has been read. $0 is the name of bash only when the script does not come from a file.
use_terminal_for_answers() {
  if [ "$assume_yes" = yes ] || [ -t 0 ] || [ ! -t 1 ]; then
    return 0
  fi
  case "${0##*/}" in
    bash | sh)
      if (exec </dev/tty) 2>/dev/null; then
        exec </dev/tty
      fi
      ;;
  esac
}

main() {
  local name
  check_options
  use_terminal_for_answers
  if [ "$assume_yes" != yes ] && [ -t 0 ] && [ -t 1 ]; then
    interactive="yes"
  fi
  if [ "$interactive" != yes ] && [ -z "$enterprise" ] && [ -z "$organizations" ]; then
    fail "Choose what to read with --enterprise SLUG or --org NAME. Run with --help to see the options."
  fi
  umask 077
  work=$(mktemp -d "${TMPDIR:-/tmp}/usage-lens.XXXXXX") || fail "Could not create a temporary folder."
  trap cleanup EXIT
  trap 'say ""; say "Stopped. Nothing was saved."; exit 130' INT TERM
  : >"$work/records.ndjson"
  : >"$work/sources.ndjson"
  : >"$work/status.tsv"
  started_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  today=$(date -u +%Y-%m-%d)

  say "${bold}GitHub Copilot Usage Lens: data collector${reset} ${dim}$COLLECTOR_VERSION${reset}"
  note "It changes no settings on GitHub, and the file stays on this computer."
  check_gh
  check_login
  say "Signed in to $host as ${bold}${login:-unknown}${reset}."
  if [ "$interactive" = yes ] && [ -z "$enterprise" ] && [ -z "$organizations" ]; then
    choose_target
  fi
  select_sources
  if [ "$interactive" = yes ]; then
    ask_options
  fi
  months="${months:-3}"
  daily_metrics="${daily_metrics:-no}"
  with_teams="${with_teams:-no}"
  select_sources
  if [ -z "$selected_sources" ]; then
    fail "No sources are left to read. Check --only and --skip."
  fi
  build_months
  prepare_output
  check_scopes
  if [ "$interactive" = yes ]; then
    confirm_plan
  fi

  mark_skipped_sources
  if [ -n "$enterprise" ]; then
    collect_enterprise
  else
    for name in $organizations; do
      collect_organization "$name"
    done
  fi
  if [ "$records_total" -eq 0 ]; then
    print_summary no
    say ""
    say "${red}No data could be read, so no file was saved.${reset} The notes above say why."
    exit 1
  fi
  save_bundle
  print_summary yes
}

# Keep main and exit on one line. With curl ... | bash, the input is the terminal by now, and bash must not read any
# more commands from it.
main; exit
