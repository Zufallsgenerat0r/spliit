window.BENCHMARK_DATA = {
  "lastUpdate": 1791967398643,
  "repoUrl": "https://github.com/Zufallsgenerat0r/spliit",
  "entries": {
    "Spliit performance (deterministic)": [
      {
        "commit": {
          "author": {
            "email": "Zufallsgenerat0r@users.noreply.github.com",
            "name": "Zufallsgenerat0r",
            "username": "Zufallsgenerat0r"
          },
          "committer": {
            "email": "Zufallsgenerat0r@users.noreply.github.com",
            "name": "Zufallsgenerat0r",
            "username": "Zufallsgenerat0r"
          },
          "distinct": true,
          "id": "6c5f37eb16967a5021372af956e2ace4d612f11a",
          "message": "fix: delete removed payers by key when updating a multi-payer expense\n\ndeleteMany received the existing rows including their included participant relation, which Prisma rejects (Unknown argument participant). Removing a payer from a multi-payer expense therefore failed; found by exercising updateExpense against a migrated postgres:15 database.",
          "timestamp": "2026-10-14T10:09:12+02:00",
          "tree_id": "dc650a6c3e47081468ea53039afdfb9cf250eb4f",
          "url": "https://github.com/Zufallsgenerat0r/spliit/commit/6c5f37eb16967a5021372af956e2ace4d612f11a"
        },
        "date": 1791967398030,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "list-groups:home bytes",
            "value": 7064,
            "unit": "bytes"
          },
          {
            "name": "list-groups:home queries",
            "value": 61,
            "unit": "queries"
          },
          {
            "name": "view-group:first-page bytes",
            "value": 26178,
            "unit": "bytes"
          },
          {
            "name": "view-group:first-page queries",
            "value": 3,
            "unit": "queries"
          },
          {
            "name": "view-group:deep-page bytes",
            "value": 25484,
            "unit": "bytes"
          },
          {
            "name": "view-group:deep-page queries",
            "value": 2,
            "unit": "queries"
          },
          {
            "name": "view-group:search bytes",
            "value": 24634,
            "unit": "bytes"
          },
          {
            "name": "view-group:search queries",
            "value": 2,
            "unit": "queries"
          },
          {
            "name": "view-group:balances bytes",
            "value": 2370,
            "unit": "bytes"
          },
          {
            "name": "view-group:balances queries",
            "value": 2,
            "unit": "queries"
          },
          {
            "name": "view-expense:edit-form bytes",
            "value": 5703,
            "unit": "bytes"
          },
          {
            "name": "view-expense:edit-form queries",
            "value": 3,
            "unit": "queries"
          }
        ]
      }
    ]
  }
}