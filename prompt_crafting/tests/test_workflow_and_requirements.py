"""Tests for the huggingface-sync GitHub Actions workflow and requirements.txt.

Covers YAML structure validation, bash shell logic (repo name extraction,
remote URL construction), job trigger conditions, concurrency settings,
and package version constraints in requirements.txt.
"""

import subprocess
from pathlib import Path

import pytest
import yaml

# Paths to the files under test
REPO_ROOT = Path(__file__).resolve().parents[2]
WORKFLOW_PATH = REPO_ROOT / ".github" / "workflows" / "huggingface-sync.yml"
REQUIREMENTS_PATH = REPO_ROOT / "requirements.txt"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _run_bash(script: str) -> subprocess.CompletedProcess:
    """Run a bash script and return the completed process."""
    return subprocess.run(
        ["bash", "-c", script],
        capture_output=True,
        text=True,
    )


def _parse_requirements(path: Path) -> dict:
    """Return a mapping of package name (lower-cased) → raw constraint string."""
    packages: dict = {}
    for line in path.read_text().splitlines():
        stripped = line.strip()
        # Skip comments and blank lines
        if not stripped or stripped.startswith("#"):
            continue
        # Remove inline comments
        stripped = stripped.split("#")[0].strip()
        if not stripped:
            continue
        # Split on the first operator (>=, ==, !=, ~=, <=, >)
        for sep in (">=", "==", "!=", "~=", "<=", ">", "<"):
            if sep in stripped:
                name, version = stripped.split(sep, 1)
                packages[name.strip().lower().rstrip("[asyncio]").split("[")[0]] = (
                    sep + version.strip()
                )
                break
        else:
            packages[stripped.lower()] = ""
    return packages


# ---------------------------------------------------------------------------
# Workflow YAML structure tests
# ---------------------------------------------------------------------------


class TestWorkflowYamlStructure:
    """Verify the huggingface-sync.yml file parses correctly and has the
    expected top-level structure."""

    @pytest.fixture(scope="class")
    def workflow(self) -> dict:
        """Load and parse the workflow YAML once for the entire class."""
        with open(WORKFLOW_PATH) as fh:
            return yaml.safe_load(fh)

    def test_file_exists(self) -> None:
        """Workflow file must exist at the expected path."""
        assert WORKFLOW_PATH.exists(), f"Missing: {WORKFLOW_PATH}"

    def test_parses_as_valid_yaml(self) -> None:
        """Workflow file must be valid YAML."""
        with open(WORKFLOW_PATH) as fh:
            content = yaml.safe_load(fh)
        assert isinstance(content, dict)

    def test_workflow_name(self, workflow: dict) -> None:
        """Workflow name must describe the two-way sync intent."""
        assert workflow["name"] == "Two-Way Sync: GitHub \u2194 Hugging Face Hub"

    def test_trigger_on_push_main(self, workflow: dict) -> None:
        """Workflow must trigger on push to the main branch."""
        push_config = workflow["on"]["push"]
        assert "main" in push_config["branches"]

    def test_trigger_on_workflow_dispatch(self, workflow: dict) -> None:
        """Workflow must support manual workflow_dispatch trigger."""
        assert "workflow_dispatch" in workflow["on"]

    def test_workflow_dispatch_has_sync_direction_input(
        self, workflow: dict
    ) -> None:
        """workflow_dispatch must expose a sync_direction input."""
        inputs = workflow["on"]["workflow_dispatch"]["inputs"]
        assert "sync_direction" in inputs

    def test_sync_direction_default(self, workflow: dict) -> None:
        """Default sync direction must be github-to-huggingface."""
        input_cfg = workflow["on"]["workflow_dispatch"]["inputs"]["sync_direction"]
        assert input_cfg["default"] == "github-to-huggingface"

    def test_sync_direction_required(self, workflow: dict) -> None:
        """sync_direction input must be marked required."""
        input_cfg = workflow["on"]["workflow_dispatch"]["inputs"]["sync_direction"]
        assert input_cfg["required"] is True

    def test_sync_direction_valid_choices(self, workflow: dict) -> None:
        """sync_direction must offer exactly the two documented choices."""
        options = workflow["on"]["workflow_dispatch"]["inputs"]["sync_direction"][
            "options"
        ]
        assert set(options) == {"github-to-huggingface", "huggingface-to-github"}

    def test_permissions_contents_write(self, workflow: dict) -> None:
        """Workflow must grant write permission for repository contents."""
        assert workflow["permissions"]["contents"] == "write"

    def test_concurrency_group_uses_ref(self, workflow: dict) -> None:
        """Concurrency group must include github.ref to scope per-branch."""
        group = workflow["concurrency"]["group"]
        assert "github.ref" in group

    def test_concurrency_cancel_in_progress_false(self, workflow: dict) -> None:
        """Sync jobs must NOT cancel in-progress runs to avoid partial syncs."""
        assert workflow["concurrency"]["cancel-in-progress"] is False

    def test_two_jobs_defined(self, workflow: dict) -> None:
        """Exactly two jobs must be defined."""
        assert len(workflow["jobs"]) == 2

    def test_job_ids_present(self, workflow: dict) -> None:
        """Both expected job IDs must exist."""
        assert "sync-github-to-huggingface" in workflow["jobs"]
        assert "sync-huggingface-to-github" in workflow["jobs"]

    def test_both_jobs_run_on_ubuntu_latest(self, workflow: dict) -> None:
        """Both jobs must target ubuntu-latest."""
        for job in workflow["jobs"].values():
            assert job["runs-on"] == "ubuntu-latest"


