package com.computech.ctui.chore;

import java.util.List;
import java.util.Optional;

public interface ChoreRepository {

	Optional<Chore> findById(String choreId);

	List<Chore> findByParentId(String parentId);

	Chore save(Chore chore);
}
