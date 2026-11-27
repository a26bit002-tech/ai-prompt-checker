
/* ==========================================
   AI PROMPT QUALITY CHECKER
   Vanilla JavaScript - No libraries or APIs
   ========================================== */

// Get HTML elements
const promptInput = document.getElementById("promptInput");
const checkBtn = document.getElementById("checkBtn");
const sampleBtn = document.getElementById("sampleBtn");
const clearBtn = document.getElementById("clearBtn");

const scoreValue = document.getElementById("scoreValue");
const ratingBadge = document.getElementById("ratingBadge");
const progressBar = document.getElementById("progressBar");
const progressTrack = document.getElementById("progressTrack");
const componentList = document.getElementById("componentList");
const componentCount = document.getElementById("componentCount");
const charCount = document.getElementById("charCount");
const errorMessage = document.getElementById("errorMessage");

// Sample prompt for students
const samplePrompt =
    "Act as an experienced science teacher. " +
    "Explain photosynthesis to college students. " +
    "Include the background of the process and real-world examples. " +
    "Use simple language, avoid technical jargon, and keep it under 300 words. " +
    "Format the answer as bullet points with clear headings.";

// Component definitions and keyword rules
const components = [
    {
        name: "Role",
        keywords: [
            /\bact as\b/i,
            /\byou are\b/i,
            /\brole\b/i,
            /\bexpert\b/i,
            /\bteacher\b/i,
            /\bdeveloper\b/i,
            /\bdesigner\b/i,
            /\bscientist\b/i,
            /\bconsultant\b/i,
            /\bprofessional\b/i,
            /\bmentor\b/i
        ],
        description: "Defines the identity or expertise the AI should adopt.",
        suggestion:
            'Start with "Act as a..." and specify an appropriate role.',
        improvement:
            "Your prompt establishes a role. Make it more precise by choosing the expertise that best fits your task."
    },
    {
        name: "Task",
        keywords: [
            /\btask\b/i,
            /\bexplain\b/i,
            /\bcreate\b/i,
            /\bwrite\b/i,
            /\bdescribe\b/i,
            /\bsummarize\b/i,
            /\bsummarise\b/i,
            /\banalyze\b/i,
            /\banalyse\b/i,
            /\bgenerate\b/i,
            /\bcompare\b/i,
            /\bdesign\b/i,
            /\bsolve\b/i,
            /\bdevelop\b/i,
            /\blist\b/i,
            /\btranslate\b/i,
            /\bcalculate\b/i,
            /\bevaluate\b/i,
            /\bdiscuss\b/i,
            /\bidentify\b/i
        ],
        description: "Specifies the action or result you want from the AI.",
        suggestion:
            'Use a clear action, such as "Explain...", "Create...", or "Compare...".',
        improvement:
            "Your prompt includes a task. Improve it by stating exactly what the final result should accomplish."
    },
    {
        name: "Context",
        keywords: [
            /\bcontext\b/i,
            /\bbackground\b/i,
            /\bfor college students\b/i,
            /\bfor students\b/i,
            /\bfor beginners\b/i,
            /\bfor children\b/i,
            /\bfor professionals\b/i,
            /\baudience\b/i,
            /\bpurpose\b/i,
            /\bscenario\b/i,
            /\bsituation\b/i,
            /\babout\b/i,
            /\bfor my\b/i,
            /\bintended for\b/i,
            /\bassume\b/i,
            /\bin the field of\b/i
        ],
        description: "Provides background, audience, or purpose.",
        suggestion:
            'Explain the background and audience, for example: "This is for first-year college students."',
        improvement:
            "Your prompt gives some context. Add relevant background, audience details, or the purpose of the task."
    },
    {
        name: "Constraints",
        keywords: [
            /\bconstraints?\b/i,
            /\bmust\b/i,
            /\bshould\b/i,
            /\bavoid\b/i,
            /\bdo not\b/i,
            /\bdon't\b/i,
            /\bwithout\b/i,
            /\blimit\b/i,
            /\bless than\b/i,
            /\bat most\b/i,
            /\bat least\b/i,
            /\bunder \d+\b/i,
            /\bmaximum\b/i,
            /\bminimum\b/i,
            /\bno more than\b/i,
            /\binclude only\b/i,
            /\bkeep it\b/i,
            /\bword count\b/i,
            /\bwithin \d+\b/i
        ],
        description: "Sets boundaries, rules, length, or requirements.",
        suggestion:
            'Add specific rules, such as "Use simple language and keep it under 300 words."',
        improvement:
            "Your prompt includes a constraint. Make your requirements measurable and avoid vague instructions."
    },
    {
        name: "Output Format",
        keywords: [
            /\boutput format\b/i,
            /\bformat\b/i,
            /\bbullet points\b/i,
            /\bbulleted list\b/i,
            /\bnumbered list\b/i,
            /\btable\b/i,
            /\bjson\b/i,
            /\bmarkdown\b/i,
            /\bparagraphs?\b/i,
            /\bheadings?\b/i,
            /\bessay\b/i,
            /\breport\b/i,
            /\bchecklist\b/i,
            /\bstep[- ]by[- ]step\b/i,
            /\bslides?\b/i,
            /\bcode block\b/i,
            /\bquestion and answer\b/i,
            /\bqa format\b/i
        ],
        description: "Tells the AI how to structure its response.",
        suggestion:
            'Specify a format, such as "Use headings and bullet points."',
        improvement:
            "Your prompt specifies a format. Clarify the desired structure, length, and presentation style."
    }
];

