# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.3] - 2026-03-15

### Added

- Add Reading level dropdown (Full article, ELI5, ELI10, ELI20) at the top of the Russell article pane; persist selection in localStorage.

### Changed

- Replace single ELI5 toggle with three simplified versions: ELI5 (plain-language “words can make a promise” / dragon and cookie examples), ELI10 (structured sections with puzzles and George IV), ELI20 (fuller treatment including theory, rival views, three puzzles, acquaintance vs description, and bottom line). Rework all three for target age ranges and clarity.

## [0.3.2] - 2026-03-15

### Added

- Add ELI5 toggle at the top of the Russell article pane; when enabled, replace the full article text with a single-paragraph plain-language explanation and persist the choice in localStorage.

## [0.3.1] - 2026-03-15

### Added

- Add natural-language symbol explainers below each LaTeX-rendered formula (Expansion Engine symbolic logic; Primary vs Secondary single reading and primary/secondary forms) describing ∃, ∀, ∧, ¬, →, = and formula-specific predicates (F/C or D/P).

## [0.3.0] - 2026-03-15

### Added

- Add assumption controls (denotes? / predicate holds?) in Theory Comparator when description is not in the built-in list.
- Add single-reading view in Primary vs Secondary for positive “The F is G” propositions.

### Changed

- Use phrase form, noun/description, and predicate C inputs (same style as Expansion Engine) in Theory Comparator and Primary vs Secondary instead of free-text proposition.
- Add “Negated (is not)” checkbox in both comparator and occurrence sections.
- Restrict Theory Comparator and Primary vs Secondary to definite descriptions (“the [noun]”); show guidance when another form is selected.

### Removed

- Remove TRUE/FALSE/UNDEFINED badges from Primary vs Secondary occurrence panels.

## [0.2.0] - 2026-03-15

### Added

- Add KaTeX rendering for symbolic logic outputs in the Expansion Engine and other sections.
- Add free-text proposition input with "Analyze" in Theory Comparator and Primary vs Secondary Occurrence.

### Changed

- Replace fixed proposition dropdowns with optional free-text inputs and analyze flow in comparator and occurrence tools.
- Use relative path for companion iframe source in index for portable static hosting.

### Removed

- Remove Three Puzzles section from the interactive companion.
- Remove Acquaintance & Description section from the interactive companion.

## [0.1.0] - 2026-03-15

### Added

- Add full text of Russell’s “On Denoting” (1905) with two-column layout (paper left, companion right).
- Add interactive companion with Expansion Engine, Theory Comparator, and Primary vs Secondary Occurrence.
