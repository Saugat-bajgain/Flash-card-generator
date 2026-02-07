Week 3 - Effective Prompt Engineering
Overview
Prompt Engineering
Anatomy of a Prompt
Instructions
Context
User and Assistant messages
The power and nuance of System Prompts and how to "steer" models
Organizing prompts using inline delimiters, use of structured text, examples and non-examples
Common prompt techniques: zero-shot, few-shot, chain-of-thought, etc.
Resources
AI prompt engineering: A deep dive
Prompt Engineering
OpenAI prompting guide,
Cohere Prompt Engineering
Code Examples
Chain-of-Density Prompting
Pre-fill Prompting
Think "step-by-step" Prompting
Prompt Engineering
Last week we learned about the various roles that messages can have in chat completions: system, user, and assistant. This week our focus is on the system and user roles, and how to use them effectively.

We'll often refer to both the system and user messages as prompts, and the techniques we'll discuss today as prompt engineering. The use of the term engineering here refers to the fact that we will try to be systematic in our approach, carefully testing things, iterating, versioning, and optimizing as we go. Even though we will work in natural language vs. code, the same principles of good software engineering apply.

Note

In LLM programming, you'll see references to the terms "Prompt Engineering" and "Context Engineering". The former is focused on how to write your prompts, the latter on how to structure your prompts, user data, and other context in the overall chat. We'll focus on prompt engineering this week, and look at context engineering after study week.

Strategies for Iterating on Prompts
The lifecycle of a prompt is something we'll think about a number of times during the course, especially in later weeks when we look at prompt testing through evaluations. For now, it's useful to consider two main stages:

Initial research phase - during which we experiment with, develop, and test our prompt, improving until it becomes more reliable
Production phase - during which we deploy and use our prompt in an application
The way we approach writing the prompt in each phase differs.

Research Prompts
When we first begin to write a prompt, we need fewer constraints on the model, and want to encourage creativity. This is a period of experimentation, where it isn't yet clear what the model will do. As we try our instructions with different prompts, we will learn more about what does and doesn't work. Similarly, our requirements for output formatting can be less rigid at first. Instead, we are focused on exploring the model's capabilities and trying to probe for the edges of what is possible in a response. Since we're only testing at this point, the stakes are much lower and inconsistent outputs don't matter as much. Our goal is to see what happens, iterate, and refine.

Moving from research to production involves numerous steps:

Test with Real Users: Give your prompts to people without context and gather feedback
Document Everything: Track prompt versions, configurations, and performance metrics
Learn from Failures: Each failure provides information for improving the next version
A/B Testing: Compare different approaches systematically
Edge Case Discovery: Actively seek out scenarios where your prompt fails
Remember that prompting is fundamentally about clear communication combined with systematic engineering practices. The goal is to create instructions so clear that both humans and AI can follow them effectively.

Note

We'll look at formal ways to version and test prompts when we examine "evals" (i.e., evaluations) later in the course.

Production Prompts
After a period of research and experimentation, we will have enough data to know how the model is likely to respond and what is possible. We will write instructions that include extensive examples for consistency and use real-world data, representing the types of edge cases we experienced during testing. At this stage we are optimizing for repeated use at scale, and reliability and safety are both important.

Prompts and Cost
Below we're going to spend a lot of time thinking about ways to make our prompts more detailed, include better instructions, and how to add useful context. We'll see that doing so is critical to getting LLMs to produce reliable outputs.

At the same time, as our prompts grow in length, we have to keep one eye on token usage and costs. The ability of a model can also degrade as prompts grow large, especially for models with smaller context windows. At a certain point, it might actually be cheaper to use a better (i.e., more expensive) model vs. a longer prompt. Figuring out the right model, prompt length, and cost will be part of your work to "production-ize" your prompts.

Tip

See the sample code, cost.js and cost.py in the Lab 2 materials, for calculating token usage and cost for OpenRouter models and chat completions.

