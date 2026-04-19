package com.computech.ctui.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.computech.ctui.demo.DemoDashboardService;
import com.computech.ctui.demo.DemoDashboardService.DemoDashboard;

@RestController
@RequestMapping("/api/demo")
public class DemoDashboardController {

	private final DemoDashboardService demoDashboardService;

	public DemoDashboardController(final DemoDashboardService demoDashboardService) {
		this.demoDashboardService = demoDashboardService;
	}

	@GetMapping("/dashboard")
	public DemoDashboard getDashboard() {
		return demoDashboardService.getDashboard();
	}
}
