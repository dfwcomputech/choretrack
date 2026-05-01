package com.computech.ctui.library;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "season_template_rewards")
public class SeasonTemplateRewardJpaEntity {

	@Id
	private String id;

	@Column(nullable = false)
	private String templateId;

	@Column(nullable = false)
	private String name;

	private String description;

	@Column(nullable = false)
	private int pointCost;

	private String category;

	@Column(nullable = false)
	private int sortOrder;

	protected SeasonTemplateRewardJpaEntity() {
	}

	public String getId() {
		return id;
	}

	public void setId(final String id) {
		this.id = id;
	}

	public String getTemplateId() {
		return templateId;
	}

	public void setTemplateId(final String templateId) {
		this.templateId = templateId;
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

	public String getCategory() {
		return category;
	}

	public void setCategory(final String category) {
		this.category = category;
	}

	public int getSortOrder() {
		return sortOrder;
	}

	public void setSortOrder(final int sortOrder) {
		this.sortOrder = sortOrder;
	}
}