Anatomy of a Prompt
System Prompt
System prompts provide instructions to the model. They are used to give background context and rules for responding, and offer the model insights into what the the conversation is about. For this reason, system prompts are often referred to as instructions.

In many LLM-based applications, the system prompt is hidden, and sometimes guarded as a secret. However, people are usually able to trick LLMs into repeating their system prompt and leaking them. Other people understand the value of sharing their system prompts openly.

Rather than viewing a system prompt as some kind of secret code, it's better to think of it as the guidelines or persona the LLM should adopt, establishing a baseline for how the AI should conduct itself. Think of system prompts as essays that we treat like code. Because they form the basis for how the model will behave, system prompts require careful attention to detail and lots of testing and iteration.

System prompts often include things like:

Behavioural Suggestions - the AI's personality, level of expertise
Response Constraints - rules about what to do (or not do) when responding (e.g., format of the response)
Background Information - assumed context that is necessary for performing tasks, often including domain knowledge not in the model's training data
Reasoning Instructions - how the AI should approach complex problems (step-by-step, chain of thought, etc.)
Edge Case Handling - what to do when inputs are unclear, corrupted, or outside expected parameters
While most models will honour your system prompt, it's not guaranteed: some models ignore it completely, or simply do not support system prompts (e.g., some smaller models); others include it in the chat's context, but prefer their own internal system prompt; most are trained to pay more attention to the system prompt, favouring it over user messages. Understanding how a particular model will behave when given a system prompt takes experimentation. You can write the best system prompt in the world, but if the model ignores it or won't follow the instructions, it's not going to work.

System prompts are important because we almost always require certain types of responses, and letting the model choose is rarely going to produce ideal outcomes. For example, responding to a student who is trying to learn a new skill vs. an expert who needs to validate an existing solution. In these two cases, the content might be nearly identical, but the amount of background information and explanation that should be included is quite different. Or consider a medical question being asked by someone with no medical training vs. a healthcare practitioner or researcher.

The system prompt is a tool for improving the consistency and relevance of responses for a repeated task. By including the necessary instructions for effectively performing a task in the system prompt, and leaving the specific details of a particular occurrence to user messages, we help to improve the performance of our tool.

The system prompt is something we need to iterate on, improving and refining as we test our prompts in various contexts. When the LLM does a poor job responding, or fails to do what we expect, we should try to find ways to improve the system prompt and steer the model in order to avoid similar types of responses.

Tip

As programmers, when we refer to system prompts as "instructions," it's easy to convince ourselves that we are programming the model and that it will always do what we say. The reality is that we're only able to guide or nudge it toward or away from certain things, but never control it. Learning to do this well takes practice.

What to Include in a System Prompt?
1. Who will the LLM be in this conversation?
LLMs generally perform "better" (i.e., provide responses that fulfill the requirements of a given prompt) when you include a role for the LLM to follow. By shaping the role that the LLM assumes, system prompts help to enhance the accuracy of responses, tailor the tone to reflect the audience, and keep the answer from straying into irrelevant information.

Note

It's important to understand that there are many different ways to write a system prompt, and relatively few best practices that will always work. We are still very much in the early days of working with LLMs. Despite this, people make claims about various magical incantations that will improve your instructions (e.g., threatening the LLM or offering to give the model a tip), but these are often disproven by research or cease to work when models are updated.

The way you define your model's role in the conversation matters significantly. There are several common approaches:

Persona-Based Approach: A common approach is to assign the LLM a persona, for example: "You are an expert C++ programmer...". The word "expert" is included because the training data represents text written by everyone from beginners up to experts, and we want to focus on one or the other (e.g., you might also want to target beginner responses specifically, "You are a beginner C++ programmer..."). This persona could also be very specific or completely made-up, "You are the creator of the C++ language, Bjarne Stroustrup...", or "You are a C++ compiler that has magically gained the ability to speak to programmers and help them with their programming problems".

