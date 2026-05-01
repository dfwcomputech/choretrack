package com.computech.ctui.library;

import java.time.Instant;
import java.util.List;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LibraryService {

	private static final List<ChoreTemplateJpaEntity> DEFAULT_CHORE_TEMPLATES = List.of(
			choreTemplate("template-chore-1", "Feed the dog", "Give food and fresh water to your dog", 10, "Pets"),
			choreTemplate("template-chore-2", "Clean your room", "Tidy up, put away clothes and make your bed", 15, "Cleaning"),
			choreTemplate("template-chore-3", "Take out the trash", "Empty all trash cans and take bags to the bin outside", 10, "Cleaning"),
			choreTemplate("template-chore-4", "Wash dishes", "Wash, rinse and dry all dishes in the sink", 15, "Cleaning"),
			choreTemplate("template-chore-5", "Do homework", "Complete all assigned school homework for today", 20, "School"),
			choreTemplate("template-chore-6", "Vacuum the living room", "Vacuum carpets and rugs in the living room", 15, "Cleaning"),
			choreTemplate("template-chore-7", "Mow the lawn", "Mow the front and back lawn", 25, "Outdoor"),
			choreTemplate("template-chore-8", "Walk the dog", "Take the dog for a 20-minute walk", 10, "Pets"),
			choreTemplate("template-chore-9", "Set the table", "Set plates, cups and cutlery for dinner", 5, "Cooking"),
			choreTemplate("template-chore-10", "Fold laundry", "Fold and put away clean laundry", 10, "Cleaning"),
			choreTemplate("template-chore-11", "Wipe counters", "Wipe down kitchen and bathroom counters", 10, "Cleaning"),
			choreTemplate("template-chore-12", "Water the plants", "Water all indoor and outdoor plants", 5, "Outdoor"),
			choreTemplate("template-chore-13", "Read for 30 minutes", "Read a book for at least 30 minutes", 15, "School"),
			choreTemplate("template-chore-14", "Unload the dishwasher", "Put away all clean dishes from the dishwasher", 10, "Cleaning"),
			choreTemplate("template-chore-15", "Practice instrument", "Practice your musical instrument for 20 minutes", 15, "School"));

	private static final List<RewardTemplateJpaEntity> DEFAULT_REWARD_TEMPLATES = List.of(
			rewardTemplate("template-reward-1", "Get Ice Cream", "Pick your favorite ice cream treat", 80, "Food"),
			rewardTemplate("template-reward-2", "Extra gaming time", "30 minutes of extra gaming time", 150, "Screen Time"),
			rewardTemplate("template-reward-3", "Go to the movies", "Choose a movie to watch with the family", 200, "Outing"),
			rewardTemplate("template-reward-4", "Buy something small", "Choose a small item from the store (up to $10)", 250, "Shopping"),
			rewardTemplate("template-reward-5", "Extra screen time", "30 extra minutes of screen time", 100, "Screen Time"),
			rewardTemplate("template-reward-6", "Choose dinner", "Pick what the family has for dinner tonight", 120, "Food"),
			rewardTemplate("template-reward-7", "Stay up late", "Stay up 30 minutes past your usual bedtime", 100, "Special"),
			rewardTemplate("template-reward-8", "Friend sleepover", "Have a friend sleep over on a weekend", 300, "Social"),
			rewardTemplate("template-reward-9", "Trip to the park", "Spend an afternoon at your favorite park", 150, "Outing"),
			rewardTemplate("template-reward-10", "No chores day", "Take a full day off from chores", 350, "Special"));

	private static final Instant SEED_INSTANT = Instant.parse("2025-01-01T00:00:00Z");

	private static final List<SeasonTemplateJpaEntity> DEFAULT_SEASON_TEMPLATES = List.of(
			seasonTemplate("season-template-1", "Starter Season",
					"A simple, beginner-friendly season pass to get your family started.", 1),
			seasonTemplate("season-template-2", "Screen Time Season",
					"Reward screen time enthusiasts with extra device and gaming perks.", 2),
			seasonTemplate("season-template-3", "Family Fun Season",
					"Keep the whole family engaged with fun outings and activities.", 3),
			seasonTemplate("season-template-4", "Responsibility Builder",
					"Build good habits and earn meaningful personal rewards.", 4),
			seasonTemplate("season-template-5", "School Week Season",
					"Keep schoolkids motivated through the week with manageable rewards.", 5));

	private static final List<SeasonTemplateRewardJpaEntity> DEFAULT_SEASON_TEMPLATE_REWARDS = List.of(
			// Starter Season
			seasonTemplateReward("str-1-1", "season-template-1", "Ice Cream Treat",
					"Pick your favorite ice cream flavor", 80, "Food", 1),
			seasonTemplateReward("str-1-2", "season-template-1", "Choose Dinner Tonight",
					"Pick what the family has for dinner", 120, "Food", 2),
			seasonTemplateReward("str-1-3", "season-template-1", "Extra Gaming Time",
					"30 minutes of extra gaming time", 150, "Screen Time", 3),
			seasonTemplateReward("str-1-4", "season-template-1", "Movie Night",
					"Choose a movie to watch with the family", 200, "Outing", 4),
			// Screen Time Season
			seasonTemplateReward("str-2-1", "season-template-2", "Extra 30 Min Screen Time",
					"Get 30 extra minutes on your device", 100, "Screen Time", 1),
			seasonTemplateReward("str-2-2", "season-template-2", "Stay Up 30 Min Late",
					"Stay up 30 minutes past your usual bedtime", 100, "Special", 2),
			seasonTemplateReward("str-2-3", "season-template-2", "Extra Gaming Session",
					"Enjoy a full extra gaming session", 150, "Screen Time", 3),
			seasonTemplateReward("str-2-4", "season-template-2", "Extra 60 Min Screen Time",
					"Get a full extra hour on your device", 200, "Screen Time", 4),
			seasonTemplateReward("str-2-5", "season-template-2", "Gaming Night with Friends",
					"Have friends over for a gaming night", 300, "Screen Time", 5),
			// Family Fun Season
			seasonTemplateReward("str-3-1", "season-template-3", "Family Game Night",
					"Pick a board game for the whole family", 120, "Fun", 1),
			seasonTemplateReward("str-3-2", "season-template-3", "Trip to the Park",
					"Spend an afternoon at your favorite park", 150, "Outing", 2),
			seasonTemplateReward("str-3-3", "season-template-3", "Movie Night Out",
					"Go see a movie at the theater", 200, "Outing", 3),
			seasonTemplateReward("str-3-4", "season-template-3", "Mini-Golf or Bowling",
					"Choose between mini-golf or bowling", 300, "Outing", 4),
			seasonTemplateReward("str-3-5", "season-template-3", "Weekend Day Trip",
					"Pick a fun destination for a family day trip", 400, "Outing", 5),
			// Responsibility Builder
			seasonTemplateReward("str-4-1", "season-template-4", "Small Treat or Snack",
					"Pick a small treat or snack of your choice", 80, "Food", 1),
			seasonTemplateReward("str-4-2", "season-template-4", "Choose Your Own Chore",
					"Swap one assigned chore for one you prefer", 100, "Special", 2),
			seasonTemplateReward("str-4-3", "season-template-4", "Extra Allowance ($5)",
					"Earn $5 added to your allowance", 200, "Allowance", 3),
			seasonTemplateReward("str-4-4", "season-template-4", "Pick a Weekend Activity",
					"Choose a fun activity for the weekend", 250, "Outing", 4),
			seasonTemplateReward("str-4-5", "season-template-4", "Day Off From Chores",
					"Take a full day off from all chores", 350, "Special", 5),
			// School Week Season
			seasonTemplateReward("str-5-1", "season-template-5", "Pick an Afternoon Snack",
					"Choose your snack after school", 80, "Food", 1),
			seasonTemplateReward("str-5-2", "season-template-5", "Late Bedtime on Friday",
					"Stay up 30 minutes later on Friday night", 100, "Special", 2),
			seasonTemplateReward("str-5-3", "season-template-5", "Choose Friday Night Activity",
					"Pick a fun activity for Friday evening", 150, "Fun", 3),
			seasonTemplateReward("str-5-4", "season-template-5", "Homework-Free Evening",
					"Take one evening off from homework", 200, "Special", 4),
			seasonTemplateReward("str-5-5", "season-template-5", "School Supplies Shopping Trip",
					"Pick out new school supplies at the store", 300, "Shopping", 5));

	private final SpringDataChoreTemplateRepository choreTemplateRepository;
	private final SpringDataRewardTemplateRepository rewardTemplateRepository;
	private final SpringDataSeasonTemplateRepository seasonTemplateRepository;
	private final SpringDataSeasonTemplateRewardRepository seasonTemplateRewardRepository;

	public LibraryService(final SpringDataChoreTemplateRepository choreTemplateRepository,
			final SpringDataRewardTemplateRepository rewardTemplateRepository,
			final SpringDataSeasonTemplateRepository seasonTemplateRepository,
			final SpringDataSeasonTemplateRewardRepository seasonTemplateRewardRepository) {
		this.choreTemplateRepository = choreTemplateRepository;
		this.rewardTemplateRepository = rewardTemplateRepository;
		this.seasonTemplateRepository = seasonTemplateRepository;
		this.seasonTemplateRewardRepository = seasonTemplateRewardRepository;
	}

	@EventListener(ApplicationReadyEvent.class)
	@Transactional
	public void seedTemplatesIfEmpty() {
		if (choreTemplateRepository.count() == 0) {
			choreTemplateRepository.saveAll(DEFAULT_CHORE_TEMPLATES);
		}
		if (rewardTemplateRepository.count() == 0) {
			rewardTemplateRepository.saveAll(DEFAULT_REWARD_TEMPLATES);
		}
		if (seasonTemplateRepository.count() == 0) {
			seasonTemplateRepository.saveAll(DEFAULT_SEASON_TEMPLATES);
			seasonTemplateRewardRepository.saveAll(DEFAULT_SEASON_TEMPLATE_REWARDS);
		}
	}

	public List<ChoreTemplateResponse> searchChoreTemplates(final String query) {
		final List<ChoreTemplateJpaEntity> results = (query == null || query.isBlank())
				? choreTemplateRepository.findAll()
				: choreTemplateRepository.searchByQuery(query.trim());
		return results.stream().map(LibraryService::toChoreResponse).toList();
	}

	public List<RewardTemplateResponse> searchRewardTemplates(final String query) {
		final List<RewardTemplateJpaEntity> results = (query == null || query.isBlank())
				? rewardTemplateRepository.findAll()
				: rewardTemplateRepository.searchByQuery(query.trim());
		return results.stream().map(LibraryService::toRewardResponse).toList();
	}

	public List<SeasonTemplateResponse> listSeasonTemplates() {
		return seasonTemplateRepository.findAllByActiveTrueOrderBySortOrderAsc()
				.stream()
				.map(template -> {
					final List<SeasonTemplateRewardResponse> rewards =
							seasonTemplateRewardRepository.findAllByTemplateIdOrderBySortOrderAsc(template.getId())
									.stream()
									.map(LibraryService::toSeasonTemplateRewardResponse)
									.toList();
					return new SeasonTemplateResponse(
							template.getId(),
							template.getName(),
							template.getDescription(),
							rewards.size(),
							rewards);
				})
				.toList();
	}

	public SeasonTemplateResponse getSeasonTemplateById(final String templateId) {
		final SeasonTemplateJpaEntity template = seasonTemplateRepository.findById(templateId)
				.filter(SeasonTemplateJpaEntity::isActive)
				.orElseThrow(() -> new SeasonTemplateNotFoundException("season template not found"));
		final List<SeasonTemplateRewardResponse> rewards =
				seasonTemplateRewardRepository.findAllByTemplateIdOrderBySortOrderAsc(templateId)
						.stream()
						.map(LibraryService::toSeasonTemplateRewardResponse)
						.toList();
		return new SeasonTemplateResponse(
				template.getId(),
				template.getName(),
				template.getDescription(),
				rewards.size(),
				rewards);
	}

	public List<SeasonTemplateRewardJpaEntity> getSeasonTemplateRewards(final String templateId) {
		seasonTemplateRepository.findById(templateId)
				.filter(SeasonTemplateJpaEntity::isActive)
				.orElseThrow(() -> new SeasonTemplateNotFoundException("season template not found"));
		return seasonTemplateRewardRepository.findAllByTemplateIdOrderBySortOrderAsc(templateId);
	}

	private static ChoreTemplateResponse toChoreResponse(final ChoreTemplateJpaEntity entity) {
		return new ChoreTemplateResponse(
				entity.getId(),
				entity.getTitle(),
				entity.getDescription(),
				entity.getSuggestedPoints(),
				entity.getCategory());
	}

	private static RewardTemplateResponse toRewardResponse(final RewardTemplateJpaEntity entity) {
		return new RewardTemplateResponse(
				entity.getId(),
				entity.getName(),
				entity.getDescription(),
				entity.getSuggestedPoints(),
				entity.getCategory());
	}

	private static SeasonTemplateRewardResponse toSeasonTemplateRewardResponse(
			final SeasonTemplateRewardJpaEntity entity) {
		return new SeasonTemplateRewardResponse(
				entity.getId(),
				entity.getName(),
				entity.getDescription(),
				entity.getPointCost(),
				entity.getCategory(),
				entity.getSortOrder());
	}

	private static ChoreTemplateJpaEntity choreTemplate(final String id, final String title,
			final String description, final int suggestedPoints, final String category) {
		final ChoreTemplateJpaEntity entity = new ChoreTemplateJpaEntity();
		entity.setId(id);
		entity.setTitle(title);
		entity.setDescription(description);
		entity.setSuggestedPoints(suggestedPoints);
		entity.setCategory(category);
		return entity;
	}

	private static RewardTemplateJpaEntity rewardTemplate(final String id, final String name,
			final String description, final int suggestedPoints, final String category) {
		final RewardTemplateJpaEntity entity = new RewardTemplateJpaEntity();
		entity.setId(id);
		entity.setName(name);
		entity.setDescription(description);
		entity.setSuggestedPoints(suggestedPoints);
		entity.setCategory(category);
		return entity;
	}

	private static SeasonTemplateJpaEntity seasonTemplate(final String id, final String name,
			final String description, final int sortOrder) {
		final SeasonTemplateJpaEntity entity = new SeasonTemplateJpaEntity();
		entity.setId(id);
		entity.setName(name);
		entity.setDescription(description);
		entity.setActive(true);
		entity.setSortOrder(sortOrder);
		entity.setCreatedAt(SEED_INSTANT);
		return entity;
	}

	private static SeasonTemplateRewardJpaEntity seasonTemplateReward(final String id, final String templateId,
			final String name, final String description, final int pointCost, final String category,
			final int sortOrder) {
		final SeasonTemplateRewardJpaEntity entity = new SeasonTemplateRewardJpaEntity();
		entity.setId(id);
		entity.setTemplateId(templateId);
		entity.setName(name);
		entity.setDescription(description);
		entity.setPointCost(pointCost);
		entity.setCategory(category);
		entity.setSortOrder(sortOrder);
		return entity;
	}
}
