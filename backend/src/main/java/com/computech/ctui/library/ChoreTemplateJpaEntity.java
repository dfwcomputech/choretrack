package com.computech.ctui.library;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "chore_templates")
public class ChoreTemplateJpaEntity {

	@Id
	private String id;

	@Column(nullable = false)
	private String title;

	private String description;

	@Column(nullable = false)
	private int suggestedPoints;

	private String category;

	protected ChoreTemplateJpaEntity() {
	}

	public String getId() {
		return id;
	}

	public void setId(final String id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(final String title) {
		this.title = title;
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
