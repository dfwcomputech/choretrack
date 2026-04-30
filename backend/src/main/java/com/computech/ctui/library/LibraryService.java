package com.computech.ctui.library;

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
			rewardTemplate("template-reward-1", "Get Icecream", "Pick your favorite ice cream treat", 80, "Food"),
			rewardTemplate("template-reward-2", "Extra gaming time", "30 minutes of extra gaming time", 150, "Screen Time"),
			rewardTemplate("template-reward-3", "Go to the movies", "Choose a movie to watch with the family", 200, "Outing"),
			rewardTemplate("template-reward-4", "Buy something small", "Choose a small item from the store (up to $10)", 250, "Shopping"),
			rewardTemplate("template-reward-5", "Extra screen time", "30 extra minutes of screen time", 100, "Screen Time"),
			rewardTemplate("template-reward-6", "Choose dinner", "Pick what the family has for dinner tonight", 120, "Food"),
			rewardTemplate("template-reward-7", "Stay up late", "Stay up 30 minutes past your usual bedtime", 100, "Special"),
			rewardTemplate("template-reward-8", "Friend sleepover", "Have a friend sleep over on a weekend", 300, "Social"),
			rewardTemplate("template-reward-9", "Trip to the park", "Spend an afternoon at your favorite park", 150, "Outing"),
			rewardTemplate("template-reward-10", "No chores day", "Take a full day off from chores", 350, "Special"));

	private final SpringDataChoreTemplateRepository choreTemplateRepository;
	private final SpringDataRewardTemplateRepository rewardTemplateRepository;

	public LibraryService(final SpringDataChoreTemplateRepository choreTemplateRepository,
			final SpringDataRewardTemplateRepository rewardTemplateRepository) {
		this.choreTemplateRepository = choreTemplateRepository;
		this.rewardTemplateRepository = rewardTemplateRepository;
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
}
