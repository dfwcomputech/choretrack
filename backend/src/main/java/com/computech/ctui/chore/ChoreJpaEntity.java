package com.computech.ctui.chore;

import java.time.Instant;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "chores")
public class ChoreJpaEntity {

	@Id
	private String id;

	@Column(nullable = false)
	private String title;

	private String description;

	@Column(nullable = false)
	private int points;

	@Column(nullable = false)
	private String assignedChildId;

	private LocalDate dueDate;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ChoreStatus status;

	@Column(nullable = false)
	private String parentId;

	@Column(nullable = false)
	private Instant createdAt;

	@Column(nullable = false)
	private Instant updatedAt;

	@Column(nullable = false)
	private boolean active;

	private Instant deletedAt;

	private Instant completedAt;

	private String completedByChildId;

	private String recurrenceSeriesId;

	@Enumerated(EnumType.STRING)
	private RecurrenceType recurrenceType;

	private String recurrenceTimeOfDay;

	private LocalDate recurrenceStartDate;

	private LocalDate recurrenceEndDate;

	private String recurrenceDaysOfWeek;

	protected ChoreJpaEntity() {
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

	public int getPoints() {
		return points;
	}

	public void setPoints(final int points) {
		this.points = points;
	}

	public String getAssignedChildId() {
		return assignedChildId;
	}

	public void setAssignedChildId(final String assignedChildId) {
		this.assignedChildId = assignedChildId;
	}

	public LocalDate getDueDate() {
		return dueDate;
	}

	public void setDueDate(final LocalDate dueDate) {
		this.dueDate = dueDate;
	}

	public ChoreStatus getStatus() {
		return status;
	}

	public void setStatus(final ChoreStatus status) {
		this.status = status;
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

	public boolean isActive() {
		return active;
	}

	public void setActive(final boolean active) {
		this.active = active;
	}

	public Instant getDeletedAt() {
		return deletedAt;
	}

	public void setDeletedAt(final Instant deletedAt) {
		this.deletedAt = deletedAt;
	}

	public Instant getCompletedAt() {
		return completedAt;
	}

	public void setCompletedAt(final Instant completedAt) {
		this.completedAt = completedAt;
	}

	public String getCompletedByChildId() {
		return completedByChildId;
	}

	public void setCompletedByChildId(final String completedByChildId) {
		this.completedByChildId = completedByChildId;
	}

	public String getRecurrenceSeriesId() {
		return recurrenceSeriesId;
	}

	public void setRecurrenceSeriesId(final String recurrenceSeriesId) {
		this.recurrenceSeriesId = recurrenceSeriesId;
	}

	public RecurrenceType getRecurrenceType() {
		return recurrenceType;
	}

	public void setRecurrenceType(final RecurrenceType recurrenceType) {
		this.recurrenceType = recurrenceType;
	}

	public String getRecurrenceTimeOfDay() {
		return recurrenceTimeOfDay;
	}

	public void setRecurrenceTimeOfDay(final String recurrenceTimeOfDay) {
		this.recurrenceTimeOfDay = recurrenceTimeOfDay;
	}

	public LocalDate getRecurrenceStartDate() {
		return recurrenceStartDate;
	}

	public void setRecurrenceStartDate(final LocalDate recurrenceStartDate) {
		this.recurrenceStartDate = recurrenceStartDate;
	}

	public LocalDate getRecurrenceEndDate() {
		return recurrenceEndDate;
	}

	public void setRecurrenceEndDate(final LocalDate recurrenceEndDate) {
		this.recurrenceEndDate = recurrenceEndDate;
	}

	public String getRecurrenceDaysOfWeek() {
		return recurrenceDaysOfWeek;
	}

	public void setRecurrenceDaysOfWeek(final String recurrenceDaysOfWeek) {
		this.recurrenceDaysOfWeek = recurrenceDaysOfWeek;
	}
}
