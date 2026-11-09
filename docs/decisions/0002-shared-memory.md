# 0002: Shared memory for any AI, at the center

Date: November 8, 2026. Status: accepted. This changes how decision 1 in `0001-knowledge-notebook.md` ranks the four jobs. Everything else in 0001 still holds.

## 1. Memory is the center, the other jobs branch from it

**Decision.** Corpus is shared memory for any AI: one library of context that belongs to the company (or to one person), not to a model vendor. Any AI tool recalls from it and saves to it, including tools that have no memory of their own. Docs sites, help centers, the support bot, and design systems are published from the same library. They're what you get once the knowledge lives in one place, not four equal products.

The pitch leads with memory. The other jobs follow as "and from the same library, you can publish…".

**Why.**

- Memory is the most useful thing AI tools have added, and it's locked inside a few vendors. Claude and ChatGPT remember one person, inside one product. A teammate's AI doesn't know what yours learned, and switching vendors leaves the memory behind.
- Open-weight models (DeepSeek, Qwen, Llama) and harnesses that store no user data have no memory at all. They need a place outside the model to keep it. That place is Corpus.
- A team of many people, or one developer using several tools, needs the same context in every tool. Only a source the team owns can do that.
- It makes Corpus more than a cheaper Mintlify or Zendesk. The publishing jobs are where the price comparison still wins.

**Revisit if** the demand test shows teams sign up for one publishing job (support answers, say) far more than for memory. Then lead with that job, as 0001 decision 1 already says.

## 2. What changes

- Deck: the Problem slide is about memory locked inside each vendor. The Solution slide shows the library in the middle and the jobs around it. The refunds example stays on the Plugins slide as proof.
- Landing page: the hero and the jobs section lead with shared memory.
- CLAUDE.md: "What Corpus is" leads with memory.
- Plugins (0001 decision 6) move from one job among four to the main way people use Corpus.

Open: whether the prototype's navigation should put memory (saved notes and the review queue) first, ahead of projects.
