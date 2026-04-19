package com.computech.ctui.demo;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class DemoDashboardService {

	private final DemoDashboard dashboard = new DemoDashboard(
			new Parent("parent-angie", "Angie", "Parent", "👩"),
			List.of(
					new Child("child-preston", "Preston", "preston", "Child", "🧒", "parent-angie"),
					new Child("child-rylan", "Rylan", "rylan", "Child", "👦", "parent-angie"),
					new Child("child-karla", "Karla", "karla", "Child", "👧", "parent-angie")),
			List.of(
					new Chore("chore-1", "Pick up the trash", "child-preston", 25, true),
					new Chore("chore-2", "Clean Cracker cage", "child-karla", 30, false),
					new Chore("chore-3", "Feed Jessie", "child-rylan", 15, true),
					new Chore("chore-4", "Feed Hunter", "child-preston", 15, false),
					new Chore("chore-5", "Clean your room", "child-karla", 20, true),
					new Chore("chore-6", "Wash your dishes", "child-rylan", 10, false),
					new Chore("chore-7", "Wash your clothes", "child-preston", 20, false)),
			List.of(
					new Reward("reward-1", "Get Icecream", 40, "🍨"),
					new Reward("reward-2", "Go to the movies", 90, "🎬"),
					new Reward("reward-3", "Extra gaming time", 60, "🎮"),
					new Reward("reward-4", "Extra tablet time", 50, "📱"),
					new Reward("reward-5", "Buy one thing from Amazon", 150, "📦")),
			new Progress(3, 220, 300, Map.of(
					"child-preston", 100,
					"child-rylan", 55,
					"child-karla", 65)));

	public DemoDashboard getDashboard() {
		return dashboard;
	}

	public record DemoDashboard(
			Parent parent,
			List<Child> children,
			List<Chore> chores,
			List<Reward> rewards,
			Progress progress) {
	}

	public record Parent(String id, String name, String role, String avatar) {
	}

	public record Child(String id, String name, String username, String role, String avatar, String parentId) {
	}

	public record Chore(String id, String title, String childId, int points, boolean completed) {
	}

	public record Reward(String id, String name, int pointsCost, String icon) {
	}

	public record Progress(int level, int points, int nextLevelPoints, Map<String, Integer> childPoints) {
	}
}
