# Pull Request Assigner

An action which adds reviewers to the pull request when the pull request is opened.

## :arrow_forward: Usage

Create a workflow (e.g. `.github/workflows/action.yml` For more detail, refer to [Configuring a workflow](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file)) for running the auto-assign action.

```yml
name: 'Pull Request Assigner'
on:
  pull_request:
    types: [opened, ready_for_review]

jobs:
  add-reviewers:
    runs-on: ubuntu-latest
    steps:
      - uses: examedi/pull-request-assigner@v0.1.0
        with:
          configuration-path: '.github/some_name_for_configs.yml' # Only needed if you use something other than .github/auto_assign.yml
```

Change event that triggers a workflow to the `pull_request_target` if you want to enable the auto-assign action when opening pull requests from fork repositories or bots like Dependabot.

Using dangerous misuse of the `pull_request_target` event can be a security risk, so make sure you understand pros and cons before using it.

See below for details:

- [Events that trigger workflows / Pull request target - GitHub Docs](https://docs.github.com/en/actions/learn-github-actions/events-that-trigger-workflows#pull_request_target)
- [Events that trigger workflows / Pull request events for forked repositories - GitHub Docs](https://docs.github.com/en/actions/learn-github-actions/events-that-trigger-workflows#pull-request-events-for-forked-repositories)

```diff
name: 'Pull Request Assigner'
 on:
-  pull_request:
+  pull_request_target:
     types: [opened, ready_for_review]

 jobs:
```

Create a separate configuration file for the auto-assign action (e.g. `.github/auto_assign.yml`).

### Single Reviewers List

Add reviewers/assignees to the pull request based on single reviewers list.

```yaml
# Set to true to add reviewers to pull requests
addReviewers: true

# Set to true to add assignees to pull requests
addAssignees: false

# A list of reviewers to be added to pull requests (GitHub user name)
reviewers:
  - reviewerA
  - reviewerB
  - reviewerC

# A number of reviewers added to the pull request
# Set 0 to add all the reviewers (default: 0)
numberOfReviewers: 0
# A list of assignees, overrides reviewers if set
# assignees:
#   - assigneeA

# A number of assignees to add to the pull request
# Set to 0 to add all of the assignees.
# Uses numberOfReviewers if unset.
# numberOfAssignees: 2

# A list of keywords to be skipped the process that add reviewers if pull requests include it
# skipKeywords:
#   - wip
```

### Multiple Reviewers List

Add reviewers/assignees to the pull request based on multiple reviewers list.

If you and peers work at the separate office or they work at the separate team by roles like frontend and backend, you might be good to use adding reviewers from each group.

```yaml
# Set to true to add reviewers to pull requests
addReviewers: true

# Set to true to add assignees to pull requests
addAssignees: false

# A number of reviewers added to the pull request from each group
# Set 0 to add all the reviewers (default: 0)
numberOfReviewers: 1

# A number of assignees to add to the pull request
# Set to 0 to add all of the assignees.
# Uses numberOfReviewers if unset.
# numberOfAssignees: 2

# Set to true to add reviewers from different groups to pull requests
useReviewGroups: true

# A list of reviewers, split into different groups, to be added to pull requests (GitHub user name)
reviewGroups:
  groupA:
    - reviewerA
    - reviewerB
    - reviewerC
  groupB:
    - reviewerD
    - reviewerE
    - reviewerF

# Set to true to add assignees from different groups to pull requests
useAssigneeGroups: false
# A list of assignees, split into different froups, to be added to pull requests (GitHub user name)
# assigneeGroups:
#   groupA:
#     - assigneeA
#     - assigneeB
#     - assigneeC
#   groupB:
#     - assigneeD
#     - assigneeE
#     - assigneeF

# A list of keywords to be skipped the process that add reviewers if pull requests include it
# skipKeywords:
#   - wip
```

### Availability Exceptions

If you want some users to _not_ get assigned pull requests on certain week days, you need to add said users to the list of availability exceptions.



```yaml
# Set to true to add reviewers to pull requests
addReviewers: true

# Set to true to add assignees to pull requests
addAssignees: false

# A number of reviewers added to the pull request from each group
# Set 0 to add all the reviewers (default: 0)
numberOfReviewers: 1

# A number of assignees to add to the pull request
# Set to 0 to add all of the assignees.
# Uses numberOfReviewers if unset.
# numberOfAssignees: 2

# Set to true to add reviewers from different groups to pull requests
useReviewGroups: true

# A list of reviewers, split into different groups, to be added to pull requests (GitHub user name)
reviewGroups:
  groupA:
    - reviewerA
    - reviewerB
  groupB:
    - reviewerC
    - reviewerD

# Add users to certain days and they wont be in the pool of possible reviewers nor in the pool of possible assignees on said days
availabilityExceptions:
  # Since all reviewers are in monday, mondays no one will be assigned
  monday:
    - reviewerA
    - reviewerB
    - reviewerC
    - reviewerD
  # Since both reviewers from group A are in tuesday, only 1 reviewer from group B will be assigned
  tuesday:
    - reviewerA
    - reviewerB
  # Since reviewer A is in friday, he will be removed from the pool of possible assignees for pull requests opened on fridays
  friday:
    - reviewerA

# If a week day isn't present (like in this example wednesday, thursday, saturday and sunday) that day all reviewers will be available
```

### Assign Author as Assignee

Add the PR creator as the assignee of the pull request.

```yaml
# Set addAssignees to 'author' to set the PR creator as the assignee.
addAssignees: author
```

### Filter by label

The action will only run if the PR meets the specified filters

```yaml
filterLabels:
  # Run
  include:
    - my_label
    - another_label
  # Not run
  exclude:
    - wip
```

### Filter draft PRs

The action will only run for non draft PRs. If you want to run for all PRs, you need to enable it to run o drafts

```yaml
runOnDraft: true
```
