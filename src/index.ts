import * as core from '@actions/core';
import * as github from '@actions/github';
import { Context } from '@actions/github/lib/context';

(async () => {
    try {
        const context: Context = github?.context;
        const token: string = core.getInput('token', { required: true });
        const pr_number: string = core.getInput('pr_number', { required: true });
        const ignoreDrafts: string = core.getInput('ignore-drafts', { required: false });
        const users: string[] = getCleanUsersList(context, core.getInput('users', { required: true }));

        const { data: pullRequest } = await octokit.pulls.get({
            owner: context?.repo?.owner,
            repo: context?.repo?.repo,
            pull_number: Number(pr_number),
            mediaType: {
              format: 'diff'
            }
        });
        core.info(`XXX: ${pullRequest.requested_reviewers}`);

        if (!token) {
            return core.setFailed(`Required input "token" not provided`);
        }

        if (!users?.length) {
            return core.info(`Required input "users" not provided, at least one must be provided`);
        }

        if (isDraft(context) && ignoreDrafts) {
            return core.info(`Ignoring due to draft PR`);
        }

        if (!hasValidOwnerInContext(context)) {
            return core.setFailed(`Valid owner is missing from context`);
        }

        if (!hasValidRepoInContext(context)) {
            return core.setFailed(`Valid repo is missing from context`);
        }

        core.setSecret(token);



        const octokit = github.getOctokit(token);
        await octokit.pulls.requestReviewers({
            owner: context?.repo?.owner,
            repo: context?.repo?.repo,
            pull_number: Number(pr_number),
            reviewers: users
        });

        core.info(`${JSON.stringify(users)} assigned for review of Pull Request #${pr_number} on ${context?.repo?.repo}`);

    } catch (error) {
        core.setFailed(error?.message);

        throw error;
    }
})();

function getCleanUsersList(context: Context, rawUserList: string = ``): string[] {
    let users: string[] = [...rawUserList?.split(',')?.map(user => user?.trim())];
    users = filterDuplicateUsers(users);

    return users;
}

function filterDuplicateUsers(users: string[] = []): string[] {
    return [...new Set(users)];
}

function filterPullRequestAuthor(context: Context, users: string[] = []): string[] {
    return [...users?.filter(user => user !== getPullRequestAuthor(context))];
}

function filterExistingReviewers(context: Context, users: string[] = []): string[] {
    const existingReviewers: string[] = getExistingReviewers(context);
    return [...users?.filter(user => existingReviewers.indexOf(user) === -1)];
}

function getPullRequestAuthor(context: Context): string {
    return context?.payload?.pull_request?.user?.login;
}

function hasValidOwnerInContext(context: Context): boolean {
    return !!context?.repo?.owner;
}

function hasValidRepoInContext(context: Context): boolean {
    return !!context?.repo?.repo;
}

function getExistingReviewers(context: Context): string[] | null {
    return context?.payload?.pull_request?.requested_reviewers;
}

function isDraft(context: Context): boolean {
    return context?.payload?.pull_request?.draft;
}
