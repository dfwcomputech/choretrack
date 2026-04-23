package com.computech.ctui.reward;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

public class InMemoryRewardRepository implements RewardRepository {

private final ConcurrentMap<String, Reward> rewardsById = new ConcurrentHashMap<>();

@Override
public Optional<Reward> findById(final String rewardId) {
return Optional.ofNullable(rewardsById.get(rewardId));
}

@Override
public List<Reward> findByParentId(final String parentId) {
return rewardsById.values()
.stream()
.filter(reward -> parentId.equals(reward.parentId()))
.toList();
}

@Override
public Reward save(final Reward reward) {
rewardsById.put(reward.id(), reward);
return reward;
}
}