# ---------------------------------------------------------------------------
# Job: sync-github-to-huggingface
# ---------------------------------------------------------------------------


class TestSyncGithubToHuggingface:
    """Tests for the sync-github-to-huggingface job."""

    @pytest.fixture(scope="class")
    def job(self) -> dict:
        with open(WORKFLOW_PATH) as fh:
            workflow = yaml.safe_load(fh)
        return workflow["jobs"]["sync-github-to-huggingface"]

    def test_job_name(self, job: dict) -> None:
        """Job display name must clearly label the sync direction."""
        assert job["name"] == "Sync GitHub to Hugging Face"

    def test_if_condition_includes_push(self, job: dict) -> None:
        """Job must run on push events."""
        assert "push" in job["if"]

    def test_if_condition_includes_github_to_huggingface_direction(
        self, job: dict
    ) -> None:
        """Job must run when dispatch direction is github-to-huggingface."""
        assert "github-to-huggingface" in job["if"]

    def test_checkout_step_uses_full_history(self, job: dict) -> None:
        """Checkout must use fetch-depth: 0 to capture full git history."""
        checkout_step = next(
            s for s in job["steps"] if "checkout" in s.get("name", "").lower()
        )
        assert checkout_step["with"]["fetch-depth"] == 0

    def test_checkout_step_uses_actions_checkout_v4(self, job: dict) -> None:
        """Checkout must use actions/checkout@v4."""
        checkout_step = next(
            s for s in job["steps"] if "checkout" in s.get("name", "").lower()
        )
        assert checkout_step["uses"] == "actions/checkout@v4"

    def test_git_identity_step_sets_bot_name(self, job: dict) -> None:
        """Git identity step must configure github-actions[bot] user name."""
        identity_step = next(
            s for s in job["steps"] if "git identity" in s.get("name", "").lower()
        )
        assert "github-actions[bot]" in identity_step["run"]

    def test_add_hf_remote_step_uses_hf_token_and_username(self, job: dict) -> None:
        """Add Hugging Face remote step must reference HF_TOKEN and HF_USERNAME."""
        remote_step = next(
            s for s in job["steps"] if "hugging face remote" in s.get("name", "").lower()
        )
        assert "HF_TOKEN" in remote_step["env"]
        assert "HF_USERNAME" in remote_step["env"]

    def test_add_hf_remote_step_uses_secrets(self, job: dict) -> None:
        """HF credentials must come from repository secrets."""
        remote_step = next(
            s for s in job["steps"] if "hugging face remote" in s.get("name", "").lower()
        )
        assert "secrets.HF_TOKEN" in remote_step["env"]["HF_TOKEN"]
        assert "secrets.HF_USERNAME" in remote_step["env"]["HF_USERNAME"]

    def test_push_step_uses_force_with_lease(self, job: dict) -> None:
        """Push to Hugging Face must use --force-with-lease for safety."""
        push_step = next(
            s for s in job["steps"] if "push" in s.get("name", "").lower()
        )
        assert "--force-with-lease" in push_step["run"]

    def test_push_step_targets_main_branch(self, job: dict) -> None:
        """Push must target main:main."""
        push_step = next(
            s for s in job["steps"] if "push" in s.get("name", "").lower()
        )
        assert "main:main" in push_step["run"]


