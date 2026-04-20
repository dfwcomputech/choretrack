package com.computech.ctui.reward;

import java.time.Instant;

public record RewardResponse(
String id,
String name,
String description,
int pointCost,
boolean active,
String category,
String imageRef,
Instant createdAt,
Instant updatedAt) {
}
