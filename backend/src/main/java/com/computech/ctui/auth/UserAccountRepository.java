package com.computech.ctui.auth;

import java.util.Optional;

public interface UserAccountRepository {

	boolean existsByUsernameIgnoreCase(String username);

	boolean existsByEmailIgnoreCase(String email);

	Optional<UserAccount> findByUsernameIgnoreCase(String username);

	UserAccount save(UserAccount userAccount);
}
