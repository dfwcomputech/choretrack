package com.computech.ctui.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@Tag("unit")
class HomeControllerWebMvcUnitTests {

	private final MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new HomeController()).build();

	@Test
	void rootPathForwardsToIndexHtml() throws Exception {
		mockMvc.perform(get("/"))
				.andExpect(status().isOk())
				.andExpect(forwardedUrl("/index.html"));
	}

	@Test
	void dashboardPathForwardsToIndexHtml() throws Exception {
		mockMvc.perform(get("/dashboard"))
				.andExpect(status().isOk())
				.andExpect(forwardedUrl("/index.html"));
	}
}
