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
		createDemoUserIfMissing("angie", "angie@choretrack.demo", "Angie", "Parent");
		createDemoUserIfMissing("preston", "preston@choretrack.demo", "Preston", "Kid");
		createDemoUserIfMissing("rylan", "rylan@choretrack.demo", "Rylan", "Kid");
		createDemoUserIfMissing("karla", "karla@choretrack.demo", "Karla", "Kid");
	}

	private void createDemoUserIfMissing(final String username, final String email, final String firstName, final String lastName) {
		if (userAccountRepository.existsByUsernameIgnoreCase(username) || userAccountRepository.existsByEmailIgnoreCase(email)) {
			return;
		}

		userAccountRepository.save(new UserAccount(
				UUID.randomUUID().toString(),
				username,
				email,
				passwordEncoder.encode("password"),
				firstName,
				lastName,
				Instant.now()));
	}
}