// Keep character count updated
promptInput.addEventListener("input", () => {
    charCount.textContent =
        `${promptInput.value.length} characters`;

    // Hide the empty-input error as the user starts typing
    if (promptInput.value.trim()) {
        errorMessage.hidden = true;
    }
});

// Check the prompt when the button is clicked
checkBtn.addEventListener("click", checkPrompt);

// Load a sample prompt
sampleBtn.addEventListener("click", () => {
    promptInput.value = samplePrompt;

    charCount.textContent =
        `${promptInput.value.length} characters`;

    errorMessage.hidden = true;

    checkPrompt();
});

// Clear all input and results
clearBtn.addEventListener("click", clearAll);


// Main prompt analysis function
function checkPrompt() {
    const prompt = promptInput.value.trim();

    // Validate empty input
    if (!prompt) {
        errorMessage.hidden = false;
        promptInput.focus();
        return;
    }

    errorMessage.hidden = true;

    // Normalize text for case-insensitive matching
    const normalizedPrompt = prompt.toLowerCase();

    // Detect components and award 20 marks per component
    const results = components.map((component) => {
        const detected = component.keywords.some((keyword) =>
            keyword.test(normalizedPrompt)
        );

        return {
            ...component,
            detected
        };
    });

    const detectedCount = results.filter(
        (item) => item.detected
    ).length;

    const score = detectedCount * 20;

    // Update the score and rating
    displayScore(score);

    // Update detected component count
    componentCount.textContent =
        `${detectedCount} / ${components.length}`;

    // Display component checklist and suggestions
    displayComponents(results);
}


// Display the score, rating, and progress bar
function displayScore(score) {
    scoreValue.textContent = score;

    // Select a rating based on the score
    let rating = "";
    let ratingClass = "";

    if (score === 100) {
        rating = "Excellent";
        ratingClass = "rating-excellent";
    } else if (score === 80) {
        rating = "Very Good";
        ratingClass = "rating-excellent";
    } else if (score === 60) {
        rating = "Good";
        ratingClass = "rating-good";
    } else if (score === 40) {
        rating = "Average";
        ratingClass = "rating-good";
    } else {
        rating = "Need Improvement";
        ratingClass = "rating-low";
    }

    ratingBadge.textContent = rating;
    ratingBadge.className = `rating-badge ${ratingClass}`;

    // Update accessible progress information
    progressTrack.setAttribute("aria-valuenow", score);
    progressTrack.setAttribute(
        "aria-valuetext",
        `${score} out of 100`
    );

    // Restart the animation so repeated checks animate correctly
    progressBar.style.transition = "none";
    progressBar.style.width = "0%";

    // Force the browser to apply the reset before animating
    void progressBar.offsetWidth;

    progressBar.style.transition = "";
    progressBar.style.width = `${score}%`;
}


// Render each component with its status and suggestion
function displayComponents(results) {
    componentList.replaceChildren();

    results.forEach((item, index) => {
        const card = document.createElement("article");

        card.className = item.detected
            ? "component-item detected"
            : "component-item missing";

        card.style.animationDelay = `${index * 60}ms`;

        // Status symbol
        const icon = document.createElement("span");
        icon.className = "status-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = item.detected ? "✓" : "✕";

        // Component text area
        const content = document.createElement("div");
        content.className = "component-content";

        // Component title and status
        const titleRow = document.createElement("div");
        titleRow.className = "component-title-row";

        const title = document.createElement("span");
        title.className = "component-title";
        title.textContent = `${index + 1}. ${item.name}`;

        const status = document.createElement("span");
        status.className = "component-status";
        status.textContent = item.detected
            ? "DETECTED · +20"
            : "MISSING · +0";

        titleRow.append(title, status);

        // Component description
        const description = document.createElement("p");
        description.className = "component-description";
        description.textContent = item.description;

        // Individual improvement suggestion
        const suggestion = document.createElement("p");
        suggestion.className = "component-suggestion";

        const suggestionLabel = document.createElement("strong");
        suggestionLabel.textContent = item.detected
            ? "Improve further: "
            : "Suggestion: ";

        suggestion.append(
            suggestionLabel,
            document.createTextNode(
                item.detected ? item.improvement : item.suggestion
            )
        );

        content.append(titleRow, description, suggestion);
        card.append(icon, content);

        componentList.appendChild(card);
    });
}


// Reset the entire application
function clearAll() {
    promptInput.value = "";
    charCount.textContent = "0 characters";
    errorMessage.hidden = true;

    scoreValue.textContent = "--";
    ratingBadge.textContent = "Not checked";
    ratingBadge.className = "rating-badge";

    progressBar.style.transition = "none";
    progressBar.style.width = "0%";

    progressTrack.setAttribute("aria-valuenow", "0");
    progressTrack.setAttribute(
        "aria-valuetext",
        "Not checked"
    );

    componentCount.textContent = "0 / 5";

    // Restore the initial empty state
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";

    const icon = document.createElement("span");
    icon.className = "empty-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "⌕";

    const title = document.createElement("strong");
    title.textContent = "Ready to analyze";

    const description = document.createElement("p");
    description.textContent =
        "Enter your prompt and select Check Prompt to see which components are present.";

    emptyState.append(icon, title, description);
    componentList.replaceChildren(emptyState);

    promptInput.focus();
}
