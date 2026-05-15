```markdown
# prompt-crafting Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches you the development patterns and conventions used in the `prompt-crafting` Python repository. You'll learn about file naming, import/export styles, commit message patterns, and how to write and run tests. This guide is ideal for contributors who want to align with the project's established practices.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `promptBuilder.py`, `testSuite.py`

### Import Style
- Use **relative imports** within the codebase.
  - Example:
    ```python
    from .utils import formatPrompt
    ```

### Export Style
- Use **named exports** (explicitly define what is exported).
  - Example:
    ```python
    __all__ = ['formatPrompt', 'validateInput']
    ```

### Commit Messages
- Commit types are **mixed**, with some using the `chore` prefix.
- Average commit message length is about 60 characters.
  - Example:
    ```
    chore: update prompt validation logic for edge cases
    ```

## Workflows

### Code Contribution
**Trigger:** When adding or updating code in the repository  
**Command:** `/contribute-code`

1. Create your Python file using camelCase naming.
2. Use relative imports for internal modules.
3. Define exports using `__all__` in your modules.
4. Write or update tests in files matching `*.test.*`.
5. Commit changes with a descriptive message, optionally prefixed (e.g., `chore:`).
6. Push your branch and open a pull request.

### Testing Code
**Trigger:** When verifying code correctness  
**Command:** `/run-tests`

1. Identify test files (pattern: `*.test.*`).
2. Run tests using your preferred Python test runner (e.g., `pytest`, `unittest`).
3. Review test results and fix any failures.

## Testing Patterns

- Test files follow the pattern: `*.test.*` (e.g., `promptBuilder.test.py`).
- The specific test framework is not enforced; use any standard Python testing tool.
- Place tests alongside or near the modules they test.

  Example test file:
  ```python
  # promptBuilder.test.py
  from .promptBuilder import formatPrompt

  def test_formatPrompt():
      assert formatPrompt("hello") == "Prompt: hello"
  ```

## Commands
| Command         | Purpose                                        |
|-----------------|------------------------------------------------|
| /contribute-code| Step-by-step guide for contributing code       |
| /run-tests      | Instructions for running the test suite        |
```