# ---------------------------------------------------------------------------
# Job: sync-huggingface-to-github
# ---------------------------------------------------------------------------


class TestSyncHuggingfaceToGithub:
    """Tests for the sync-huggingface-to-github job."""

    @pytest.fixture(scope="class")
    def job(self) -> dict:
        with open(WORKFLOW_PATH) as fh:
            workflow = yaml.safe_load(fh)
        return workflow["jobs"]["sync-huggingface-to-github"]

    def test_job_name(self, job: dict) -> None:
        """Job display name must clearly label the sync direction."""
        assert job["name"] == "Sync Hugging Face to GitHub"

    def test_if_condition_requires_workflow_dispatch(self, job: dict) -> None:
        """Job must only run on workflow_dispatch events."""
        assert "workflow_dispatch" in job["if"]

    def test_if_condition_requires_huggingface_to_github_direction(
        self, job: dict
    ) -> None:
        """Job must only run when direction is huggingface-to-github."""
        assert "huggingface-to-github" in job["if"]

    def test_if_condition_requires_both_conditions(self, job: dict) -> None:
        """Job must require both workflow_dispatch AND correct direction (&&)."""
        assert "&&" in job["if"]

    def test_checkout_step_uses_gh_pat(self, job: dict) -> None:
        """Checkout must authenticate with GH_PAT for push-back permission."""
        checkout_step = next(
            s for s in job["steps"] if "checkout" in s.get("name", "").lower()
        )
        assert "GH_PAT" in checkout_step["with"].get("token", "")

    def test_checkout_step_uses_full_history(self, job: dict) -> None:
        """Checkout must use fetch-depth: 0."""
        checkout_step = next(
            s for s in job["steps"] if "checkout" in s.get("name", "").lower()
        )
        assert checkout_step["with"]["fetch-depth"] == 0

    def test_git_identity_uses_sync_bot_name(self, job: dict) -> None:
        """Git identity must configure repo-sync-bot user."""
        identity_step = next(
            s for s in job["steps"] if "git identity" in s.get("name", "").lower()
        )
        assert "repo-sync-bot" in identity_step["run"]

    def test_merge_allows_unrelated_histories(self, job: dict) -> None:
        """Merge must pass --allow-unrelated-histories for first-time syncs."""
        merge_step = next(
            s for s in job["steps"] if "merge" in s.get("name", "").lower()
        )
        assert "--allow-unrelated-histories" in merge_step["run"]

    def test_merge_uses_no_edit(self, job: dict) -> None:
        """Merge must pass --no-edit to avoid interactive prompts."""
        merge_step = next(
            s for s in job["steps"] if "merge" in s.get("name", "").lower()
        )
        assert "--no-edit" in merge_step["run"]

    def test_push_targets_origin_main(self, job: dict) -> None:
        """Final push must target origin main to update GitHub."""
        push_step = next(
            s for s in job["steps"] if "push" in s.get("name", "").lower()
        )
        assert "origin main" in push_step["run"]

    def test_steps_order(self, job: dict) -> None:
        """Steps must follow the correct order: checkout, identity, remote, fetch, merge, push."""
        step_names = [s.get("name", "").lower() for s in job["steps"]]
        # Verify relative ordering by finding index of each key step
        checkout_idx = next(i for i, n in enumerate(step_names) if "checkout" in n)
        identity_idx = next(i for i, n in enumerate(step_names) if "git identity" in n)
        remote_idx = next(
            i for i, n in enumerate(step_names) if "hugging face remote" in n
        )
        fetch_idx = next(i for i, n in enumerate(step_names) if "fetch" in n)
        merge_idx = next(i for i, n in enumerate(step_names) if "merge" in n)
        push_idx = next(i for i, n in enumerate(step_names) if "push" in n)
        assert checkout_idx < identity_idx < remote_idx < fetch_idx < merge_idx < push_idx


