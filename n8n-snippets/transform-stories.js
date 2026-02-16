// === Configuration ===
const DEFAULT_MODE = 'full';
const START_DATE_FIELD_ID = 'customfield_10015';

// === STEP 1: Get the selected mode from input ===
const mode = $json.mode ?? DEFAULT_MODE;

// === STEP 2: Define all possible fields and their transformation logic ===
const fieldDefinitions = [
  { key: 'key', label: 'Key', path: 'key' },
  { key: 'title', label: 'Title', path: 'fields.summary' },
  { key: 'squad', label: 'Squad', path: 'fields.project.name' },
  { key: 'issuetype', label: 'Type of Issue', path: 'fields.issuetype.name' },
  { key: 'labels', label: 'Labels', path: 'fields.labels' },
  { key: 'assignee', label: 'Assignee', path: 'fields.assignee.displayName' },
  { key: 'original_estimate', label: 'Original Estimate', path: 'fields.timetracking.originalEstimate' },
  { key: 'created_date', label: 'Created Date', path: 'fields.created', format: 'iso' },
  { key: 'start_date', label: 'Start Date', path: `fields.${START_DATE_FIELD_ID}`, format: 'iso' },
  { key: 'end_date', label: 'End date', path: 'fields.duedate', format: 'iso' },
  { key: 'created_date_formatted', label: 'Created Date (Formatted)', path: 'fields.created', format: 'dd-mmm-yyyy' },
  { key: 'start_date_formatted', label: 'Start Date (Formatted)', path: `fields.${START_DATE_FIELD_ID}`, format: 'dd-mmm-yyyy' },
  { key: 'end_date_formatted', label: 'End date (Formatted)', path: 'fields.duedate', format: 'dd-mmm-yyyy' },
  { key: 'created_date_relative', label: 'Created Date (Relative)', path: 'fields.created', format: 'relative' },
  { key: 'start_date_relative', label: 'Start Date (Relative)', path: `fields.${START_DATE_FIELD_ID}`, format: 'relative' },
  { key: 'end_date_relative', label: 'End Date (Relative)', path: 'fields.duedate', format: 'relative' },
  { key: 'status', label: 'Overall Status', path: 'fields.status.name' },
  { key: 'last_update_1', label: 'Last Update 1', custom: 'last_update', index: 0 },
  { key: 'last_update_2', label: 'Last Update 2', custom: 'last_update', index: 1 },
  { key: 'last_comment_1', label: 'Last Comment 1', custom: 'last_comment', index: 0 },
  { key: 'last_comment_2', label: 'Last Comment 2', custom: 'last_comment', index: 1 },
  { key: 'available_transitions', label: 'Available Transitions', custom: 'transitions' },
];

// === STEP 3: Define which field keys to include for each mode ===
const fieldKeysByMode = {
  full: [
    'key', 'title', 'squad', 'issuetype', 'labels',
    'assignee', 'original_estimate',
    'created_date', 'created_date_relative',
    'start_date', 'start_date_relative',
    'end_date', 'end_date_relative',
    'status',
    'available_transitions', 'last_update_1', 'last_update_2',
    'last_comment_1', 'last_comment_2',
  ],
  compact: [
    'key', 'title', 'squad', 'labels',
    'assignee', 'original_estimate',
    'start_date', 'start_date_formatted', 'start_date_relative',
    'end_date', 'end_date_relative',
    'status',
    'available_transitions', 'last_update_1', 'last_update_2',
    'last_comment_1', 'last_comment_2',
  ],
  metrics: [
    'key', 'labels',
    'assignee', 'original_estimate',
    'status',
    'start_date_relative', 'end_date_relative',
    'available_transitions', 'last_update_1', 'last_update_2',
    'last_comment_1', 'last_comment_2',
  ],
};

// === STEP 4: Utility Functions ===

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc?.[part], obj) ?? null;
}

function normalizeDateString(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return dateStr;
  return dateStr.replace(/([+-]\d{2})(\d{2})$/, '$1:$2');
}

function formatDate(dateStr, formatType) {
  if (!dateStr) return null;

  const normalizedDateStr = normalizeDateString(dateStr);
  const dateObj = new Date(normalizedDateStr);

  if (isNaN(dateObj.getTime())) {
    console.error(`Invalid date detected: ${dateStr} (Normalized: ${normalizedDateStr})`);
    return null;
  }

  switch (formatType) {
    case 'iso':
      return dateObj.toISOString().split('T')[0];

    case 'dd-mmm-yyyy':
      const day = String(dateObj.getDate()).padStart(2, '0');
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[dateObj.getMonth()];
      const year = dateObj.getFullYear();
      return `${day}-${month}-${year}`;

    case 'relative':
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const compareDate = new Date(dateObj);
      compareDate.setHours(0, 0, 0, 0);

      const msInDay = 1000 * 60 * 60 * 24;
      const diffDays = Math.round((compareDate - today) / msInDay);

      if (diffDays === 0) return "today";
      if (diffDays === 1) return "tomorrow";
      if (diffDays === -1) return "yesterday";

      const absDays = Math.abs(diffDays);
      const label = absDays === 1 ? "day" : "days";
      return diffDays < 0 ? `${absDays} ${label} ago` : `in ${absDays} ${label}`;

    default:
      return dateStr;
  }
}

