package com.computech.ctui.library;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SpringDataRewardTemplateRepository extends JpaRepository<RewardTemplateJpaEntity, String> {

	@Query("SELECT t FROM RewardTemplateJpaEntity t WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%'))")
	List<RewardTemplateJpaEntity> searchByQuery(@Param("query") String query);
}
