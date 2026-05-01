package com.computech.ctui.chore;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.computech.ctui.auth.AccountRole;
import com.computech.ctui.auth.AccountPlanService;
import com.computech.ctui.auth.ForbiddenOperationException;
import com.computech.ctui.auth.UserAccount;
import com.computech.ctui.auth.UserAccountRepository;

@Service
public class ChoreService {

	private static final DateTimeFormatter REQUEST_DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

	private final ChoreRepository choreRepository;
	private final UserAccountRepository userAccountRepository;
	private final AccountPlanService accountPlanService;

	public ChoreService(final ChoreRepository choreRepository, final UserAccountRepository userAccountRepository,
			final AccountPlanService accountPlanService) {
		this.choreRepository = choreRepository;
		this.userAccountRepository = userAccountRepository;
		this.accountPlanService = accountPlanService;
	}

	public List<ChoreResponse> listActiveChores(final String authenticatedUsername) {
		final UserAccount authenticatedUser = resolveAuthenticatedUser(authenticatedUsername,
		"Only parent or child users can view chores");
		if (authenticatedUser.role() == AccountRole.PARENT) {
			return choreRepository.findByParentId(authenticatedUser.id())
			.stream()
			.filter(Chore::active)
			.map(chore -> toResponse(chore, resolveOwnedChild(chore.assignedChildId(), authenticatedUser.id())))
			.toList();
		}
		if (authenticatedUser.role() == AccountRole.CHILD) {
			return choreRepository.findByParentId(authenticatedUser.parentId())
			.stream()
			.filter(Chore::active)
			.filter(chore -> authenticatedUser.id().equals(chore.assignedChildId()))
			.map(chore -> toResponse(chore, authenticatedUser))
			.toList();
		}
		throw new IllegalStateException("Unexpected account role for chore listing: " + authenticatedUser.role());
	}

	public ChildDashboardResponse getChildDashboard(final String authenticatedUsername, final String date) {
		final UserAccount child = resolveChild(authenticatedUsername, "only child users can view child dashboard");
		final LocalDate selectedDate = resolveRequestedDate(date);
		final LocalDate today = LocalDate.now();
		final YearMonth selectedMonth = YearMonth.from(selectedDate);

		final List<ChildDashboardChoreResponse> choresForSelectedDate = choreRepository
				.findByAssignedChildIdAndDueDate(child.id(), selectedDate)
				.stream()
				.filter(Chore::active)
				.sorted(Comparator.comparing(Chore::createdAt))
				.map(this::toChildDashboardChoreResponse)
				.toList();

		final List<ChildDashboardCalendarEntryResponse> calendarEntries = choreRepository
				.findByAssignedChildId(child.id())
				.stream()
				.filter(Chore::active)
				.filter(chore -> chore.dueDate() != null)
				.filter(chore -> YearMonth.from(chore.dueDate()).equals(selectedMonth))
				.sorted(Comparator.comparing(Chore::dueDate).thenComparing(Chore::createdAt))
				.map(this::toChildDashboardCalendarEntryResponse)
				.toList();

		return new ChildDashboardResponse(
				new ChildDashboardChildResponse(
						child.id(),
						resolveChildName(child),
						child.currentPoints(),
						currentLevelForPoints(child.currentPoints()),
						pointsToNextLevel(child.currentPoints())),
				selectedDate,
				selectedDate.equals(today),
				choresForSelectedDate,
				new ChildDashboardCalendarResponse(selectedMonth.getMonthValue(), selectedMonth.getYear(), calendarEntries));
	}

