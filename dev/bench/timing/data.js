window.BENCHMARK_DATA = {
  "lastUpdate": 1791967400682,
  "repoUrl": "https://github.com/Zufallsgenerat0r/spliit",
  "entries": {
    "Spliit performance (timing)": [
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
        "date": 1791967400079,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "list-groups:home p50",
            "value": 238.48,
            "unit": "ms"
          },
          {
            "name": "list-groups:home p95",
            "value": 260.58,
            "unit": "ms"
          },
          {
            "name": "view-group:first-page p50",
            "value": 14.2,
            "unit": "ms"
          },
          {
            "name": "view-group:first-page p95",
            "value": 20.9,
            "unit": "ms"
          },
          {
            "name": "view-group:deep-page p50",
            "value": 12.08,
            "unit": "ms"
          },
          {
            "name": "view-group:deep-page p95",
            "value": 13.74,
            "unit": "ms"
          },
          {
            "name": "view-group:search p50",
            "value": 10.16,
            "unit": "ms"
          },
          {
            "name": "view-group:search p95",
            "value": 10.97,
            "unit": "ms"
          },
          {
            "name": "view-group:balances p50",
            "value": 167.52,
            "unit": "ms"
          },
          {
            "name": "view-group:balances p95",
            "value": 198.86,
            "unit": "ms"
          },
          {
            "name": "view-expense:edit-form p50",
            "value": 5.89,
            "unit": "ms"
          },
          {
            "name": "view-expense:edit-form p95",
            "value": 7.36,
            "unit": "ms"
          }
        ]
      }
    ]
  }
}