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
				null,
				null,
				null));
		return toResponse(created, child);
	}

	public synchronized ChoreResponse updateChore(final String choreId, final ChoreUpdateRequest request,
			final String authenticatedUsername) {
		final UserAccount parent = resolveParent(authenticatedUsername, "only parent users can manage chores");
		final Chore existing = resolveOwnedChore(choreId, parent.id());
		final UserAccount child = resolveOwnedChild(request.assignedChildId(), parent.id());
		final Instant now = Instant.now();
		final ChoreStatus updatedStatus = request.status() == null ? ChoreStatus.PENDING : request.status();
		final Chore updated = choreRepository.save(new Chore(
				existing.id(),
				request.title().trim(),
				normalizeDescription(request.description()),
				request.points(),
				child.id(),
				request.dueDate(),
				updatedStatus,
				existing.parentId(),
				existing.createdAt(),
				now,
				existing.active(),
				existing.deletedAt(),
				updatedStatus == ChoreStatus.COMPLETED
						? (existing.completedAt() == null ? now : existing.completedAt())
						: null,
				updatedStatus == ChoreStatus.COMPLETED
						? (existing.completedByChildId() == null ? child.id() : existing.completedByChildId())
						: null));
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
					now,
					existing.completedAt(),
					existing.completedByChildId()));
		}
		return new ChoreDeleteResponse("Chore deleted successfully");
	}

	public synchronized ChoreCompletionResponse completeChore(final String choreId, final String authenticatedUsername) {
		final UserAccount child = resolveChild(authenticatedUsername, "only child users can complete chores");
		final Chore chore = choreRepository.findById(choreId)
				.filter(Chore::active)
				.orElseThrow(() -> new ChoreNotFoundException("chore not found"));

		if (!child.id().equals(chore.assignedChildId())) {
			throw new ForbiddenOperationException("child cannot complete this chore");
		}
		if (chore.status() == ChoreStatus.COMPLETED) {
			throw new ChoreAlreadyCompletedException("chore has already been completed");
		}

		final Instant now = Instant.now();
		final Chore completedChore = choreRepository.save(new Chore(
				chore.id(),
				chore.title(),
				chore.description(),
				chore.points(),
				chore.assignedChildId(),
				chore.dueDate(),
				ChoreStatus.COMPLETED,
				chore.parentId(),
				chore.createdAt(),
				now,
				chore.active(),
				chore.deletedAt(),
				now,
				child.id()));

		final int updatedCurrentPoints = child.currentPoints() + completedChore.points();
		final int updatedTotalEarnedPoints = child.totalEarnedPoints() + completedChore.points();
		final UserAccount updatedChild = userAccountRepository.save(new UserAccount(
				child.id(),
				child.username(),
				child.email(),
				child.passwordHash(),
				child.firstName(),
				child.lastName(),
				child.displayName(),
				child.role(),
				child.parentId(),
				child.createdAt(),
				child.active(),
				updatedCurrentPoints,
				updatedTotalEarnedPoints,
				now,
				child.deletedAt()));

		return new ChoreCompletionResponse(
				completedChore.id(),
				completedChore.status(),
				child.id(),
				completedChore.points(),
				updatedChild.currentPoints(),
				completedChore.completedAt());
	}

	public ChildProgressResponse getChildProgress(final String childId, final String authenticatedUsername) {
		final UserAccount authenticatedUser = resolveAuthenticatedUser(authenticatedUsername);
		final UserAccount child = resolveChildById(childId);

		if (authenticatedUser.role() == AccountRole.PARENT) {
			if (!authenticatedUser.id().equals(child.parentId())) {
				throw new ForbiddenOperationException("parent cannot access this child account");
			}
		} else if (authenticatedUser.role() == AccountRole.CHILD) {
			if (!authenticatedUser.id().equals(child.id())) {
				throw new ForbiddenOperationException("child cannot access another child account");
			}
		} else {
			throw new ForbiddenOperationException("only parent or child users can view child progress");
		}

		final List<Chore> childChores = choreRepository.findByParentId(child.parentId())
				.stream()
				.filter(Chore::active)
				.filter(chore -> child.id().equals(chore.assignedChildId()))
				.toList();

		final int completedChores = (int) childChores.stream()
				.filter(chore -> chore.status() == ChoreStatus.COMPLETED)
				.count();
		final int pendingChores = childChores.size() - completedChores;

		return new ChildProgressResponse(
				child.id(),
				resolveChildName(child),
				child.currentPoints(),
				child.totalEarnedPoints(),
				completedChores,
				pendingChores,
				nextLevelAt(child.currentPoints()),
				child.updatedAt());
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
		final UserAccount parent = resolveAuthenticatedUser(authenticatedUsername, forbiddenMessage);
		if (parent.role() != AccountRole.PARENT) {
			throw new ForbiddenOperationException(forbiddenMessage);
		}
		return parent;
	}

	private UserAccount resolveChild(final String authenticatedUsername, final String forbiddenMessage) {
		final UserAccount child = resolveAuthenticatedUser(authenticatedUsername, forbiddenMessage);
		if (child.role() != AccountRole.CHILD) {
			throw new ForbiddenOperationException(forbiddenMessage);
		}
		return child;
	}

	private UserAccount resolveChildById(final String childId) {
		final UserAccount child = userAccountRepository.findById(childId)
				.orElseThrow(() -> new ChoreChildNotFoundException("child account not found"));
		if (child.role() != AccountRole.CHILD) {
			throw new ChoreChildNotFoundException("child account not found");
		}
		return child;
	}

	private UserAccount resolveOwnedChild(final String childId, final String parentId) {
		final UserAccount child = resolveChildById(childId);
		if (!parentId.equals(child.parentId())) {
			throw new ForbiddenOperationException("parent cannot access this child account");
		}
		return child;
	}

	private UserAccount resolveAuthenticatedUser(final String authenticatedUsername) {
		return resolveAuthenticatedUser(authenticatedUsername, "authentication required");
	}

	private UserAccount resolveAuthenticatedUser(final String authenticatedUsername, final String forbiddenMessage) {
		return userAccountRepository.findByUsernameIgnoreCase(authenticatedUsername)
				.orElseThrow(() -> new ForbiddenOperationException(forbiddenMessage));
	}

	private int nextLevelAt(final int currentPoints) {
		return ((Math.max(0, currentPoints) / 100) + 1) * 100;
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
