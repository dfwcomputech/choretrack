package com.computech.ctui.chore;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ChoreRepository {

	Optional<Chore> findById(String choreId);

	List<Chore> findByParentId(String parentId);

	List<Chore> findByAssignedChildId(String childId);

	List<Chore> findByAssignedChildIdAndDueDate(String childId, LocalDate dueDate);

	Chore save(Chore chore);
}
