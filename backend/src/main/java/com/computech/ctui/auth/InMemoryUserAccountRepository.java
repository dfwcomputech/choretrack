package com.computech.ctui.auth;

import java.util.Locale;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.stereotype.Repository;

@Repository
public class InMemoryUserAccountRepository implements UserAccountRepository {

	private final ConcurrentMap<String, UserAccount> usersById = new ConcurrentHashMap<>();
	private final ConcurrentMap<String, String> usernameIndex = new ConcurrentHashMap<>();
	private final ConcurrentMap<String, String> emailIndex = new ConcurrentHashMap<>();

	@Override
	public boolean existsByUsernameIgnoreCase(final String username) {
		return usernameIndex.containsKey(normalize(username));
	}

	@Override
	public boolean existsByEmailIgnoreCase(final String email) {
		return emailIndex.containsKey(normalize(email));
	}

	@Override
	public Optional<UserAccount> findByUsernameIgnoreCase(final String username) {
		final String userId = usernameIndex.get(normalize(username));
		return Optional.ofNullable(userId).map(usersById::get);
	}

	@Override
	public UserAccount save(final UserAccount userAccount) {
		usersById.put(userAccount.id(), userAccount);
		usernameIndex.put(normalize(userAccount.username()), userAccount.id());
		emailIndex.put(normalize(userAccount.email()), userAccount.id());
		return userAccount;
	}

	private String normalize(final String value) {
		return value.toLowerCase(Locale.ROOT);
	}
}