	public synchronized ChoreResponse createChore(final ChoreCreateRequest request, final String authenticatedUsername) {
		final UserAccount parent = resolveParent(authenticatedUsername, "only parent users can manage chores");
		final UserAccount child = resolveOwnedChild(request.assignedChildId(), parent.id());
		final ChoreStatus status = request.status() == null ? ChoreStatus.PENDING : request.status();
		final Instant now = Instant.now();

		final long activeChoreCount = choreRepository.findByParentId(parent.id())
				.stream()
				.filter(Chore::active)
				.count();
		accountPlanService.enforceChoreCreationLimit(parent, activeChoreCount);

		if (request.recurrence() == null) {
			final Chore created = choreRepository.save(new Chore(
			UUID.randomUUID().toString(),
			request.title().trim(),
			normalizeDescription(request.description()),
			request.points(),
			child.id(),
			request.dueDate(),
			status,
			parent.id(),
			now,
			now,
			true,
			null,
			status == ChoreStatus.COMPLETED ? now : null,
			status == ChoreStatus.COMPLETED ? child.id() : null,
			null,
			null,
			null));
			return toResponse(created, child);
		}

		final String recurrenceSeriesId = UUID.randomUUID().toString();
		final List<Chore> generatedOccurrences = createRecurringOccurrences(
		request.title().trim(),
		normalizeDescription(request.description()),
		request.points(),
		child.id(),
		parent.id(),
		status,
		request.recurrence(),
		recurrenceSeriesId,
		now);
		return toResponse(generatedOccurrences.get(0), child);
	}

	public synchronized ChoreResponse updateSeriesChores(final String choreId, final ChoreUpdateRequest request,
	final String authenticatedUsername) {
		final UserAccount parent = resolveParent(authenticatedUsername, "only parent users can manage chores");
		final Chore existing = resolveOwnedChore(choreId, parent.id());
		final UserAccount child = resolveOwnedChild(request.assignedChildId(), parent.id());

		if (existing.recurrenceSeriesId() == null) {
			return updateChore(choreId, request, authenticatedUsername);
		}

		final String title = request.title().trim();
		final String description = normalizeDescription(request.description());
		final int points = request.points();
		final Instant now = Instant.now();

		choreRepository.findByParentId(parent.id())
		.stream()
		.filter(Chore::active)
		.filter(chore -> existing.recurrenceSeriesId().equals(chore.recurrenceSeriesId()))
		.forEach(chore -> choreRepository.save(new Chore(
		chore.id(),
		title,
		description,
		points,
		child.id(),
		chore.dueDate(),
		chore.status(),
		chore.parentId(),
		chore.createdAt(),
		now,
		chore.active(),
		chore.deletedAt(),
		chore.completedAt(),
		chore.completedByChildId(),
		chore.recurrenceSeriesId(),
		chore.recurrenceType(),
		chore.recurrenceTimeOfDay())));

		final Chore updatedTarget = resolveOwnedChore(choreId, parent.id());
		return toResponse(updatedTarget, child);
	}

