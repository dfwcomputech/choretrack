package com.computech.ctui.library;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SpringDataChoreTemplateRepository extends JpaRepository<ChoreTemplateJpaEntity, String> {

	@Query("SELECT t FROM ChoreTemplateJpaEntity t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%'))")
	List<ChoreTemplateJpaEntity> searchByQuery(@Param("query") String query);
}
