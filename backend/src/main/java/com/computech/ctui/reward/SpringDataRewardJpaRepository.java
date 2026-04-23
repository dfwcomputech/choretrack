package com.computech.ctui.reward;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataRewardJpaRepository extends JpaRepository<RewardJpaEntity, String> {

	List<RewardJpaEntity> findByParentId(String parentId);
}
