import { describe, expect, it } from "vitest";
import { mergeDualListItems, rememberDeselectedItems } from "./dualListItems";

const api = { id: "api1", label: "api1" };
const apiRead = { id: "api1.read", label: "api1.read" };
// Not offered to a client without a user flow, yet it can already be selected.
const openid = { id: "openid", label: "openid" };

const leftItems = (all: { id: string }[], selected: { id: string }[]) =>
  all.filter((item) => !selected.some((sel) => sel.id === item.id));

describe("rememberDeselectedItems", () => {
  it("remembers an item that has left the selection", () => {
    expect(rememberDeselectedItems([], [api, openid], [api])).toEqual([openid]);
  });

  it("remembers everything when the selection is cleared", () => {
    expect(rememberDeselectedItems([], [api, openid], [])).toEqual([api, openid]);
  });

  it("does not remember an item twice", () => {
    expect(rememberDeselectedItems([openid], [openid], [])).toEqual([openid]);
  });

  it("keeps the same list when nothing was removed", () => {
    const remembered = [openid];

    expect(rememberDeselectedItems(remembered, [api], [api, apiRead])).toBe(
      remembered,
    );
  });
});

describe("mergeDualListItems", () => {
  it("keeps a removed item that is not among the offered ones available", () => {
    const offered = [api, apiRead];
    const selectedBefore = [api, openid];
    const selectedAfter = [api];

    const remembered = rememberDeselectedItems([], selectedBefore, selectedAfter);
    const all = mergeDualListItems(offered, selectedAfter, [], remembered);

    expect(leftItems(all, selectedAfter)).toEqual([apiRead, openid]);
  });

  it("loses that item without the remembered list - the original bug", () => {
    const all = mergeDualListItems([api, apiRead], [api], [], []);

    expect(all).not.toContainEqual(openid);
  });

  it("lists an item once after it is selected again", () => {
    const all = mergeDualListItems([api], [api, openid], [], [openid]);

    expect(all).toEqual([api, openid]);
  });

  it("leaves the label and the order of the offered items alone", () => {
    const offered = [{ id: "api1", label: "My API" }, apiRead];

    const all = mergeDualListItems(offered, [], [], [apiRead, api]);

    expect(all).toEqual(offered);
  });

  it("still merges the offered, selected and custom items as before", () => {
    const custom = { id: "custom", label: "custom" };

    expect(mergeDualListItems([api, apiRead], [apiRead, openid], [custom], [])).toEqual(
      [api, apiRead, openid, custom],
    );
  });
});
