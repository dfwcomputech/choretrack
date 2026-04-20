package com.computech.ctui.auth;

import java.util.Optional;
import java.util.List;

public interface UserAccountRepository {

	boolean existsByUsernameIgnoreCase(String username);

	boolean existsByEmailIgnoreCase(String email);

	Optional<UserAccount> findByUsernameIgnoreCase(String username);

	Optional<UserAccount> findById(String id);

	List<UserAccount> findByParentId(String parentId);

	UserAccount save(UserAccount userAccount);
}