// === STEP 5: Custom Field Logic Helpers ===

function getTransitionsValue(transitions) {
  const validTransitions = transitions ?? [];
  return validTransitions.length > 0
    ? validTransitions.map(t => t.name).join(', ')
    : "N/A";
}

function getUpdateValue(sortedHistories, index) {
  if (!sortedHistories || sortedHistories.length <= index) {
    return "N/A";
  }

  const history = sortedHistories[index];
  if (!history.items || history.items.length === 0) {
    return "N/A";
  }
  const change = history.items[0];

  const date = formatDate(history.created, 'iso');
  const fieldName = change?.field ?? 'unknown field';
  const from = change?.fromString ?? 'N/A';
  const to = change?.toString ?? 'N/A';

  return `${date}: ${fieldName} changed from '${from}' → '${to}'`;
}

function getCommentValue(comments, index) {
  const validComments = comments ?? [];
  const targetIndex = validComments.length - 1 - index;

  if (targetIndex < 0 || validComments.length <= targetIndex) {
    return "N/A";
  }

  const comment = validComments[targetIndex];
  const date = formatDate(comment.created, 'dd-mmm-yyyy');
  const author = comment.updateAuthor?.displayName || comment.author?.displayName || "Unknown Author";
  const body = (comment.body ?? "[No content]")
    .replace(/\r\n|\r|\n/g, ' ')
    .replace(/\[~.*?\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const maxLength = 150;
  const truncatedBody = body.length > maxLength ? body.substring(0, maxLength) + '...' : body;

  return `${date} by ${author}: ${truncatedBody}`;
}

// === STEP 6: Core Transformation Logic ===

function transformIssue(issue, selectedMode, definitions, keysByMode) {
  const result = {};
  const includedKeys = keysByMode[selectedMode] ?? keysByMode[DEFAULT_MODE];

  const comments = issue.fields?.comment?.comments ?? [];
  const transitions = issue.transitions ?? [];
  const sortedHistories = (issue.changelog?.histories ?? [])
    .filter(h => h.items?.length > 0)
    .sort((a, b) => new Date(normalizeDateString(b.created)) - new Date(normalizeDateString(a.created)));

  for (const field of definitions) {
    if (!includedKeys.includes(field.key)) continue;

    let value = null;

    try {
      if (field.custom) {
        switch (field.custom) {
          case 'transitions':
            value = getTransitionsValue(transitions);
            break;
          case 'last_update':
            value = getUpdateValue(sortedHistories, field.index);
            break;
          case 'last_comment':
            value = getCommentValue(comments, field.index);
            break;
          default:
            console.warn(`Unknown custom field type: ${field.custom}`);
            value = "Error: Unknown custom type";
        }
      } else {
        const rawValue = getNestedValue(issue, field.path);

        if (field.format && rawValue !== null) {
          value = formatDate(rawValue, field.format);
        } else {
          value = rawValue;
        }
      }
    } catch (error) {
      console.error(`Error processing field '${field.label}' (key: ${field.key}):`, error);
      value = `Error processing field: ${field.key}`;
    }

    result[field.key] = value;
  }

  return result;
}

// === STEP 7: Apply transformation to each input item ===
const output = items.map(item => {
  if (!item.json) {
    console.error("Input item missing 'json' property:", item);
    return { json: { error: "Input item missing 'json' property" } };
  }
  try {
    return {
      json: transformIssue(item.json, mode, fieldDefinitions, fieldKeysByMode),
    };
  } catch (error) {
    console.error("Error transforming issue:", item.json?.key || 'Unknown Key', error);
    return { json: { error: `Failed to transform issue ${item.json?.key || ''}: ${error.message}` } };
  }
});

// === STEP 8: Structure and Return the final output ===

function getTimestampGMT8() {
  const now = new Date();
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Singapore'
    });
    const parts = formatter.formatToParts(now);
    const dateParts = {};
    parts.forEach(({type, value}) => { dateParts[type] = value; });
    return `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}:${dateParts.second}+08:00`;
  } catch (e) {
    console.warn("Intl.DateTimeFormat for timezone formatting failed, using default toISOString().", e);
    return now.toISOString();
  }
}

const finalResult = {
  generation_timestamp: getTimestampGMT8(),
  total_records: output.length,
  Stories: output.map(item => item.json)
};

return [{ json: finalResult }];
