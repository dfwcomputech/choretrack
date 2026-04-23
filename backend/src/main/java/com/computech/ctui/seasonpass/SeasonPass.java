package com.computech.ctui.seasonpass;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "season_passes")
public class SeasonPass {

	@Id
	private String id;

	@Column(nullable = false, unique = true)
	private String parentId;

	@Column(nullable = false, columnDefinition = "TEXT")
	private String configurationJson;

	@Column(nullable = false)
	private Instant createdAt;

	@Column(nullable = false)
	private Instant updatedAt;

	protected SeasonPass() {
	}

	public String getId() {
		return id;
	}

	public void setId(final String id) {
		this.id = id;
	}

	public String getParentId() {
		return parentId;
	}

	public void setParentId(final String parentId) {
		this.parentId = parentId;
	}

	public String getConfigurationJson() {
		return configurationJson;
	}

	public void setConfigurationJson(final String configurationJson) {
		this.configurationJson = configurationJson;
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
}
