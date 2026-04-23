package com.computech.ctui.reward;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

@Repository
public class JpaRewardRepository implements RewardRepository {

	private final SpringDataRewardJpaRepository repository;

	public JpaRewardRepository(final SpringDataRewardJpaRepository repository) {
		this.repository = repository;
	}

	@Override
	public Optional<Reward> findById(final String rewardId) {
		return repository.findById(rewardId).map(this::toDomain);
	}

	@Override
	public List<Reward> findByParentId(final String parentId) {
		return repository.findByParentId(parentId).stream().map(this::toDomain).toList();
	}

	@Override
	public Reward save(final Reward reward) {
		return toDomain(repository.save(toEntity(reward)));
	}

	private RewardJpaEntity toEntity(final Reward reward) {
		final RewardJpaEntity entity = new RewardJpaEntity();
		entity.setId(reward.id());
		entity.setName(reward.name());
		entity.setDescription(reward.description());
		entity.setPointCost(reward.pointCost());
		entity.setActive(reward.active());
		entity.setCategory(reward.category());
		entity.setImageRef(reward.imageRef());
		entity.setParentId(reward.parentId());
		entity.setCreatedAt(reward.createdAt());
		entity.setUpdatedAt(reward.updatedAt());
		entity.setDeletedAt(reward.deletedAt());
		return entity;
	}

	private Reward toDomain(final RewardJpaEntity entity) {
		return new Reward(
				entity.getId(),
				entity.getName(),
				entity.getDescription(),
				entity.getPointCost(),
				entity.isActive(),
				entity.getCategory(),
				entity.getImageRef(),
				entity.getParentId(),
				entity.getCreatedAt(),
				entity.getUpdatedAt(),
				entity.getDeletedAt());
	}
}
