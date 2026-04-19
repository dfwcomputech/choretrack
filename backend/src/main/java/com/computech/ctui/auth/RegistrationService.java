package com.computech.ctui.auth;

import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class RegistrationService {

	private final UserAccountRepository userAccountRepository;
	private final PasswordEncoder passwordEncoder;
	private final String defaultUsername;

	public RegistrationService(final UserAccountRepository userAccountRepository, final PasswordEncoder passwordEncoder,
			@Value("${security.default-user.name}") final String defaultUsername) {
		this.userAccountRepository = userAccountRepository;
		this.passwordEncoder = passwordEncoder;
		this.defaultUsername = defaultUsername;
	}

	public synchronized RegistrationResponse register(final RegistrationRequest request) {
		final String username = request.username().trim();
		final String email = request.email().trim();

		if (defaultUsername.equalsIgnoreCase(username) || userAccountRepository.existsByUsernameIgnoreCase(username)) {
			throw new DuplicateUserException("username", "username already exists");
		}
		if (userAccountRepository.existsByEmailIgnoreCase(email)) {
			throw new DuplicateUserException("email", "email already exists");
		}

		final UserAccount userAccount = new UserAccount(
				UUID.randomUUID().toString(),
				username,
				email,
				passwordEncoder.encode(request.password()),
				request.firstName().trim(),
				request.lastName().trim(),
				request.firstName().trim(),
				AccountRole.PARENT,
				null,
				Instant.now());

		final UserAccount saved = userAccountRepository.save(userAccount);
		return new RegistrationResponse(saved.id(), saved.username(), saved.email(), saved.firstName(), saved.lastName());
	}
}
