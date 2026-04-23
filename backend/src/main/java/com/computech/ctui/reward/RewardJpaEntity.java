package com.computech.ctui.reward;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "rewards")
public class RewardJpaEntity {

	@Id
	private String id;

	@Column(nullable = false)
	private String name;

	private String description;

	@Column(nullable = false)
	private int pointCost;

	@Column(nullable = false)
	private boolean active;

	private String category;

	private String imageRef;

	@Column(nullable = false)
	private String parentId;

	@Column(nullable = false)
	private Instant createdAt;

	@Column(nullable = false)
	private Instant updatedAt;

	private Instant deletedAt;

	protected RewardJpaEntity() {
	}

	public String getId() {
		return id;
	}

	public void setId(final String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(final String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(final String description) {
		this.description = description;
	}

	public int getPointCost() {
		return pointCost;
	}

	public void setPointCost(final int pointCost) {
		this.pointCost = pointCost;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(final boolean active) {
		this.active = active;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(final String category) {
		this.category = category;
	}

	public String getImageRef() {
		return imageRef;
	}

	public void setImageRef(final String imageRef) {
		this.imageRef = imageRef;
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
