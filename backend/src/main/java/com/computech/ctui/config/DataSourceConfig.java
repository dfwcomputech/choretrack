package com.computech.ctui.config;

import java.net.URI;
import java.net.URISyntaxException;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configures the application DataSource, normalizing Render-style PostgreSQL
 * URLs (postgresql://user:password@host:port/database) to standard JDBC URLs
 * (jdbc:postgresql://host:port/database) with credentials set separately.
 */
@Configuration
public class DataSourceConfig {

	private static final String POSTGRES_SCHEME = "postgresql";
	private static final String JDBC_POSTGRES_PREFIX = "jdbc:postgresql://";
	private static final int DEFAULT_POSTGRES_PORT = 5432;

	@Bean
	DataSource dataSource(
			@Value("${spring.datasource.url}") final String rawUrl,
			@Value("${spring.datasource.driver-class-name:org.postgresql.Driver}") final String driverClassName,
			@Value("${spring.datasource.username:#{null}}") final String username,
			@Value("${spring.datasource.password:#{null}}") final String password) {

		final ParsedDataSourceUrl parsed = parseUrl(rawUrl);

		final DataSourceBuilder<?> builder = DataSourceBuilder.create()
				.url(parsed.jdbcUrl())
				.driverClassName(driverClassName);

		// Explicit properties take precedence over credentials embedded in the URL.
		final String effectiveUsername = username != null ? username : parsed.username();
		final String effectivePassword = password != null ? password : parsed.password();

		if (effectiveUsername != null) {
			builder.username(effectiveUsername);
		}
		if (effectivePassword != null) {
			builder.password(effectivePassword);
		}

		return builder.build();
	}

	/**
	 * Parses a raw datasource URL that may be in either Render format
	 * ({@code postgresql://user:password@host:port/database}) or standard JDBC
	 * format ({@code jdbc:postgresql://host:port/database}).
	 * <p>
	 * When the URL is in Render format the embedded credentials are extracted and
	 * stripped from the returned JDBC URL so that HikariCP (Spring Boot's default
	 * connection pool) receives a clean URL and separate username/password values.
	 *
	 * @param rawUrl the raw URL string from the environment or properties file
	 * @return a {@link ParsedDataSourceUrl} containing a valid JDBC URL and,
	 *         optionally, extracted credentials
	 */
	ParsedDataSourceUrl parseUrl(final String rawUrl) {
		if (rawUrl == null) {
			return new ParsedDataSourceUrl(null, null, null);
		}

		// Already a valid JDBC URL — leave it untouched.
		if (rawUrl.startsWith("jdbc:")) {
			return new ParsedDataSourceUrl(rawUrl, null, null);
		}

		// Render-style URL: postgresql://user:password@host[:port]/database
		if (rawUrl.startsWith(POSTGRES_SCHEME + "://")) {
			try {
				final URI uri = new URI(rawUrl);
				final String host = uri.getHost();
				final int port = uri.getPort() > 0 ? uri.getPort() : DEFAULT_POSTGRES_PORT;
				final String database = uri.getPath(); // includes leading '/'

				final String jdbcUrl = JDBC_POSTGRES_PREFIX + host + ":" + port + database;

				String extractedUsername = null;
				String extractedPassword = null;
				final String userInfo = uri.getUserInfo();
				if (userInfo != null) {
					final int colonIdx = userInfo.indexOf(':');
					if (colonIdx >= 0) {
						extractedUsername = userInfo.substring(0, colonIdx);
						extractedPassword = userInfo.substring(colonIdx + 1);
					}
					else {
						extractedUsername = userInfo;
					}
				}

				return new ParsedDataSourceUrl(jdbcUrl, extractedUsername, extractedPassword);
			}
			catch (final URISyntaxException e) {
				throw new IllegalArgumentException("Invalid datasource URL: " + rawUrl, e);
			}
		}

		// Unknown format — return as-is and let the driver report any problem.
		return new ParsedDataSourceUrl(rawUrl, null, null);
	}

	/** Value object holding a normalized JDBC URL and optional extracted credentials. */
	record ParsedDataSourceUrl(String jdbcUrl, String username, String password) {
	}
}
