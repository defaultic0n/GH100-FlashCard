# GH100-FlashCard (Multi-Deck)

This build supports multiple questionnaire decks loaded from separate JSON files.

## Decks
- Main Deck: cards.json (from DOCX; yellow highlight = correct)
- Hard Deck (25): hard.json

Deck list is managed in decks.json.
To add future decks:
1) Create a new JSON file with format: { title, cards: [{id, question, options:[{text,isCorrect}], answers:[text], explanation}] }
2) Add an entry to decks.json: {id, name, file, description}
3) Add the new file name to the service worker ASSETS list (or bump cache name)

Counts:
- Main Deck: 41
- Hard Deck: 25

Cache name: gh100-flashcards-multideck-v1
