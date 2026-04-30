package com.computech.ctui.library;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "reward_templates")
public class RewardTemplateJpaEntity {

	@Id
	private String id;

	@Column(nullable = false)
	private String name;

	private String description;

	@Column(nullable = false)
	private int suggestedPoints;

	private String category;

	protected RewardTemplateJpaEntity() {
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

	public int getSuggestedPoints() {
		return suggestedPoints;
	}

	public void setSuggestedPoints(final int suggestedPoints) {
		this.suggestedPoints = suggestedPoints;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(final String category) {
		this.category = category;
	}
}
