package com.computech.ctui.controller;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chores")
public class ChoreApiController {

	private final AtomicLong idSequence = new AtomicLong(0);
	private final List<Chore> chores = new CopyOnWriteArrayList<>();

	public ChoreApiController() {
		chores.add(new Chore(idSequence.incrementAndGet(), "Take out trash", false));
		chores.add(new Chore(idSequence.incrementAndGet(), "Wash dishes", true));
		chores.add(new Chore(idSequence.incrementAndGet(), "Clean living room", false));
	}

	@GetMapping
	public List<Chore> getChores() {
		return chores;
	}

	@PostMapping
	public ResponseEntity<Chore> createChore(@RequestBody final CreateChoreRequest request) {
		if (request == null || request.title() == null || request.title().isBlank()) {
			return ResponseEntity.badRequest().build();
		}

		final Chore created = new Chore(idSequence.incrementAndGet(), request.title().trim(), false);
		chores.add(created);
		return ResponseEntity.status(HttpStatus.CREATED).body(created);
	}

	@PatchMapping("/{id}/toggle")
	public ResponseEntity<Chore> toggleChore(@PathVariable final long id) {
		for (int i = 0; i < chores.size(); i++) {
			final Chore existing = chores.get(i);
			if (existing.id() == id) {
				final Chore updated = new Chore(existing.id(), existing.title(), !existing.completed());
				chores.set(i, updated);
				return ResponseEntity.ok(updated);
			}
		}
		return ResponseEntity.notFound().build();
	}

	private record CreateChoreRequest(String title) {
	}

	public record Chore(long id, String title, boolean completed) {
	}
}
