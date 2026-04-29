package com.computech.ctui.auth;

import org.springframework.stereotype.Service;

@Service
public class AccountPlanService {

	public static final int FREE_MAX_CHILDREN = 2;
	public static final int FREE_MAX_ACTIVE_CHORES = 10;
	public static final int FREE_MAX_ACTIVE_REWARDS = 5;

	public void enforceChildCreationLimit(final UserAccount parent, final long currentActiveChildCount) {
		if (parent.accountType() != AccountType.FREE) {
			return;
		}
		if (currentActiveChildCount >= FREE_MAX_CHILDREN) {
			throw new AccountPlanLimitException(
					"Free accounts can only create " + FREE_MAX_CHILDREN + " children account.",
					"accountType");
		}
	}

	public void enforceChoreCreationLimit(final UserAccount parent, final long currentActiveChoreCount) {
		if (parent.accountType() != AccountType.FREE) {
			return;
		}
		if (currentActiveChoreCount >= FREE_MAX_ACTIVE_CHORES) {
			throw new AccountPlanLimitException(
					"Free accounts can only create " + FREE_MAX_ACTIVE_CHORES + " active chores.",
					"accountType");
		}
	}

	public void enforceRewardCreationLimit(final UserAccount parent, final long currentActiveRewardCount) {
		if (parent.accountType() != AccountType.FREE) {
			return;
		}
		if (currentActiveRewardCount >= FREE_MAX_ACTIVE_REWARDS) {
			throw new AccountPlanLimitException(
					"Free accounts can only create " + FREE_MAX_ACTIVE_REWARDS + " rewards.",
					"accountType");
		}
	}
}
