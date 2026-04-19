package com.computech.ctui.auth;

import java.time.Instant;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DemoUserDataInitializer {

	private final UserAccountRepository userAccountRepository;
	private final PasswordEncoder passwordEncoder;

	public DemoUserDataInitializer(final UserAccountRepository userAccountRepository, final PasswordEncoder passwordEncoder) {
		this.userAccountRepository = userAccountRepository;
		this.passwordEncoder = passwordEncoder;
		initialize();
	}

	private void initialize() {
		final UserAccount parent = createDemoUserIfMissing("angie", "angie@choretrack.demo", "Angie", "Parent",
				AccountRole.PARENT, null);
		final String parentId = parent == null ? null : parent.id();
		createDemoUserIfMissing("preston", "preston@choretrack.demo", "Preston", "Kid", AccountRole.CHILD, parentId);
		createDemoUserIfMissing("rylan", "rylan@choretrack.demo", "Rylan", "Kid", AccountRole.CHILD, parentId);
		createDemoUserIfMissing("karla", "karla@choretrack.demo", "Karla", "Kid", AccountRole.CHILD, parentId);
	}

	private UserAccount createDemoUserIfMissing(final String username, final String email, final String firstName,
			final String lastName, final AccountRole role, final String parentId) {
		if (userAccountRepository.existsByUsernameIgnoreCase(username) || userAccountRepository.existsByEmailIgnoreCase(email)) {
			return null;
		}

		return userAccountRepository.save(new UserAccount(
				UUID.randomUUID().toString(),
				username,
				email,
				passwordEncoder.encode("password"),
				firstName,
				lastName,
				firstName,
				role,
				parentId,
				Instant.now()));
	}
}
