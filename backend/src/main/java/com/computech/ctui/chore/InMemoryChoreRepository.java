package com.computech.ctui.chore;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.stereotype.Repository;

@Repository
public class InMemoryChoreRepository implements ChoreRepository {

	private final ConcurrentMap<String, Chore> choresById = new ConcurrentHashMap<>();

	@Override
	public Optional<Chore> findById(final String choreId) {
		return Optional.ofNullable(choresById.get(choreId));
	}

	@Override
	public List<Chore> findByParentId(final String parentId) {
		return choresById.values()
				.stream()
				.filter(chore -> parentId.equals(chore.parentId()))
				.toList();
	}

	@Override
	public Chore save(final Chore chore) {
		choresById.put(chore.id(), chore);
		return chore;
	}
}
