# 🔥 Assign Assign Reviewers to PR

GitHub Action to assign PR reviewers based on list of comma-separated usernames

#### 📋 Billogram
Modified this action to take pull request number as an input parameter.
Also set node version to node16.

#### 📋 GitHub Action Inputs

**users** - comma-separated list of GitHub usernames

```
users: "itsOliverBott, SantaClaus, b4tman, sp0derman"
```

**ignore-drafts** - boolean to ignore PR's in draft mode (defaults to false if not provided)

```
ignore-drafts: true
```



#### 📋 Example YAML file configuration

```yaml
name: "Assign Reviewers to PR"

on:  
  pull_request:
    types: [opened, ready_for_review, reopened, review_requested, review_request_removed]
     
jobs:
  assign-pr-reviewers:
    runs-on: ubuntu-latest
    steps:
    - name: "Assign Reviewers to PR"
      uses: itsOliverBott/assign-pr-reviewers@release
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
        users: "itsOliverBott" # comma-separated (example: "itsOliverBott, SantaClaus, b4tman, sp0derman")
        ignore-drafts: true # defaults to false if not provided
```