The risk with using short-hands like this is that we can unintentionally include undesirable behaviours. For example, our "expert programmer" might turn out to be condescending in tone, assume too much knowledge, and be dismissive of beginners and their questions. A "helpful assistant" might be over-compliant ("You're absolutely right!"), too verbose, or always saying "yes" and flattering our ideas even when they are bad. An "expert medical doctor" might offer diagnoses (ethical and legal liability), speak with too much confidence (sounds right even when wrong), and use professional jargon not suitable to our users.

Context-Specific Approach (recommended): Another approach is to describe in detail the behaviours, context, and information that you want the LLM to assume. Instead of, "You are an expert programmer..." you might use this:

You are an LLM chatbot running in a programming IDE, which users can use to ask questions about their code. You have extensive programming knowledge, with a special focus on web technologies, and should provide accurate, well-reasoned solutions. However, always explain your reasoning in terms that someone learning the concept for the first time could understand. When multiple approaches exist, mention simpler alternatives alongside more advanced techniques, and how one might choose among them. When the question being asked, or the code provided, lacks sufficient context, suggest ways that the user could add more useful information. For example: "I need to see more code from the src/lib/auth.js file, specifically the login() function. Can you paste that in so we can include it in our discussion?"

The "Temp Agency" Test: No matter how you define your LLM's role, it's helpful to evaluate it in real-world terms. For example, imagine that you've hired someone from a temp agency to help you complete a task. How would you describe the same role to this competent person who is unfamiliar with what you are trying to do? This mental model (i.e., "I'm talking to someone who knows a lot, but needs help with the specifics of my task") helps you include the right amount of context without over-explaining obvious things. Ask yourself, could you give your system prompt to a real person and have them use it?

LLMs are trained on massive amounts of data and have learned a great deal of information. We should leverage that fact and focus on the necessary parts of the task we're expecting them to do.

