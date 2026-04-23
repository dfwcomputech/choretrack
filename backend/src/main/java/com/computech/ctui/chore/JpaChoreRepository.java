package com.computech.ctui.chore;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

@Repository
public class JpaChoreRepository implements ChoreRepository {

	private final SpringDataChoreJpaRepository repository;

	public JpaChoreRepository(final SpringDataChoreJpaRepository repository) {
		this.repository = repository;
	}

	@Override
	public Optional<Chore> findById(final String choreId) {
		return repository.findById(choreId).map(this::toDomain);
	}

	@Override
	public List<Chore> findByParentId(final String parentId) {
		return repository.findByParentId(parentId).stream().map(this::toDomain).toList();
	}

	@Override
	public List<Chore> findByAssignedChildId(final String childId) {
		return repository.findByAssignedChildId(childId).stream().map(this::toDomain).toList();
	}

	@Override
	public List<Chore> findByAssignedChildIdAndDueDate(final String childId, final LocalDate dueDate) {
		return repository.findByAssignedChildIdAndDueDate(childId, dueDate).stream().map(this::toDomain).toList();
	}

	@Override
	public Chore save(final Chore chore) {
		return toDomain(repository.save(toEntity(chore)));
	}

	private ChoreJpaEntity toEntity(final Chore chore) {
		final ChoreJpaEntity entity = new ChoreJpaEntity();
		entity.setId(chore.id());
		entity.setTitle(chore.title());
		entity.setDescription(chore.description());
		entity.setPoints(chore.points());
		entity.setAssignedChildId(chore.assignedChildId());
		entity.setDueDate(chore.dueDate());
		entity.setStatus(chore.status());
		entity.setParentId(chore.parentId());
		entity.setCreatedAt(chore.createdAt());
		entity.setUpdatedAt(chore.updatedAt());
		entity.setActive(chore.active());
		entity.setDeletedAt(chore.deletedAt());
		entity.setCompletedAt(chore.completedAt());
		entity.setCompletedByChildId(chore.completedByChildId());
		entity.setRecurrenceSeriesId(chore.recurrenceSeriesId());
		entity.setRecurrenceType(chore.recurrenceType());
		entity.setRecurrenceTimeOfDay(chore.recurrenceTimeOfDay());
		return entity;
	}

	private Chore toDomain(final ChoreJpaEntity entity) {
		return new Chore(
				entity.getId(),
				entity.getTitle(),
				entity.getDescription(),
				entity.getPoints(),
				entity.getAssignedChildId(),
				entity.getDueDate(),
				entity.getStatus(),
				entity.getParentId(),
				entity.getCreatedAt(),
				entity.getUpdatedAt(),
				entity.isActive(),
				entity.getDeletedAt(),
				entity.getCompletedAt(),
				entity.getCompletedByChildId(),
				entity.getRecurrenceSeriesId(),
				entity.getRecurrenceType(),
				entity.getRecurrenceTimeOfDay());
	}
}
