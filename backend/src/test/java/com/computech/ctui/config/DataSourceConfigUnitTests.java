package com.computech.ctui.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import com.computech.ctui.config.DataSourceConfig.ParsedDataSourceUrl;

@Tag("unit")
class DataSourceConfigUnitTests {

	private final DataSourceConfig config = new DataSourceConfig();

	// ── Render-style URLs ─────────────────────────────────────────────────────

	@Test
	void parsesRenderUrlWithPort() {
		final ParsedDataSourceUrl result = config
				.parseUrl("postgresql://alice:secret@dpg-abc123.oregon-postgres.render.com:5432/choretrackdb");

		assertThat(result.jdbcUrl())
				.isEqualTo("jdbc:postgresql://dpg-abc123.oregon-postgres.render.com:5432/choretrackdb");
		assertThat(result.username()).isEqualTo("alice");
		assertThat(result.password()).isEqualTo("secret");
	}

	@Test
	void parsesRenderUrlWithoutPort_defaultsTo5432() {
		final ParsedDataSourceUrl result = config
				.parseUrl("postgresql://alice:secret@dpg-abc123.oregon-postgres.render.com/choretrackdb");

		assertThat(result.jdbcUrl())
				.isEqualTo("jdbc:postgresql://dpg-abc123.oregon-postgres.render.com:5432/choretrackdb");
		assertThat(result.username()).isEqualTo("alice");
		assertThat(result.password()).isEqualTo("secret");
	}

	@Test
	void parsesRenderUrlWithUsernameOnly() {
		final ParsedDataSourceUrl result = config
				.parseUrl("postgresql://alice@dpg-abc123.oregon-postgres.render.com:5432/choretrackdb");

		assertThat(result.jdbcUrl())
				.isEqualTo("jdbc:postgresql://dpg-abc123.oregon-postgres.render.com:5432/choretrackdb");
		assertThat(result.username()).isEqualTo("alice");
		assertThat(result.password()).isNull();
	}

	@Test
	void parsesRenderUrlWithNoCredentials() {
		final ParsedDataSourceUrl result = config
				.parseUrl("postgresql://dpg-abc123.oregon-postgres.render.com:5432/choretrackdb");

		assertThat(result.jdbcUrl())
				.isEqualTo("jdbc:postgresql://dpg-abc123.oregon-postgres.render.com:5432/choretrackdb");
		assertThat(result.username()).isNull();
		assertThat(result.password()).isNull();
	}

	// ── Already-JDBC URLs ─────────────────────────────────────────────────────

	@Test
	void leavesJdbcUrlUntouched() {
		final String jdbcUrl = "jdbc:postgresql://localhost:5432/choretrack";
		final ParsedDataSourceUrl result = config.parseUrl(jdbcUrl);

		assertThat(result.jdbcUrl()).isEqualTo(jdbcUrl);
		assertThat(result.username()).isNull();
		assertThat(result.password()).isNull();
	}

	// ── Null / unknown inputs ─────────────────────────────────────────────────

	@Test
	void handlesNullUrl() {
		final ParsedDataSourceUrl result = config.parseUrl(null);

		assertThat(result.jdbcUrl()).isNull();
		assertThat(result.username()).isNull();
		assertThat(result.password()).isNull();
	}

	@Test
	void returnsUnknownUrlAsIs() {
		final String unknown = "h2:mem:test";
		final ParsedDataSourceUrl result = config.parseUrl(unknown);

		assertThat(result.jdbcUrl()).isEqualTo(unknown);
	}

	@Test
	void throwsOnMalformedUrl() {
		assertThatThrownBy(() -> config.parseUrl("postgresql://host with spaces/db"))
				.isInstanceOf(IllegalArgumentException.class)
				.hasMessageContaining("Invalid datasource URL");
	}
}
