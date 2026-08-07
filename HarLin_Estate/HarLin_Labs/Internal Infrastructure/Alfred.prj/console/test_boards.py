"""Workflows-gallery registry tests (boards.py).

Added 2026-07-12 with the Commercial group. Guards the registry invariants the
menu renderer relies on: unique ids, every board in a known group, listing()
shape, and html-kind paths whitelisted through html_path().
"""
from console import boards


def test_ids_unique():
    ids = [b["id"] for b in boards._BOARDS]
    assert len(ids) == len(set(ids)), "duplicate board ids"


def test_every_board_in_a_known_group():
    for b in boards._BOARDS:
        assert b["group"] in boards.GROUP_ORDER, f"{b['id']} group {b['group']!r} not in GROUP_ORDER"


def test_listing_shape():
    payload = boards.listing()
    assert payload["groups"] == boards.GROUP_ORDER
    assert len(payload["boards"]) == len(boards._BOARDS)
    for item in payload["boards"]:
        for key in ("id", "title", "group", "kind", "url", "external", "live", "available", "note"):
            assert key in item, f"{item.get('id')} missing {key}"
        assert item["kind"] in ("html", "lattice", "miro")


def test_html_path_is_whitelisted():
    for b in boards._BOARDS:
        if b["kind"] == "html":
            assert boards.html_path(b["id"]) == b["path"]
    # non-html ids must never resolve to a file
    for b in boards._BOARDS:
        if b["kind"] != "html":
            try:
                boards.html_path(b["id"])
                assert False, f"html_path resolved non-html board {b['id']}"
            except KeyError:
                pass


def test_commercial_team_flowchart_registered_and_on_disk():
    b = boards._BY_ID["commercial-team-flow"]
    assert b["group"] == "Commercial"
    assert b["kind"] == "html"
    assert boards.html_path("commercial-team-flow").exists(), (
        "Commercial_Team_Flowchart.html missing at its registered path")
