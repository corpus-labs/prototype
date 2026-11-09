# Speaker notes

About 30 seconds a slide, about 6 minutes in all (roughly 75 words a slide at a calm pace). Learn the beats and say them your way; reading word for word sounds stiff. Slide numbers match the page controls: Cover, 1 to 10, Summary.

## Cover

Hi, I'm Mitch Kostelecky, a graduate student at the Iovine Young Academy, applying for the GenAI track. This is Corpus. The short version: Corpus is one shared memory for every AI tool and every teammate, owned by your company, not by an AI vendor. Claude, ChatGPT, and open-weight models all read from it and save to it. And the same pages become your docs, your help center, and your support bot.

## 1. Problem

The best AI tools now remember you. Claude does, ChatGPT does. But that memory has three problems. It's personal: my teammate's AI doesn't know what mine learned. It's locked in: switch to another AI, and the memory stays with the old vendor. And open-weight models like DeepSeek and Qwen don't remember anything at all. Look at the table: nothing today gives a team memory that's shared and works in every AI.

## 2. Why now

And teams do switch. In two years, the business AI leader flipped from OpenAI to Anthropic, which now takes 55 percent of enterprise spend. Even big customers move: Revolut just shifted its developers from Claude to self-hosted Z.ai models and cut costs by up to 90 percent. Open-weight models already handle almost a fifth of enterprise AI use. And MCP finally lets every tool read from one outside source. So what your team knows has to outlive the model.

## 3. Solution

Corpus is that outside source. It's a library your company owns, kept as plain Markdown files, hosted by us or on your own server. Any AI can recall from it and save to it. That's the center. And because everything lives in one place, the same pages publish as public docs, a help center, a support bot that answers customers, and even a design system. Today, teams pay for a separate tool for each of those.

## 4. Plugins

Here's what that looks like. On Monday, someone tells Claude Code that refunds now take three business days. Claude saves it to Corpus as a draft, and I approve it the same day. Days later, someone asks Codex how long refunds take, and it answers correctly, citing the page. Plugins install in one click for Claude, Codex, Cursor, Z.ai, DeepSeek, and Grok, so the whole team can use them, not just developers.

## 5. How it works

Under the hood, it's a loop. People write in a notebook editor, and agents save notes from whatever tool they use, as drafts a person approves. Then the same pages publish for people and connect to agents. Below is the Refunds page: people read it as a help page, and agents and the support bot get the exact same words as Markdown. And questions nobody could answer come back as drafts, written with whichever model you pick.

## 6. Competition

Today, teams stitch this together from five tools: Mintlify for docs, GitBook or Obsidian for notes, Zendesk for support answers, and zeroheight for design systems. Each covers a piece. Most charge every month, and almost none let you run them on your own server. Corpus, the green row, is the only one that covers all of it, works with any AI, and can be self-hosted.

## 7. Business model

And it costs a fraction. Over three years, the smallest Mintlify plan is sixteen thousand dollars. Corpus is a lifetime license between 79 and 99 dollars, and the demand test picks the price. Hosting is seven dollars a month for teams that don't want to run it. Teams bring their own AI key, so model bills never land on us, and each sale is nearly all margin. The goal is bootstrapped and profitable.

## 8. Traction

What's built today is a clickable prototype of the whole notebook: the editor, handbook, help center, and design system projects, a published help center with search and a support bot, and plugins with a review queue. This screenshot is the help center, and you can try it live at demo.corpus.app. Next, Corpus reads a real folder of Markdown from disk. And the landing page at corpus.app has been collecting signups since November.

## 9. Team

I'm a solo founder, and I've done this before. I run Charged Labs, agentic developer tooling and cloud infrastructure for Drupal and WordPress. I've been a staff-level frontend engineer, including at Flipgrid, which Microsoft acquired. As an Elite author on ThemeForest, I've made over a hundred thousand dollars from one-time-priced products, the same model as Corpus. And I live this problem: every week I switch between Claude Code, Z.ai, DeepSeek, and OpenCode.

## 10. Use of proceeds

The three thousand dollars buys a demand test: fifteen hundred on Reddit ads and fifteen hundred on X, four ad sets each, one per job, with half of visitors seeing 79 dollars and half 99. After two weeks, more goes to whichever platform brings signups more cheaply, and I'll interview ten signups. The timeline runs to the Venture Showcase in spring, where I'm aiming for 250 signups, 10 beta teams, and 25 paid licenses.

## Summary

Corpus is Latin for body. Today it means the whole body of writing on a subject, and in AI, it's the text a model learns from. That's exactly what this is: everything your team knows, in one body you own for life, that works with any AI. I'm asking for the three thousand dollar Ignite Grant to run the demand test, and for a mentor with marketing experience who has sold software to small teams. You can try the prototype at demo.corpus.app and join the waitlist at corpus.app. Thank you.
