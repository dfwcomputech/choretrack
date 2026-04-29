package com.computech.ctui.reward;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.computech.ctui.auth.AccountPlanService;
import com.computech.ctui.auth.AccountRole;
import com.computech.ctui.auth.ForbiddenOperationException;
import com.computech.ctui.auth.UserAccount;
import com.computech.ctui.auth.UserAccountRepository;

@Service
public class RewardService {

private final RewardRepository rewardRepository;
private final UserAccountRepository userAccountRepository;
private final AccountPlanService accountPlanService;

public RewardService(final RewardRepository rewardRepository, final UserAccountRepository userAccountRepository,
		final AccountPlanService accountPlanService) {
this.rewardRepository = rewardRepository;
this.userAccountRepository = userAccountRepository;
this.accountPlanService = accountPlanService;
}

public List<RewardResponse> listActiveRewards(final String authenticatedUsername) {
final UserAccount parent = resolveParent(authenticatedUsername, "only parent users can manage rewards");
return rewardRepository.findByParentId(parent.id())
.stream()
.filter(Reward::active)
.map(this::toResponse)
.toList();
}

public synchronized RewardResponse createReward(final RewardCreateRequest request, final String authenticatedUsername) {
final UserAccount parent = resolveParent(authenticatedUsername, "only parent users can manage rewards");
final long activeRewardCount = rewardRepository.findByParentId(parent.id())
		.stream()
		.filter(Reward::active)
		.count();
accountPlanService.enforceRewardCreationLimit(parent, activeRewardCount);
final Instant now = Instant.now();
final Reward created = rewardRepository.save(new Reward(
UUID.randomUUID().toString(),
request.name().trim(),
normalizeValue(request.description()),
request.pointCost(),
request.active() == null ? true : request.active(),
normalizeValue(request.category()),
normalizeValue(request.imageRef()),
parent.id(),
now,
now,
null));
return toResponse(created);
}

public synchronized RewardResponse updateReward(final String rewardId, final RewardUpdateRequest request,
final String authenticatedUsername) {
final UserAccount parent = resolveParent(authenticatedUsername, "only parent users can manage rewards");
final Reward existing = resolveOwnedReward(rewardId, parent.id());
final Instant now = Instant.now();
final Reward updated = rewardRepository.save(new Reward(
existing.id(),
request.name().trim(),
normalizeValue(request.description()),
request.pointCost(),
request.active(),
normalizeValue(request.category()),
normalizeValue(request.imageRef()),
existing.parentId(),
existing.createdAt(),
now,
existing.deletedAt()));
return toResponse(updated);
}

public synchronized RewardDeleteResponse deleteReward(final String rewardId, final String authenticatedUsername) {
final UserAccount parent = resolveParent(authenticatedUsername, "only parent users can manage rewards");
final Reward existing = resolveOwnedReward(rewardId, parent.id());
if (existing.active()) {
final Instant now = Instant.now();
rewardRepository.save(new Reward(
existing.id(),
existing.name(),
existing.description(),
existing.pointCost(),
false,
existing.category(),
existing.imageRef(),
existing.parentId(),
existing.createdAt(),
now,
now));
}
return new RewardDeleteResponse("Reward deleted successfully");
}

private Reward resolveOwnedReward(final String rewardId, final String parentId) {
final Reward reward = rewardRepository.findById(rewardId)
.filter(Reward::active)
.orElseThrow(() -> new RewardNotFoundException("reward not found"));
if (!parentId.equals(reward.parentId())) {
throw new ForbiddenOperationException("parent cannot access this reward");
}
return reward;
}

private UserAccount resolveParent(final String authenticatedUsername, final String forbiddenMessage) {
final UserAccount parent = userAccountRepository.findByUsernameIgnoreCase(authenticatedUsername)
.orElseThrow(() -> new ForbiddenOperationException(forbiddenMessage));
if (parent.role() != AccountRole.PARENT) {
throw new ForbiddenOperationException(forbiddenMessage);
}
return parent;
}

private String normalizeValue(final String value) {
if (value == null || value.isBlank()) {
return null;
}
return value.trim();
}

private RewardResponse toResponse(final Reward reward) {
return new RewardResponse(
reward.id(),
reward.name(),
reward.description(),
reward.pointCost(),
reward.active(),
reward.category(),
reward.imageRef(),
reward.createdAt(),
reward.updatedAt());
}
}