	public synchronized ChoreResponse updateChore(final String choreId, final ChoreUpdateRequest request,
	final String authenticatedUsername) {
		final UserAccount parent = resolveParent(authenticatedUsername, "only parent users can manage chores");
		final Chore existing = resolveOwnedChore(choreId, parent.id());
		final UserAccount child = resolveOwnedChild(request.assignedChildId(), parent.id());
		final ChoreStatus updatedStatus = request.status() == null ? ChoreStatus.PENDING : request.status();
		final Instant now = Instant.now();

		if (request.recurrence() != null) {
			final String recurrenceSeriesId = existing.recurrenceSeriesId() == null
			? UUID.randomUUID().toString()
			: existing.recurrenceSeriesId();
			final LocalDate cutoffDate = existing.dueDate() == null ? LocalDate.now() : existing.dueDate();
			deactivateSeriesOccurrences(parent.id(), recurrenceSeriesId, cutoffDate, now);
			final List<Chore> generatedOccurrences = createRecurringOccurrences(
			request.title().trim(),
			normalizeDescription(request.description()),
			request.points(),
			child.id(),
			parent.id(),
			updatedStatus,
			request.recurrence(),
			recurrenceSeriesId,
			now);
			return toResponse(generatedOccurrences.get(0), child);
		}

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
		: null,
		existing.recurrenceSeriesId(),
		existing.recurrenceType(),
		existing.recurrenceTimeOfDay()));
		return toResponse(updated, child);
	}

	public synchronized ChoreDeleteResponse deleteChore(final String choreId, final String authenticatedUsername) {
		final UserAccount parent = resolveParent(authenticatedUsername, "only parent users can manage chores");
		final Chore existing = resolveOwnedChore(choreId, parent.id());
		if (!existing.active()) {
			return new ChoreDeleteResponse("Chore deleted successfully");
		}

		final Instant now = Instant.now();
		if (existing.recurrenceSeriesId() != null) {
			final LocalDate cutoffDate = existing.dueDate() == null ? LocalDate.now() : existing.dueDate();
			deactivateSeriesOccurrences(parent.id(), existing.recurrenceSeriesId(), cutoffDate, now);
			return new ChoreDeleteResponse("Chore deleted successfully");
		}

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
		existing.completedByChildId(),
		existing.recurrenceSeriesId(),
		existing.recurrenceType(),
		existing.recurrenceTimeOfDay()));
		return new ChoreDeleteResponse("Chore deleted successfully");
	}

	public synchronized ChoreCompletionResponse completeChore(final String choreId, final String authenticatedUsername) {
		final UserAccount authenticatedUser = resolveAuthenticatedUser(
				authenticatedUsername,
				"only parent or child users can complete chores");
		final Chore chore = choreRepository.findById(choreId)
		.filter(Chore::active)
		.orElseThrow(() -> new ChoreNotFoundException("chore not found"));

		final UserAccount child;
		if (authenticatedUser.role() == AccountRole.CHILD) {
			child = authenticatedUser;
			if (!child.id().equals(chore.assignedChildId())) {
				throw new ForbiddenOperationException("child cannot complete this chore");
			}
			if (chore.dueDate() == null || !LocalDate.now().equals(chore.dueDate())) {
				throw new ForbiddenOperationException("You can only complete chores scheduled for today");
			}
		} else if (authenticatedUser.role() == AccountRole.PARENT) {
			if (!authenticatedUser.id().equals(chore.parentId())) {
				throw new ForbiddenOperationException("parent cannot access this chore");
			}
			child = resolveOwnedChild(chore.assignedChildId(), authenticatedUser.id());
		} else {
			throw new ForbiddenOperationException("only parent or child users can complete chores");
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
		child.id(),
		chore.recurrenceSeriesId(),
		chore.recurrenceType(),
		chore.recurrenceTimeOfDay()));

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
		child.accountType(),
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

	public synchronized ChoreCompletionResponse revertChore(final String choreId, final String authenticatedUsername) {
		final UserAccount child = resolveChild(authenticatedUsername, "only child users can revert chores");
		final Chore chore = choreRepository.findById(choreId)
		.filter(Chore::active)
		.orElseThrow(() -> new ChoreNotFoundException("chore not found"));

		if (!child.id().equals(chore.assignedChildId())) {
			throw new ForbiddenOperationException("child cannot revert this chore");
		}
		if (chore.status() == ChoreStatus.PENDING) {
			throw new ChoreAlreadyPendingException("chore is already pending");
		}

		final Instant now = Instant.now();
		choreRepository.save(new Chore(
		chore.id(),
		chore.title(),
		chore.description(),
		chore.points(),
		chore.assignedChildId(),
		chore.dueDate(),
		ChoreStatus.PENDING,
		chore.parentId(),
		chore.createdAt(),
		now,
		chore.active(),
		chore.deletedAt(),
		null,
		null,
		chore.recurrenceSeriesId(),
		chore.recurrenceType(),
		chore.recurrenceTimeOfDay()));

		final int updatedCurrentPoints = Math.max(0, child.currentPoints() - chore.points());
		final int updatedTotalEarnedPoints = Math.max(0, child.totalEarnedPoints() - chore.points());
		final UserAccount updatedChild = userAccountRepository.save(new UserAccount(
		child.id(),
		child.username(),
		child.email(),
		child.passwordHash(),
		child.firstName(),
		child.lastName(),
		child.displayName(),
		child.role(),
		child.accountType(),
		child.parentId(),
		child.createdAt(),
		child.active(),
		updatedCurrentPoints,
		updatedTotalEarnedPoints,
		now,
		child.deletedAt()));

		return new ChoreCompletionResponse(
		chore.id(),
		ChoreStatus.PENDING,
		child.id(),
		-chore.points(),
		updatedChild.currentPoints(),
		null);
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

	private int currentLevelForPoints(final int currentPoints) {
		return (Math.max(0, currentPoints) / 100) + 1;
	}

	private int pointsToNextLevel(final int currentPoints) {
		return nextLevelAt(currentPoints) - Math.max(0, currentPoints);
	}

	private LocalDate resolveRequestedDate(final String date) {
		if (date == null || date.isBlank()) {
			return LocalDate.now();
		}
		try {
			return LocalDate.parse(date, REQUEST_DATE_FORMATTER);
		} catch (DateTimeParseException exception) {
			throw new IllegalArgumentException("Invalid date format. Expected yyyy-MM-dd");
		}
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
		chore.updatedAt(),
		chore.recurrenceSeriesId());
	}

	private ChildDashboardChoreResponse toChildDashboardChoreResponse(final Chore chore) {
		return new ChildDashboardChoreResponse(
				chore.id(),
				chore.title(),
				chore.description(),
				chore.dueDate(),
				chore.points(),
				chore.status());
	}

	private ChildDashboardCalendarEntryResponse toChildDashboardCalendarEntryResponse(final Chore chore) {
		return new ChildDashboardCalendarEntryResponse(
				chore.dueDate(),
				chore.id(),
				chore.title(),
				chore.status());
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

	private List<Chore> createRecurringOccurrences(
	final String title,
	final String description,
	final int points,
	final String childId,
	final String parentId,
	final ChoreStatus status,
	final ChoreRecurrenceRequest recurrence,
	final String recurrenceSeriesId,
	final Instant now) {
		if (recurrence.type() != RecurrenceType.DAILY) {
			throw new IllegalArgumentException("only DAILY recurrence is supported");
		}

		final Set<DayOfWeek> allowedDays = recurrence.asJavaDaysOfWeek();
		final List<Chore> generatedOccurrences = new ArrayList<>();
		for (LocalDate date = recurrence.startDate(); !date.isAfter(recurrence.endDate()); date = date.plusDays(1)) {
			if (!allowedDays.isEmpty() && !allowedDays.contains(date.getDayOfWeek())) {
				continue;
			}
			generatedOccurrences.add(choreRepository.save(new Chore(
			UUID.randomUUID().toString(),
			title,
			description,
			points,
			childId,
			date,
			status,
			parentId,
			now,
			now,
			true,
			null,
			status == ChoreStatus.COMPLETED ? now : null,
			status == ChoreStatus.COMPLETED ? childId : null,
			recurrenceSeriesId,
			recurrence.type(),
			normalizeDescription(recurrence.timeOfDay()))));
		}

		if (generatedOccurrences.isEmpty()) {
			throw new IllegalArgumentException("recurrence produced no occurrences for the selected date range");
		}
		return generatedOccurrences;
	}

	private void deactivateSeriesOccurrences(
	final String parentId,
	final String recurrenceSeriesId,
	final LocalDate cutoffDate,
	final Instant now) {
		choreRepository.findByParentId(parentId)
		.stream()
		.filter(Chore::active)
		.filter(chore -> recurrenceSeriesId.equals(chore.recurrenceSeriesId()))
		.filter(chore -> chore.dueDate() == null || !chore.dueDate().isBefore(cutoffDate))
		.forEach(chore -> choreRepository.save(new Chore(
		chore.id(),
		chore.title(),
		chore.description(),
		chore.points(),
		chore.assignedChildId(),
		chore.dueDate(),
		chore.status(),
		chore.parentId(),
		chore.createdAt(),
		now,
		false,
		now,
		chore.completedAt(),
		chore.completedByChildId(),
		chore.recurrenceSeriesId(),
		chore.recurrenceType(),
		chore.recurrenceTimeOfDay())));
	}
}
