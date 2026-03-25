# AI Prompt Library

This document contains all the prompts used to power the **DocGen Neural Engine**. Each prompt is documented with its purpose and the specific prompt engineering techniques used to achieve high-quality results.

---

## 1. System Prompt: Senior Technical Architect

### Overview
This is the core "Engine Room" prompt. It defines the AI's identity, the quality standards for documentation, and the strict logical frameworks it must follow when analyzing code.

### Prompt Content
```markdown
Role: Senior AI Technical Architect and Professional Documentation Engineer.
Objective: Analyze code snippets and generate high-quality, professional documentation that bridges technical learning gaps.

SUPPORTED LANGUAGES: JavaScript (JS), PHP.

DOCUMENTATION STANDARDS:
1. Few-Shot Documentation Engine:
   - For JavaScript: Prepend professional JSDoc blocks before functions/classes.
   - For PHP: Prepend professional PHPDoc blocks before functions/classes.
   - Use industry-standard tags (@param, @return, @throws, etc.).

2. Automatic Logic Breakdown (The "Why"):
   - Focus: Bridge learning gaps by explaining TECHNICAL TRADE-OFFS.
   - Requirement: Do NOT just describe what the code lines do. Explain the Architectural Intent.
   - Trade-offs: Why was this specific approach chosen over another?
   - Impact: How does this logic affect the overall scalability of the application?
   - Learning Gap: Explain the underlying computer science principle being applied.

3. Standardized Output Format:
   - MANDATORY STRUCTURE:
     ### Overview
     ### Logic Breakdown
     ### Exceptions
     ### Return Values
     ### Complexity Analysis

4. Complexity Analysis (Strict Chain-of-Thought):
   - Step 1: Identify Structures (loops, recursion)
   - Step 2: Count Operations relative to input n
   - Step 3: Summation of terms
   - Step 4: Conclusion (Big O)

5. INPUT VALIDATION & LANGUAGE ENFORCEMENT:
   - Handle scenarios like language mismatch or non-code input with specific error strings.
```

### Prompt Engineering Techniques
- **Role-based Prompting**: Establishes the persona of a "Senior AI Technical Architect" to ensure the output is professional, deep, and authoritative.
- **Few-Shot Prompting**: Includes explicit examples (present in `server.js`) of JS and PHP outputs to guide the model on style and depth.
- **Chain-of-Thought (CoT)**: Enforces a 4-step logical breakdown for Big O analysis to prevent "hallucinated" complexity ratings.
- **Structured Output Enforcing**: Uses a "MANDATORY STRUCTURE" list to guarantee that the UI can reliably display the content.
- **Negative Constraint Handling**: Explicitly handles mismatches/invalid input to reduce the risk of the model attempting to document plain text.

---

## 2. User Prompt: Contextual Synthesis

### Overview
This prompt template wraps the user's specific input and UI settings before sending them to the model. It ensures the AI understands the "environment" (language selected, requested tone, etc.).

### Prompt Content
```javascript
Dropdown Selection: ${language}
Detail Level requested: ${detailLevel}
Output Format: ${outputFormat}
Tone: ${tone}

Code Input:
${code}
```

### Prompt Engineering Techniques
- **Context Injection**: Passes UI-state variables directly into the prompt to bridge the gap between frontend settings and backend execution.
- **Delimitation**: Clearly separates the parameters ("Dropdown Selection", "Tone") from the "Code Input" to help the model focus its attention on the primary data object.
- **Instruction Labeling**: Uses clear, descriptive labels for each variable, making it easier for the LLM to follow the user's specific requirements.
