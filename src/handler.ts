import * as core from '@actions/core';
import * as utils from './utils';
import { Context } from '@actions/github/lib/context';
import { PullRequestEvent } from '@octokit/webhooks-types';
import { PullRequest } from './pr';
import { Client } from './types'

export interface Config {
  addReviewers: boolean;
  addAssignees: boolean | string;
  reviewers: string[];
  assignees: string[];
  filterLabels?: {
    include?: string[];
    exclude?: string[];
  };
  numberOfAssignees: number;
  numberOfReviewers: number;
  skipKeywords: string[];
  useReviewGroups: boolean;
  useAssigneeGroups: boolean;
  reviewGroups: { [key: string]: string[] };
  assigneeGroups: { [key: string]: string[] };
  availabilityExceptions: { [key: string]: string[] };
  runOnDraft?: boolean;
}

export async function handlePullRequest(
  client: Client,
  context: Context,
  config: Config
) {
  if (!context.payload.pull_request) {
    throw new Error('the webhook payload does not exist');
  }

  const { pull_request: event } = context.payload as PullRequestEvent;
  const { title, draft, user, number } = event;
  const {
    skipKeywords,
    useReviewGroups,
    useAssigneeGroups,
    reviewGroups,
    availabilityExceptions,
    assigneeGroups,
    addReviewers,
    addAssignees,
    filterLabels,
    runOnDraft,
  } = config;

  if (skipKeywords && utils.includesSkipKeywords(title, skipKeywords)) {
    core.info(
      'Skips the process to add reviewers/assignees since PR title includes skip-keywords'
    );
    return;
  }
  if (!runOnDraft && draft) {
    core.info(
      'Skips the process to add reviewers/assignees since PR type is draft'
    );
    return;
  }

  if (useReviewGroups && !reviewGroups) {
    throw new Error(
      "Error in configuration file to do with using review groups. Expected 'reviewGroups' variable to be set because the variable 'useReviewGroups' = true."
    );
  }

  if (useAssigneeGroups && !assigneeGroups) {
    throw new Error(
      "Error in configuration file to do with using review groups. Expected 'assigneeGroups' variable to be set because the variable 'useAssigneeGroups' = true."
    );
  }

  const owner = user.login;
  const pr = new PullRequest(client, context);

  if (filterLabels !== undefined) {
    if (filterLabels.include !== undefined && filterLabels.include.length > 0) {
      const hasLabels = pr.hasAnyLabel(filterLabels.include);
      if (!hasLabels) {
        core.info(
          'Skips the process to add reviewers/assignees since PR is not tagged with any of the filterLabels.include'
        );
        return;
      }
    }

    if (filterLabels.exclude !== undefined && filterLabels.exclude.length > 0) {
      const hasLabels = pr.hasAnyLabel(filterLabels.exclude);
      if (hasLabels) {
        core.info(
          'Skips the process to add reviewers/assignees since PR is tagged with any of the filterLabels.exclude'
        );
        return;
      }
    }
  }

  let unavailableUsers: string[] = [];
  if (availabilityExceptions !== undefined) {
    unavailableUsers = utils.getUnavailableUsers(availabilityExceptions);
    core.info(`Unavailable users today: ${unavailableUsers}`);
  }

  if (addReviewers) {
    try {
      const reviewers = utils.chooseReviewers(owner, config, unavailableUsers);

      if (reviewers.length > 0) {
        await pr.addReviewers(reviewers);
        core.info(`Added reviewers to PR #${number}: ${reviewers.join(', ')}`);
      } else {
        core.info(`No reviewers available, no reviews requested.`);
      }
    } catch (error) {
      if (error instanceof Error) {
        core.warning(error.message);
      }
    }
  }

  if (addAssignees) {
    try {
      const assignees = utils.chooseAssignees(owner, config, unavailableUsers);

      if (assignees.length > 0) {
        await pr.addAssignees(assignees);
        core.info(`Added assignees to PR #${number}: ${assignees.join(', ')}`);
      } else {
        core.info(`No possible assignees available, no one assigned.`);
      }
    } catch (error) {
      if (error instanceof Error) {
        core.warning(error.message);
      }
    }
  }
}