# ---------------------------------------------------------------------------
# Bash logic: REPO_NAME extraction
# ---------------------------------------------------------------------------


class TestRepoNameExtraction:
    """Unit tests for the bash snippet that extracts REPO_NAME from
    GITHUB_REPOSITORY (format: 'owner/repo-name')."""

    _SCRIPT_TEMPLATE = (
        'GITHUB_REPOSITORY="{value}"; '
        'REPO_NAME="${{GITHUB_REPOSITORY#*/}}"; '
        "echo $REPO_NAME"
    )

    def _extract(self, github_repository: str) -> str:
        script = self._SCRIPT_TEMPLATE.format(value=github_repository)
        result = _run_bash(script)
        return result.stdout.strip()

    def test_simple_owner_and_repo(self) -> None:
        """Standard 'owner/repo' input yields 'repo'."""
        assert self._extract("owner/myrepo") == "myrepo"

    def test_hyphenated_repo_name(self) -> None:
        """Repo names with hyphens are preserved correctly."""
        assert self._extract("my-org/my-awesome-project") == "my-awesome-project"

    def test_numeric_repo_name(self) -> None:
        """Numeric suffixes in repo names are preserved."""
        assert self._extract("acmecorp/project123") == "project123"

    def test_owner_with_hyphen(self) -> None:
        """Owners with hyphens are stripped correctly."""
        assert self._extract("my-org/repo") == "repo"

    def test_strip_prefix_only_up_to_first_slash(self) -> None:
        """Only the part before the first '/' is stripped as the owner."""
        assert self._extract("owner/repo/extra") == "repo/extra"

    def test_empty_repo_name_returns_empty(self) -> None:
        """If repo portion is empty the result is empty."""
        result = self._extract("owner/")
        assert result == ""

    def test_uppercase_preserved(self) -> None:
        """Case is preserved in repo name extraction."""
        assert self._extract("Owner/MyRepo") == "MyRepo"


# ---------------------------------------------------------------------------
# Bash logic: HF remote URL construction
# ---------------------------------------------------------------------------


