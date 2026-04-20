package com.computech.ctui.reward;

import java.util.List;
import java.util.Optional;

public interface RewardRepository {

Optional<Reward> findById(String rewardId);

List<Reward> findByParentId(String parentId);

Reward save(Reward reward);
}
