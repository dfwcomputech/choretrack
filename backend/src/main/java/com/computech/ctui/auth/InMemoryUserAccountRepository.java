package com.computech.ctui.auth;

import java.util.Locale;
import java.util.List;
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
		if (email == null) {
			return false;
		}
		return emailIndex.containsKey(normalize(email));
	}

	@Override
	public Optional<UserAccount> findByUsernameIgnoreCase(final String username) {
		final String userId = usernameIndex.get(normalize(username));
		return Optional.ofNullable(userId).map(usersById::get);
	}

	@Override
	public Optional<UserAccount> findById(final String id) {
		return Optional.ofNullable(usersById.get(id));
	}

	@Override
	public List<UserAccount> findByParentId(final String parentId) {
		return usersById.values()
				.stream()
				.filter(user -> parentId.equals(user.parentId()))
				.toList();
	}

	@Override
	public UserAccount save(final UserAccount userAccount) {
		usersById.put(userAccount.id(), userAccount);
		usernameIndex.put(normalize(userAccount.username()), userAccount.id());
		if (userAccount.email() != null) {
			emailIndex.put(normalize(userAccount.email()), userAccount.id());
		}
		return userAccount;
	}

	private String normalize(final String value) {
		return value.toLowerCase(Locale.ROOT);
	}
}
