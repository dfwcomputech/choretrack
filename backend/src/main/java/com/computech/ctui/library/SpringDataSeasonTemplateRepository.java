package com.computech.ctui.library;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataSeasonTemplateRepository extends JpaRepository<SeasonTemplateJpaEntity, String> {

	List<SeasonTemplateJpaEntity> findAllByActiveTrueOrderBySortOrderAsc();
}
