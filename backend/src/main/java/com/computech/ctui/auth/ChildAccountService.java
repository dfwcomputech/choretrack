package com.computech.ctui.auth;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class ChildAccountService {

	private final UserAccountRepository userAccountRepository;
	private final PasswordEncoder passwordEncoder;
	private final String defaultUsername;
	private final AccountPlanService accountPlanService;

	public ChildAccountService(final UserAccountRepository userAccountRepository, final PasswordEncoder passwordEncoder,
			@Value("${security.default-user.name}") final String defaultUsername,
			final AccountPlanService accountPlanService) {
		this.userAccountRepository = userAccountRepository;
		this.passwordEncoder = passwordEncoder;
		this.defaultUsername = defaultUsername;
		this.accountPlanService = accountPlanService;
	}

	public synchronized ChildAccountResponse createChild(final ChildAccountRequest request, final String authenticatedUsername) {
		final UserAccount parent = resolveParent(authenticatedUsername, "only parent users can create child accounts");

		final long activeChildCount = userAccountRepository.findByParentId(parent.id())
				.stream()
				.filter(child -> child.role() == AccountRole.CHILD && child.active())
				.count();
		accountPlanService.enforceChildCreationLimit(parent, activeChildCount);

		final String username = request.username().trim();
		if (defaultUsername.equalsIgnoreCase(username) || userAccountRepository.existsByUsernameIgnoreCase(username)) {
			throw new DuplicateUserException("username", "username already exists");
		}

		final String firstName = request.firstName().trim();
		final String lastName = request.lastName() == null ? "" : request.lastName().trim();
		final String displayName = normalizeDisplayName(request.displayName(), firstName);

		final UserAccount child = userAccountRepository.save(new UserAccount(
				UUID.randomUUID().toString(),
				username,
				null,
				passwordEncoder.encode(request.password()),
				firstName,
				lastName,
				displayName,
				AccountRole.CHILD,
				parent.id(),
				Instant.now()));

		return toResponse(child);
	}

	public List<ChildAccountResponse> listActiveChildren(final String authenticatedUsername) {
		final UserAccount parent = resolveParent(authenticatedUsername, "only parent users can manage child accounts");
		return userAccountRepository.findByParentId(parent.id())
				.stream()
				.filter(child -> child.role() == AccountRole.CHILD && child.active())
				.map(this::toResponse)
				.toList();
	}

	public synchronized ChildAccountResponse updateChild(final String childId, final ChildAccountUpdateRequest request,
			final String authenticatedUsername) {
		final UserAccount parent = resolveParent(authenticatedUsername, "only parent users can manage child accounts");
		final UserAccount child = resolveOwnedChild(childId, parent.id());

		final String firstName = request.firstName().trim();
		final String lastName = request.lastName() == null ? "" : request.lastName().trim();
		final String displayName = normalizeDisplayName(request.displayName(), firstName);
		final String username = normalizeUsername(request.username(), child.username());

		if (!child.username().equalsIgnoreCase(username)
				&& (defaultUsername.equalsIgnoreCase(username) || userAccountRepository.existsByUsernameIgnoreCase(username))) {
			throw new DuplicateUserException("username", "username already exists");
		}

		final UserAccount updatedChild = userAccountRepository.save(new UserAccount(
				child.id(),
				username,
				child.email(),
				child.passwordHash(),
				firstName,
				lastName,
				displayName,
				child.role(),
				child.accountType(),
				child.parentId(),
				child.createdAt(),
				child.active(),
				child.currentPoints(),
				child.totalEarnedPoints(),
				Instant.now(),
				child.deletedAt()));

		return toResponse(updatedChild);
	}

	public synchronized ChildAccountDeleteResponse hideChild(final String childId, final String authenticatedUsername) {
		final UserAccount parent = resolveParent(authenticatedUsername, "only parent users can manage child accounts");
		final UserAccount child = resolveOwnedChild(childId, parent.id());

		if (child.active()) {
			userAccountRepository.save(new UserAccount(
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
					false,
					child.currentPoints(),
					child.totalEarnedPoints(),
					Instant.now(),
					Instant.now()));
		}

		return new ChildAccountDeleteResponse("Child account hidden successfully");
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
				.orElseThrow(() -> new ChildAccountNotFoundException("child account not found"));
		if (child.role() != AccountRole.CHILD) {
			throw new ChildAccountNotFoundException("child account not found");
		}
		if (!parentId.equals(child.parentId())) {
			throw new ForbiddenOperationException("parent cannot access this child account");
		}
		return child;
	}

	private ChildAccountResponse toResponse(final UserAccount child) {
		return new ChildAccountResponse(
				child.id(),
				child.username(),
				child.firstName(),
				child.lastName(),
				child.displayName(),
				child.parentId(),
				child.role(),
				child.active(),
				child.createdAt(),
				child.updatedAt());
	}

	private String normalizeUsername(final String requestedUsername, final String fallbackUsername) {
		if (requestedUsername == null || requestedUsername.isBlank()) {
			return fallbackUsername;
		}
		return requestedUsername.trim();
	}

	private String normalizeDisplayName(final String requestedDisplayName, final String fallbackFirstName) {
		if (requestedDisplayName == null || requestedDisplayName.isBlank()) {
			return fallbackFirstName;
		}
		return requestedDisplayName.trim();
	}
}
