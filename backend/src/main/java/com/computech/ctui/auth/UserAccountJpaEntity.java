package com.computech.ctui.auth;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_accounts")
public class UserAccountJpaEntity {

	@Id
	private String id;

	@Column(nullable = false, unique = true)
	private String username;

	@Column(unique = true)
	private String email;

	@Column(nullable = false)
	private String passwordHash;

	@Column(nullable = false)
	private String firstName;

	@Column(nullable = false)
	private String lastName;

	private String displayName;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private AccountRole role;

	private String parentId;

	@Column(nullable = false)
	private Instant createdAt;

	@Column(nullable = false)
	private boolean active;

	@Column(nullable = false)
	private int currentPoints;

	@Column(nullable = false)
	private int totalEarnedPoints;

	@Column(nullable = false)
	private Instant updatedAt;

	private Instant deletedAt;

	protected UserAccountJpaEntity() {
	}

	public String getId() {
		return id;
	}

	public void setId(final String id) {
		this.id = id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(final String username) {
		this.username = username;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(final String email) {
		this.email = email;
	}

	public String getPasswordHash() {
		return passwordHash;
	}

	public void setPasswordHash(final String passwordHash) {
		this.passwordHash = passwordHash;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(final String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(final String lastName) {
		this.lastName = lastName;
	}

	public String getDisplayName() {
		return displayName;
	}

	public void setDisplayName(final String displayName) {
		this.displayName = displayName;
	}

	public AccountRole getRole() {
		return role;
	}

	public void setRole(final AccountRole role) {
		this.role = role;
	}

	public String getParentId() {
		return parentId;
	}

	public void setParentId(final String parentId) {
		this.parentId = parentId;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(final Instant createdAt) {
		this.createdAt = createdAt;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(final boolean active) {
		this.active = active;
	}

	public int getCurrentPoints() {
		return currentPoints;
	}

	public void setCurrentPoints(final int currentPoints) {
		this.currentPoints = currentPoints;
	}

	public int getTotalEarnedPoints() {
		return totalEarnedPoints;
	}

	public void setTotalEarnedPoints(final int totalEarnedPoints) {
		this.totalEarnedPoints = totalEarnedPoints;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(final Instant updatedAt) {
		this.updatedAt = updatedAt;
	}

	public Instant getDeletedAt() {
		return deletedAt;
	}

	public void setDeletedAt(final Instant deletedAt) {
		this.deletedAt = deletedAt;
	}
}