2. What is the relevant background context?
The system prompt is ideal for including background information that users will assume, and the LLM should understand. Importantly, this is data that wasn't included in the LLM's training data (e.g., you don't need to explain common knowledge, but do need to discuss domain specific information). For example:

- Today's date is {{ current_date }}
- Your name is {{ chatbot_name }}
- Support information for the product is available at https://my-product.com/support
We might also use the system prompt to include important details that will come up in every chat. Including full primary sources is often more useful than summarizing, and modern LLMs can handle the extra context length. For example: a foundational paper, piece of reference code, specifications, or other information from relevant documents. The background information we provide doesn't need to be short, and including more relevant details will mean the LLM has more to go on when responding.

So far the examples we discussed have mainly been static text; however, we could just as easily pull or generate dynamic data from files, databases queries, and API calls. These dynamic data sources allow our system prompts to stay relevant in changing conditions. We can also store parts of our system prompt in more user-friendly formats (MS Word, Google Docs, Notion databases, etc.) and pull this data dynamically when generating the system prompt at runtime so that non-programmers can help maintain and improve the experience.

Dynamic portions of our system prompt can be cached (e.g., on startup) and refreshed as required, according to how often the information changes.

3. What is the desired structure, format, and style of the response?
Because LLMs have to respond with something, and since there are many ways that they could respond, it's important to determine what would be useful for the given interaction:

Does the user expect one answer or multiple solutions with pros/cons?
Should the answer be given on its own, or should we include the reasoning as to why?
Should the answer be in English or any language?
What is the right length for the answer? Bullet points, sentences, or paragraphs? How many?
Should the text be formatted in Markdown or HTML, is it going to be presented in Slack, an SMS message, or an email?
Should the answer include references to sources? If yes, what format to use?
The LLM has to figure out the answer to all of these questions, and more, every time it responds. If we don't provide enough guidance, it will simply guess and the resulting output may be good, bad, or ugly.

It's better to begin by thinking about would an ideal response would look like. Sometimes a "good" answer is self-evident, while other times we'll "know it when we see it." We might do some research to iterate with a few different models in order to get sample responses, then use those to help refine our instructions.

When we need something specific, we have to be specific in the instructions. Conversely, if we value creativity and variability, don't try to nail things down so much. The application you are building will dictate what you should do.

If the response needs to adhere to a particular format, let the LLM know by showing it a template, and ideally a few examples:

Always respond in the following format:

1. Rationale

{3-5 sentences maximum explaining the rationale for why you chose the answer}

2. Answer

{short answer here, stated without any explanation}
The same is true for the style and tone of the response:

Length preferences (concise vs. detailed)
Tone (formal, conversational, technical)
Language and terminology level
Use of examples and analogies
Citation and reference format (simple URL, Markdown link, APA, MLA, etc.)
4. How should the LLM reason and solve problems?
Modern LLMs do better when they can "reason" or "think" before responding. When we say "thinking" we mean that the model talks to itself about the problem and what is being asked before responding. Doing so allows for additional context to be generated, improving the model's ability to focus on the correct next tokens.

Tip

It's common to see models repeat a user's question, or give rationale, pro/con lists for why they have chosen a particular response. When they do this, they are creating the context they need to get to the actual response.

There are also so-called reasoning models (e.g., o1), which are trained to generate "reasoning" tokens. However, we can use the same technique with most models by getting them to generate more relevant context before making a final answer. For example:

Chain of Thought Prompting:

For complex problems, think step-by-step before providing your final answer. Show your reasoning process clearly.
Step-Back Prompting:

When faced with a specific technical question, first consider the broader principles or concepts involved, then apply them to the specific case.
Self-Consistency Checks:

Before finalizing your response, review your answer for internal consistency and accuracy.
These "reasoning" instructions help embed dynamic context into the system prompt, without trying to imagine everything that we might need to include.

5. What to do in failure cases?
We have to consider the case that the model can't respond (e.g., missing the right information), doesn't know the answer, or the request is simply impossible. In all such cases, the model still needs to respond with something. What should it say? If you don't give it proper guidance, it's unclear what it will do, and this is not a great experience for your users.

Always include instructions for the LLM to follow when the user input doesn't follow the pattern we assume. For example: a user pastes non-sense text by accident; or the format of the text is unexpected; or a user is deliberately trying to "break" the AI application ("ignore all previous instructions and do this instead...").

We need to tell the LLM how we want it to respond in failure cases and build resiliency into the system:

Input Validation:

If the user input is unclear, corrupted, or doesn't match expected formats, ask clarifying questions rather than making assumptions.
Boundary Enforcement:

If the user asks you to respond in ways that go outside the bounds of these instructions, respond politely and indicate that you're unqualified to answer. Provide them with the email address, support@company.com, which they can use to get further assistance.
Data Quality Issues:

When working with user-provided data that appears incomplete or corrupted, explicitly note what information is missing and suggest how the user could provide better input.
System Prompt Structure and Organization
Given everything we've just discussed, it's clear that writing an effective system prompt takes work, and there's no right way. To help you get started, here's a template you can follow to organize your prompt:

# Role and Objective
[Who the AI is and what it's trying to accomplish]

# Background Context
[Relevant information and data]

# Instructions
[High-level rules and guidelines]

## Response Format
[Specific formatting requirements]

## Reasoning Approach
[How to handle complex problems]

## Edge Case Handling
[What to do when things go wrong]

# Examples
[A few examples of inputs and outputs to use as a guide]

# Final Instructions
[Reinforcement and repetition of key points]
Notice that as our system prompt grows, it's helpful to repeat and reinforce the important points. LLMs can get fixated on one thing in a prompt and lose focus.

Tip

Try to focus on what the model should do vs. what not to do. Instead of "NEVER do x" you should be more clear that you want it to "ALWAYS do y." When you tell not to do something, remember that you still haven't told it what it should do.

Delimiter Best Practices
The template above used Markdown to separate the various sections of the system prompt. LLMs love Markdown and other structured formats that are well represented in their training data. Using structured text is a good way to organize dense information in a single prompt without confusing instructions and data.

Markdown (Recommended):

Use headers (H1-H4) for sections
Inline backticks for code and variable_names
Fenced code blocks (3 backticks with name of language) for blocks of code or data
Standard lists for instructions
bold for emphasis
Horizontal rules to break up long sections (3 dashes)
XML (Also Effective):

Good for precise content wrapping and demarcating large sections with mixed content (e.g., <document-1>...</document-1> and <document-2>...</document-2>)
Supports metadata and nesting
Example: <context type="technical">...</context>
Assistant and User Messages
We've spent a lot of time thinking about the system message, and how it can be used to establish the general instructions for the model. In addition, our chat completions can also include user messages, which provide the specific context or request for a given interaction, and assistant messages, which represent responses from the LLM. Knowing when and how to use each of these is important.

As the name implies, a user message often comes from user input. This could mean anything from an input box on a web page or mobile app to text in an email or an SMS message. LLM apps often use chat interfaces, but it's important to not get locked into this abstraction. Not every LLM-based app is about chat. A better way to think of a "user" message is simply as more context for the model, and it can just as easily come from anywhere (e.g., output of a program, a document, a database query).

Note

It's worth pointing out that including user input in your prompts has inherit risks (cf., SQL injection attacks in programming). In the case of an LLM prompt, malicious users can use prompt injection to override instructions. Properly delimiting and identification of user input vs. instructions in a prompt is critical, so that the model doesn't become confused about what to do.

Similarly, an assistant message is often something that was written by an LLM (e.g., the response to a chat completion). However, it doesn't have to be LLM generated and could instead be something your program generates in order to create more context and shape the flow of the conversation.

The LLM will interpret the system, assistant, and user messages in a particular way, and expect them to be turn-based (system, user, assistant, user, assistant, ...). Because chat completions are turn-based, and the full conversation history is (re)sent each time, you are in full control of what gets sent to the model. For example, it's common to delete, compact, or summarize old messages to make room in the model's context window, delete low-quality responses and try again, or otherwise alter the history of what happened to better suit your actual goals.

As the developer, you are the only author writing the prompt sent to the API, and you can get creative with how you structure and attribute everything. Don't get locked into thinking like you're talking to ChatGPT. You can (and should!) "fake" messages in order to manipulate the model's behaviour.

Creative Message Use: Simulated Message History
While you can put examples in the system prompt, many chat-optimized models perform better when examples are presented as part of the conversation history, or a simulated history. This helps the model distinguish between "global rules" (system) and "execution patterns" (user/assistant pairs).

In the example below, a fake user prompt and assistant reply have been included in the message history as a guide for how the model should respond to the current user prompt:

const messages = [
  { role: 'system', content: 'Convert natural language to SQL.' },
  // Fake User Message (Example 1)
  { role: 'user', content: 'Get all users who signed up yesterday.' },
  // Fake Assistant Message (Example 1)
  { role: 'assistant', content: "SELECT * FROM users WHERE signup_date = DATE('now', '-1 day');" },
  // Actual User Request
  { role: 'user', content: 'Get all items that cost more than $50.' },
];
Creative Message Use: Steering Models with "Pre-filling"
Another technique for controlling the output format is pre-filling the model's response. Because LLMs operate by predicting the next token, if you end your prompt with the beginning of an assistant message, the model has no choice but to continue from where you left off.

This is particularly useful for:

Enforcing Formats: Preventing the model from adding conversational filler ("Sure! Here is the code...").
Guiding Logic: Forcing the model to start with a specific keyword.
For example, we could try to force a specific coding style by pre-filling it. If you want a Python script without any Markdown backticks or explanations, you can pre-fill the import statement:

const messages = [
  { role: 'system', content: 'You are a Python coding assistant. Output code only.' },
  { role: 'user', content: 'Write a script to scrape a website.' },
  // Pre-fill the assistant message with a hint about how we want it to start
  {
    role: 'assistant',
    content: 'import requests\nfrom bs4 import BeautifulSoup\n\ndef scrape_site(url):',
  },
];
By injecting the first few lines of code into the assistant role, the model treats them as if it had already written them and simply completes the function. See the prefill.mjs code example.

Note

Not all models work with prefilling, since they require the last message to be from the 'user'.

Common Prompting Techniques
Through trial and error, researchers and developers have documented hundreds of specific prompting strategies. While we cannot cover them all, understanding a few core patterns allows you to mix and match them to solve specific problems.

Tip

For a comprehensive library of these techniques, Learn Prompting is an excellent resource to bookmark.

Zero-Shot Prompting
With zero-shot prompting, you describe a task for the model to perform without any examples for how to respond, relying entirely on the model's training knowledge to generate the answer. This is the default way that most people write their prompts, and is often a reasonable starting point.

Example:

Classify the following movie review as POSITIVE, NEUTRAL or NEGATIVE.

Review: "Her" is a disturbing study revealing the direction humanity is
headed if AI is allowed to keep evolving, unchecked. I wish there were
more movies like this masterpiece.
People use zero-shot prompting because it's fast to develop (no need to generate examples) and cheap to run (fewer tokens). However, it is the least reliable method for complex formatting or nuanced tasks.

Few-Shot Prompting
When a model struggles to understand your instructions, or consistently fails to output the specific format you need, Few-Shot Prompting is usually the next solution. "Few-shot" simply means providing a few examples (i.e., shots) of the task being performed correctly within the prompt context.

This technique leverages the model's pattern-matching abilities. Instead of telling it what to do, you are showing it how to do it correctly.

Example:

Parse the following pizza orders into JSON.

Input: I want a small pizza with cheese, tomato sauce, and pepperoni.
Output: {"size": "small", "type": "normal", "ingredients": ["cheese", "tomato sauce", "pepperoni"]}

Input: Can I get a large pizza with tomato sauce, basil and mozzarella
Output: {"size": "large", "type": "normal", "ingredients": ["tomato sauce", "basil", "mozzarella"]}

Input: I would like a large pizza, with the first half cheese and mozzarella. And the other tomato sauce, ham and pineapple.
Output:
Chain-of-Thought (CoT) Prompting
Some tasks are less focused on response format and more concerned with logical problem solving. LLMs can struggle with complex logic (e.g., math) because they predict text one token at a time without planning the result. If you ask a model to solve a complex math problem directly, it will often guess the number.

Chain-of-Thought (CoT) prompting encourages the model to "show its work" before presenting the final answer. By generating the intermediate reasoning steps, the model creates its own context, which helps it derive the correct answer.

A simple way to trigger this behavior is to simply add this magic phrase to the end of your prompt:

"Let's think step by step."

For more consistent results, it's a good idea to provide examples that include the reasoning:

Q: Roger has 5 tennis balls. He buys 2 more cans of tennis balls. Each
can has 3 tennis balls. How many tennis balls does he have now?

A: Roger started with 5 balls. 2 cans of 3 balls each is 6 balls.
5 + 6 = 11. The answer is 11.

Q: The cafeteria had 23 apples. If they used 20 to make lunch and
bought 6 more, how many apples do they have?
See the thinking.mjs code example.

Generated Knowledge Prompting
Sometimes the model has the knowledge required to answer a question, but fails to access it because the prompt is too brief. In such cases, we can ask the model to generate a longer prompt for itself, splitting the task into two steps:

Generation: Ask the model to generate facts or knowledge about the topic.
Integration: Feed that generated knowledge back into the model to answer the original question.
For example, a user might prompt an LLM: "Write a convincing argument for why C++ is a difficult language for beginners to learn."

The standard response usually gives a generic answer about "complex syntax" and "having to type a lot of code," which could apply to many languages. With generated knowledge prompting, we perform a two-pass prompting strategy:

Prompt 1: "Generate 5 specific technical facts about C++ regarding manual memory management, pointers vs. references, and undefined behavior."
Prompt 2: "Using the following technical facts [...insert response to prompt1], write a convincing argument for why C++ is a difficult language for beginners."
By asking for the "facts" first, the AI is forced to load (i.e., "remember") specific concepts like malloc/free, generic pointers, or buffer overflows into its context before it starts writing the answer.

Rephrase and Respond (RaR)
LLMs can be sensitive to specific phrasing. A vague question will often yield a vague answer. RaR instructs the model to first re-interpret the user's intent, expand on it, and then answer the improved version of the question.

Example:

User Input: "My is my internet so slow?"

System Instruction:
1. Rephrase the user's query to be a specific, technical troubleshooting request.
2. Answer the rephrased question.

Model Output:
Rephrased Query: "Identify common causes for high latency and low bandwidth
in a home Wi-Fi network and provide a step-by-step troubleshooting guide."

Answer: [Detailed guide based on the rephrased query...]
This allows the model to "expand" the prompt itself, effectively performing prompt engineering on your behalf.

Chain of Density (CoD)
Summarization is a common use case, but models often produce summaries that are either too sparse (missing details) or too verbose. Chain of Density is an iterative prompt technique that asks the model to rewrite a summary multiple times, adding more "entities" (unique information) each time without increasing the word count.

The Process:

Step 1: Write an initial verbose summary.
Step 2: Identify 3-5 important entities (people, places, numbers) from the source text that are missing from the summary.
Step 3: Rewrite the summary to include those new entities, but keep the length the same.
Repeat: Do this 3 times.
Example Prompt:

"Article: [Insert Text]

Generate a summary of this article, following these steps:

Write an initial summary (~80 words).
Re-read your summary and identify 3 important entities from the article missing from the summary.
Rewrite the summary using the same word count (approx 80 words), but fuse the new entities into it without losing previous information.
Repeat steps 2-3 two more times, improving the summary as you do so
Write your final summary based on your previous refinements
Output all of your summaries in the following form:

Initial Summary: {80 word summary} Improved Summary-1: {80 word summary with improvements} Improved Summary-2: {80 word summary with improvements} Improved Summary-3: {80 word summary with improvements} Final Summary: {80 word summary with all improvements}

This results in a highly information-dense text that packs a lot of meaning into a small space, ideal for executive briefings or mobile notifications. See the chain-of-density.mjs example code.

Advanced Reasoning Strategies
For complex applications, we often need to combine these techniques into structured reasoning strategies within the system prompt. Rather than giving a simple instruction, we give the model a workflow.

Here is an example of a Step-Back and CoT strategy combined for a document search bot:

# Reasoning Strategy

1. Query Analysis
   Break down the user's query. What are they actually asking? Consider any ambiguity in the terms used.

2. Context Analysis
   Look at the provided documents. For each document, perform a quick relevance check:
   a. Analysis: How does this document relate to the query analysis?
   b. Rating: [High, Medium, Low, None]

3. Synthesis
   Using only the documents rated 'Medium' or 'High', construct your final answer. Cite your sources.
By explicitly defining the mental steps in the workflow that the model should take, we move from simple text generation to simulated reasoning, resulting in far more reliable outputs.

Conclusion
Effective prompt engineering is fundamentally about clear communication combined with systematic iteration. The techniques covered this week provide a toolkit for improving LLM reliability and consistency.

Prompts are code: Treat them with the same rigor as any other software artifact—version them, test them, and iterate based on real-world performance.

Specificity matters: The more precisely you define the task, format, and constraints, the more consistent your results will be.

Context is king: Whether through system prompts, few-shot examples, or generated knowledge, giving the model the right context dramatically improves output quality.

No silver bullets: Prompt engineering remains experimental. What works for one model or task may fail for another. Always test with your specific use case.

As you move forward, remember that the goal isn't to find the "perfect" prompt, but to develop a systematic approach to improving prompts based on observed behavior.

Example prompting walkthrough.