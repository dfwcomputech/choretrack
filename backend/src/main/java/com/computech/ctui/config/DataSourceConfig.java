package com.computech.ctui.config;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configures the application DataSource, normalizing Render-style PostgreSQL
 * URLs (postgresql://...) to standard JDBC URLs (jdbc:postgresql://...).
 */
@Configuration
public class DataSourceConfig {

	private static final String POSTGRES_SCHEME = "postgresql://";
	private static final String JDBC_POSTGRES_SCHEME = "jdbc:postgresql://";

	@Bean
	DataSource dataSource(
			@Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/choretrack}") final String url,
			@Value("${spring.datasource.driver-class-name:org.postgresql.Driver}") final String driverClassName,
			@Value("${spring.datasource.username:#{null}}") final String username,
			@Value("${spring.datasource.password:#{null}}") final String password) {

		final String jdbcUrl = normalizeUrl(url);

		final DataSourceBuilder<?> builder = DataSourceBuilder.create()
				.url(jdbcUrl)
				.driverClassName(driverClassName);

		if (username != null) {
			builder.username(username);
		}
		if (password != null) {
			builder.password(password);
		}

		return builder.build();
	}

	private String normalizeUrl(final String url) {
		if (url != null && url.startsWith(POSTGRES_SCHEME)) {
			return JDBC_POSTGRES_SCHEME + url.substring(POSTGRES_SCHEME.length());
		}
		return url;
	}
}
