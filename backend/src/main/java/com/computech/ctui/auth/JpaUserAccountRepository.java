package com.computech.ctui.auth;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

@Repository
public class JpaUserAccountRepository implements UserAccountRepository {

	private final UserRepository repository;

	public JpaUserAccountRepository(final UserRepository repository) {
		this.repository = repository;
	}

	@Override
	public boolean existsByUsernameIgnoreCase(final String username) {
		return repository.existsByUsernameIgnoreCase(username);
	}

	@Override
	public boolean existsByEmailIgnoreCase(final String email) {
		return repository.existsByEmailIgnoreCase(email);
	}

	@Override
	public Optional<UserAccount> findByUsernameIgnoreCase(final String username) {
		return repository.findByUsernameIgnoreCase(username).map(this::toDomain);
	}

	@Override
	public Optional<UserAccount> findById(final String id) {
		return repository.findById(id).map(this::toDomain);
	}

	@Override
	public List<UserAccount> findByParentId(final String parentId) {
		return repository.findByParentId(parentId).stream().map(this::toDomain).toList();
	}

	@Override
	public UserAccount save(final UserAccount userAccount) {
		return toDomain(repository.save(toEntity(userAccount)));
	}

	@Override
	public long countAll() {
		return repository.count();
	}

	private UserAccountJpaEntity toEntity(final UserAccount userAccount) {
		final UserAccountJpaEntity entity = new UserAccountJpaEntity();
		entity.setId(userAccount.id());
		entity.setUsername(userAccount.username());
		entity.setEmail(userAccount.email());
		entity.setPasswordHash(userAccount.passwordHash());
		entity.setFirstName(userAccount.firstName());
		entity.setLastName(userAccount.lastName());
		entity.setDisplayName(userAccount.displayName());
		entity.setRole(userAccount.role());
		entity.setAccountType(userAccount.accountType() != null ? userAccount.accountType() : AccountType.FREE);
		entity.setParentId(userAccount.parentId());
		entity.setCreatedAt(userAccount.createdAt());
		entity.setActive(userAccount.active());
		entity.setCurrentPoints(userAccount.currentPoints());
		entity.setTotalEarnedPoints(userAccount.totalEarnedPoints());
		entity.setUpdatedAt(userAccount.updatedAt());
		entity.setDeletedAt(userAccount.deletedAt());
		return entity;
	}

	private UserAccount toDomain(final UserAccountJpaEntity entity) {
		return new UserAccount(
				entity.getId(),
				entity.getUsername(),
				entity.getEmail(),
				entity.getPasswordHash(),
				entity.getFirstName(),
				entity.getLastName(),
				entity.getDisplayName(),
				entity.getRole(),
				entity.getAccountType() != null ? entity.getAccountType() : AccountType.FREE,
				entity.getParentId(),
				entity.getCreatedAt(),
				entity.isActive(),
				entity.getCurrentPoints(),
				entity.getTotalEarnedPoints(),
				entity.getUpdatedAt(),
				entity.getDeletedAt());
	}
}
