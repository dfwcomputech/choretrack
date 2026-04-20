package com.computech.ctui.chore;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.computech.ctui.auth.AccountRole;
import com.computech.ctui.auth.ForbiddenOperationException;
import com.computech.ctui.auth.UserAccount;
import com.computech.ctui.auth.UserAccountRepository;

@Service
public class ChoreService {

	private final ChoreRepository choreRepository;
	private final UserAccountRepository userAccountRepository;

	public ChoreService(final ChoreRepository choreRepository, final UserAccountRepository userAccountRepository) {
		this.choreRepository = choreRepository;
		this.userAccountRepository = userAccountRepository;
	}

	public List<ChoreResponse> listActiveChores(final String authenticatedUsername) {
		final UserAccount parent = resolveParent(authenticatedUsername, "only parent users can manage chores");
		return choreRepository.findByParentId(parent.id())
				.stream()
				.filter(Chore::active)
				.map(chore -> toResponse(chore, resolveOwnedChild(chore.assignedChildId(), parent.id())))
				.toList();
	}

	public synchronized ChoreResponse createChore(final ChoreCreateRequest request, final String authenticatedUsername) {
		final UserAccount parent = resolveParent(authenticatedUsername, "only parent users can manage chores");
		final UserAccount child = resolveOwnedChild(request.assignedChildId(), parent.id());
		final Instant now = Instant.now();
		final Chore created = choreRepository.save(new Chore(
				UUID.randomUUID().toString(),
				request.title().trim(),
				normalizeDescription(request.description()),
				request.points(),
				child.id(),
				request.dueDate(),
				request.status() == null ? ChoreStatus.PENDING : request.status(),
				parent.id(),
				now,
				now,
				true,
				null));
		return toResponse(created, child);
	}

	public synchronized ChoreResponse updateChore(final String choreId, final ChoreUpdateRequest request,
			final String authenticatedUsername) {
		final UserAccount parent = resolveParent(authenticatedUsername, "only parent users can manage chores");
		final Chore existing = resolveOwnedChore(choreId, parent.id());
		final UserAccount child = resolveOwnedChild(request.assignedChildId(), parent.id());
		final Instant now = Instant.now();
		final Chore updated = choreRepository.save(new Chore(
				existing.id(),
				request.title().trim(),
				normalizeDescription(request.description()),
				request.points(),
				child.id(),
				request.dueDate(),
				request.status() == null ? ChoreStatus.PENDING : request.status(),
				existing.parentId(),
				existing.createdAt(),
				now,
				existing.active(),
				existing.deletedAt()));
		return toResponse(updated, child);
	}

	public synchronized ChoreDeleteResponse deleteChore(final String choreId, final String authenticatedUsername) {
		final UserAccount parent = resolveParent(authenticatedUsername, "only parent users can manage chores");
		final Chore existing = resolveOwnedChore(choreId, parent.id());
		if (existing.active()) {
			final Instant now = Instant.now();
			choreRepository.save(new Chore(
					existing.id(),
					existing.title(),
					existing.description(),
					existing.points(),
					existing.assignedChildId(),
					existing.dueDate(),
					existing.status(),
					existing.parentId(),
					existing.createdAt(),
					now,
					false,
					now));
		}
		return new ChoreDeleteResponse("Chore deleted successfully");
	}

	private Chore resolveOwnedChore(final String choreId, final String parentId) {
		final Chore chore = choreRepository.findById(choreId)
				.filter(Chore::active)
				.orElseThrow(() -> new ChoreNotFoundException("chore not found"));
		if (!parentId.equals(chore.parentId())) {
			throw new ForbiddenOperationException("parent cannot access this chore");
		}
		return chore;
	}

	private UserAccount resolveParent(final String authenticatedUsername, final String forbiddenMessage) {
		final UserAccount parent = userAccountRepository.findByUsernameIgnoreCase(authenticatedUsername)
				.orElseThrow(() -> new ForbiddenOperationException(forbiddenMessage));
		if (parent.role() != AccountRole.PARENT) {
			throw new ForbiddenOperationException(forbiddenMessage);
		}
		return parent;
	}

	private UserAccount resolveOwnedChild(final String childId, final String parentId) {
		final UserAccount child = userAccountRepository.findById(childId)
				.orElseThrow(() -> new ChoreChildNotFoundException("child account not found"));
		if (child.role() != AccountRole.CHILD) {
			throw new ChoreChildNotFoundException("child account not found");
		}
		if (!parentId.equals(child.parentId())) {
			throw new ForbiddenOperationException("parent cannot access this child account");
		}
		return child;
	}

	private String normalizeDescription(final String description) {
		if (description == null || description.isBlank()) {
			return null;
		}
		return description.trim();
	}

	private ChoreResponse toResponse(final Chore chore, final UserAccount child) {
		return new ChoreResponse(
				chore.id(),
				chore.title(),
				chore.description(),
				chore.points(),
				chore.assignedChildId(),
				resolveChildName(child),
				chore.dueDate(),
				chore.status(),
				chore.createdAt(),
				chore.updatedAt());
	}

	private String resolveChildName(final UserAccount child) {
		if (child.displayName() != null && !child.displayName().isBlank()) {
			return child.displayName();
		}
		if (child.firstName() != null && !child.firstName().isBlank()) {
			return child.firstName();
		}
		return child.username();
	}
}