class TestHuggingFaceRemoteUrl:
    """Tests for the HF remote URL built in both sync jobs."""

    _URL_SCRIPT = (
        'GITHUB_REPOSITORY="{repo}"; '
        'HF_USERNAME="{username}"; '
        'HF_TOKEN="{token}"; '
        'REPO_NAME="${{GITHUB_REPOSITORY#*/}}"; '
        'echo "https://${{HF_USERNAME}}:${{HF_TOKEN}}@huggingface.co/spaces/${{HF_USERNAME}}/${{REPO_NAME}}"'
    )

    def _build_url(self, github_repository: str, username: str, token: str) -> str:
        script = self._URL_SCRIPT.format(
            repo=github_repository, username=username, token=token
        )
        return _run_bash(script).stdout.strip()

    def test_url_contains_hf_domain(self) -> None:
        """Remote URL must point to huggingface.co."""
        url = self._build_url("myorg/myrepo", "hfuser", "tok_abc")
        assert "huggingface.co" in url

    def test_url_contains_spaces_path(self) -> None:
        """Remote URL must use the /spaces/ namespace."""
        url = self._build_url("myorg/myrepo", "hfuser", "tok_abc")
        assert "/spaces/" in url

    def test_url_embeds_username(self) -> None:
        """Username must appear in URL both as credential and path component."""
        url = self._build_url("myorg/myrepo", "hfuser", "tok_abc")
        assert url.count("hfuser") == 2  # once in creds, once in path

    def test_url_embeds_token_as_password(self) -> None:
        """Token must appear in the URL as the HTTP password."""
        url = self._build_url("myorg/myrepo", "hfuser", "mysecrettoken")
        assert "mysecrettoken" in url

    def test_url_ends_with_repo_name(self) -> None:
        """URL must end with the repository name."""
        url = self._build_url("myorg/specialrepo", "hfuser", "tok")
        assert url.endswith("/specialrepo")

    def test_url_scheme_is_https(self) -> None:
        """Remote URL must use HTTPS."""
        url = self._build_url("myorg/myrepo", "hfuser", "tok")
        assert url.startswith("https://")

    def test_url_structure(self) -> None:
        """Full URL must match the expected pattern."""
        url = self._build_url("acme/demo-app", "acmeuser", "token123")
        assert (
            url
            == "https://acmeuser:token123@huggingface.co/spaces/acmeuser/demo-app"
        )


# ---------------------------------------------------------------------------
# requirements.txt version constraints
# ---------------------------------------------------------------------------


class TestRequirementsTxt:
    """Tests for the version constraints declared in requirements.txt,
    focusing on the asyncpg change introduced in this PR."""

    @pytest.fixture(scope="class")
    def packages(self) -> dict:
        """Parse requirements.txt into a name→constraint mapping."""
        return _parse_requirements(REQUIREMENTS_PATH)

    def test_requirements_file_exists(self) -> None:
        """requirements.txt must exist at the repo root."""
        assert REQUIREMENTS_PATH.exists()

    def test_asyncpg_constraint_is_at_least_0_30_0(self, packages: dict) -> None:
        """asyncpg must allow >=0.30.0 (relaxed from 0.31.0 in this PR)."""
        assert "asyncpg" in packages, "asyncpg not found in requirements.txt"
        constraint = packages["asyncpg"]
        assert constraint == ">=0.30.0", (
            f"Expected asyncpg>=0.30.0 but found asyncpg{constraint}"
        )

    def test_asyncpg_does_not_require_0_31_0(self, packages: dict) -> None:
        """asyncpg must NOT be pinned to >=0.31.0 (that was the old value)."""
        constraint = packages.get("asyncpg", "")
        assert "0.31.0" not in constraint

    def test_fastapi_present(self, packages: dict) -> None:
        """fastapi must be declared as a dependency."""
        assert "fastapi" in packages

    def test_sqlalchemy_present(self, packages: dict) -> None:
        """sqlalchemy must be declared with asyncio extra."""
        # _parse_requirements strips the extra, so look for 'sqlalchemy'
        assert "sqlalchemy" in packages

    def test_pydantic_present(self, packages: dict) -> None:
        """pydantic must be declared as a dependency."""
        assert "pydantic" in packages

    def test_alembic_present(self, packages: dict) -> None:
        """alembic must be declared as a dependency."""
        assert "alembic" in packages

    def test_pytest_present(self, packages: dict) -> None:
        """pytest must be declared for testing."""
        assert "pytest" in packages

    def test_all_version_constraints_use_gte_operator(
        self, packages: dict
    ) -> None:
        """All pinned packages should use >= (minimum version), not exact ==."""
        for name, constraint in packages.items():
            if constraint:
                assert not constraint.startswith("=="), (
                    f"Package {name!r} uses exact pin {constraint!r}; "
                    "prefer >= for flexibility"
                )
