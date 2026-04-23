package com.computech.ctui.auth;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserAccountJpaEntity, String> {

	Optional<UserAccountJpaEntity> findByUsernameIgnoreCase(String username);

	boolean existsByUsernameIgnoreCase(String username);

	boolean existsByEmailIgnoreCase(String email);

	List<UserAccountJpaEntity> findByParentId(String parentId);
}
