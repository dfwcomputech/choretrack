package com.computech.ctui.chore;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataChoreJpaRepository extends JpaRepository<ChoreJpaEntity, String> {

	List<ChoreJpaEntity> findByParentId(String parentId);

	List<ChoreJpaEntity> findByAssignedChildId(String childId);

	List<ChoreJpaEntity> findByAssignedChildIdAndDueDate(String childId, LocalDate dueDate);
}
