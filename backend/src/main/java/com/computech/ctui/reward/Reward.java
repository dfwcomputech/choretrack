package com.computech.ctui.reward;

import java.time.Instant;

public record Reward(
String id,
String name,
String description,
int pointCost,
boolean active,
String category,
String imageRef,
String parentId,
Instant createdAt,
Instant updatedAt,
Instant deletedAt) {
}
