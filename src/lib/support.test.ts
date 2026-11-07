import { describe, expect, it } from "vite-plus/test";

import { helpPages } from "@/data/handbook-pages";
import { answerFrom } from "@/lib/support";

describe("answerFrom", () => {
  it("answers from the section that covers the question, and names the page", () => {
    const reply = answerFrom("How long do refunds take?", helpPages);
    expect(reply.kind).toBe("answer");
    if (reply.kind !== "answer") return;
    expect(reply.page.id).toBe("refunds");
    expect(reply.section).toBe("How long refunds take");
    expect(reply.text).toContain("3 business days");
  });

  it("finds plural and singular forms of the same word", () => {
    const reply = answerFrom("Can I move my license to a new site?", helpPages);
    expect(reply.kind === "answer" && reply.page.id).toBe("licenses");
  });

  it("returns a gap instead of guessing when under half the words match", () => {
    const reply = answerFrom("Do you offer discounts for nonprofits?", helpPages);
    expect(reply.kind).toBe("gap");
    expect(reply.coverage).toBeLessThan(0.5);
  });

  it("returns a gap for a question with only filler words", () => {
    expect(answerFrom("How do I?", helpPages).kind).toBe("gap");
  });
});
