import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Chat } from "./chat";

describe("Chat", () => {
  it("sends the conversation and renders the streamed reply", async () => {
    const streamChat = vi.fn(async function* () {
      yield "Hel";
      yield "lo!";
    });
    render(<Chat streamChat={streamChat} />);

    await userEvent.type(screen.getByPlaceholderText("Say something…"), "hi");
    await userEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("Hello!")).toBeInTheDocument();
    expect(streamChat).toHaveBeenCalledWith({ messages: [{ role: "user", content: "hi" }] });
  });
});
