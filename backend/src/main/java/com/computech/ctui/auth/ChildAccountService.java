package com.computech.ctui.auth;

import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class ChildAccountService {

	private final UserAccountRepository userAccountRepository;
	private final PasswordEncoder passwordEncoder;
	private final String defaultUsername;

	public ChildAccountService(final UserAccountRepository userAccountRepository, final PasswordEncoder passwordEncoder,
			@Value("${security.default-user.name}") final String defaultUsername) {
		this.userAccountRepository = userAccountRepository;
		this.passwordEncoder = passwordEncoder;
		this.defaultUsername = defaultUsername;
	}

	public synchronized ChildAccountResponse createChild(final ChildAccountRequest request, final String authenticatedUsername) {
		final UserAccount parent = userAccountRepository.findByUsernameIgnoreCase(authenticatedUsername)
				.orElseThrow(() -> new ForbiddenOperationException("only parent users can create child accounts"));
		if (parent.role() != AccountRole.PARENT) {
			throw new ForbiddenOperationException("only parent users can create child accounts");
		}

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

		return new ChildAccountResponse(
				child.id(),
				child.username(),
				child.firstName(),
				child.lastName(),
				child.displayName(),
				child.parentId(),
				child.role(),
				child.createdAt());
	}

	private String normalizeDisplayName(final String requestedDisplayName, final String fallbackFirstName) {
		if (requestedDisplayName == null || requestedDisplayName.isBlank()) {
			return fallbackFirstName;
		}
		return requestedDisplayName.trim();
	}
}
